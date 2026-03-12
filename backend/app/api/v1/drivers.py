from fastapi import APIRouter, HTTPException

from app.models.driver import Driver, DriversResponse
from app.services import driver_service

router = APIRouter(prefix="/drivers", tags=["drivers"])


@router.get("", response_model=DriversResponse)
async def list_drivers(year: int | None = None):
    """현재 시즌 드라이버 목록"""
    return await driver_service.get_drivers(year)


@router.get("/{driver_number}", response_model=Driver)
async def get_driver(driver_number: int, year: int | None = None):
    """드라이버 상세"""
    result = await driver_service.get_driver_detail(driver_number, year)
    if result is None:
        raise HTTPException(status_code=404, detail="Driver not found")
    return result
