"""Catálogo consultado na tabela jogos do banco oficial."""
from app.core.database import connect

FRONTEND_GAMES = {
    "cores": ("Acerte a cor", "Identificar e selecionar cores."),
    "encaixe": ("Encaixe as formas", "Reconhecer e encaixar formas geométricas."),
    "ligar": ("Ligue ao nome", "Associar palavras a imagens."),
    "corforma": ("Cor e forma", "Relacionar cores e formas geométricas."),
    "falar": ("Vamos falar", "Explorar palavras, sílabas e frases."),
    "frutas": ("Bloquinho de Frutas", "Atividade lúdica com frutas e blocos."),
}

def list_games():
    with connect() as db:
        rows = db.execute("SELECT id_jogo,nome,habilidade FROM jogos ORDER BY id_jogo").fetchall()
    order = {key: index for index, key in enumerate(FRONTEND_GAMES)}
    rows = sorted(rows, key=lambda r: order.get(r["id_jogo"], 999))
    return [{"id": r["id_jogo"], "name": r["nome"], "description": FRONTEND_GAMES.get(r["id_jogo"], (r["nome"], r["habilidade"]))[1], "active": True, "supported_ages": list(range(3, 19))} for r in rows]

def get_game(game_id: str):
    return next((g for g in list_games() if g["id"] == game_id), None)

GAMES = list_games()
