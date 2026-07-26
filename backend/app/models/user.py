"""User ORM model."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.comment import Comment
    from app.models.ticket import Ticket


class User(Base):
    """Application user (assignee / creator / comment author)."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False)

    tickets_created: Mapped[list[Ticket]] = relationship(
        "Ticket",
        back_populates="creator",
        foreign_keys="Ticket.created_by",
    )
    tickets_assigned: Mapped[list[Ticket]] = relationship(
        "Ticket",
        back_populates="assignee",
        foreign_keys="Ticket.assigned_to",
    )
    comments: Mapped[list[Comment]] = relationship(
        "Comment",
        back_populates="author",
    )
