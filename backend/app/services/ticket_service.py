"""Ticket domain service including status state machine."""

from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from app.core.exceptions import (
    BusinessValidationError,
    InvalidStatusTransitionError,
    InvalidUserHeaderError,
    TicketNotFoundError,
)
from app.models.ticket import Ticket
from app.repositories.ticket_repository import TicketRepository
from app.repositories.user_repository import UserRepository
from app.schemas.ticket import (
    Priority,
    TicketCreate,
    TicketFilters,
    TicketStatus,
    TicketUpdate,
)

logger = logging.getLogger(__name__)

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    TicketStatus.OPEN.value: {
        TicketStatus.IN_PROGRESS.value,
        TicketStatus.CANCELLED.value,
    },
    TicketStatus.IN_PROGRESS.value: {
        TicketStatus.RESOLVED.value,
        TicketStatus.CANCELLED.value,
    },
    TicketStatus.RESOLVED.value: {TicketStatus.CLOSED.value},
    TicketStatus.CLOSED.value: set(),
    TicketStatus.CANCELLED.value: set(),
}


class TicketService:
    """Ticket use cases; owns transactions and status transition rules."""

    def __init__(
        self,
        ticket_repository: TicketRepository,
        user_repository: UserRepository,
        session: Session,
    ) -> None:
        self._tickets = ticket_repository
        self._users = user_repository
        self._session = session

    def create(self, data: TicketCreate, created_by: int) -> Ticket:
        """Create a ticket with status Open and commit on success."""
        self._require_creator(created_by)
        self._validate_assignee(data.assigned_to)
        try:
            ticket = self._tickets.create(
                {
                    "title": data.title,
                    "description": data.description,
                    "priority": data.priority.value,
                    "status": TicketStatus.OPEN.value,
                    "assigned_to": data.assigned_to,
                    "created_by": created_by,
                }
            )
            self._session.commit()
            self._session.refresh(ticket)
            logger.info(
                "ticket_created ticket_id=%s created_by=%s",
                ticket.id,
                created_by,
            )
            return ticket
        except Exception:
            self._session.rollback()
            raise

    def list(
        self,
        filters: TicketFilters | None = None,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[Ticket], int]:
        """List tickets with optional filters and pagination."""
        return self._tickets.list(filters, skip=skip, limit=limit)

    def get(self, ticket_id: int) -> Ticket:
        """Return a ticket with comments or raise TicketNotFoundError."""
        ticket = self._tickets.get_by_id(ticket_id)
        if ticket is None:
            raise TicketNotFoundError(ticket_id=ticket_id)
        return ticket

    def update_fields(self, ticket_id: int, data: TicketUpdate) -> Ticket:
        """Update non-status fields and commit on success."""
        ticket = self.get(ticket_id)
        updates = data.model_dump(exclude_unset=True)
        if "assigned_to" in updates:
            self._validate_assignee(updates["assigned_to"])
        if "priority" in updates and isinstance(updates["priority"], Priority):
            updates["priority"] = updates["priority"].value
        try:
            ticket = self._tickets.update(ticket, updates)
            self._session.commit()
            self._session.refresh(ticket)
            return ticket
        except Exception:
            self._session.rollback()
            raise

    def transition_status(
        self,
        ticket_id: int,
        new_status: TicketStatus | str,
    ) -> Ticket:
        """Apply an allowed status transition and commit on success."""
        ticket = self.get(ticket_id)
        target = (
            new_status.value if isinstance(new_status, TicketStatus) else new_status
        )
        current = ticket.status
        allowed = ALLOWED_TRANSITIONS.get(current, set())
        if target not in allowed:
            logger.info(
                "invalid_status_transition ticket_id=%s from=%s to=%s",
                ticket_id,
                current,
                target,
            )
            raise InvalidStatusTransitionError(
                from_status=current,
                to_status=target,
            )
        try:
            ticket = self._tickets.update(ticket, {"status": target})
            self._session.commit()
            self._session.refresh(ticket)
            logger.info(
                "ticket_status_changed ticket_id=%s from=%s to=%s",
                ticket_id,
                current,
                target,
            )
            return ticket
        except Exception:
            self._session.rollback()
            raise

    def _require_creator(self, user_id: int) -> None:
        if self._users.get_by_id(user_id) is None:
            raise InvalidUserHeaderError(detail=f"Unknown user id: {user_id}")

    def _validate_assignee(self, assigned_to: int | None) -> None:
        if assigned_to is None:
            return
        if self._users.get_by_id(assigned_to) is None:
            raise BusinessValidationError(
                detail=f"Assignee user id {assigned_to} does not exist",
                code="ASSIGNEE_NOT_FOUND",
                field="assigned_to",
            )
