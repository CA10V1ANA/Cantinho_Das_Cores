from fastapi.testclient import TestClient
from app.main import app
from app.modules.auth.repository import repository as users_repository
from app.modules.children.repository import repository as children_repository

client = TestClient(app)

def setup_function():
    users_repository.clear()
    children_repository.clear()

def responsible_token(email="responsavel@example.com"):
    response = client.post("/api/auth/register", json={"name":"Responsável", "email":email, "password":"SenhaForte123", "accepted_terms": True})
    return response.json()["access_token"]

def auth(token):
    return {"Authorization": f"Bearer {token}"}

def test_create_and_list_child():
    token = responsible_token()
    created = client.post("/api/children", json={"name":"Criança", "age":8}, headers=auth(token))
    assert created.status_code == 201
    assert created.json()["name"] == "Criança"
    assert created.json()["age"] == 8
    assert created.json()["responsible_id"]
    listed = client.get("/api/children", headers=auth(token))
    assert len(listed.json()) == 1

def test_child_age_validation():
    token = responsible_token()
    assert client.post("/api/children", json={"name":"Criança", "age":2}, headers=auth(token)).status_code == 422
    assert client.post("/api/children", json={"name":"Criança", "age":19}, headers=auth(token)).status_code == 422

def test_update_and_delete_child():
    token = responsible_token()
    created = client.post("/api/children", json={"name":"Criança", "age":8}, headers=auth(token)).json()
    child_id = created["id"]
    updated = client.put(f"/api/children/{child_id}", json={"name":"Novo nome", "age":9}, headers=auth(token))
    assert updated.status_code == 200
    assert updated.json()["name"] == "Novo nome" and updated.json()["age"] == 9
    assert client.delete(f"/api/children/{child_id}", headers=auth(token)).status_code == 204
    assert client.get(f"/api/children/{child_id}", headers=auth(token)).status_code == 404

def test_user_cannot_access_another_users_child():
    owner_token = responsible_token("owner@example.com")
    other_token = responsible_token("other@example.com")
    child = client.post("/api/children", json={"name":"Perfil", "age":10}, headers=auth(owner_token)).json()
    assert client.get(f"/api/children/{child['id']}", headers=auth(other_token)).status_code == 404
    assert client.delete(f"/api/children/{child['id']}", headers=auth(other_token)).status_code == 404

def test_guest_cannot_manage_children():
    guest_token = client.post("/api/auth/guest").json()["access_token"]
    assert client.get("/api/children", headers=auth(guest_token)).status_code == 403
    assert client.post("/api/children", json={"name":"Perfil", "age":8}, headers=auth(guest_token)).status_code == 403

def test_children_requires_authentication():
    assert client.get("/api/children").status_code == 401
