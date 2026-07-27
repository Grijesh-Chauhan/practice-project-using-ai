"""Comments API integration tests (Milestone M7)."""

from fastapi.testclient import TestClient

from app.models.user import User
from tests.conftest import auth_headers


def _create_ticket(client: TestClient, user_id: int) -> dict[str, object]:
    response = client.post(
        "/api/v1/tickets",
        json={
            "title": "Commentable",
            "description": "Needs a comment",
            "priority": "medium",
        },
        headers=auth_headers(user_id),
    )
    assert response.status_code == 201
    return response.json()


def test_create_comment_returns_201(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """POST /tickets/{id}/comments creates with created_by from header."""
    alice, bob = seed_users[0], seed_users[1]
    ticket = _create_ticket(db_client, alice.id)

    response = db_client.post(
        f"/api/v1/tickets/{ticket['id']}/comments",
        json={"message": "  Investigating  "},
        headers=auth_headers(bob.id),
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["message"] == "Investigating"
    assert payload["ticket_id"] == ticket["id"]
    assert payload["created_by"] == bob.id
    assert "id" in payload
    assert "created_at" in payload


def test_create_comment_missing_ticket_returns_404(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """POST comments on unknown ticket returns 404."""
    alice = seed_users[0]
    response = db_client.post(
        "/api/v1/tickets/999/comments",
        json={"message": "Orphan comment"},
        headers=auth_headers(alice.id),
    )
    assert response.status_code == 404
    assert response.json()["code"] == "TICKET_NOT_FOUND"


def test_create_comment_bad_user_returns_400(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """POST comments with unknown X-User-Id returns 400."""
    alice = seed_users[0]
    ticket = _create_ticket(db_client, alice.id)

    response = db_client.post(
        f"/api/v1/tickets/{ticket['id']}/comments",
        json={"message": "Bad author"},
        headers=auth_headers(999),
    )
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_USER_HEADER"


def test_create_comment_missing_header_returns_400(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """POST comments without X-User-Id returns 400."""
    alice = seed_users[0]
    ticket = _create_ticket(db_client, alice.id)

    response = db_client.post(
        f"/api/v1/tickets/{ticket['id']}/comments",
        json={"message": "No header"},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_USER_HEADER"


def test_create_comment_empty_message_returns_422(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """POST comments with empty/whitespace message returns 422."""
    alice = seed_users[0]
    ticket = _create_ticket(db_client, alice.id)

    response = db_client.post(
        f"/api/v1/tickets/{ticket['id']}/comments",
        json={"message": "   "},
        headers=auth_headers(alice.id),
    )
    assert response.status_code == 422
    assert response.json()["code"] == "VALIDATION_ERROR"


def test_comment_allowed_on_closed_ticket(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """Comments are allowed on Closed tickets."""
    alice = seed_users[0]
    ticket = _create_ticket(db_client, alice.id)
    ticket_id = ticket["id"]

    assert (
        db_client.patch(
            f"/api/v1/tickets/{ticket_id}/status",
            json={"status": "In Progress"},
        ).status_code
        == 200
    )
    assert (
        db_client.patch(
            f"/api/v1/tickets/{ticket_id}/status",
            json={"status": "Resolved"},
        ).status_code
        == 200
    )
    assert (
        db_client.patch(
            f"/api/v1/tickets/{ticket_id}/status",
            json={"status": "Closed"},
        ).status_code
        == 200
    )

    response = db_client.post(
        f"/api/v1/tickets/{ticket_id}/comments",
        json={"message": "Closing note"},
        headers=auth_headers(alice.id),
    )
    assert response.status_code == 201
    assert response.json()["message"] == "Closing note"
