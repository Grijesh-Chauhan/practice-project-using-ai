"""Shared API schemas."""

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Canonical API error envelope."""

    detail: str = Field(description="Human-readable error message")
    code: str = Field(description="Machine-readable error code")
    field: str | None = Field(
        default=None,
        description="Optional field name related to the error",
    )
