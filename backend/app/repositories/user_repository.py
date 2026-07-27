"""User data-access repository."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    """SQLAlchemy queries for the users table."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, user_id: int) -> User | None:
        """Return a user by primary key, or None if missing."""
        return self._session.get(User, user_id)

    def list_all(self) -> list[User]:
        """Return all users ordered by id ascending."""
        statement = select(User).order_by(User.id.asc())
        return list(self._session.scalars(statement).all())
