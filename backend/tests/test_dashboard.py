from fastapi.testclient import TestClient
from app.main import app
from app.modules.auth.repository import repository as users
from app.modules.children.repository import repository as kids
from app.modules.sessions.repository import repository as sessions

client = TestClient(app)

def setup_function():
    users.clear(); kids.clear(); sessions.clear()

def register(email='dash@example.com'):
    t = client.post('/api/auth/register', json={'name':'Responsável','email':email,'password':'SenhaForte123','accepted_terms':True}).json()['access_token']
    return {'Authorization': f'Bearer {t}'}

def child(h, name='Ana'):
    return client.post('/api/children', json={'name':name,'age':8}, headers=h).json()['id']

def play(h, cid, game='cores', ok=5, err=0, done=True, dur=60, at='2026-11-10T10:00:00+00:00'):
    r = client.post('/api/sessions', json={'child_id':cid,'game_id':game,'correct_answers':ok,'incorrect_answers':err,'completed':done,'duration_seconds':dur,'played_at':at}, headers=h)
    assert r.status_code == 201, r.text

def seed(h):
    cid = child(h)
    play(h, cid, 'cores', 5, 0, True, 60, '2026-11-10T10:00:00+00:00')
    play(h, cid, 'cores', 5, 5, True, 100, '2026-11-11T10:00:00+00:00')
    play(h, cid, 'ligar', 2, 3, False, 30, '2026-11-11T11:00:00+00:00')
    return cid

def test_summary():
    h = register(); cid = seed(h)
    s = client.get(f'/api/dashboard/summary?child_id={cid}', headers=h).json()
    assert s['total_matches'] == 3 and s['completed_matches'] == 2 and s['completion_rate'] == 67
    assert s['abandoned_matches'] == 1
    # indicadores de desempenho consideram só as concluídas (a abandonada de 2x3 fica de fora)
    assert s['average_score'] == 75.0 and s['average_duration_seconds'] == 80.0
    assert s['total_correct'] == 10 and s['total_errors'] == 5

def test_only_abandoned_has_no_score_but_counts_matches():
    h = register(); cid = child(h)
    play(h, cid, 'cores', 0, 0, False, 5)
    s = client.get('/api/dashboard/summary', headers=h).json()
    assert s['total_matches'] == 1 and s['completed_matches'] == 0 and s['abandoned_matches'] == 1
    assert s['average_score'] is None and s['average_duration_seconds'] is None and s['completion_rate'] == 0
    g = {x['game_id']: x for x in client.get('/api/dashboard/games', headers=h).json()}
    assert g['cores']['total_matches'] == 1 and g['cores']['average_score'] is None

def test_summary_empty():
    h = register(); child(h)
    s = client.get('/api/dashboard/summary', headers=h).json()
    assert s['total_matches'] == 0 and s['completion_rate'] == 0 and s['average_score'] is None

def test_games_lists_all_games_with_data():
    h = register(); seed(h)
    g = {x['game_id']: x for x in client.get('/api/dashboard/games', headers=h).json()}
    assert len(g) == 6 and g['cores']['completed_matches'] == 2 and g['ligar']['completed_matches'] == 0
    assert g['falar']['total_matches'] == 0 and g['falar']['average_score'] is None

def test_evolution_groups_by_day():
    h = register(); seed(h)
    e = client.get('/api/dashboard/evolution', headers=h).json()
    assert [x['date'] for x in e] == ['2026-11-10', '2026-11-11']
    assert e[1]['matches'] == 2 and e[1]['completed_matches'] == 1 and e[1]['abandoned_matches'] == 1
    assert e[1]['average_score'] == 50.0

def test_history_paginated_includes_abandoned():
    h = register(); seed(h)
    r = client.get('/api/dashboard/history?limit=2', headers=h).json()
    assert r['total'] == 3 and len(r['items']) == 2
    assert r['items'][0]['game_id'] == 'ligar' and r['items'][0]['completed'] is False
    assert r['items'][0]['child_name'] == 'Ana'

def test_isolation_and_permissions():
    h1 = register('a@example.com'); cid = seed(h1)
    h2 = register('b@example.com')
    assert client.get(f'/api/dashboard/summary?child_id={cid}', headers=h2).status_code == 404
    assert client.get('/api/dashboard/summary', headers=h2).json()['total_matches'] == 0
    g = client.post('/api/auth/guest').json()['access_token']
    assert client.get('/api/dashboard/summary', headers={'Authorization': f'Bearer {g}'}).status_code == 403
    assert client.get('/api/dashboard/summary').status_code == 401

def test_invalid_params():
    h = register()
    assert client.get('/api/dashboard/summary?days=0', headers=h).status_code == 422
    assert client.get('/api/dashboard/history?game_id=xxx', headers=h).status_code == 404
