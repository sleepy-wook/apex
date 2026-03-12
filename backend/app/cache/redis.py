import json
import logging
from functools import wraps
from typing import Any, Callable

import redis.asyncio as aioredis

from app.config import get_settings

logger = logging.getLogger(__name__)

_redis: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis | None:
    return _redis


async def init_redis() -> None:
    global _redis
    settings = get_settings()
    try:
        _redis = aioredis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=5,
        )
        await _redis.ping()
        logger.info("Redis connected successfully")
    except Exception as e:
        logger.warning("Redis connection failed, running without cache: %s", e)
        _redis = None


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.close()
        _redis = None


def cached(prefix: str, ttl: int, key_builder: Callable[..., str] | None = None):
    """
    Cache decorator for async functions.
    Falls back to direct DB call if Redis is unavailable.

    Usage:
        @cached(prefix="races", ttl=86400, key_builder=lambda year: f"{year}")
        async def get_races(year: int): ...
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            r = _redis
            if r is None:
                return await func(*args, **kwargs)

            # Build cache key
            if key_builder is not None:
                key_suffix = key_builder(*args, **kwargs)
            else:
                parts = [str(a) for a in args] + [
                    f"{k}={v}" for k, v in sorted(kwargs.items())
                ]
                key_suffix = ":".join(parts)

            cache_key = f"apex:{prefix}:{key_suffix}"

            try:
                cached_data = await r.get(cache_key)
                if cached_data is not None:
                    logger.debug("Cache HIT: %s", cache_key)
                    return json.loads(cached_data)
            except Exception as e:
                logger.warning("Cache read error for %s: %s", cache_key, e)

            # Cache miss — call the actual function
            result = await func(*args, **kwargs)

            try:
                await r.set(cache_key, json.dumps(result, default=str), ex=ttl)
                logger.debug("Cache SET: %s (TTL=%ds)", cache_key, ttl)
            except Exception as e:
                logger.warning("Cache write error for %s: %s", cache_key, e)

            return result

        return wrapper

    return decorator
