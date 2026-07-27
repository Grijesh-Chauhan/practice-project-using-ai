"""Users API endpoints."""

from fastapi import APIRouter

from app.api.deps import UserSvc
from app.schemas.user import UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_users(service: UserSvc) -> list[UserRead]:
    """List seeded users for assignee dropdown."""
    users = service.list_users()
    return [UserRead.model_validate(user) for user in users]
