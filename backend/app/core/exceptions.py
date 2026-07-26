"""Domain exception hierarchy mapped to HTTP by central handlers."""

from __future__ import annotations


class AppError(Exception):
    """Base class for application domain errors."""

    status_code: int = 500
    default_code: str = "INTERNAL_ERROR"

    def __init__(
        self,
        detail: str,
        *,
        code: str | None = None,
        field: str | None = None,
    ) -> None:
        super().__init__(detail)
        self.detail = detail
        self.code = code or self.default_code
        self.field = field


class NotFoundError(AppError):
    """Resource was not found."""

    status_code = 404
    default_code = "NOT_FOUND"


class TicketNotFoundError(NotFoundError):
    """Ticket id does not exist."""

    default_code = "TICKET_NOT_FOUND"

    def __init__(
        self,
        detail: str = "Ticket not found",
        *,
        ticket_id: int | None = None,
        code: str | None = None,
        field: str | None = None,
    ) -> None:
        super().__init__(detail, code=code, field=field)
        self.ticket_id = ticket_id


class ConflictError(AppError):
    """Request conflicts with current resource state."""

    status_code = 409
    default_code = "CONFLICT"


class InvalidStatusTransitionError(ConflictError):
    """Disallowed or same-status ticket transition."""

    default_code = "INVALID_STATUS_TRANSITION"

    def __init__(
        self,
        detail: str | None = None,
        *,
        from_status: str,
        to_status: str,
        code: str | None = None,
        field: str | None = "status",
    ) -> None:
        message = detail or f"Cannot transition from {from_status} to {to_status}"
        super().__init__(message, code=code, field=field)
        self.from_status = from_status
        self.to_status = to_status


class BadRequestError(AppError):
    """Client request is malformed or missing required context."""

    status_code = 400
    default_code = "BAD_REQUEST"


class InvalidUserHeaderError(BadRequestError):
    """Missing, non-integer, or unknown X-User-Id when required."""

    default_code = "INVALID_USER_HEADER"

    def __init__(
        self,
        detail: str = "Missing or invalid X-User-Id header",
        *,
        code: str | None = None,
        field: str | None = None,
    ) -> None:
        super().__init__(detail, code=code, field=field)


class BusinessValidationError(AppError):
    """Business rule failed after schema validation succeeded."""

    status_code = 422
    default_code = "BUSINESS_VALIDATION_ERROR"

    def __init__(
        self,
        detail: str,
        *,
        code: str,
        field: str | None = None,
    ) -> None:
        super().__init__(detail, code=code, field=field)
