from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.core.database import INTEGRITY_ERRORS
from app.modules.auth.schemas import RegisterRequest, LoginRequest, TokenResponse, UserPublic, MessageResponse
from app.modules.auth.repository import repository, UserRecord
from app.modules.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    revoke_token_jti,
    check_rate_limit,
    record_failed_attempt,
    reset_failed_attempts,
)
from app.modules.auth.dependencies import get_current_claims

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])


def public_user(user: UserRecord) -> UserPublic:
    return UserPublic(id=user.id, name=user.name, email=user.email or None, role=user.role, is_guest=user.is_guest)


def token_response(user: UserRecord) -> TokenResponse:
    token, expires = create_access_token(subject=user.id, role=user.role, is_guest=user.is_guest)
    return TokenResponse(access_token=token, expires_in=expires, user=public_user(user))


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    email = str(payload.email).lower().strip()
    if not payload.accepted_terms:
        raise HTTPException(status_code=422, detail="É necessário aceitar os termos para criar a conta")
    record = UserRecord(id="", name=payload.name.strip(), email=email, password_hash=hash_password(payload.password))
    try:
        repository.add(record, accepted_terms=payload.accepted_terms)
    except INTEGRITY_ERRORS as exc:
        msg = str(exc).upper()
        if "UNIQUE" in msg or "DUPLICATE KEY" in msg:
            raise HTTPException(status_code=409, detail="Este e-mail já está cadastrado")
        raise HTTPException(status_code=422, detail="Não foi possível salvar o cadastro. Verifique os dados informados.")
    return token_response(record)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request):
    email = str(payload.email).lower().strip()
    client_host = request.client.host if request.client else "local"
    rate_key = f"{client_host}:{email}"

    blocked, retry_after = check_rate_limit(rate_key)
    if blocked:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Muitas tentativas de login. Aguarde {retry_after}s antes de tentar novamente.",
            headers={"Retry-After": str(retry_after)},
        )

    user = repository.get_by_email(email)
    if not user or not verify_password(payload.password, user.password_hash):
        record_failed_attempt(rate_key)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha inválidos")

    reset_failed_attempts(rate_key)
    return token_response(user)


@router.post("/guest", response_model=TokenResponse)
def guest_login():
    visitor = UserRecord(id=f"guest-{uuid4()}", name="Visitante", email="", password_hash="", role="guest", is_guest=True)
    return token_response(visitor)


@router.get("/me", response_model=UserPublic)
def me(claims: dict = Depends(get_current_claims)):
    if claims.get("guest"):
        return UserPublic(id=claims["sub"], name="Visitante", email=None, role="guest", is_guest=True)
    user = repository.get_by_id(claims.get("sub", ""))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado ou sessão inválida")
    return public_user(user)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(claims: dict = Depends(get_current_claims)):
    """Renova a sessão atual emitindo um novo JWT e revogando o token anterior."""
    revoke_token_jti(claims.get("jti"), claims.get("exp"))
    if claims.get("guest"):
        visitor = UserRecord(id=claims["sub"], name="Visitante", email="", password_hash="", role="guest", is_guest=True)
        return token_response(visitor)
    user = repository.get_by_id(claims.get("sub", ""))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado ou sessão inválida")
    return token_response(user)


@router.post("/logout", response_model=MessageResponse)
def logout(claims: dict = Depends(get_current_claims)):
    revoke_token_jti(claims.get("jti"), claims.get("exp"))
    return MessageResponse(message="Sessão encerrada e token revogado com sucesso.")
