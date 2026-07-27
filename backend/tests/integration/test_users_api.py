"""Users API integration tests (Milestone M3)."""

from fastapi.testclient import TestClient

from app.models.user import User


def test_list_users_returns_empty_when_none(db_client: TestClient) -> None:
    """GET /api/v1/users returns an empty list when no users exist."""
    response = db_client.get("/api/v1/users")
    assert response.status_code == 200
    assert response.json() == []


def test_list_users_returns_seeded_shape(
    db_client: TestClient,
    seed_users: list[User],
) -> None:
    """GET /api/v1/users returns id/name/email/role for seeded users."""
    assert len(seed_users) >= 2

    response = db_client.get("/api/v1/users")
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) == len(seed_users)

    for item in payload:
        assert set(item.keys()) == {"id", "name", "email", "role"}
        assert isinstance(item["id"], int)
        assert isinstance(item["name"], str)
        assert isinstance(item["email"], str)
        assert isinstance(item["role"], str)

    emails = {item["email"] for item in payload}
    assert emails == {"alice@example.com", "bob@example.com"}

    ids = [item["id"] for item in payload]
    assert ids == sorted(ids)
