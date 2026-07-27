"""Comment data-access repository."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.comment import Comment


class CommentRepository:
    """SQLAlchemy queries for the comments table (no commits)."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, ticket_id: int, message: str, created_by: int) -> Comment:
        """Insert a comment row and flush so the primary key is available."""
        comment = Comment(
            ticket_id=ticket_id,
            message=message,
            created_by=created_by,
        )
        self._session.add(comment)
        self._session.flush()
        return comment

    def list_by_ticket(self, ticket_id: int) -> list[Comment]:
        """Return comments for a ticket ordered by created_at ascending."""
        statement = (
            select(Comment)
            .where(Comment.ticket_id == ticket_id)
            .order_by(Comment.created_at.asc(), Comment.id.asc())
        )
        return list(self._session.scalars(statement).all())
