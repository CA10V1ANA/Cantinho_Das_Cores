from fastapi import Depends, FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import sqlite3
from app.core.config import settings
from app.core.database import create_backup, list_backups
from app.modules.auth.dependencies import require_active_responsible
from app.modules.auth.router import router as auth_router
from app.modules.children.router import router as children_router
from app.modules.games.router import router as games_router
from app.modules.sessions.router import router as sessions_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.reports.router import router as reports_router

logger = logging.getLogger("cantinho")

app = FastAPI(
    title="Cantinho das Cores API",
    description="API do Cantinho das Cores — Autenticação reforçada, perfis, catálogo, partidas, dashboard, envio de relatórios e backup SQLite.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    if settings.is_production or request.headers.get("x-forwarded-proto") == "https":
        response.headers.setdefault("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
    return response


app.include_router(auth_router)
app.include_router(children_router)
app.include_router(games_router)
app.include_router(sessions_router)
app.include_router(dashboard_router)
app.include_router(reports_router)


@app.exception_handler(sqlite3.IntegrityError)
async def sqlite_constraint_error(_: Request, exc: sqlite3.IntegrityError):
    message = str(exc).lower()
    if "unique" in message:
        detail = "Este registro já existe."
        code = 409
    elif "foreign key" in message:
        detail = "Não foi possível concluir: o registro relacionado não existe ou não está disponível."
        code = 422
    elif "check constraint" in message or "not null" in message:
        detail = "Os dados informados não atendem às regras de cadastro."
        code = 422
    else:
        detail = "Não foi possível salvar os dados informados."
        code = 422
    return JSONResponse(status_code=code, content={"detail": detail})


@app.exception_handler(Exception)
async def unexpected_error(request: Request, exc: Exception):
    """Resposta genérica: nada de SQL, caminhos, tokens ou stack trace para o cliente. O detalhe vai só para o log."""
    logger.error("Erro inesperado em %s %s: %s", request.method, request.url.path, type(exc).__name__, exc_info=exc)
    return JSONResponse(status_code=500, content={"detail": "Erro interno do servidor. Tente novamente em instantes."})


@app.get("/health", tags=["Sistema"])
def health_check():
    return {"status": "ok", "service": "cantinho-das-cores-api", "version": "1.0.0"}


@app.post("/api/system/backup", tags=["Sistema"], status_code=status.HTTP_201_CREATED)
def trigger_backup(_: str = Depends(require_active_responsible)):
    """Executa backup online consistente do banco SQLite com rotação automática."""
    return create_backup()


@app.get("/api/system/backups", tags=["Sistema"])
def get_backups(_: str = Depends(require_active_responsible)):
    """Lista os backups disponíveis no diretório persistente."""
    return list_backups()
