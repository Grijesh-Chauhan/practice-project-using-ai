"""Comment API endpoints."""

from fastapi import APIRouter

from app.api.deps import CommentSvc, RequireUserId
from app.schemas.comment import CommentCreate, CommentRead

router = APIRouter(prefix="/tickets", tags=["comments"])


@router.post(
    "/{ticket_id}/comments",
    response_model=CommentRead,
    status_code=201,
)
def create_comment(
    ticket_id: int,
    body: CommentCreate,
    service: CommentSvc,
    created_by: RequireUserId,
) -> CommentRead:
    """Add a comment to a ticket (allowed for any status including terminal)."""
    comment = service.add_comment(ticket_id, body, created_by=created_by)
    return CommentRead.model_validate(comment)
