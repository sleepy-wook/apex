from fastapi import APIRouter

from app.api.v1 import circuits, drivers, head_to_head, races, schedule, standings, teams

v1_router = APIRouter(prefix="/api/v1")

# Races & sessions (no prefix — paths defined in the router itself)
v1_router.include_router(races.router, tags=["races"])

# Schedule
v1_router.include_router(schedule.router, tags=["schedule"])

# Teams
v1_router.include_router(teams.router, tags=["teams"])

# Circuits
v1_router.include_router(circuits.router, tags=["circuits"])

# Standings
v1_router.include_router(standings.router)

# Drivers
v1_router.include_router(drivers.router)

# Head-to-head
v1_router.include_router(head_to_head.router)
