"""Ticket stats API integration tests."""

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.ticket import Ticket
from app.models.user import User
from tests.conftest import auth_headers


def test_stats_returns_aggregations(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """GET /tickets/stats returns status/priority/month aggregates."""
    alice = seed_users[0]
    assert (
        db_client.post(
            "/api/v1/tickets",
            json={
                "title": "Stats high open",
                "description": "For stats",
                "priority": "high",
            },
            headers=auth_headers(alice.id),
        ).status_code
        == 201
    )
    assert (
        db_client.post(
            "/api/v1/tickets",
            json={
                "title": "Stats low open",
                "description": "For stats",
                "priority": "low",
            },
            headers=auth_headers(alice.id),
        ).status_code
        == 201
    )

    response = db_client.get("/api/v1/tickets/stats")
    assert response.status_code == 200
    payload = response.json()
    assert payload["by_status"]["Open"] == 2
    assert payload["by_priority"]["high"] == 1
    assert payload["by_priority"]["low"] == 1
    assert any(cell["status"] == "Open" for cell in payload["by_status_priority"])
    assert payload["created_by_month"]
    assert payload["status_by_month"]


def test_stats_respects_created_after(
    db_client: TestClient,
    db_session: Session,
    seed_users: list[User],
) -> None:
    """Stats honor created_after the same way list filters do."""
    alice = seed_users[0]
    recent = db_client.post(
        "/api/v1/tickets",
        json={
            "title": "Recent stats ticket",
            "description": "Keep",
            "priority": "medium",
        },
        headers=auth_headers(alice.id),
    ).json()
    old = db_client.post(
        "/api/v1/tickets",
        json={
            "title": "Old stats ticket",
            "description": "Exclude",
            "priority": "medium",
        },
        headers=auth_headers(alice.id),
    ).json()

    old_row = db_session.get(Ticket, old["id"])
    assert old_row is not None
    old_row.created_at = datetime.now(UTC) - timedelta(days=400)
    db_session.commit()

    cutoff = (datetime.now(UTC) - timedelta(days=180)).isoformat()
    response = db_client.get(
        "/api/v1/tickets/stats",
        params={"created_after": cutoff},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["by_status"].get("Open", 0) == 1
    assert sum(payload["by_status"].values()) == 1
    assert recent["id"]
