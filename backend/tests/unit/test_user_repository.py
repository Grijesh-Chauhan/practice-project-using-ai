"""UserRepository unit tests."""

from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repository import UserRepository


def test_list_all_returns_users_ordered_by_id(db_session: Session) -> None:
    """list_all returns inserted users sorted by primary key."""
    bob = User(name="Bob", email="bob@example.com", role="agent")
    alice = User(name="Alice", email="alice@example.com", role="agent")
    db_session.add_all([bob, alice])
    db_session.flush()

    repo = UserRepository(db_session)
    users = repo.list_all()

    assert len(users) == 2
    assert [user.id for user in users] == sorted(user.id for user in users)
    assert {user.email for user in users} == {
        "bob@example.com",
        "alice@example.com",
    }


def test_get_by_id_returns_user_or_none(db_session: Session) -> None:
    """get_by_id finds an existing user and returns None for unknown ids."""
    user = User(name="Carol", email="carol@example.com", role="admin")
    db_session.add(user)
    db_session.flush()

    repo = UserRepository(db_session)
    found = repo.get_by_id(user.id)
    assert found is not None
    assert found.email == "carol@example.com"
    assert repo.get_by_id(999_999) is None
