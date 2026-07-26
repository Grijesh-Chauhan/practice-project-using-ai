"""FastAPI application entrypoint."""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints import health
from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exception_handlers import register_exception_handlers
from app.core.logging import configure_logging

logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Configure logging on startup and emit lifecycle messages."""
    settings = get_settings()
    configure_logging(settings.log_level)
    logger.info("Starting %s (%s)", settings.app_name, settings.app_env)
    yield
    logger.info("Shutting down %s", settings.app_name)


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    settings = get_settings()
    application = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        lifespan=lifespan,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
        allow_headers=["Content-Type", "X-User-Id"],
    )
    register_exception_handlers(application)
    # Unversioned liveness probe (see docs/api-contract.md)
    application.include_router(health.router)
    application.include_router(api_router, prefix=settings.api_v1_prefix)
    return application


app = create_app()
