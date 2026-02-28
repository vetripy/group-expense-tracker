"""User models."""

from datetime import datetime

from pydantic import EmailStr, Field

from app.models.base import BaseDBModel, PyObjectId


class UserBase(BaseDBModel):
    """Shared user attributes."""

    email: EmailStr
    full_name: str = ""


class UserCreate(UserBase):
    """Schema for user registration."""

    password: str = Field(..., min_length=8)


class UserInDB(UserBase):
    """User as stored in database (with hashed password)."""

    id: PyObjectId | None = Field(default=None, alias="_id")
    hashed_password: str
    is_active: bool = True


class User(UserBase):
    """User response model (excludes sensitive data)."""

    id: PyObjectId | None = None
    is_active: bool = True
    created_at: datetime | None = None


class UserResponse(User):
    """API response schema for user (alias for User)."""

    pass
