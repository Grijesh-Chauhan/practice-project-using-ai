"""API v1 router aggregation."""

from fastapi import APIRouter

from app.api.v1.endpoints import comments, tickets, users

api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(tickets.router)
api_router.include_router(comments.router)
