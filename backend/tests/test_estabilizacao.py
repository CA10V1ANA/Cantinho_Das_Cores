"""Módulo 8 — testes de auditoria/estabilização (segurança, robustez, isolamento, configuração)."""
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core import database
from app.core.config import DEV_JWT_SECRET, Settings, settings
from app.main import app
from app.modules.auth.repository import repository as users
from app.modules.children.repository import repository as kids
from app.modules.reports import repository as reports_repo
from app.modules.sessions.repository import repository as sessions

client = TestClient(app)
SENHA = "SenhaForte123"


def setup_function():
    users.clear(); kids.clear(); sessions.clear()


def conta(email="m8@example.com"):
    r = client.post("/api/auth/register", json={"name": "Responsável", "email": email, "password": SENHA, "accepted_terms": True})
    assert r.status_code == 201
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def crianca(h, nome="Ana", idade=8):
    return client.post("/api/children", json={"name": nome, "age": idade}, headers=h).json()["id"]


def partida(cid, jogo="cores", acertos=5, erros=0, concluida=True, played_at=None):
    return {"child_id": cid, "game_id": jogo, "correct_answers": acertos, "incorrect_answers": erros, "completed": concluida,
            "duration_seconds": 30, "played_at": played_at or datetime.now(timezone.utc).isoformat()}


# ---------- Isolamento da suíte e banco ----------
def test_suite_usa_banco_temporario_e_nao_o_real():
    real = Path(database.BACKEND_DIR) / "data" / "cantinho_das_cores.sqlite3"
    assert Path(database.DB_PATH).resolve() != real.resolve()


def test_init_db_e_idempotente_e_mantem_seis_jogos():
    database.init_db(); database.init_db()
    with database.connect() as db:
        ids = [r["id_jogo"] for r in db.execute("SELECT id_jogo FROM jogos ORDER BY id_jogo")]
    assert ids == sorted(["cores", "encaixe", "ligar", "corforma", "falar", "frutas"])


def test_senha_gravada_como_hash_argon2_nunca_em_texto_puro():
    conta("hash@example.com")
    with database.connect() as db:
        senha = db.execute("SELECT senha FROM responsaveis WHERE email='hash@example.com'").fetchone()["senha"]
    assert senha.startswith("$argon2") and SENHA not in senha


def test_excluir_responsavel_apaga_criancas_partidas_e_relatorios_em_cascata():
    h = conta("cascata@example.com"); cid = crianca(h)
    client.post("/api/sessions", json=partida(cid), headers=h)
    hoje = datetime.now(timezone.utc).date().isoformat()
    client.post("/api/reports", json={"child_id": cid, "period_start": hoje, "period_end": hoje}, headers=h)
    with database.connect() as db:
        db.execute("DELETE FROM responsaveis WHERE email='cascata@example.com'")
        contagens = [db.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in ("criancas", "partidas", "relatorios")]
    assert contagens == [0, 0, 0]


# ---------- Autenticação / autorização ----------
@pytest.mark.parametrize("rota", ["/api/children", "/api/sessions", "/api/dashboard/summary", "/api/reports"])
def test_visitante_bloqueado_nas_rotas_restritas(rota):
    tok = client.post("/api/auth/guest").json()["access_token"]
    assert client.get(rota, headers={"Authorization": f"Bearer {tok}"}).status_code == 403


def test_visitante_acessa_catalogo_me_e_logout():
    tok = client.post("/api/auth/guest").json()["access_token"]
    h = {"Authorization": f"Bearer {tok}"}
    assert client.get("/api/games").status_code == 200
    assert client.get("/api/auth/me", headers=h).json()["is_guest"] is True
    assert client.post("/api/auth/logout", headers=h).status_code == 200


@pytest.mark.parametrize("rota", ["/api/children", "/api/sessions", "/api/dashboard/summary", "/api/reports", "/api/auth/me"])
def test_rotas_privadas_exigem_token(rota):
    assert client.get(rota).status_code == 401


def test_token_expirado_e_assinatura_falsa_sao_rejeitados_em_rota_privada():
    agora = datetime.now(timezone.utc)
    claims = {"sub": "1", "role": "responsible", "guest": False}
    expirado = jwt.encode({**claims, "exp": agora - timedelta(minutes=1)}, settings.jwt_secret, algorithm="HS256")
    falso = jwt.encode({**claims, "exp": agora + timedelta(minutes=5)}, "outro-segredo-qualquer-0123456789abcdef", algorithm="HS256")
    sem_assinatura = jwt.encode({**claims, "exp": agora + timedelta(minutes=5)}, key=None, algorithm="none")
    for tok in (expirado, falso, sem_assinatura):
        assert client.get("/api/children", headers={"Authorization": f"Bearer {tok}"}).status_code == 401


def test_login_nao_diferencia_email_inexistente_de_senha_errada():
    conta("existe@example.com")
    a = client.post("/api/auth/login", json={"email": "existe@example.com", "password": "errada123"})
    b = client.post("/api/auth/login", json={"email": "naoexiste@example.com", "password": "errada123"})
    assert a.status_code == b.status_code == 401 and a.json() == b.json()


# ---------- Robustez: identificadores inválidos devem dar 404, nunca 500 ----------
@pytest.mark.parametrize("ruim", ["abc", "1.5", "-", "99999999999999999999999999"])
def test_ids_invalidos_retornam_404_e_nao_500(ruim):
    h = conta("ids@example.com"); cid = crianca(h)
    ok = client.post("/api/sessions", json=partida(cid), headers=h).json()["id"]
    assert ok
    for metodo, url in [("get", f"/api/children/{ruim}"), ("put", f"/api/children/{ruim}"), ("delete", f"/api/children/{ruim}"),
                        ("get", f"/api/sessions/{ruim}"), ("get", f"/api/sessions?child_id={ruim}"),
                        ("get", f"/api/dashboard/summary?child_id={ruim}"), ("get", f"/api/dashboard/history?child_id={ruim}"),
                        ("get", f"/api/reports?child_id={ruim}"), ("get", f"/api/reports/{ruim}")]:
        kwargs = {"json": {"name": "Zé", "age": 9}} if metodo == "put" else {}
        r = getattr(client, metodo)(url, headers=h, **kwargs)
        assert r.status_code == 404, (metodo, url, r.status_code)
    assert client.post("/api/sessions", json=partida(ruim), headers=h).status_code in (404, 422)  # 422 se o schema já barra o tamanho
    hoje = datetime.now(timezone.utc).date().isoformat()
    assert client.post("/api/reports", json={"child_id": ruim, "period_start": hoje, "period_end": hoje}, headers=h).status_code == 404


def test_erro_inesperado_devolve_json_generico_sem_vazar_detalhes(monkeypatch):
    def quebra():
        raise sqlite3.OperationalError("unable to open database file /srv/segredo/caminho.sqlite3 SELECT * FROM responsaveis")
    monkeypatch.setattr("app.modules.games.router.list_games", quebra)
    r = TestClient(app, raise_server_exceptions=False).get("/api/games")
    assert r.status_code == 500
    assert r.json() == {"detail": "Erro interno do servidor. Tente novamente em instantes."}
    assert "segredo" not in r.text and "SELECT" not in r.text


# ---------- Partidas ----------
def test_played_at_com_fuso_e_convertido_para_utc():
    h = conta("fuso@example.com"); cid = crianca(h)
    # 23:30 em Fortaleza (UTC-03:00) == 02:30 UTC do dia seguinte
    r = client.post("/api/sessions", json=partida(cid, played_at="2026-11-20T23:30:00-03:00"), headers=h)
    assert r.status_code == 201
    assert r.json()["played_at"].startswith("2026-11-21T02:30:00")
    hist = client.get("/api/dashboard/history", headers=h).json()["items"][0]
    assert hist["played_at"].startswith("2026-11-21T02:30:00")


@pytest.mark.parametrize("campo,valor", [("duration_seconds", 86401), ("duration_seconds", -1), ("incorrect_answers", -1), ("correct_answers", -1),
                                         ("played_at", "2026-11-20T10:00:00")])
def test_partida_rejeita_limites_invalidos(campo, valor):
    h = conta("lim@example.com"); cid = crianca(h)
    corpo = partida(cid, acertos=2, concluida=False); corpo[campo] = valor
    assert client.post("/api/sessions", json=corpo, headers=h).status_code == 422


# ---------- Dashboard: filtros ----------
def test_dashboard_filtra_por_periodo_e_por_jogo():
    h = conta("filtro@example.com"); cid = crianca(h)
    antigo = (datetime.now(timezone.utc) - timedelta(days=20)).isoformat()
    client.post("/api/sessions", json=partida(cid, "cores", played_at=antigo), headers=h)
    client.post("/api/sessions", json=partida(cid, "ligar"), headers=h)
    assert client.get("/api/dashboard/summary", params={"child_id": cid}, headers=h).json()["total_matches"] == 2
    assert client.get("/api/dashboard/summary", params={"child_id": cid, "days": 3}, headers=h).json()["total_matches"] == 1
    evo = client.get("/api/dashboard/evolution", params={"child_id": cid, "game_id": "cores"}, headers=h).json()
    assert sum(p["matches"] for p in evo) == 1
    hist = client.get("/api/dashboard/history", params={"child_id": cid, "game_id": "ligar"}, headers=h).json()
    assert hist["total"] == 1 and hist["items"][0]["game_id"] == "ligar"


def test_dashboard_distingue_zero_de_sem_dados():
    h = conta("zero@example.com"); cid = crianca(h)
    vazio = client.get("/api/dashboard/summary", params={"child_id": cid}, headers=h).json()
    assert vazio["average_score"] is None and vazio["total_errors"] == 0 and vazio["total_matches"] == 0
    client.post("/api/sessions", json=partida(cid, "ligar", 0, 4, False), headers=h)  # só abandonada
    s = client.get("/api/dashboard/summary", params={"child_id": cid}, headers=h).json()
    assert s["average_score"] is None and s["total_matches"] == 1 and s["completed_matches"] == 0


def test_isolamento_do_dashboard_e_relatorios_entre_responsaveis():
    h1 = conta("um@example.com"); c1 = crianca(h1)
    client.post("/api/sessions", json=partida(c1), headers=h1)
    h2 = conta("dois@example.com")
    assert client.get("/api/dashboard/summary", headers=h2).json()["total_matches"] == 0
    assert client.get("/api/dashboard/summary", params={"child_id": c1}, headers=h2).status_code == 404
    hoje = datetime.now(timezone.utc).date().isoformat()
    rid = client.post("/api/reports", json={"child_id": c1, "period_start": hoje, "period_end": hoje}, headers=h1).json()["id"]
    assert client.get(f"/api/reports/{rid}", headers=h2).status_code == 404
    assert client.post(f"/api/reports/{rid}/sent", headers=h2).status_code == 404
    assert client.get("/api/reports", headers=h2).json() == []


# ---------- Relatórios: marcação de envio ----------
def test_marcar_enviado_duas_vezes_retorna_409_e_preserva_primeira_data():
    h = conta("env@example.com"); cid = crianca(h)
    hoje = datetime.now(timezone.utc).date().isoformat()
    rid = client.post("/api/reports", json={"child_id": cid, "period_start": hoje, "period_end": hoje}, headers=h).json()["id"]
    primeira = client.post(f"/api/reports/{rid}/sent", headers=h)
    assert primeira.status_code == 200
    assert client.post(f"/api/reports/{rid}/sent", headers=h).status_code == 409
    assert client.get(f"/api/reports/{rid}/status", headers=h).json()["sent_at"] == primeira.json()["sent_at"]


def test_marcacao_concorrente_perde_corrida_e_recebe_409(monkeypatch):
    """Se outra requisição marcar entre a checagem e o UPDATE, a segunda deve receber 409 (não 200)."""
    h = conta("corrida@example.com"); cid = crianca(h)
    hoje = datetime.now(timezone.utc).date().isoformat()
    rid = client.post("/api/reports", json={"child_id": cid, "period_start": hoje, "period_end": hoje}, headers=h).json()["id"]
    monkeypatch.setattr(reports_repo, "mark_sent", lambda _id: False)
    assert client.post(f"/api/reports/{rid}/sent", headers=h).status_code == 409


# ---------- Configuração / segurança ----------
def _cfg(**kw):
    return Settings(_env_file=None, **kw)


def test_producao_recusa_segredo_jwt_padrao_ou_curto():
    with pytest.raises(ValidationError):
        _cfg(app_env="production", jwt_secret=DEV_JWT_SECRET)
    with pytest.raises(ValidationError):
        _cfg(app_env="production", jwt_secret="curto")
    with pytest.raises(ValidationError):
        _cfg(app_env="production", jwt_secret="change-this-to-a-long-random-secret-before-deploying")


def test_producao_recusa_cors_curinga():
    with pytest.raises(ValidationError):
        _cfg(app_env="production", jwt_secret="x" * 48, cors_origins="*")


def test_producao_aceita_configuracao_segura_e_desenvolvimento_continua_livre():
    assert _cfg(app_env="production", jwt_secret="a1B2c3D4" * 6, cors_origins="https://meu-site.example").app_env == "production"
    assert _cfg(app_env="development").app_env == "development"


def test_database_path_vem_de_settings():
    assert str(_cfg(database_path="/tmp/x.sqlite3").database_path) == "/tmp/x.sqlite3"


def test_cors_nao_libera_origem_desconhecida():
    r = client.options("/api/auth/login", headers={"Origin": "https://malicioso.example", "Access-Control-Request-Method": "POST"})
    assert "access-control-allow-origin" not in r.headers
