"""Shared pytest fixtures."""

from collections.abc import Generator
from pathlib import Path
from sqlite3 import Connection as SQLiteConnection

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.api.deps import get_db
from app.core.config import get_settings
from app.main import create_app
from app.models.user import User

BACKEND_ROOT = Path(__file__).resolve().parents[1]


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


@pytest.fixture
def seed_users(db_session: Session) -> list[User]:
    """Insert two demo users for assignee/header tests."""
    users = [
        User(name="Alice Agent", email="alice@example.com", role="agent"),
        User(name="Bob Agent", email="bob@example.com", role="agent"),
    ]
    db_session.add_all(users)
    db_session.commit()
    for user in users:
        db_session.refresh(user)
    return users


@pytest.fixture
def client() -> Generator[TestClient]:
    """Provide a FastAPI test client without DB overrides."""
    with TestClient(create_app()) as test_client:
        yield test_client


@pytest.fixture
def db_client(migrated_engine: Engine) -> Generator[TestClient]:
    """Provide a FastAPI test client with get_db bound to the test database."""
    SessionLocal = sessionmaker(
        bind=migrated_engine,
        autoflush=False,
        autocommit=False,
    )

    def override_get_db() -> Generator[Session]:
        session = SessionLocal()
        try:
            yield session
        finally:
            session.close()

    application = create_app()
    application.dependency_overrides[get_db] = override_get_db
    with TestClient(application) as test_client:
        yield test_client
    application.dependency_overrides.clear()
