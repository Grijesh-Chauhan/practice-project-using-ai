"""Ticket ORM model."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.comment import Comment
    from app.models.user import User


class Ticket(Base):
    """Support ticket entity."""

    __tablename__ = "tickets"
    __table_args__ = (
        Index("idx_tickets_status", "status"),
        Index("idx_tickets_created_by", "created_by"),
        Index("idx_tickets_assigned_to", "assigned_to"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="Open",
        server_default="Open",
    )
    assigned_to: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )
    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    creator: Mapped[User] = relationship(
        "User",
        back_populates="tickets_created",
        foreign_keys=[created_by],
    )
    assignee: Mapped[User | None] = relationship(
        "User",
        back_populates="tickets_assigned",
        foreign_keys=[assigned_to],
    )
    comments: Mapped[list[Comment]] = relationship(
        "Comment",
        back_populates="ticket",
        order_by="Comment.created_at, Comment.id",
        cascade="all, delete-orphan",
    )
