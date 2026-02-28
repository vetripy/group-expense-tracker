"""FastAPI dependency injection."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import Settings, get_settings
from app.core.database import get_database
from app.core.security import decode_token
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService

security = HTTPBearer(auto_error=False)


# Type aliases for cleaner dependency injection
SettingsDep = Annotated[Settings, Depends(get_settings)]
DatabaseDep = Annotated[AsyncIOMotorDatabase, Depends(get_database)]


async def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: DatabaseDep,
) -> str:
    """Extract and validate user ID from JWT. Raises 401 if invalid."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(credentials.credentials)
    if payload is None or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    return user_id


def get_user_repository(db: DatabaseDep) -> UserRepository:
    """Create UserRepository with database dependency."""
    return UserRepository(db)


def get_auth_service(db: DatabaseDep) -> AuthService:
    """Create AuthService with dependencies."""
    return AuthService(db)


# Dependency aliases
CurrentUserIdDep = Annotated[str, Depends(get_current_user_id)]
UserRepositoryDep = Annotated[UserRepository, Depends(get_user_repository)]
AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
