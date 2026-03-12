from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str = "ok"
    db: str = "connected"
    cache: str = "connected"


class SeasonsResponse(BaseModel):
    seasons: list[int]
