"""FastAPI dependency injection."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import Settings, get_settings
from app.core.database import get_database
from app.core.security import decode_token
from app.models.group import GroupInDB
from app.repositories.group_repository import GroupRepository
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.group_service import GroupService

security = HTTPBearer(auto_error=False)


# Type aliases for cleaner dependency injection
SettingsDep = Annotated[Settings, Depends(get_settings)]
DatabaseDep = Annotated[AsyncIOMotorDatabase, Depends(get_database)]


def get_group_repository(db: DatabaseDep) -> GroupRepository:
    return GroupRepository(db)


def get_group_service(db: DatabaseDep) -> GroupService:
    return GroupService(db)


def get_expense_repository(db: DatabaseDep):
    from app.repositories.expense_repository import ExpenseRepository
    return ExpenseRepository(db)


def get_expense_service(db: DatabaseDep):
    from app.services.expense_service import ExpenseService
    return ExpenseService(db)


def get_expense_repository(db: DatabaseDep):
    from app.repositories.expense_repository import ExpenseRepository
    return ExpenseRepository(db)


ExpenseServiceDep = Annotated[object, Depends(get_expense_service)]
ExpenseRepositoryDep = Annotated[object, Depends(get_expense_repository)]


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
GroupRepositoryDep = Annotated[GroupRepository, Depends(get_group_repository)]
GroupServiceDep = Annotated[GroupService, Depends(get_group_service)]


async def require_group_member(
    group_id: str,
    user_id: CurrentUserIdDep,
    group_repo: GroupRepositoryDep,
) -> GroupInDB:
    """Require user to be a member of the group. Returns group or 403/404."""
    group = await group_repo.get_by_id(group_id)
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    group_service = GroupService(group_repo.db)
    if not group_service.is_member(group, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group",
        )
    return group


async def require_group_admin(
    group_id: str,
    user_id: CurrentUserIdDep,
    group_repo: GroupRepositoryDep,
) -> GroupInDB:
    """Require user to be admin of the group."""
    group = await require_group_member(group_id, user_id, group_repo)
    group_service = GroupService(group_repo.db)
    if not group_service.is_admin(group, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return group


GroupMemberDep = Annotated[GroupInDB, Depends(require_group_member)]
GroupAdminDep = Annotated[GroupInDB, Depends(require_group_admin)]


