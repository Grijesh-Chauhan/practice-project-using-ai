"""TicketService status transition matrix unit tests."""

from itertools import product

import pytest
from sqlalchemy.orm import Session

from app.core.exceptions import InvalidStatusTransitionError
from app.models.user import User
from app.repositories.ticket_repository import TicketRepository
from app.repositories.user_repository import UserRepository
from app.schemas.ticket import Priority, TicketCreate, TicketStatus
from app.services.ticket_service import ALLOWED_TRANSITIONS, TicketService

ALL_STATUSES = [status.value for status in TicketStatus]

VALID_TRANSITIONS = [
    (from_status, to_status)
    for from_status, allowed in ALLOWED_TRANSITIONS.items()
    for to_status in sorted(allowed)
]

INVALID_TRANSITIONS = [
    (from_status, to_status)
    for from_status, to_status in product(ALL_STATUSES, ALL_STATUSES)
    if to_status not in ALLOWED_TRANSITIONS[from_status]
]


def _service(db_session: Session) -> TicketService:
    return TicketService(
        TicketRepository(db_session),
        UserRepository(db_session),
        db_session,
    )


def _create_ticket_in_status(
    db_session: Session,
    status: str,
) -> int:
    """Create an Open ticket then walk the happy path to the target status."""
    user = User(name="Agent", email=f"agent-{status}@example.com", role="agent")
    db_session.add(user)
    db_session.commit()

    service = _service(db_session)
    ticket = service.create(
        TicketCreate(
            title=f"Ticket for {status}",
            description="Transition fixture",
            priority=Priority.MEDIUM,
        ),
        created_by=user.id,
    )
    path = {
        TicketStatus.OPEN.value: [],
        TicketStatus.IN_PROGRESS.value: [TicketStatus.IN_PROGRESS],
        TicketStatus.RESOLVED.value: [
            TicketStatus.IN_PROGRESS,
            TicketStatus.RESOLVED,
        ],
        TicketStatus.CLOSED.value: [
            TicketStatus.IN_PROGRESS,
            TicketStatus.RESOLVED,
            TicketStatus.CLOSED,
        ],
        TicketStatus.CANCELLED.value: [TicketStatus.CANCELLED],
    }
    for step in path[status]:
        ticket = service.transition_status(ticket.id, step)
    assert ticket.status == status
    return ticket.id


@pytest.mark.parametrize(("from_status", "to_status"), VALID_TRANSITIONS)
def test_valid_status_transition_succeeds(
    db_session: Session,
    from_status: str,
    to_status: str,
) -> None:
    """Allowed transitions update status successfully."""
    ticket_id = _create_ticket_in_status(db_session, from_status)
    service = _service(db_session)

    updated = service.transition_status(ticket_id, to_status)

    assert updated.status == to_status


@pytest.mark.parametrize(("from_status", "to_status"), INVALID_TRANSITIONS)
def test_invalid_status_transition_raises(
    db_session: Session,
    from_status: str,
    to_status: str,
) -> None:
    """Disallowed and same-status transitions raise InvalidStatusTransitionError."""
    ticket_id = _create_ticket_in_status(db_session, from_status)
    service = _service(db_session)

    with pytest.raises(InvalidStatusTransitionError) as exc_info:
        service.transition_status(ticket_id, to_status)

    assert exc_info.value.code == "INVALID_STATUS_TRANSITION"
    assert exc_info.value.from_status == from_status
    assert exc_info.value.to_status == to_status


def test_same_status_transition_rejected(db_session: Session) -> None:
    """Open → Open is invalid."""
    ticket_id = _create_ticket_in_status(db_session, TicketStatus.OPEN.value)
    service = _service(db_session)

    with pytest.raises(InvalidStatusTransitionError) as exc_info:
        service.transition_status(ticket_id, TicketStatus.OPEN)

    assert exc_info.value.from_status == TicketStatus.OPEN.value
    assert exc_info.value.to_status == TicketStatus.OPEN.value


@pytest.mark.parametrize(
    "terminal",
    [TicketStatus.CLOSED.value, TicketStatus.CANCELLED.value],
)
def test_terminal_states_reject_all_transitions(
    db_session: Session,
    terminal: str,
) -> None:
    """Closed and Cancelled reject every target status."""
    ticket_id = _create_ticket_in_status(db_session, terminal)
    service = _service(db_session)

    for target in ALL_STATUSES:
        with pytest.raises(InvalidStatusTransitionError):
            service.transition_status(ticket_id, target)
