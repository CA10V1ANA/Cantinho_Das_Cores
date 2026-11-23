from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError
from app.modules.auth.repository import repository as users_repository
from app.modules.auth.security import decode_access_token, is_token_revoked

bearer = HTTPBearer(auto_error=False)


def get_current_claims(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token ausente",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        claims = decode_access_token(credentials.credentials)
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if is_token_revoked(claims.get("jti")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão encerrada. Faça login novamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return claims


def require_active_responsible(claims: dict = Depends(get_current_claims)) -> str:
    """Garante que o token pertence a um responsável cadastrado que ainda existe no banco."""
    if claims.get("guest") or claims.get("role") != "responsible":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas responsáveis cadastrados podem acessar este recurso",
        )
    sub = claims.get("sub", "")
    if users_repository.get_by_id(sub) is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Responsável não encontrado ou sessão inválida",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return sub
