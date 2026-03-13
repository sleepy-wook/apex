from pydantic import BaseModel


class DriverStanding(BaseModel):
    position: int | None
    driver_id: str
    driver_name: str
    name_acronym: str
    team_name: str
    team_colour: str
    points: float
    wins: int


class DriverStandingsResponse(BaseModel):
    year: int
    round: int
    standings: list[DriverStanding]


class ConstructorStanding(BaseModel):
    position: int | None
    constructor_id: str
    constructor_name: str
    team_colour: str
    points: float
    wins: int


class ConstructorStandingsResponse(BaseModel):
    year: int
    round: int
    standings: list[ConstructorStanding]


class RoundPoints(BaseModel):
    round: int
    points: float


class StandingsProgression(BaseModel):
    driver_id: str
    name_acronym: str
    team_colour: str
    rounds: list[RoundPoints]


class StandingsProgressionResponse(BaseModel):
    progression: list[StandingsProgression]
