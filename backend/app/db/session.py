"""Database engine and session factory."""

from collections.abc import Generator
from pathlib import Path
from sqlite3 import Connection as SQLiteConnection

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


def ensure_sqlite_directory(database_url: str) -> None:
    """Create the parent directory for a SQLite file URL if needed."""
    if not database_url.startswith("sqlite:///"):
        return
    db_path = database_url.removeprefix("sqlite:///")
    path_only = db_path.split("?", 1)[0]
    if not path_only or path_only == ":memory:":
        return
    Path(path_only).parent.mkdir(parents=True, exist_ok=True)


settings = get_settings()
ensure_sqlite_directory(settings.database_url)

connect_args: dict[str, bool] = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)


@event.listens_for(Engine, "connect")
def _set_sqlite_pragma(dbapi_connection: object, _connection_record: object) -> None:
    """Enable SQLite foreign key enforcement on every connection."""
    if not isinstance(dbapi_connection, SQLiteConnection):
        return
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    class_=Session,
)


def get_session() -> Generator[Session]:
    """Yield a database session and ensure it is closed."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
