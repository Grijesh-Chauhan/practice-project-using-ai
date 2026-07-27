"""User domain service."""

from __future__ import annotations

from app.core.exceptions import InvalidUserHeaderError
from app.models.user import User
from app.repositories.user_repository import UserRepository


class UserService:
    """Thin orchestration for user read operations."""

    def __init__(self, user_repository: UserRepository) -> None:
        self._users = user_repository

    def list_users(self) -> list[User]:
        """Return all users for assignee dropdown and header checks."""
        return self._users.list_all()

    def require_user(self, user_id: int) -> User:
        """Return the user or raise when the id is unknown."""
        user = self._users.get_by_id(user_id)
        if user is None:
            raise InvalidUserHeaderError(
                detail=f"Unknown user id: {user_id}",
            )
        return user
