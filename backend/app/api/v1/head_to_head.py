from fastapi import APIRouter, HTTPException

from app.models.driver import HeadToHeadResponse
from app.services import driver_service

router = APIRouter(tags=["head-to-head"])


@router.get(
    "/head-to-head/{year}/{constructor_id}",
    response_model=HeadToHeadResponse,
)
async def get_head_to_head(year: int, constructor_id: str):
    """팀메이트 간 H2H 비교"""
    result = await driver_service.get_head_to_head(year, constructor_id)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Head-to-head data not found for {constructor_id} in {year}",
        )
    return result
