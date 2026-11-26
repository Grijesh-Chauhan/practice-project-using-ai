"""Ticket API schemas."""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.comment import CommentRead


class TicketStatus(StrEnum):
    """Allowed ticket lifecycle statuses."""

    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    CLOSED = "Closed"
    CANCELLED = "Cancelled"


class Priority(StrEnum):
    """Ticket priority levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


def _trim_nonempty(value: str, *, field_name: str) -> str:
    trimmed = value.strip()
    if not trimmed:
        raise ValueError(f"{field_name} must not be empty or whitespace")
    return trimmed


class TicketCreate(BaseModel):
    """Request body for creating a ticket (status always forced to Open)."""

    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    priority: Priority
    assigned_to: int | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        return _trim_nonempty(value, field_name="title")

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        return _trim_nonempty(value, field_name="description")


class TicketUpdate(BaseModel):
    """Partial field update; status is not accepted (use status endpoint)."""

    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    priority: Priority | None = None
    assigned_to: int | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _trim_nonempty(value, field_name="title")

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _trim_nonempty(value, field_name="description")


class TicketStatusUpdate(BaseModel):
    """Request body for status transition endpoint."""

    status: TicketStatus


class TicketFilters(BaseModel):
    """Composable list/export query filters."""

    q: str | None = None
    status: TicketStatus | None = None
    priority: Priority | None = None
    assigned_to: int | None = None
    created_by: int | None = None
    created_after: datetime | None = None


class TicketRead(BaseModel):
    """Ticket representation without nested comments."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    priority: Priority
    status: TicketStatus
    assigned_to: int | None
    created_by: int
    created_at: datetime
    updated_at: datetime


class TicketDetail(TicketRead):
    """Ticket representation including comments ordered ASC."""

    comments: list[CommentRead] = Field(default_factory=list)


class TicketList(BaseModel):
    """Paginated ticket list response."""

    items: list[TicketRead]
    total: int


class StatusPriorityCount(BaseModel):
    """Count of tickets for one status × priority cell."""

    status: TicketStatus
    priority: Priority
    count: int


class MonthCount(BaseModel):
    """Tickets created in a calendar month (YYYY-MM)."""

    month: str
    count: int


class MonthStatusCount(BaseModel):
    """Tickets created in a month that currently have a given status."""

    month: str
    status: TicketStatus
    count: int


class TicketStats(BaseModel):
    """Aggregated ticket analytics for dashboard charts."""

    by_status: dict[str, int]
    by_priority: dict[str, int]
    by_status_priority: list[StatusPriorityCount]
    created_by_month: list[MonthCount]
    status_by_month: list[MonthStatusCount]
