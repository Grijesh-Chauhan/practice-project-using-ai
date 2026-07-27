"""FastAPI dependency providers."""

from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.exceptions import InvalidUserHeaderError
from app.db.session import get_session
from app.repositories.comment_repository import CommentRepository
from app.repositories.ticket_repository import TicketRepository
from app.repositories.user_repository import UserRepository
from app.services.comment_service import CommentService
from app.services.ticket_service import TicketService
from app.services.user_service import UserService


def get_db() -> Generator[Session]:
    """Provide a request-scoped SQLAlchemy session (closed after the request)."""
    yield from get_session()


DbSession = Annotated[Session, Depends(get_db)]


def get_user_repository(db: DbSession) -> UserRepository:
    """Provide a request-scoped UserRepository."""
    return UserRepository(db)


UserRepo = Annotated[UserRepository, Depends(get_user_repository)]


def get_ticket_repository(db: DbSession) -> TicketRepository:
    """Provide a request-scoped TicketRepository."""
    return TicketRepository(db)


TicketRepo = Annotated[TicketRepository, Depends(get_ticket_repository)]


def get_comment_repository(db: DbSession) -> CommentRepository:
    """Provide a request-scoped CommentRepository."""
    return CommentRepository(db)


CommentRepo = Annotated[CommentRepository, Depends(get_comment_repository)]


def get_user_service(repository: UserRepo) -> UserService:
    """Provide a request-scoped UserService."""
    return UserService(repository)


UserSvc = Annotated[UserService, Depends(get_user_service)]


def get_ticket_service(
    ticket_repository: TicketRepo,
    user_repository: UserRepo,
    db: DbSession,
) -> TicketService:
    """Provide a request-scoped TicketService."""
    return TicketService(ticket_repository, user_repository, db)


TicketSvc = Annotated[TicketService, Depends(get_ticket_service)]


def get_comment_service(
    comment_repository: CommentRepo,
    ticket_repository: TicketRepo,
    user_repository: UserRepo,
    db: DbSession,
) -> CommentService:
    """Provide a request-scoped CommentService."""
    return CommentService(
        comment_repository,
        ticket_repository,
        user_repository,
        db,
    )


CommentSvc = Annotated[CommentService, Depends(get_comment_service)]


def require_user_id(
    user_service: UserSvc,
    x_user_id: Annotated[str | None, Header()] = None,
) -> int:
    """Require a valid existing user id from the X-User-Id header."""
    if x_user_id is None or not x_user_id.strip():
        raise InvalidUserHeaderError()
    try:
        user_id = int(x_user_id)
    except ValueError as exc:
        raise InvalidUserHeaderError() from exc
    user_service.require_user(user_id)
    return user_id


RequireUserId = Annotated[int, Depends(require_user_id)]
