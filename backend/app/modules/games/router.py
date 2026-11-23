from fastapi import APIRouter, HTTPException
from app.modules.games.catalog import list_games, get_game
router = APIRouter(prefix="/api/games", tags=["Catálogo de jogos"])
@router.get("")
def list_all_games(): return list_games()
@router.get("/{game_id}")
def read_game(game_id: str):
    game = get_game(game_id)
    if game is None: raise HTTPException(status_code=404, detail="Jogo não encontrado")
    return game
