"""API v1 router aggregation."""

from fastapi import APIRouter

from app.api.routers import auth, groups

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(groups.router)
