"""Central FastAPI exception handlers for domain and unexpected errors."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppError
from app.schemas.common import ErrorResponse

logger = logging.getLogger("app.api")


def _error_body(
    *,
    detail: str,
    code: str,
    field: str | None = None,
) -> dict[str, Any]:
    """Build the locked error envelope, omitting null field."""
    payload = ErrorResponse(detail=detail, code=code, field=field)
    data = payload.model_dump()
    if data.get("field") is None:
        data.pop("field", None)
    return data


async def app_error_handler(_request: Request, exc: Exception) -> JSONResponse:
    """Map domain AppError subclasses to HTTP JSON responses."""
    if not isinstance(exc, AppError):
        raise exc
    logger.warning(
        "domain_error code=%s status=%s detail=%s",
        exc.code,
        exc.status_code,
        exc.detail,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body(detail=exc.detail, code=exc.code, field=exc.field),
    )


async def request_validation_error_handler(
    _request: Request,
    exc: Exception,
) -> JSONResponse:
    """Normalize FastAPI/Pydantic validation errors to the project envelope."""
    if not isinstance(exc, RequestValidationError):
        raise exc
    errors = exc.errors()
    first = errors[0] if errors else {}
    loc = first.get("loc", ())
    field: str | None = None
    if isinstance(loc, (list, tuple)) and len(loc) >= 2:
        field = str(loc[-1])
    elif isinstance(loc, (list, tuple)) and loc:
        field = str(loc[-1])

    message = first.get("msg", "Validation error")
    if isinstance(message, str) and message.startswith("Value error, "):
        message = message.removeprefix("Value error, ")

    logger.info("validation_error field=%s detail=%s", field, message)
    return JSONResponse(
        status_code=422,
        content=_error_body(
            detail=str(message),
            code="VALIDATION_ERROR",
            field=field,
        ),
    )


async def http_exception_handler(
    _request: Request,
    exc: Exception,
) -> JSONResponse:
    """Normalize Starlette/FastAPI HTTPException to the project envelope."""
    if not isinstance(exc, StarletteHTTPException):
        raise exc
    detail = exc.detail
    if not isinstance(detail, str):
        detail = "Request error"
    code = "HTTP_ERROR"
    if exc.status_code == 404:
        code = "NOT_FOUND"
    elif exc.status_code == 405:
        code = "METHOD_NOT_ALLOWED"
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body(detail=detail, code=code),
    )


async def unhandled_exception_handler(
    _request: Request,
    exc: Exception,
) -> JSONResponse:
    """Log unexpected errors and return a safe 500 envelope (no stack leak)."""
    logger.error("unhandled_exception", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content=_error_body(
            detail="An unexpected error occurred",
            code="INTERNAL_ERROR",
        ),
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Attach all exception handlers to the application."""
    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(RequestValidationError, request_validation_error_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
