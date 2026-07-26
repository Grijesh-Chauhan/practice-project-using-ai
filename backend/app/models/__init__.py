"""ORM models package — import all models for Alembic metadata discovery."""

from app.models.comment import Comment
from app.models.ticket import Ticket
from app.models.user import User

__all__ = ["Comment", "Ticket", "User"]
