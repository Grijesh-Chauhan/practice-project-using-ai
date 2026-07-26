"""Comment ORM model."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.ticket import Ticket
    from app.models.user import User


class Comment(Base):
    """Comment attached to a ticket."""

    __tablename__ = "comments"
    __table_args__ = (Index("idx_comments_ticket_id", "ticket_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    ticket_id: Mapped[int] = mapped_column(
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    ticket: Mapped[Ticket] = relationship(
        "Ticket",
        back_populates="comments",
    )
    author: Mapped[User] = relationship(
        "User",
        back_populates="comments",
    )
