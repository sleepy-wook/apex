from fastapi import APIRouter

from app.models.schedule import ScheduleResponse
from app.services import schedule_service

router = APIRouter()


@router.get("/schedule/{year}", response_model=ScheduleResponse)
async def get_schedule(year: int):
    """시즌 전체 일정 — 모든 세션(FP1~Race) 포함"""
    return await schedule_service.get_schedule(year)
