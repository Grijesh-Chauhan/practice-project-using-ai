"""TicketRepository unit tests."""

from sqlalchemy.orm import Session

from app.models.ticket import Ticket
from app.models.user import User
from app.repositories.ticket_repository import TicketRepository
from app.schemas.ticket import Priority, TicketFilters, TicketStatus


def _seed_users(db_session: Session) -> tuple[User, User]:
    alice = User(name="Alice", email="alice@example.com", role="agent")
    bob = User(name="Bob", email="bob@example.com", role="agent")
    db_session.add_all([alice, bob])
    db_session.flush()
    return alice, bob


def test_create_flush_yields_ticket_id(db_session: Session) -> None:
    """create flushes so the ticket primary key is available without commit."""
    alice, _bob = _seed_users(db_session)
    repo = TicketRepository(db_session)

    ticket = repo.create(
        {
            "title": "Login issue",
            "description": "Cannot reset password",
            "priority": Priority.HIGH.value,
            "status": TicketStatus.OPEN.value,
            "assigned_to": None,
            "created_by": alice.id,
        }
    )

    assert ticket.id is not None
    assert ticket.id > 0
    # Repository must not commit — uncommitted row is visible only on this session.
    assert db_session.get(Ticket, ticket.id) is ticket


def test_get_by_id_returns_ticket_or_none(db_session: Session) -> None:
    """get_by_id finds an existing ticket and returns None for unknown ids."""
    alice, _bob = _seed_users(db_session)
    repo = TicketRepository(db_session)
    created = repo.create(
        {
            "title": "Network down",
            "description": "VPN offline",
            "priority": Priority.MEDIUM.value,
            "status": TicketStatus.OPEN.value,
            "assigned_to": None,
            "created_by": alice.id,
        }
    )
    db_session.commit()

    found = repo.get_by_id(created.id)
    assert found is not None
    assert found.title == "Network down"
    assert repo.get_by_id(999_999) is None


def test_list_filters_compose_without_errors(db_session: Session) -> None:
    """List filters for status, priority, assignee, creator, and q compose."""
    alice, bob = _seed_users(db_session)
    repo = TicketRepository(db_session)
    repo.create(
        {
            "title": "Alpha Login",
            "description": "Password reset fails",
            "priority": Priority.HIGH.value,
            "status": TicketStatus.OPEN.value,
            "assigned_to": bob.id,
            "created_by": alice.id,
        }
    )
    repo.create(
        {
            "title": "Beta Printer",
            "description": "Paper jam",
            "priority": Priority.LOW.value,
            "status": TicketStatus.IN_PROGRESS.value,
            "assigned_to": None,
            "created_by": bob.id,
        }
    )
    db_session.commit()

    items, total = repo.list(
        TicketFilters(
            q="login",
            status=TicketStatus.OPEN,
            priority=Priority.HIGH,
            assigned_to=bob.id,
            created_by=alice.id,
        )
    )
    assert total == 1
    assert len(items) == 1
    assert items[0].title == "Alpha Login"

    items, total = repo.list(TicketFilters(status=TicketStatus.IN_PROGRESS))
    assert total == 1
    assert items[0].title == "Beta Printer"


def test_list_pagination_skip_limit(db_session: Session) -> None:
    """list respects skip/limit and returns accurate total."""
    alice, _bob = _seed_users(db_session)
    repo = TicketRepository(db_session)
    for index in range(3):
        repo.create(
            {
                "title": f"Ticket {index}",
                "description": f"Desc {index}",
                "priority": Priority.MEDIUM.value,
                "status": TicketStatus.OPEN.value,
                "assigned_to": None,
                "created_by": alice.id,
            }
        )
    db_session.commit()

    items, total = repo.list(skip=1, limit=1)
    assert total == 3
    assert len(items) == 1


def test_update_applies_fields(db_session: Session) -> None:
    """update mutates provided fields and flushes."""
    alice, bob = _seed_users(db_session)
    repo = TicketRepository(db_session)
    ticket = repo.create(
        {
            "title": "Old title",
            "description": "Old description",
            "priority": Priority.LOW.value,
            "status": TicketStatus.OPEN.value,
            "assigned_to": None,
            "created_by": alice.id,
        }
    )
    updated = repo.update(
        ticket,
        {
            "title": "New title",
            "priority": Priority.HIGH.value,
            "assigned_to": bob.id,
        },
    )
    db_session.commit()

    assert updated.title == "New title"
    assert updated.priority == Priority.HIGH.value
    assert updated.assigned_to == bob.id
    assert updated.status == TicketStatus.OPEN.value


def test_list_for_export_constrained_to_created_by(db_session: Session) -> None:
    """list_for_export always scopes results to the given creator."""
    alice, bob = _seed_users(db_session)
    repo = TicketRepository(db_session)
    repo.create(
        {
            "title": "Alice ticket",
            "description": "Mine",
            "priority": Priority.MEDIUM.value,
            "status": TicketStatus.OPEN.value,
            "assigned_to": None,
            "created_by": alice.id,
        }
    )
    repo.create(
        {
            "title": "Bob ticket",
            "description": "Theirs",
            "priority": Priority.MEDIUM.value,
            "status": TicketStatus.OPEN.value,
            "assigned_to": None,
            "created_by": bob.id,
        }
    )
    db_session.commit()

    exported = repo.list_for_export(alice.id, TicketFilters(created_by=bob.id))
    assert len(exported) == 1
    assert exported[0].created_by == alice.id
    assert exported[0].title == "Alice ticket"
