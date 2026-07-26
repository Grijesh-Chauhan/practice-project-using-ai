"""Application settings loaded from environment variables."""

from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the FastAPI application."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = Field(default="Support Ticket API", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    database_url: str = Field(
        default="sqlite:///./data/tickets.db",
        alias="DATABASE_URL",
    )
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:5173"],
        alias="CORS_ORIGINS",
    )
    api_v1_prefix: str = Field(default="/api/v1", alias="API_V1_PREFIX")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        """Accept comma-separated CORS origins from environment strings."""
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("app_env")
    @classmethod
    def validate_app_env(cls, value: str) -> str:
        """Restrict app environment to known values."""
        allowed = {"development", "production", "test"}
        if value not in allowed:
            msg = f"APP_ENV must be one of {sorted(allowed)}"
            raise ValueError(msg)
        return value


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
