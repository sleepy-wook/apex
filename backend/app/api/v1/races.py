from fastapi import APIRouter, HTTPException

from app.models.race import (
    LapsResponse,
    PositionsResponse,
    RaceResultsResponse,
    RaceSummaryResponse,
    SeasonRacesResponse,
    SessionDetail,
)
from app.models.strategy import StrategyResponse
from app.models.common import SeasonsResponse
from app.services import race_service

router = APIRouter()


@router.get("/seasons", response_model=SeasonsResponse)
async def list_seasons():
    """사용 가능한 시즌 목록"""
    return await race_service.get_seasons()


@router.get("/seasons/{year}/races", response_model=SeasonRacesResponse)
async def list_season_races(year: int):
    """시즌 내 전체 레이스(GP) 목록"""
    return await race_service.get_season_races(year)


@router.get("/sessions/{session_key}", response_model=SessionDetail)
async def get_session(session_key: int):
    """특정 세션 상세 정보"""
    result = await race_service.get_session_detail(session_key)
    if result is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return result


@router.get("/races/{year}/{round}/summary", response_model=RaceSummaryResponse)
async def get_race_summary(year: int, round: int):
    """레이스 요약"""
    result = await race_service.get_race_summary(year, round)
    if result is None:
        raise HTTPException(status_code=404, detail="Race summary not found")
    return result


@router.get("/races/{year}/{round}/results", response_model=RaceResultsResponse)
async def get_race_results(year: int, round: int):
    """드라이버별 레이스 결과"""
    return await race_service.get_race_results(year, round)


@router.get("/races/{year}/{round}/laps", response_model=LapsResponse)
async def get_race_laps(year: int, round: int, driver_number: int | None = None):
    """랩별 분석 데이터 — lap_analysis는 S3 Parquet (현재 미구현, 빈 배열 반환)"""
    # lap_analysis is stored in S3 Parquet, not in PostgreSQL.
    # This endpoint is a placeholder; the S3/telemetry agent will implement it.
    return {"laps": []}


@router.get("/races/{year}/{round}/positions", response_model=PositionsResponse)
async def get_race_positions(year: int, round: int):
    """랩별 포지션 변화 — position_changes는 S3 (현재 미구현, 빈 배열 반환)"""
    # position_changes is stored in S3 Parquet, not in PostgreSQL.
    return {"positions": []}


@router.get("/races/{year}/{round}/strategy", response_model=StrategyResponse)
async def get_race_strategy(year: int, round: int):
    """피트 전략"""
    return await race_service.get_race_strategy(year, round)
