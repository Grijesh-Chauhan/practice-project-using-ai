"""Unit tests for the CSV export serializer."""

import csv
import io
from datetime import UTC, datetime

from app.models.ticket import Ticket
from app.utils.csv_export import TICKET_CSV_COLUMNS, build_tickets_csv


def _make_ticket(**overrides: object) -> Ticket:
    """Build a detached Ticket instance for serialization tests."""
    now = datetime(2026, 7, 24, 8, 0, 0, tzinfo=UTC)
    defaults: dict[str, object] = {
        "id": 1,
        "title": "Login issue",
        "description": "Cannot reset password",
        "priority": "high",
        "status": "Open",
        "assigned_to": 2,
        "created_by": 1,
        "created_at": now,
        "updated_at": now,
    }
    defaults.update(overrides)
    return Ticket(**defaults)


def test_csv_has_header_row_in_locked_order() -> None:
    """First row is the locked column header."""
    body = build_tickets_csv([_make_ticket()])
    rows = list(csv.reader(io.StringIO(body)))
    assert rows[0] == list(TICKET_CSV_COLUMNS)


def test_csv_serializes_ticket_values() -> None:
    """A ticket row renders each field, with ISO datetimes."""
    body = build_tickets_csv([_make_ticket()])
    row = list(csv.DictReader(io.StringIO(body)))[0]
    assert row["id"] == "1"
    assert row["title"] == "Login issue"
    assert row["priority"] == "high"
    assert row["status"] == "Open"
    assert row["created_at"].startswith("2026-07-24T08:00:00")


def test_csv_renders_none_assignee_as_empty() -> None:
    """A null assigned_to becomes an empty CSV cell, not the string 'None'."""
    body = build_tickets_csv([_make_ticket(assigned_to=None)])
    row = list(csv.DictReader(io.StringIO(body)))[0]
    assert row["assigned_to"] == ""


def test_csv_escapes_commas_quotes_and_newlines() -> None:
    """Free-text fields with delimiters are quoted/escaped correctly."""
    ticket = _make_ticket(
        title='Comma, "quote" and\nnewline',
        description="plain",
    )
    body = build_tickets_csv([ticket])
    # csv.reader must round-trip the value back to its original form.
    parsed = list(csv.DictReader(io.StringIO(body)))[0]
    assert parsed["title"] == 'Comma, "quote" and\nnewline'


def test_csv_empty_iterable_has_header_only() -> None:
    """No tickets still yields a header row (valid CSV)."""
    body = build_tickets_csv([])
    rows = list(csv.reader(io.StringIO(body)))
    assert rows == [list(TICKET_CSV_COLUMNS)]
