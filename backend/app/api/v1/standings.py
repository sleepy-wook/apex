from fastapi import APIRouter

from app.models.standing import (
    ConstructorStandingsResponse,
    DriverStandingsResponse,
    StandingsProgressionResponse,
)
from app.services import standing_service

router = APIRouter(prefix="/standings", tags=["standings"])


# NOTE: progression must be registered BEFORE /drivers/{year}
# to avoid "progression" being matched as a {year} path param.
@router.get(
    "/drivers/{year}/progression",
    response_model=StandingsProgressionResponse,
)
async def get_driver_standings_progression(year: int):
    """라운드별 포인트 추이 (스탠딩 차트용)"""
    return await standing_service.get_standings_progression(year)


@router.get("/drivers/{year}", response_model=DriverStandingsResponse)
async def get_driver_standings(year: int, round: int | None = None):
    """드라이버 챔피언십 순위"""
    return await standing_service.get_driver_standings(year, round)


@router.get("/constructors/{year}", response_model=ConstructorStandingsResponse)
async def get_constructor_standings(year: int, round: int | None = None):
    """컨스트럭터 챔피언십 순위"""
    return await standing_service.get_constructor_standings(year, round)
