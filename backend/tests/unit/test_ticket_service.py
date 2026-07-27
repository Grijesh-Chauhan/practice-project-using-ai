"""TicketService unit tests (create, get, update, assignee checks)."""

import pytest
from sqlalchemy.orm import Session

from app.core.exceptions import (
    BusinessValidationError,
    InvalidUserHeaderError,
    TicketNotFoundError,
)
from app.models.user import User
from app.repositories.ticket_repository import TicketRepository
from app.repositories.user_repository import UserRepository
from app.schemas.ticket import Priority, TicketCreate, TicketStatus, TicketUpdate
from app.services.ticket_service import TicketService


def _service(db_session: Session) -> TicketService:
    return TicketService(
        TicketRepository(db_session),
        UserRepository(db_session),
        db_session,
    )


def _seed_users(db_session: Session) -> tuple[User, User]:
    alice = User(name="Alice", email="alice@example.com", role="agent")
    bob = User(name="Bob", email="bob@example.com", role="agent")
    db_session.add_all([alice, bob])
    db_session.commit()
    return alice, bob


def test_create_always_sets_open_status(db_session: Session) -> None:
    """create forces status Open and persists via commit."""
    alice, bob = _seed_users(db_session)
    service = _service(db_session)

    ticket = service.create(
        TicketCreate(
            title="  Login issue  ",
            description="  Cannot reset password  ",
            priority=Priority.HIGH,
            assigned_to=bob.id,
        ),
        created_by=alice.id,
    )

    assert ticket.id is not None
    assert ticket.status == TicketStatus.OPEN.value
    assert ticket.title == "Login issue"
    assert ticket.description == "Cannot reset password"
    assert ticket.created_by == alice.id
    assert ticket.assigned_to == bob.id


def test_create_rejects_unknown_creator(db_session: Session) -> None:
    """create raises InvalidUserHeaderError when created_by is unknown."""
    service = _service(db_session)
    with pytest.raises(InvalidUserHeaderError) as exc_info:
        service.create(
            TicketCreate(
                title="Orphan",
                description="No creator",
                priority=Priority.LOW,
            ),
            created_by=999,
        )
    assert exc_info.value.code == "INVALID_USER_HEADER"


def test_create_rejects_unknown_assignee(db_session: Session) -> None:
    """create raises BusinessValidationError when assignee is unknown."""
    alice, _bob = _seed_users(db_session)
    service = _service(db_session)
    with pytest.raises(BusinessValidationError) as exc_info:
        service.create(
            TicketCreate(
                title="Bad assignee",
                description="Missing user",
                priority=Priority.MEDIUM,
                assigned_to=999,
            ),
            created_by=alice.id,
        )
    assert exc_info.value.code == "ASSIGNEE_NOT_FOUND"
    assert exc_info.value.field == "assigned_to"


def test_get_raises_when_missing(db_session: Session) -> None:
    """get raises TicketNotFoundError for unknown ids."""
    service = _service(db_session)
    with pytest.raises(TicketNotFoundError) as exc_info:
        service.get(42)
    assert exc_info.value.code == "TICKET_NOT_FOUND"
    assert exc_info.value.ticket_id == 42


def test_update_fields_does_not_change_status(db_session: Session) -> None:
    """update_fields changes title/priority/assignee without touching status."""
    alice, bob = _seed_users(db_session)
    service = _service(db_session)
    ticket = service.create(
        TicketCreate(
            title="Original",
            description="Original description",
            priority=Priority.LOW,
        ),
        created_by=alice.id,
    )
    ticket = service.transition_status(ticket.id, TicketStatus.IN_PROGRESS)

    updated = service.update_fields(
        ticket.id,
        TicketUpdate(
            title="Updated",
            priority=Priority.HIGH,
            assigned_to=bob.id,
        ),
    )

    assert updated.title == "Updated"
    assert updated.priority == Priority.HIGH.value
    assert updated.assigned_to == bob.id
    assert updated.status == TicketStatus.IN_PROGRESS.value


def test_update_fields_rejects_unknown_assignee(db_session: Session) -> None:
    """update_fields validates assignee existence."""
    alice, _bob = _seed_users(db_session)
    service = _service(db_session)
    ticket = service.create(
        TicketCreate(
            title="Assignable",
            description="Needs valid assignee",
            priority=Priority.MEDIUM,
        ),
        created_by=alice.id,
    )

    with pytest.raises(BusinessValidationError) as exc_info:
        service.update_fields(ticket.id, TicketUpdate(assigned_to=999))
    assert exc_info.value.code == "ASSIGNEE_NOT_FOUND"
