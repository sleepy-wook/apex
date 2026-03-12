from pydantic import field_validator
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # PostgreSQL (Supabase)
    database_url: str = "postgresql://postgres:password@localhost:5432/postgres"
    db_min_pool_size: int = 5
    db_max_pool_size: int = 20

    # Redis
    redis_url: str = "redis://localhost:6379"

    # App
    app_env: str = "development"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v  # type: ignore[return-value]

    # AWS S3
    s3_bucket: str = "apex-f1-data"
    aws_region: str = "us-east-1"

    # Cache TTLs (seconds)
    cache_ttl_race: int = 86400       # 24h
    cache_ttl_standings: int = 21600  # 6h
    cache_ttl_seasons: int = 604800   # 7d
    cache_ttl_drivers: int = 86400    # 24h

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
