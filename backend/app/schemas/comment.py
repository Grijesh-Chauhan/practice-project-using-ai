"""Comment API schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


def _trim_nonempty(value: str, *, field_name: str) -> str:
    trimmed = value.strip()
    if not trimmed:
        raise ValueError(f"{field_name} must not be empty or whitespace")
    return trimmed


class CommentCreate(BaseModel):
    """Request body for creating a comment."""

    message: str = Field(min_length=1, max_length=5000)

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        return _trim_nonempty(value, field_name="message")


class CommentRead(BaseModel):
    """Public comment representation nested under ticket detail."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    message: str = Field(min_length=1, max_length=5000)
    created_by: int
    created_at: datetime
