"""CSV export API integration tests (FR-07, AC-040–AC-043)."""

import csv
import io

from fastapi.testclient import TestClient

from app.models.user import User
from app.utils.csv_export import TICKET_CSV_COLUMNS
from tests.conftest import auth_headers


def _create_ticket(
    client: TestClient,
    user_id: int,
    *,
    title: str = "Export me",
    priority: str = "high",
) -> dict[str, object]:
    response = client.post(
        "/api/v1/tickets",
        json={
            "title": title,
            "description": "Ticket for export tests",
            "priority": priority,
        },
        headers=auth_headers(user_id),
    )
    assert response.status_code == 201, response.text
    return response.json()


def _parse_csv(body: str) -> list[dict[str, str]]:
    return list(csv.DictReader(io.StringIO(body)))


def test_export_returns_csv_content_type_and_headers(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """Export responds with text/csv and an attachment filename."""
    alice = seed_users[0]
    _create_ticket(db_client, alice.id)

    response = db_client.get(
        "/api/v1/tickets/export",
        headers=auth_headers(alice.id),
    )
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert 'filename="my-tickets.csv"' in response.headers["content-disposition"]


def test_export_has_locked_column_headers(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """CSV header row matches the locked column order (no comments column)."""
    alice = seed_users[0]
    _create_ticket(db_client, alice.id)

    response = db_client.get(
        "/api/v1/tickets/export",
        headers=auth_headers(alice.id),
    )
    rows = _parse_csv(response.text)
    assert rows
    assert list(rows[0].keys()) == list(TICKET_CSV_COLUMNS)
    assert "comments" not in rows[0]


def test_export_excludes_other_users_tickets(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """Export only includes tickets created by the requesting user."""
    alice, bob = seed_users[0], seed_users[1]
    _create_ticket(db_client, alice.id, title="Alice ticket")
    _create_ticket(db_client, bob.id, title="Bob ticket")

    response = db_client.get(
        "/api/v1/tickets/export",
        headers=auth_headers(alice.id),
    )
    rows = _parse_csv(response.text)
    titles = {row["title"] for row in rows}
    assert titles == {"Alice ticket"}
    assert all(int(row["created_by"]) == alice.id for row in rows)


def test_export_applies_filters_within_own_tickets(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """Query filters narrow the export within the caller's own tickets."""
    alice = seed_users[0]
    _create_ticket(db_client, alice.id, title="High one", priority="high")
    _create_ticket(db_client, alice.id, title="Low one", priority="low")

    response = db_client.get(
        "/api/v1/tickets/export",
        params={"priority": "high"},
        headers=auth_headers(alice.id),
    )
    rows = _parse_csv(response.text)
    assert {row["title"] for row in rows} == {"High one"}


def test_export_without_user_header_returns_400(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """Export without X-User-Id returns 400 INVALID_USER_HEADER."""
    assert seed_users
    response = db_client.get("/api/v1/tickets/export")
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_USER_HEADER"


def test_export_unknown_user_returns_400(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """Export with an unknown X-User-Id returns 400."""
    assert seed_users
    response = db_client.get(
        "/api/v1/tickets/export",
        headers=auth_headers(999),
    )
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_USER_HEADER"
