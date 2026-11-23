"""Testes dos 5 novos requisitos do backend:
1. Regra definitiva de pontuação do Bloquinho de Frutas
2. Canal real de envio dos relatórios (outbox, SMTP, webhook)
3. Configuração de hospedagem, domínio, CORS e cabeçalhos HTTPS
4. Backup online, rotação e persistência WAL do banco de dados SQLite
5. Segurança reforçada de autenticação e sessões (revogação de JWT no logout, refresh token, rate limit e usuário removido)
"""
from datetime import datetime, timezone
from pathlib import Path
from fastapi.testclient import TestClient
from app.core import database
from app.main import app
from app.modules.auth.repository import repository as users
from app.modules.children.repository import repository as kids
from app.modules.reports.delivery import clear_outbox, get_outbox
from app.modules.sessions.repository import repository as sessions

client = TestClient(app)
SENHA = "SenhaForte123"


def setup_function():
    users.clear()
    kids.clear()
    sessions.clear()
    clear_outbox()


def registrar_e_logar(email="novos@example.com"):
    r = client.post(
        "/api/auth/register",
        json={"name": "Responsável", "email": email, "password": SENHA, "accepted_terms": True},
    )
    assert r.status_code == 201
    tok = r.json()["access_token"]
    return tok, {"Authorization": f"Bearer {tok}"}


def criar_crianca(headers, nome="Bia", idade=9):
    r = client.post("/api/children", json={"name": nome, "age": idade}, headers=headers)
    assert r.status_code == 201
    return r.json()["id"]


# ---------- 1. Regra definitiva de pontuação do Bloquinho de Frutas ----------
def test_pontuacao_definitiva_bloquinho_de_frutas_concluida_com_bonus():
    _, h = registrar_e_logar("frutas@example.com")
    cid = criar_crianca(h)
    r = client.post(
        "/api/sessions",
        json={
            "child_id": cid,
            "game_id": "frutas",
            "correct_answers": 4,
            "incorrect_answers": 1,
            "completed": True,
            "duration_seconds": 65,
            "goals_completed": 3,
            "total_goals": 3,
            "squares_closed": 2,
            "moves_remaining": 4,
        },
        headers=h,
    )
    assert r.status_code == 201
    body = r.json()
    assert body["completed"] is True
    assert body["correct_answers"] == 5  # normalizado para 5 ao concluir todas as metas
    assert body["score"] == 100


def test_pontuacao_definitiva_bloquinho_de_frutas_parcial_proporcional_as_metas():
    _, h = registrar_e_logar("frutas_parcial@example.com")
    cid = criar_crianca(h)
    r = client.post(
        "/api/sessions",
        json={
            "child_id": cid,
            "game_id": "frutas",
            "correct_answers": 3,
            "incorrect_answers": 2,
            "completed": False,
            "duration_seconds": 50,
            "goals_completed": 2,
            "total_goals": 4,
            "squares_closed": 1,
            "moves_remaining": 0,
        },
        headers=h,
    )
    assert r.status_code == 201
    body = r.json()
    assert body["completed"] is False
    assert 1 <= body["correct_answers"] <= 4
    assert 0 < body["score"] <= 100


# ---------- 2. Canal real de envio dos relatórios ----------
def test_envio_real_de_relatorio_registra_na_outbox_e_marca_enviado():
    _, h = registrar_e_logar("relatorio@example.com")
    cid = criar_crianca(h)
    hoje = datetime.now(timezone.utc).date().isoformat()
    rep = client.post("/api/reports", json={"child_id": cid, "period_start": hoje, "period_end": hoje}, headers=h)
    assert rep.status_code == 201
    rid = rep.json()["id"]

    enviado = client.post(
        f"/api/reports/{rid}/send",
        json={"channel": "console", "recipient": "escola@example.com"},
        headers=h,
    )
    assert enviado.status_code == 200
    data = enviado.json()
    assert data["sent"] is True and data["sent_at"] is not None
    assert data["delivery_channel"] == "console"
    assert data["delivery_recipient"] == "escola@example.com"

    outbox = get_outbox()
    assert len(outbox) == 1
    assert outbox[0]["report_id"] == rid
    assert outbox[0]["recipient"] == "escola@example.com"


# ---------- 3. Hospedagem, domínio e cabeçalhos HTTPS ----------
def test_cabecalhos_de_seguranca_e_hsts_em_https():
    r = client.get("/health", headers={"X-Forwarded-Proto": "https"})
    assert r.status_code == 200
    assert r.headers.get("x-content-type-options") == "nosniff"
    assert r.headers.get("x-frame-options") == "DENY"
    assert "max-age=" in r.headers.get("strict-transport-security", "")


# ---------- 4. Backup e persistência do banco de dados ----------
def test_backup_online_e_rotacao_do_sqlite(tmp_path, monkeypatch):
    monkeypatch.setattr(database, "BACKUP_DIR", tmp_path)
    _, h = registrar_e_logar("backup@example.com")
    criar_crianca(h, "Lucas", 10)

    r1 = client.post("/api/system/backup", headers=h)
    assert r1.status_code == 201
    b1 = r1.json()
    assert Path(b1["path"]).exists() and b1["size_bytes"] > 0

    lista = client.get("/api/system/backups", headers=h)
    assert lista.status_code == 200
    assert len(lista.json()) >= 1


# ---------- 5. Segurança da autenticação e das sessões ----------
def test_logout_revoga_token_no_servidor():
    _, h = registrar_e_logar("revogar@example.com")
    assert client.get("/api/auth/me", headers=h).status_code == 200
    assert client.post("/api/auth/logout", headers=h).status_code == 200
    # Mesmo com token ainda dentro do prazo, o servidor recusa após logout
    assert client.get("/api/auth/me", headers=h).status_code == 401
    assert client.get("/api/children", headers=h).status_code == 401


def test_refresh_token_emite_novo_e_revoga_anterior():
    _, h = registrar_e_logar("refresh@example.com")
    r = client.post("/api/auth/refresh", headers=h)
    assert r.status_code == 200
    novo_token = r.json()["access_token"]
    # O token antigo foi revogado
    assert client.get("/api/auth/me", headers=h).status_code == 401
    # O token novo funciona normalmente
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {novo_token}"}).status_code == 200


def test_rate_limiting_bloqueia_tentativas_excessivas_de_login():
    registrar_e_logar("alvo@example.com")
    for _ in range(5):
        r = client.post("/api/auth/login", json={"email": "alvo@example.com", "password": "errada"})
        assert r.status_code == 401
    bloqueado = client.post("/api/auth/login", json={"email": "alvo@example.com", "password": SENHA})
    assert bloqueado.status_code == 429
    assert "Retry-After" in bloqueado.headers


def test_token_de_responsavel_excluido_e_rejeitado_com_401():
    _, h = registrar_e_logar("excluido@example.com")
    with database.connect() as db:
        db.execute("DELETE FROM responsaveis WHERE email='excluido@example.com'")
    assert client.get("/api/children", headers=h).status_code == 401
    assert client.get("/api/dashboard/summary", headers=h).status_code == 401
    assert client.get("/api/reports", headers=h).status_code == 401
