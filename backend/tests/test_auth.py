from fastapi.testclient import TestClient
from app.main import app
from app.modules.auth.repository import repository
client = TestClient(app)
def setup_function():
    repository.clear()
def test_register_success_and_never_returns_password():
    res = client.post("/api/auth/register", json={"name":"Responsável", "email":"teste@example.com", "password":"SenhaForte123", "accepted_terms": True})
    assert res.status_code == 201
    body = res.json()
    assert body["access_token"]
    assert body["user"]["email"] == "teste@example.com"
    assert "password" not in body["user"] and "password_hash" not in body["user"]
def test_duplicate_email_conflict():
    payload = {"name":"Pessoa", "email":"dup@example.com", "password":"SenhaForte123", "accepted_terms": True}
    assert client.post("/api/auth/register", json=payload).status_code == 201
    assert client.post("/api/auth/register", json=payload).status_code == 409
def test_register_validation_and_terms_required():
    assert client.post("/api/auth/register", json={"name":"Jo", "email":"jo@example.com", "password":"SenhaForte123", "accepted_terms": False}).status_code == 422
    assert client.post("/api/auth/register", json={"name":"Jo", "email":"jo@example.com", "password":"123", "accepted_terms": True}).status_code == 422
def test_login_success_and_invalid_password():
    client.post("/api/auth/register", json={"name":"Pessoa", "email":"login@example.com", "password":"SenhaForte123", "accepted_terms": True})
    assert client.post("/api/auth/login", json={"email":"login@example.com", "password":"SenhaForte123", "accepted_terms": True}).status_code == 200
    wrong = client.post("/api/auth/login", json={"email":"login@example.com", "password":"wrong"})
    assert wrong.status_code == 401 and wrong.json()["detail"] == "E-mail ou senha inválidos"
def test_guest_and_me():
    visitor = client.post("/api/auth/guest")
    assert visitor.status_code == 200
    token = visitor.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization":f"Bearer {token}"})
    assert me.status_code == 200 and me.json()["is_guest"] and me.json()["role"] == "guest"
def test_me_requires_valid_token():
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization":"Bearer invalid"}).status_code == 401
def test_logout_requires_token_and_accepts_valid_token():
    assert client.post("/api/auth/logout").status_code == 401
    token = client.post("/api/auth/guest").json()["access_token"]
    assert client.post("/api/auth/logout", headers={"Authorization":f"Bearer {token}"}).status_code == 200


def test_email_is_case_insensitive():
    payload = {"name":"Pessoa", "email":"Case@Example.com", "password":"SenhaForte123", "accepted_terms": True}
    assert client.post('/api/auth/register', json=payload).status_code == 201
    assert client.post('/api/auth/login', json={"email":"case@example.com", "password":"SenhaForte123"}).status_code == 200
    duplicate = {**payload, "email":"CASE@example.com"}
    assert client.post('/api/auth/register', json=duplicate).status_code == 409
