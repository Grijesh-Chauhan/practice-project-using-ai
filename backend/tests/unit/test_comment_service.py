"""CommentService unit tests."""

import pytest
from sqlalchemy.orm import Session

from app.core.exceptions import InvalidUserHeaderError, TicketNotFoundError
from app.models.user import User
from app.repositories.comment_repository import CommentRepository
from app.repositories.ticket_repository import TicketRepository
from app.repositories.user_repository import UserRepository
from app.schemas.comment import CommentCreate
from app.schemas.ticket import Priority, TicketCreate, TicketStatus
from app.services.comment_service import CommentService
from app.services.ticket_service import TicketService


def _ticket_service(db_session: Session) -> TicketService:
    return TicketService(
        TicketRepository(db_session),
        UserRepository(db_session),
        db_session,
    )


def _comment_service(db_session: Session) -> CommentService:
    return CommentService(
        CommentRepository(db_session),
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


def test_add_comment_persists_and_commits(db_session: Session) -> None:
    """add_comment creates a comment and commits."""
    alice, bob = _seed_users(db_session)
    ticket = _ticket_service(db_session).create(
        TicketCreate(
            title="Needs comment",
            description="Body",
            priority=Priority.LOW,
        ),
        created_by=alice.id,
    )

    comment = _comment_service(db_session).add_comment(
        ticket.id,
        CommentCreate(message="  Looking into it  "),
        created_by=bob.id,
    )

    assert comment.id is not None
    assert comment.message == "Looking into it"
    assert comment.ticket_id == ticket.id
    assert comment.created_by == bob.id


def test_add_comment_allows_cancelled_ticket(db_session: Session) -> None:
    """Comments are allowed on Cancelled tickets."""
    alice, bob = _seed_users(db_session)
    tickets = _ticket_service(db_session)
    ticket = tickets.create(
        TicketCreate(
            title="Cancelled ticket",
            description="Body",
            priority=Priority.MEDIUM,
        ),
        created_by=alice.id,
    )
    tickets.transition_status(ticket.id, TicketStatus.CANCELLED)

    comment = _comment_service(db_session).add_comment(
        ticket.id,
        CommentCreate(message="Cancelled note"),
        created_by=bob.id,
    )
    assert comment.ticket_id == ticket.id


def test_add_comment_missing_ticket_raises(db_session: Session) -> None:
    """add_comment raises TicketNotFoundError for unknown tickets."""
    alice, _bob = _seed_users(db_session)
    with pytest.raises(TicketNotFoundError) as exc_info:
        _comment_service(db_session).add_comment(
            999,
            CommentCreate(message="Orphan"),
            created_by=alice.id,
        )
    assert exc_info.value.code == "TICKET_NOT_FOUND"


def test_add_comment_unknown_user_raises(db_session: Session) -> None:
    """add_comment raises InvalidUserHeaderError for unknown authors."""
    alice, _bob = _seed_users(db_session)
    ticket = _ticket_service(db_session).create(
        TicketCreate(
            title="Has ticket",
            description="Body",
            priority=Priority.HIGH,
        ),
        created_by=alice.id,
    )
    with pytest.raises(InvalidUserHeaderError) as exc_info:
        _comment_service(db_session).add_comment(
            ticket.id,
            CommentCreate(message="Bad author"),
            created_by=999,
        )
    assert exc_info.value.code == "INVALID_USER_HEADER"
