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


def purge_expired_revoked_tokens() -> int:
    """Remove da tabela tokens_revogados os tokens cujo prazo exp já venceu."""
    now_iso = datetime.now(timezone.utc).isoformat()
    with connect() as db:
        cur = db.execute(
            "DELETE FROM tokens_revogados WHERE expira_em IS NOT NULL AND expira_em < ?",
            (now_iso,),
        )
        return cur.rowcount


def revoke_token_jti(jti: str | None, exp: int | float | None = None) -> None:
    if not jti:
        return
    exp_iso = (
        datetime.fromtimestamp(exp, tz=timezone.utc).isoformat()
        if isinstance(exp, (int, float))
        else None
    )
    now_iso = datetime.now(timezone.utc).isoformat()
    with connect() as db:
        db.execute(
            "DELETE FROM tokens_revogados WHERE expira_em IS NOT NULL AND expira_em < ?",
            (now_iso,),
        )
        db.execute(
            "INSERT INTO tokens_revogados(jti, expira_em) VALUES (?, ?) ON CONFLICT (jti) DO NOTHING",
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
    """Verifica no SQLite se a chave (ex: IP:email) excedeu o limite de falhas na janela configurada.
    Persiste entre reinícios e múltiplos workers. Retorna (bloqueado, segundos_restantes)."""
    window = max(1, settings.auth_rate_limit_window_seconds)
    max_attempts = max(1, settings.auth_rate_limit_max_attempts)
    now = time.time()
    cutoff = now - window
    with connect() as db:
        db.execute("DELETE FROM tentativas_login WHERE criado_em < ?", (cutoff,))
        rows = db.execute(
            "SELECT criado_em FROM tentativas_login WHERE chave = ? AND criado_em >= ? ORDER BY criado_em ASC",
            (key, cutoff),
        ).fetchall()
    if len(rows) >= max_attempts:
        oldest = float(rows[0]["criado_em"])
        retry_after = max(1, int(window - (now - oldest)))
        return True, retry_after
    return False, 0


def record_failed_attempt(key: str) -> None:
    window = max(1, settings.auth_rate_limit_window_seconds)
    now = time.time()
    cutoff = now - window
    with connect() as db:
        db.execute("DELETE FROM tentativas_login WHERE criado_em < ?", (cutoff,))
        db.execute("INSERT INTO tentativas_login(chave, criado_em) VALUES (?, ?)", (key, now))


def reset_failed_attempts(key: str | None = None) -> None:
    with connect() as db:
        if key is None:
            db.execute("DELETE FROM tentativas_login")
        else:
            db.execute("DELETE FROM tentativas_login WHERE chave = ?", (key,))
