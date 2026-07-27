"""UserService unit tests."""

import pytest
from sqlalchemy.orm import Session

from app.core.exceptions import InvalidUserHeaderError
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService


def test_list_users_delegates_to_repository(db_session: Session) -> None:
    """list_users returns all persisted users."""
    db_session.add(User(name="Alice", email="alice@example.com", role="agent"))
    db_session.flush()

    service = UserService(UserRepository(db_session))
    users = service.list_users()
    assert len(users) == 1
    assert users[0].email == "alice@example.com"


def test_require_user_returns_existing(db_session: Session) -> None:
    """require_user returns the ORM user when the id exists."""
    user = User(name="Bob", email="bob@example.com", role="agent")
    db_session.add(user)
    db_session.flush()

    service = UserService(UserRepository(db_session))
    found = service.require_user(user.id)
    assert found.id == user.id


def test_require_user_raises_for_unknown_id(db_session: Session) -> None:
    """require_user raises InvalidUserHeaderError when the user is missing."""
    service = UserService(UserRepository(db_session))
    with pytest.raises(InvalidUserHeaderError) as exc_info:
        service.require_user(42)
    assert exc_info.value.code == "INVALID_USER_HEADER"
