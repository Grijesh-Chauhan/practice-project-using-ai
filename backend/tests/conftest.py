"""Shared pytest fixtures."""

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture
def client() -> Generator[TestClient]:
    """Provide a FastAPI test client."""
    with TestClient(create_app()) as test_client:
        yield test_client
