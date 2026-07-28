"""Ticket search & filter API integration tests (FR-06, AC-030–AC-033)."""

from fastapi.testclient import TestClient

from app.models.user import User
from tests.conftest import auth_headers


def _create_ticket(
    client: TestClient,
    user_id: int,
    *,
    title: str,
    description: str = "Body text",
    priority: str = "medium",
    assigned_to: int | None = None,
) -> dict[str, object]:
    payload: dict[str, object] = {
        "title": title,
        "description": description,
        "priority": priority,
    }
    if assigned_to is not None:
        payload["assigned_to"] = assigned_to
    response = client.post(
        "/api/v1/tickets",
        json=payload,
        headers=auth_headers(user_id),
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_search_by_query_matches_title_case_insensitive(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """`q` performs a case-insensitive match on title."""
    alice = seed_users[0]
    _create_ticket(db_client, alice.id, title="Password reset broken")
    _create_ticket(db_client, alice.id, title="Dashboard slow")

    response = db_client.get("/api/v1/tickets", params={"q": "password"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    assert payload["items"][0]["title"] == "Password reset broken"


def test_search_by_query_matches_description(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """`q` also matches the description field."""
    alice = seed_users[0]
    _create_ticket(
        db_client,
        alice.id,
        title="Ticket A",
        description="Contains unique keyword zebra",
    )
    _create_ticket(db_client, alice.id, title="Ticket B", description="Nothing here")

    response = db_client.get("/api/v1/tickets", params={"q": "zebra"})
    assert response.json()["total"] == 1


def test_filter_by_status(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """Filtering by status returns only matching tickets."""
    alice = seed_users[0]
    open_ticket = _create_ticket(db_client, alice.id, title="Stays open")
    moved = _create_ticket(db_client, alice.id, title="Moves on")
    db_client.patch(
        f"/api/v1/tickets/{moved['id']}/status",
        json={"status": "In Progress"},
    )

    response = db_client.get("/api/v1/tickets", params={"status": "Open"})
    payload = response.json()
    ids = {item["id"] for item in payload["items"]}
    assert open_ticket["id"] in ids
    assert moved["id"] not in ids


def test_filter_by_priority(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """Filtering by priority returns only matching tickets."""
    alice = seed_users[0]
    _create_ticket(db_client, alice.id, title="High one", priority="high")
    _create_ticket(db_client, alice.id, title="Low one", priority="low")

    response = db_client.get("/api/v1/tickets", params={"priority": "high"})
    payload = response.json()
    assert payload["total"] == 1
    assert payload["items"][0]["title"] == "High one"


def test_combined_search_and_filter(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """Text search combines with a priority filter (AND semantics)."""
    alice = seed_users[0]
    _create_ticket(db_client, alice.id, title="Urgent bug", priority="high")
    _create_ticket(db_client, alice.id, title="Urgent chore", priority="low")
    _create_ticket(db_client, alice.id, title="Calm bug", priority="high")

    response = db_client.get(
        "/api/v1/tickets",
        params={"q": "urgent", "priority": "high"},
    )
    payload = response.json()
    assert payload["total"] == 1
    assert payload["items"][0]["title"] == "Urgent bug"


def test_filter_by_assignee(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """Filtering by assigned_to returns only tickets for that assignee."""
    alice, bob = seed_users[0], seed_users[1]
    _create_ticket(db_client, alice.id, title="For Bob", assigned_to=bob.id)
    _create_ticket(db_client, alice.id, title="Unassigned")

    response = db_client.get("/api/v1/tickets", params={"assigned_to": bob.id})
    payload = response.json()
    assert payload["total"] == 1
    assert payload["items"][0]["title"] == "For Bob"
