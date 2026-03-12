from pydantic import BaseModel


class Driver(BaseModel):
    driver_number: int
    full_name: str
    name_acronym: str
    team_name: str
    team_colour: str
    first_name: str | None = None
    last_name: str | None = None
    headshot_url: str | None = None
    country_code: str | None = None


class DriversResponse(BaseModel):
    drivers: list[Driver]


class HeadToHeadDriver(BaseModel):
    name_acronym: str
    full_name: str
    qualifying_wins: int
    race_wins: int
    avg_position: float
    total_points: float


class HeadToHeadResponse(BaseModel):
    year: int
    team_name: str
    team_colour: str
    driver_1: HeadToHeadDriver
    driver_2: HeadToHeadDriver
