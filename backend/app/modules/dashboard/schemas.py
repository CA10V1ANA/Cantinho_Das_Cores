from datetime import datetime
from pydantic import BaseModel

class Summary(BaseModel):
    child_id: str | None
    total_matches: int
    completed_matches: int
    abandoned_matches: int
    completion_rate: int
    average_score: float | None
    average_duration_seconds: float | None
    total_correct: int
    total_errors: int
    last_played_at: datetime | None

class GamePerformance(BaseModel):
    game_id: str
    name: str
    skill: str
    total_matches: int
    completed_matches: int
    abandoned_matches: int
    average_score: float | None
    average_duration_seconds: float | None
    total_errors: int
    last_played_at: datetime | None

class EvolutionPoint(BaseModel):
    date: str
    matches: int
    completed_matches: int
    abandoned_matches: int
    average_score: float | None
    average_duration_seconds: float | None

class HistoryItem(BaseModel):
    id: str
    child_id: str
    child_name: str
    game_id: str
    game_name: str
    correct_answers: int
    incorrect_answers: int
    score: int
    duration_seconds: int | None
    completed: bool
    played_at: datetime

class History(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[HistoryItem]
