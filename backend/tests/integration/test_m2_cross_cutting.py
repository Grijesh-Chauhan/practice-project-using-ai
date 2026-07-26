"""Milestone M2 cross-cutting infrastructure tests."""

from __future__ import annotations

import logging
from collections.abc import Generator
from typing import Annotated

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.exceptions import (
    BusinessValidationError,
    InvalidStatusTransitionError,
    InvalidUserHeaderError,
    TicketNotFoundError,
)
from app.main import create_app

DbSession = Annotated[Session, Depends(get_db)]


class _DemoBody(BaseModel):
    """Minimal body used to trigger RequestValidationError."""

    title: str = Field(min_length=1, max_length=10)


def _register_m2_demo_routes(application: FastAPI) -> None:
    """Throwaway routes that exercise domain exception handlers and DI."""

    @application.get("/__m2__/ticket-not-found")
    def raise_ticket_not_found() -> None:
        raise TicketNotFoundError(ticket_id=999)

    @application.get("/__m2__/invalid-transition")
    def raise_invalid_transition() -> None:
        raise InvalidStatusTransitionError(
            from_status="Open",
            to_status="Closed",
        )

    @application.get("/__m2__/invalid-user-header")
    def raise_invalid_user_header() -> None:
        raise InvalidUserHeaderError()

    @application.get("/__m2__/business-validation")
    def raise_business_validation() -> None:
        raise BusinessValidationError(
            "Assignee not found",
            code="ASSIGNEE_NOT_FOUND",
            field="assigned_to",
        )

    @application.get("/__m2__/unhandled")
    def raise_unhandled() -> None:
        raise RuntimeError("boom-secret-stack")

    @application.post("/__m2__/validate")
    def validate_body(body: _DemoBody) -> dict[str, str]:
        return {"title": body.title}

    @application.get("/__m2__/db")
    def check_db(db: DbSession) -> dict[str, object]:
        result = db.execute(text("SELECT 1")).scalar()
        return {"ok": True, "result": result}


@pytest.fixture
def client() -> Generator[TestClient]:
    """App client with M2 throwaway routes mounted."""
    application = create_app()
    _register_m2_demo_routes(application)
    with TestClient(application) as test_client:
        yield test_client


def test_ticket_not_found_maps_to_404_envelope(client: TestClient) -> None:
    """TicketNotFoundError → 404 with detail + code."""
    response = client.get("/__m2__/ticket-not-found")
    assert response.status_code == 404
    body = response.json()
    assert body["detail"] == "Ticket not found"
    assert body["code"] == "TICKET_NOT_FOUND"
    assert "traceback" not in body
    assert "stack" not in str(body).lower()


def test_invalid_status_transition_maps_to_409(client: TestClient) -> None:
    """InvalidStatusTransitionError → 409 + INVALID_STATUS_TRANSITION."""
    response = client.get("/__m2__/invalid-transition")
    assert response.status_code == 409
    body = response.json()
    assert body["code"] == "INVALID_STATUS_TRANSITION"
    assert "Cannot transition from Open to Closed" in body["detail"]
    assert body.get("field") == "status"


def test_invalid_user_header_maps_to_400(client: TestClient) -> None:
    """InvalidUserHeaderError → 400 + INVALID_USER_HEADER."""
    response = client.get("/__m2__/invalid-user-header")
    assert response.status_code == 400
    body = response.json()
    assert body["code"] == "INVALID_USER_HEADER"
    assert "detail" in body


def test_business_validation_maps_to_422(client: TestClient) -> None:
    """BusinessValidationError → 422 with custom code and field."""
    response = client.get("/__m2__/business-validation")
    assert response.status_code == 422
    body = response.json()
    assert body["code"] == "ASSIGNEE_NOT_FOUND"
    assert body["field"] == "assigned_to"
    assert body["detail"] == "Assignee not found"


def test_unhandled_exception_returns_safe_500() -> None:
    """Unhandled errors → 500 INTERNAL_ERROR without leaking stack traces."""
    application = create_app()
    _register_m2_demo_routes(application)
    # raise_server_exceptions=False mirrors real ASGI servers for Exception handlers
    with TestClient(application, raise_server_exceptions=False) as test_client:
        response = test_client.get("/__m2__/unhandled")
    assert response.status_code == 500
    body = response.json()
    assert body == {
        "detail": "An unexpected error occurred",
        "code": "INTERNAL_ERROR",
    }
    raw = response.text
    assert "boom-secret-stack" not in raw
    assert "Traceback" not in raw
    assert "RuntimeError" not in raw


def test_request_validation_normalized_to_envelope(client: TestClient) -> None:
    """RequestValidationError → 422 VALIDATION_ERROR envelope."""
    response = client.post("/__m2__/validate", json={"title": ""})
    assert response.status_code == 422
    body = response.json()
    assert body["code"] == "VALIDATION_ERROR"
    assert "detail" in body
    assert body.get("field") == "title"


def test_get_db_dependency_provides_session(client: TestClient) -> None:
    """get_db yields a usable SQLAlchemy session per request."""
    response = client.get("/__m2__/db")
    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert body["result"] == 1


def test_cors_allows_localhost_and_x_user_id(client: TestClient) -> None:
    """CORS preflight allows Vite origin and X-User-Id header."""
    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "x-user-id,content-type",
        },
    )
    assert response.status_code in {200, 204}
    assert (
        response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    )
    allow_headers = response.headers.get("access-control-allow-headers", "").lower()
    assert "x-user-id" in allow_headers
    assert "content-type" in allow_headers


def test_cors_rejects_unknown_origin(client: TestClient) -> None:
    """Unknown origins are not reflected in Access-Control-Allow-Origin."""
    response = client.get(
        "/health",
        headers={"Origin": "http://evil.example"},
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") != "http://evil.example"


def test_logging_emits_info_on_startup(caplog: pytest.LogCaptureFixture) -> None:
    """Startup configures logging and emits an INFO lifecycle message."""
    with caplog.at_level(logging.INFO, logger="app"):
        application = create_app()
        with TestClient(application):
            pass
    assert any(
        "Starting" in record.getMessage() and record.levelno == logging.INFO
        for record in caplog.records
    )
