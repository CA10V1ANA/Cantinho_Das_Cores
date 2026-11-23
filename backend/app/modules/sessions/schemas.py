from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator


class SessionCreate(BaseModel):
    child_id: str = Field(min_length=1, max_length=20)
    game_id: str = Field(min_length=1, max_length=32)
    correct_answers: int = Field(default=0, ge=0, le=5)
    incorrect_answers: int = Field(default=0, ge=0)
    completed: bool = False
    duration_seconds: int = Field(default=0, ge=0, le=86400)
    played_at: datetime | None = None

    # Campos específicos da regra definitiva de pontuação do Bloquinho de Frutas (frutas)
    goals_completed: int | None = Field(default=None, ge=0, le=10)
    total_goals: int | None = Field(default=None, ge=1, le=10)
    squares_closed: int = Field(default=0, ge=0, le=50)
    moves_remaining: int = Field(default=0, ge=0, le=100)

    @field_validator("played_at")
    @classmethod
    def require_timezone_when_provided(cls, value):
        if value is not None and value.tzinfo is None:
            raise ValueError("played_at deve conter fuso horário")
        return value


class SessionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    child_id: str
    game_id: str
    age: int
    correct_answers: int
    incorrect_answers: int
    attempts: int
    accuracy_rate: int
    score: int
    completed: bool
    duration_seconds: int
    played_at: datetime
    created_at: datetime
