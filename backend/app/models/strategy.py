from pydantic import BaseModel


class Stint(BaseModel):
    stint_number: int
    compound: str
    lap_start: int
    lap_end: int
    stint_laps: int
    tyre_age_at_start: int


class PitStop(BaseModel):
    lap_number: int
    pit_duration: float | None = None


class PitStrategy(BaseModel):
    driver_number: int
    name_acronym: str
    team_name: str
    team_colour: str
    stints: list[Stint]
    pit_stops: list[PitStop]


class StrategyResponse(BaseModel):
    strategies: list[PitStrategy]
