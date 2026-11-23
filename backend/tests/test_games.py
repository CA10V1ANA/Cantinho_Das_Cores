from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_catalog_lists_exact_six_frontend_games():
    response = client.get('/api/games')
    assert response.status_code == 200
    assert [item['id'] for item in response.json()] == ['cores', 'encaixe', 'ligar', 'corforma', 'falar', 'frutas']

def test_catalog_game_details():
    response = client.get('/api/games/cores')
    assert response.status_code == 200
    assert response.json()['name'] == 'Acerte a cor'
    assert response.json()['supported_ages'] == list(range(3, 19))

def test_unknown_game_returns_404():
    assert client.get('/api/games/inexistente').status_code == 404
