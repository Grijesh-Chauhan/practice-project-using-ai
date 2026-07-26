"""FastAPI dependency providers."""

from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.session import get_session


def get_db() -> Generator[Session]:
    """Provide a request-scoped SQLAlchemy session (closed after the request)."""
    yield from get_session()
