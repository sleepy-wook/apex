from pydantic import BaseModel


class TeamDriver(BaseModel):
    driver_name: str
    name_acronym: str
    driver_number: int | None = None
    points: float = 0.0
    driver_position: int | None = None
    headshot_url: str | None = None


class Team(BaseModel):
    position: int
    constructor_id: str
    constructor_name: str
    team_colour: str
    points: float
    wins: int
    drivers: list[TeamDriver]
    # Detail fields from team_details seed table
    full_name: str | None = None
    base_city: str | None = None
    base_country: str | None = None
    founded_year: int | None = None
    engine_supplier: str | None = None
    team_principal: str | None = None
    world_championships: int | None = None


class TeamsResponse(BaseModel):
    year: int
    round: int
    teams: list[Team]
