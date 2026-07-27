"""Comment domain service."""

from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from app.core.exceptions import InvalidUserHeaderError, TicketNotFoundError
from app.models.comment import Comment
from app.repositories.comment_repository import CommentRepository
from app.repositories.ticket_repository import TicketRepository
from app.repositories.user_repository import UserRepository
from app.schemas.comment import CommentCreate

logger = logging.getLogger(__name__)


class CommentService:
    """Comment use cases; owns transactions for add_comment."""

    def __init__(
        self,
        comment_repository: CommentRepository,
        ticket_repository: TicketRepository,
        user_repository: UserRepository,
        session: Session,
    ) -> None:
        self._comments = comment_repository
        self._tickets = ticket_repository
        self._users = user_repository
        self._session = session

    def add_comment(
        self,
        ticket_id: int,
        data: CommentCreate,
        created_by: int,
    ) -> Comment:
        """Add a comment to any ticket status; commit on success."""
        if self._users.get_by_id(created_by) is None:
            raise InvalidUserHeaderError(detail=f"Unknown user id: {created_by}")
        if self._tickets.get_by_id(ticket_id) is None:
            raise TicketNotFoundError(ticket_id=ticket_id)
        try:
            comment = self._comments.create(
                ticket_id=ticket_id,
                message=data.message,
                created_by=created_by,
            )
            self._session.commit()
            self._session.refresh(comment)
            logger.info(
                "comment_created comment_id=%s ticket_id=%s created_by=%s",
                comment.id,
                ticket_id,
                created_by,
            )
            return comment
        except Exception:
            self._session.rollback()
            raise
