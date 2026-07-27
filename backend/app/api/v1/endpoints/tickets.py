"""Ticket API endpoints."""

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.api.deps import RequireUserId, TicketSvc
from app.schemas.ticket import (
    Priority,
    TicketCreate,
    TicketDetail,
    TicketFilters,
    TicketList,
    TicketRead,
    TicketStatus,
    TicketStatusUpdate,
    TicketUpdate,
)

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("/export")
def export_tickets_stub() -> JSONResponse:
    """Path-order stub for CSV export (implemented in Milestone 8)."""
    return JSONResponse(
        status_code=501,
        content={
            "detail": "CSV export will be implemented in Milestone 8",
            "code": "NOT_IMPLEMENTED",
        },
    )


@router.get("", response_model=TicketList)
def list_tickets(
    service: TicketSvc,
    q: str | None = None,
    status: TicketStatus | None = None,
    priority: Priority | None = None,
    assigned_to: int | None = None,
    created_by: int | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
) -> TicketList:
    """List tickets with optional filters and pagination."""
    filters = TicketFilters(
        q=q,
        status=status,
        priority=priority,
        assigned_to=assigned_to,
        created_by=created_by,
    )
    items, total = service.list(filters, skip=skip, limit=limit)
    return TicketList(
        items=[TicketRead.model_validate(ticket) for ticket in items],
        total=total,
    )


@router.post("", response_model=TicketRead, status_code=201)
def create_ticket(
    body: TicketCreate,
    service: TicketSvc,
    created_by: RequireUserId,
) -> TicketRead:
    """Create a ticket; status is always Open; created_by from X-User-Id."""
    ticket = service.create(body, created_by=created_by)
    return TicketRead.model_validate(ticket)


@router.get("/{ticket_id}", response_model=TicketDetail)
def get_ticket(ticket_id: int, service: TicketSvc) -> TicketDetail:
    """Return a ticket with comments ordered by created_at ascending."""
    ticket = service.get(ticket_id)
    return TicketDetail.model_validate(ticket)


@router.patch("/{ticket_id}", response_model=TicketRead)
def update_ticket(
    ticket_id: int,
    body: TicketUpdate,
    service: TicketSvc,
) -> TicketRead:
    """Update non-status ticket fields."""
    ticket = service.update_fields(ticket_id, body)
    return TicketRead.model_validate(ticket)


@router.patch("/{ticket_id}/status", response_model=TicketRead)
def transition_ticket_status(
    ticket_id: int,
    body: TicketStatusUpdate,
    service: TicketSvc,
) -> TicketRead:
    """Apply an allowed status transition via the service state machine."""
    ticket = service.transition_status(ticket_id, body.status)
    return TicketRead.model_validate(ticket)
