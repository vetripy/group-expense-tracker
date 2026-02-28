"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import get_settings
from app.core.database import database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: connect and disconnect database."""
    await database.connect()
    # Create indexes for performance
    await database.db.users.create_index("email", unique=True)
    yield
    await database.disconnect()


def create_application() -> FastAPI:
    """Factory for FastAPI application."""
    settings = get_settings()
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Group expense tracking API for families, roommates, and friends.",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # API routes
    app.include_router(api_router)

    @app.get("/health")
    async def health_check():
        """Health check endpoint for Docker/K8s."""
        return {"status": "ok"}

    return app


app = create_application()
