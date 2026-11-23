from collections import defaultdict
from datetime import datetime, timedelta, timezone
import time
from uuid import uuid4
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, VerifyMismatchError, InvalidHashError
from app.core.config import settings
from app.core.database import connect

password_hasher = PasswordHasher()
ALGORITHM = "HS256"

# Controle em memória de tentativas falhas por chave (email / IP)
_failed_attempts: dict[str, list[float]] = defaultdict(list)


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return password_hasher.verify(hashed, password)
    except (VerificationError, VerifyMismatchError, InvalidHashError, ValueError):
        return False


def create_access_token(*, subject: str, role: str, is_guest: bool = False) -> tuple[str, int]:
    expires_seconds = settings.jwt_expire_minutes * 60
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "role": role,
        "guest": is_guest,
        "iat": now,
        "exp": now + timedelta(seconds=expires_seconds),
        "jti": str(uuid4()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM), expires_seconds


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])


def revoke_token_jti(jti: str | None, exp: int | float | None = None) -> None:
    if not jti:
        return
    exp_iso = (
        datetime.fromtimestamp(exp, tz=timezone.utc).isoformat()
        if isinstance(exp, (int, float))
        else None
    )
    with connect() as db:
        db.execute(
            "INSERT OR IGNORE INTO tokens_revogados(jti, expira_em) VALUES (?, ?)",
            (str(jti), exp_iso),
        )


def is_token_revoked(jti: str | None) -> bool:
    if not jti:
        return False
    with connect() as db:
        row = db.execute(
            "SELECT 1 FROM tokens_revogados WHERE jti = ? LIMIT 1",
            (str(jti),),
        ).fetchone()
    return row is not None


def clear_revoked_tokens() -> None:
    with connect() as db:
        db.execute("DELETE FROM tokens_revogados")


def check_rate_limit(key: str) -> tuple[bool, int]:
    """Verifica se a chave (ex: email) excedeu o limite de falhas na janela configurada.
    Retorna (bloqueado, segundos_restantes)."""
    window = max(1, settings.auth_rate_limit_window_seconds)
    max_attempts = max(1, settings.auth_rate_limit_max_attempts)
    now = time.monotonic()
    valid = [t for t in _failed_attempts.get(key, []) if now - t < window]
    _failed_attempts[key] = valid
    if len(valid) >= max_attempts:
        retry_after = max(1, int(window - (now - valid[0])))
        return True, retry_after
    return False, 0


def record_failed_attempt(key: str) -> None:
    window = max(1, settings.auth_rate_limit_window_seconds)
    now = time.monotonic()
    valid = [t for t in _failed_attempts.get(key, []) if now - t < window]
    valid.append(now)
    _failed_attempts[key] = valid


def reset_failed_attempts(key: str | None = None) -> None:
    if key is None:
        _failed_attempts.clear()
    else:
        _failed_attempts.pop(key, None)
