"""Group models."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field

from app.models.base import BaseDBModel, PyObjectId


class MemberRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"


class GroupMember(BaseModel):
    user_id: str
    role: MemberRole = MemberRole.MEMBER


class GroupBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    custom_categories: list[str] = Field(default_factory=list, max_length=20)


class GroupCreate(GroupBase):
    pass


class GroupInDB(BaseDBModel):
    name: str
    created_by: str  # user_id
    members: list[dict] = Field(default_factory=list)  # [{user_id, role}]
    custom_categories: list[str] = Field(default_factory=list)


class Group(BaseDBModel):
    id: PyObjectId | None = None
    name: str
    created_by: str
    members: list[dict]
    custom_categories: list[str] = Field(default_factory=list)
    created_at: datetime | None = None
