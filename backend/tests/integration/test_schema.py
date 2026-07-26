"""Persistence foundation tests for Milestone M1."""

from collections.abc import Generator
from pathlib import Path
from sqlite3 import Connection as SQLiteConnection

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, event, inspect, select, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.models import Comment, Ticket, User

BACKEND_ROOT = Path(__file__).resolve().parents[2]


def _enable_sqlite_foreign_keys(engine: Engine) -> None:
    """Enable FK enforcement on a SQLite engine (mirrors app session setup)."""

    @event.listens_for(engine, "connect")
    def _set_pragma(dbapi_connection: object, _connection_record: object) -> None:
        if isinstance(dbapi_connection, SQLiteConnection):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()


@pytest.fixture
def migrated_engine(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> Generator[Engine]:
    """Create a temporary SQLite DB and apply Alembic migrations to head."""
    db_path = tmp_path / "test.db"
    database_url = f"sqlite:///{db_path}"
    monkeypatch.setenv("DATABASE_URL", database_url)
    get_settings.cache_clear()

    alembic_cfg = Config(str(BACKEND_ROOT / "alembic.ini"))
    command.upgrade(alembic_cfg, "head")

    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    _enable_sqlite_foreign_keys(engine)
    try:
        yield engine
    finally:
        engine.dispose()
        get_settings.cache_clear()


@pytest.fixture
def db_session(migrated_engine: Engine) -> Generator[Session]:
    """Yield a session bound to the migrated test database."""
    SessionLocal = sessionmaker(
        bind=migrated_engine,
        autoflush=False,
        autocommit=False,
    )
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_schema_tables_and_indexes_exist(migrated_engine: Engine) -> None:
    """Users, tickets, comments and recommended indexes must exist after upgrade."""
    inspector = inspect(migrated_engine)
    assert set(inspector.get_table_names()) >= {"users", "tickets", "comments"}

    ticket_indexes = {idx["name"] for idx in inspector.get_indexes("tickets")}
    assert {
        "idx_tickets_status",
        "idx_tickets_created_by",
        "idx_tickets_assigned_to",
    } <= ticket_indexes

    comment_indexes = {idx["name"] for idx in inspector.get_indexes("comments")}
    assert "idx_comments_ticket_id" in comment_indexes

    email_unique = any(
        constraint["column_names"] == ["email"]
        for constraint in inspector.get_unique_constraints("users")
    )
    email_unique_index = any(
        idx["unique"] and idx["column_names"] == ["email"]
        for idx in inspector.get_indexes("users")
    )
    assert email_unique or email_unique_index


def test_foreign_keys_enabled(migrated_engine: Engine, db_session: Session) -> None:
    """PRAGMA foreign_keys must be ON and reject invalid ticket creators."""
    with migrated_engine.connect() as conn:
        enabled = conn.execute(text("PRAGMA foreign_keys")).scalar()
        assert enabled == 1

    ticket = Ticket(
        title="Orphan",
        description="Should fail FK",
        priority="low",
        created_by=9999,
    )
    db_session.add(ticket)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_comment_cascade_and_relationships(db_session: Session) -> None:
    """Deleting a ticket cascades to comments; relationships round-trip."""
    user = User(name="Agent One", email="agent1@example.com", role="agent")
    db_session.add(user)
    db_session.flush()

    ticket = Ticket(
        title="Network issue",
        description="Cannot connect",
        priority="high",
        created_by=user.id,
        assigned_to=user.id,
    )
    db_session.add(ticket)
    db_session.flush()

    comment = Comment(
        ticket_id=ticket.id,
        message="Looking into it",
        created_by=user.id,
    )
    db_session.add(comment)
    db_session.commit()

    db_session.refresh(ticket)
    assert ticket.creator.email == "agent1@example.com"
    assert ticket.assignee is not None
    assert len(ticket.comments) == 1
    assert ticket.comments[0].message == "Looking into it"

    ticket_id = ticket.id
    db_session.delete(ticket)
    db_session.commit()

    remaining = db_session.scalars(
        select(Comment).where(Comment.ticket_id == ticket_id)
    ).all()
    assert remaining == []


def test_alembic_downgrade_removes_tables(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Initial revision downgrade must drop all three tables."""
    db_path = tmp_path / "downgrade.db"
    database_url = f"sqlite:///{db_path}"
    monkeypatch.setenv("DATABASE_URL", database_url)
    get_settings.cache_clear()

    alembic_cfg = Config(str(BACKEND_ROOT / "alembic.ini"))
    try:
        command.upgrade(alembic_cfg, "head")
        command.downgrade(alembic_cfg, "base")

        engine = create_engine(database_url)
        inspector = inspect(engine)
        tables = set(inspector.get_table_names())
        engine.dispose()

        assert "users" not in tables
        assert "tickets" not in tables
        assert "comments" not in tables
    finally:
        get_settings.cache_clear()
