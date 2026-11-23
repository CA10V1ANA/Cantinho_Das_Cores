from datetime import date, datetime
from pydantic import BaseModel, Field, model_validator


class ReportCreate(BaseModel):
    child_id: str
    period_start: date
    period_end: date

    @model_validator(mode="after")
    def check_period(self):
        if self.period_end < self.period_start:
            raise ValueError("period_end deve ser igual ou posterior a period_start")
        if (self.period_end - self.period_start).days > 365:
            raise ValueError("O período não pode passar de 366 dias")
        return self


class ReportSendRequest(BaseModel):
    channel: str = Field(default="email", pattern="^(email|smtp|webhook|console)$")
    recipient: str | None = Field(default=None, max_length=255)


class ReportPublic(BaseModel):
    id: str
    child_id: str
    child_name: str
    period_start: date
    period_end: date
    text: str
    generated_at: datetime
    sent_at: datetime | None
    sent: bool
    delivery_channel: str | None = None
    delivery_recipient: str | None = None


class ReportStatus(BaseModel):
    id: str
    sent: bool
    generated_at: datetime
    sent_at: datetime | None
