"""Ticket API integration tests (Milestone M6)."""

from fastapi.testclient import TestClient

from app.models.user import User
from tests.conftest import auth_headers


def _create_ticket(
    client: TestClient,
    user_id: int,
    *,
    title: str = "Login issue",
    description: str = "Cannot reset password",
    priority: str = "high",
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


def test_create_ticket_returns_201_open_status(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """POST /tickets creates with status Open and requires X-User-Id."""
    alice, bob = seed_users[0], seed_users[1]
    payload = _create_ticket(db_client, alice.id, assigned_to=bob.id)

    assert payload["status"] == "Open"
    assert payload["title"] == "Login issue"
    assert payload["created_by"] == alice.id
    assert payload["assigned_to"] == bob.id


def test_create_ticket_missing_header_returns_400(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """POST /tickets without X-User-Id returns 400 INVALID_USER_HEADER."""
    assert seed_users
    response = db_client.post(
        "/api/v1/tickets",
        json={
            "title": "No header",
            "description": "Should fail",
            "priority": "low",
        },
    )
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_USER_HEADER"


def test_create_ticket_unknown_user_returns_400(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """POST /tickets with unknown X-User-Id returns 400."""
    assert seed_users
    response = db_client.post(
        "/api/v1/tickets",
        json={
            "title": "Bad user",
            "description": "Should fail",
            "priority": "low",
        },
        headers=auth_headers(999),
    )
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_USER_HEADER"


def test_get_ticket_not_found_returns_404(db_client: TestClient) -> None:
    """GET /tickets/{id} returns 404 for missing tickets."""
    response = db_client.get("/api/v1/tickets/999")
    assert response.status_code == 404
    assert response.json()["code"] == "TICKET_NOT_FOUND"


def test_get_ticket_includes_comments_asc(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """GET /tickets/{id} returns nested comments ordered by created_at ASC."""
    alice = seed_users[0]
    ticket = _create_ticket(db_client, alice.id)
    ticket_id = ticket["id"]

    first = db_client.post(
        f"/api/v1/tickets/{ticket_id}/comments",
        json={"message": "First"},
        headers=auth_headers(alice.id),
    )
    second = db_client.post(
        f"/api/v1/tickets/{ticket_id}/comments",
        json={"message": "Second"},
        headers=auth_headers(alice.id),
    )
    assert first.status_code == 201
    assert second.status_code == 201

    response = db_client.get(f"/api/v1/tickets/{ticket_id}")
    assert response.status_code == 200
    detail = response.json()
    assert [c["message"] for c in detail["comments"]] == ["First", "Second"]


def test_patch_ticket_rejects_status_field(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """PATCH /tickets/{id} with status in body returns 422."""
    alice = seed_users[0]
    ticket = _create_ticket(db_client, alice.id)

    response = db_client.patch(
        f"/api/v1/tickets/{ticket['id']}",
        json={"status": "Closed"},
    )
    assert response.status_code == 422
    assert response.json()["code"] == "VALIDATION_ERROR"


def test_patch_ticket_updates_fields(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """PATCH /tickets/{id} updates title/priority without changing status."""
    alice, bob = seed_users[0], seed_users[1]
    ticket = _create_ticket(db_client, alice.id)

    response = db_client.patch(
        f"/api/v1/tickets/{ticket['id']}",
        json={
            "title": "Updated title",
            "priority": "medium",
            "assigned_to": bob.id,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["title"] == "Updated title"
    assert payload["priority"] == "medium"
    assert payload["assigned_to"] == bob.id
    assert payload["status"] == "Open"


def test_invalid_status_transition_returns_409(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """PATCH /tickets/{id}/status rejects Open → Closed with 409."""
    alice = seed_users[0]
    ticket = _create_ticket(db_client, alice.id)

    response = db_client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        json={"status": "Closed"},
    )
    assert response.status_code == 409
    body = response.json()
    assert body["code"] == "INVALID_STATUS_TRANSITION"
    assert "Open" in body["detail"]
    assert "Closed" in body["detail"]


def test_valid_status_transition_returns_200(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """PATCH /tickets/{id}/status allows Open → In Progress."""
    alice = seed_users[0]
    ticket = _create_ticket(db_client, alice.id)

    response = db_client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        json={"status": "In Progress"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "In Progress"


def test_list_tickets_returns_items_and_total(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """GET /tickets returns paginated items and total."""
    alice = seed_users[0]
    _create_ticket(db_client, alice.id, title="One")
    _create_ticket(db_client, alice.id, title="Two", priority="low")

    response = db_client.get("/api/v1/tickets")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 2
    assert len(payload["items"]) == 2


def test_export_route_registered_before_id(
    db_client: TestClient,
) -> None:
    """GET /tickets/export is registered (stub) and not treated as {id}."""
    response = db_client.get("/api/v1/tickets/export")
    assert response.status_code == 501
    assert response.json()["code"] == "NOT_IMPLEMENTED"


def test_unknown_assignee_returns_422(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """POST /tickets with unknown assigned_to returns 422."""
    alice = seed_users[0]
    response = db_client.post(
        "/api/v1/tickets",
        json={
            "title": "Bad assignee",
            "description": "Missing user",
            "priority": "medium",
            "assigned_to": 999,
        },
        headers=auth_headers(alice.id),
    )
    assert response.status_code == 422
    body = response.json()
    assert body["code"] == "ASSIGNEE_NOT_FOUND"
    assert body["field"] == "assigned_to"
