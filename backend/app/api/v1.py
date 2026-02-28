"""API v1 router aggregation."""

from fastapi import APIRouter

from app.api.routers import auth

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
