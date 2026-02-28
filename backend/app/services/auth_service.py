"""Authentication business logic."""

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User, UserCreate, UserInDB
from app.repositories.user_repository import UserRepository


class AuthService:
    """Handles authentication operations."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.repo = UserRepository(db)

    async def register(self, user_create: UserCreate) -> User:
        """Register a new user."""
        existing = await self.repo.get_by_email(user_create.email)
        if existing:
            raise ValueError("Email already registered")
        user_in_db = UserInDB(
            email=user_create.email.lower(),
            full_name=user_create.full_name,
            hashed_password=get_password_hash(user_create.password),
        )
        created = await self.repo.create(user_in_db)
        return User(
            id=created.id,
            email=created.email,
            full_name=created.full_name,
            is_active=created.is_active,
            created_at=created.created_at,
        )

    async def authenticate(self, email: str, password: str) -> User | None:
        """Authenticate user and return user if valid."""
        user = await self.repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return User(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at,
        )

    def create_tokens(self, user_id: str) -> tuple[str, str]:
        """Create access and refresh tokens for a user."""
        access = create_access_token(str(user_id))
        refresh = create_refresh_token(str(user_id))
        return access, refresh

    def refresh_access_token(self, refresh_token: str) -> str | None:
        """Validate refresh token and return new access token."""
        payload = decode_token(refresh_token)
        if payload is None or payload.get("type") != "refresh":
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        return create_access_token(user_id)
