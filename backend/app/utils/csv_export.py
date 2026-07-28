"""CSV serialization helpers for ticket export."""

from __future__ import annotations

import csv
import io
from collections.abc import Iterable, Sequence
from datetime import datetime

from app.models.ticket import Ticket

TICKET_CSV_COLUMNS: Sequence[str] = (
    "id",
    "title",
    "description",
    "priority",
    "status",
    "assigned_to",
    "created_by",
    "created_at",
    "updated_at",
)


def _format_value(value: object) -> str:
    """Render a ticket field for CSV output (ISO 8601 for datetimes)."""
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


def build_tickets_csv(tickets: Iterable[Ticket]) -> str:
    """Serialize tickets to a CSV string with the locked column order.

    Uses the standard library csv writer so quoting/escaping of commas,
    quotes, and newlines in free-text fields is handled correctly.
    """
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(TICKET_CSV_COLUMNS)
    for ticket in tickets:
        writer.writerow(
            [_format_value(getattr(ticket, column)) for column in TICKET_CSV_COLUMNS]
        )
    return buffer.getvalue()
