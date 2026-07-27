"""Ticket data-access repository."""

from __future__ import annotations

import builtins
from collections.abc import Mapping
from typing import Any

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.ticket import Ticket
from app.schemas.ticket import TicketFilters


class TicketRepository:
    """SQLAlchemy queries for the tickets table (no commits, no status rules)."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, ticket_id: int) -> Ticket | None:
        """Return a ticket with comments loaded, or None if missing."""
        statement = (
            select(Ticket)
            .where(Ticket.id == ticket_id)
            .options(selectinload(Ticket.comments))
        )
        return self._session.scalars(statement).first()

    def list(
        self,
        filters: TicketFilters | None = None,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[builtins.list[Ticket], int]:
        """Return matching tickets and total count for the filter set."""
        base = self._filtered_query(filters)
        total = self._session.scalar(select(func.count()).select_from(base.subquery()))
        items = builtins.list(
            self._session.scalars(
                base.order_by(Ticket.id.asc()).offset(skip).limit(limit)
            ).all()
        )
        return items, int(total or 0)

    def create(self, ticket_fields: Mapping[str, Any]) -> Ticket:
        """Insert a ticket row and flush so the primary key is available."""
        ticket = Ticket(**ticket_fields)
        self._session.add(ticket)
        self._session.flush()
        return ticket

    def update(self, ticket: Ticket, fields: Mapping[str, Any]) -> Ticket:
        """Apply field updates on an attached ticket and flush."""
        for key, value in fields.items():
            setattr(ticket, key, value)
        self._session.flush()
        return ticket

    def list_for_export(
        self,
        created_by: int,
        filters: TicketFilters | None = None,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> builtins.list[Ticket]:
        """Return tickets for CSV export constrained to created_by."""
        export_filters = (
            filters.model_copy(update={"created_by": created_by})
            if filters is not None
            else TicketFilters(created_by=created_by)
        )
        items, _total = self.list(export_filters, skip=skip, limit=limit)
        return items

    def _filtered_query(self, filters: TicketFilters | None) -> Select[tuple[Ticket]]:
        """Compose a select with optional list filters (no status rules)."""
        statement: Select[tuple[Ticket]] = select(Ticket)
        if filters is None:
            return statement

        if filters.q:
            pattern = f"%{filters.q}%"
            statement = statement.where(
                or_(
                    Ticket.title.ilike(pattern),
                    Ticket.description.ilike(pattern),
                )
            )
        if filters.status is not None:
            statement = statement.where(Ticket.status == filters.status.value)
        if filters.priority is not None:
            statement = statement.where(Ticket.priority == filters.priority.value)
        if filters.assigned_to is not None:
            statement = statement.where(Ticket.assigned_to == filters.assigned_to)
        if filters.created_by is not None:
            statement = statement.where(Ticket.created_by == filters.created_by)
        return statement
