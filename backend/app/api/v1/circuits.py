from fastapi import APIRouter, HTTPException

from app.models.circuit import CircuitDetailResponse, CircuitsResponse
from app.services import circuit_service

router = APIRouter()


@router.get("/circuits", response_model=CircuitsResponse)
async def list_circuits():
    """전체 서킷 목록"""
    return await circuit_service.get_circuits()


@router.get("/circuits/{circuit_key}", response_model=CircuitDetailResponse)
async def get_circuit(circuit_key: int):
    """서킷 상세 + 과거 레이스 결과"""
    result = await circuit_service.get_circuit_detail(circuit_key)
    if result is None:
        raise HTTPException(status_code=404, detail="Circuit not found")
    return result
