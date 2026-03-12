import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import v1_router
from app.cache.redis import close_redis, get_redis, init_redis
from app.config import get_settings
from app.db.connection import close_pool, get_pool, init_pool

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB pool + Redis. Shutdown: close both."""
    logger.info("Starting up Apex API...")
    await init_pool()
    logger.info("PostgreSQL connection pool initialized")
    await init_redis()
    logger.info("Redis initialized")
    yield
    logger.info("Shutting down Apex API...")
    await close_redis()
    await close_pool()
    logger.info("All connections closed")


settings = get_settings()

app = FastAPI(
    title="Apex F1 API",
    description="한국 F1 팬을 위한 데이터 분석 플랫폼 API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Register v1 routes
app.include_router(v1_router)


# Health check
@app.get("/api/v1/health")
async def health_check():
    """서버 상태 확인"""
    db_status = "connected"
    cache_status = "connected"

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
    except Exception:
        db_status = "disconnected"

    try:
        r = await get_redis()
        if r is not None:
            await r.ping()
        else:
            cache_status = "disconnected"
    except Exception:
        cache_status = "disconnected"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "db": db_status,
        "cache": cache_status,
    }
