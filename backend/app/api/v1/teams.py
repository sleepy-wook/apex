from fastapi import APIRouter

from app.models.team import TeamsResponse
from app.services import team_service

router = APIRouter()


@router.get("/teams/{year}", response_model=TeamsResponse)
async def get_teams(year: int):
    """시즌 팀 목록 — 컨스트럭터 순위 + 소속 드라이버"""
    return await team_service.get_teams(year)
