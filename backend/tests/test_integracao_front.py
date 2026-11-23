"""Fluxos usados pela integração do front (payloads iguais aos de src/services/partidas.js)."""
from datetime import datetime, timedelta, timezone
import jwt
from fastapi.testclient import TestClient
from app.core.config import settings
from app.main import app
from app.modules.auth.repository import repository as users
from app.modules.children.repository import repository as kids
from app.modules.sessions.repository import repository as sessions

client = TestClient(app)
JOGOS = {"cores", "encaixe", "ligar", "corforma", "falar", "frutas"}

def setup_function():
    users.clear(); kids.clear(); sessions.clear()

def conta(email="front@example.com"):
    r = client.post("/api/auth/register", json={"name": "Responsável", "email": email, "password": "SenhaForte123", "accepted_terms": True})
    assert r.status_code == 201
    return {"Authorization": f"Bearer {r.json()['access_token']}"}

def crianca(h, nome="Ana", idade=8):
    return client.post("/api/children", json={"name": nome, "age": idade}, headers=h).json()["id"]

def partida(cid, jogo="cores", acertos=5, erros=0, concluida=True, dur=60):
    return {"child_id": cid, "game_id": jogo, "correct_answers": acertos, "incorrect_answers": erros,
            "completed": concluida, "duration_seconds": dur, "played_at": datetime.now(timezone.utc).isoformat()}

def test_cadastro_sem_aceite_e_rejeitado():
    r = client.post("/api/auth/register", json={"name": "Responsável", "email": "a@example.com", "password": "SenhaForte123", "accepted_terms": False})
    assert r.status_code in (400, 422)

def test_email_repetido_ignora_maiusculas_e_retorna_409():
    conta("Maria@Example.com")
    r = client.post("/api/auth/register", json={"name": "Maria", "email": "maria@example.com", "password": "SenhaForte123", "accepted_terms": True})
    assert r.status_code == 409 and "cadastrado" in r.json()["detail"].lower()

def test_login_valido_e_invalido():
    conta("login@example.com")
    assert client.post("/api/auth/login", json={"email": "LOGIN@example.com", "password": "SenhaForte123"}).status_code == 200
    r = client.post("/api/auth/login", json={"email": "login@example.com", "password": "errada"})
    assert r.status_code == 401 and "access_token" not in r.text

def test_seis_jogos_no_catalogo_publico():
    r = client.get("/api/games")
    assert r.status_code == 200 and {g["id"] for g in r.json()} == JOGOS

def test_partida_concluida_abandonada_e_sem_respostas():
    h = conta(); cid = crianca(h)
    assert client.post("/api/sessions", json=partida(cid), headers=h).status_code == 201
    assert client.post("/api/sessions", json=partida(cid, "ligar", 2, 3, False, 20), headers=h).status_code == 201
    r = client.post("/api/sessions", json=partida(cid, "falar", 0, 0, False, 3), headers=h)
    assert r.status_code == 201 and r.json()["accuracy_rate"] == 0

def test_concluida_exige_cinco_acertos():
    h = conta(); cid = crianca(h)
    assert client.post("/api/sessions", json=partida(cid, acertos=3, concluida=True), headers=h).status_code == 422
    assert client.post("/api/sessions", json=partida(cid, acertos=6), headers=h).status_code == 422

def test_nao_acessa_crianca_de_outro_responsavel():
    h1 = conta("a@example.com"); cid = crianca(h1)
    h2 = conta("b@example.com")
    assert client.get(f"/api/children/{cid}", headers=h2).status_code == 404
    assert client.put(f"/api/children/{cid}", json={"name": "X1", "age": 9}, headers=h2).status_code == 404
    assert client.delete(f"/api/children/{cid}", headers=h2).status_code == 404
    assert client.post("/api/sessions", json=partida(cid), headers=h2).status_code == 404

def test_dashboard_vazio_e_com_abandonadas():
    h = conta(); cid = crianca(h)
    s = client.get(f"/api/dashboard/summary?child_id={cid}", headers=h).json()
    assert s["total_matches"] == 0 and s["average_score"] is None
    client.post("/api/sessions", json=partida(cid), headers=h)
    client.post("/api/sessions", json=partida(cid, "ligar", 1, 4, False, 15), headers=h)
    s = client.get(f"/api/dashboard/summary?child_id={cid}", headers=h).json()
    assert (s["total_matches"], s["completed_matches"], s["abandoned_matches"]) == (2, 1, 1)
    assert s["average_score"] == 100.0 and s["total_errors"] == 0
    hist = client.get(f"/api/dashboard/history?child_id={cid}", headers=h).json()
    assert {i["completed"] for i in hist["items"]} == {True, False}

def test_relatorio_gerar_consultar_e_registrar_envio():
    h = conta(); cid = crianca(h)
    client.post("/api/sessions", json=partida(cid), headers=h)
    hoje = datetime.now(timezone.utc).date().isoformat()
    r = client.post("/api/reports", json={"child_id": cid, "period_start": hoje, "period_end": hoje}, headers=h)
    assert r.status_code == 201 and r.json()["sent"] is False
    rid = r.json()["id"]
    assert client.get(f"/api/reports/{rid}", headers=h).json()["text"]
    assert client.post(f"/api/reports/{rid}/sent", headers=h).json()["sent_at"]

def test_token_invalido_e_expirado():
    assert client.get("/api/children", headers={"Authorization": "Bearer lixo"}).status_code == 401
    expirado = jwt.encode({"sub": "1", "role": "responsible", "guest": False,
                           "exp": datetime.now(timezone.utc) - timedelta(minutes=1)}, settings.jwt_secret, algorithm="HS256")
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {expirado}"}).status_code == 401

def test_cors_libera_origem_do_vite():
    r = client.options("/api/auth/login", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST",
                                                  "Access-Control-Request-Headers": "authorization,content-type"})
    assert r.headers.get("access-control-allow-origin") == "http://localhost:5173"
