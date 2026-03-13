from pydantic import BaseModel


class SessionInfo(BaseModel):
    session_key: int
    session_name: str | None = None
    session_type: str | None = None
    date_start: str | None = None
    date_end: str | None = None


class ScheduleEvent(BaseModel):
    round: int | None = None
    circuit_key: int | None = None
    circuit_short_name: str
    country_name: str
    country_code: str | None = None
    location: str | None = None
    gmt_offset: str | None = None
    sessions: list[SessionInfo]
    winner_name: str | None = None
    winner_team: str | None = None
    winner_team_colour: str | None = None


class ScheduleResponse(BaseModel):
    year: int
    events: list[ScheduleEvent]
