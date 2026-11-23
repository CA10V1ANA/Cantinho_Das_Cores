from fastapi.testclient import TestClient
from app.main import app
from app.modules.auth.repository import repository as users_repository
from app.modules.children.repository import repository as children_repository
from app.modules.sessions.repository import repository as sessions_repository

client = TestClient(app)

def setup_function():
    users_repository.clear()
    children_repository.clear()
    sessions_repository.clear()

def register(email='sessoes@example.com'):
    return client.post('/api/auth/register', json={'name':'Responsável','email':email,'password':'SenhaForte123','accepted_terms':True}).json()['access_token']

def headers(token):
    return {'Authorization': f'Bearer {token}'}

def child(token, age=8):
    return client.post('/api/children', json={'name':'Criança','age':age}, headers=headers(token)).json()

def payload(child_id, **changes):
    data = {'child_id':child_id,'game_id':'cores','correct_answers':5,'incorrect_answers':0,'completed':True,'duration_seconds':75}
    data.update(changes)
    return data

def test_create_session_calculates_attempts_and_accuracy():
    token = register(); profile = child(token)
    response = client.post('/api/sessions', json=payload(profile['id']), headers=headers(token))
    assert response.status_code == 201
    body = response.json()
    assert body['attempts'] == 5 and body['accuracy_rate'] == 100
    assert body['age'] == 8 and body['child_id'] == profile['id']

def test_list_sessions_and_filter_by_child_and_game():
    token = register(); profile = child(token)
    client.post('/api/sessions', json=payload(profile['id']), headers=headers(token))
    assert len(client.get('/api/sessions', headers=headers(token)).json()) == 1
    assert len(client.get(f"/api/sessions?child_id={profile['id']}&game_id=cores", headers=headers(token)).json()) == 1
    assert client.get('/api/sessions?game_id=nao-existe', headers=headers(token)).status_code == 404

def test_read_session_and_hide_from_other_owner():
    token = register('a@example.com'); other = register('b@example.com'); profile = child(token)
    created = client.post('/api/sessions', json=payload(profile['id']), headers=headers(token)).json()
    assert client.get(f"/api/sessions/{created['id']}", headers=headers(token)).status_code == 200
    assert client.get(f"/api/sessions/{created['id']}", headers=headers(other)).status_code == 404

def test_cannot_record_session_for_another_responsibles_child():
    owner = register('owner@example.com'); other = register('other@example.com')
    profile = child(owner)
    response = client.post('/api/sessions', json=payload(profile['id']), headers=headers(other))
    assert response.status_code == 404

def test_guest_cannot_create_or_list_sessions():
    guest = client.post('/api/auth/guest').json()['access_token']
    assert client.get('/api/sessions', headers=headers(guest)).status_code == 403
    assert client.post('/api/sessions', json=payload('fake'), headers=headers(guest)).status_code == 403

def test_invalid_game_and_payload_are_rejected():
    token = register(); profile = child(token)
    assert client.post('/api/sessions', json=payload(profile['id'], game_id='nao-existe'), headers=headers(token)).status_code == 404
    assert client.post('/api/sessions', json=payload(profile['id'], correct_answers=4, completed=True), headers=headers(token)).status_code == 422

def test_deleting_child_also_deletes_its_sessions():
    token = register(); profile = child(token)
    client.post('/api/sessions', json=payload(profile['id']), headers=headers(token))
    assert len(client.get('/api/sessions', headers=headers(token)).json()) == 1
    assert client.delete(f"/api/children/{profile['id']}", headers=headers(token)).status_code == 204
    assert client.get('/api/sessions', headers=headers(token)).json() == []


def test_abandoned_session_is_saved_but_not_listed_in_reports():
    token = register(); profile = child(token)
    abandoned = payload(profile['id'], correct_answers=0, incorrect_answers=0, completed=False, duration_seconds=12)
    created = client.post('/api/sessions', json=abandoned, headers=headers(token))
    assert created.status_code == 201
    assert created.json()['accuracy_rate'] == 0
    assert created.json()['attempts'] == 0
    assert client.get('/api/sessions', headers=headers(token)).json() == []
