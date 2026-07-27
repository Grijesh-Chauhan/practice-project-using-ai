"""FastAPI dependency providers."""

from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_session
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService


def get_db() -> Generator[Session]:
    """Provide a request-scoped SQLAlchemy session (closed after the request)."""
    yield from get_session()


DbSession = Annotated[Session, Depends(get_db)]


def get_user_repository(db: DbSession) -> UserRepository:
    """Provide a request-scoped UserRepository."""
    return UserRepository(db)


UserRepo = Annotated[UserRepository, Depends(get_user_repository)]


def get_user_service(repository: UserRepo) -> UserService:
    """Provide a request-scoped UserService."""
    return UserService(repository)


UserSvc = Annotated[UserService, Depends(get_user_service)]
