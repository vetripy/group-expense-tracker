"""Group business logic."""

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.group import GroupInDB, GroupCreate, MemberRole
from app.repositories.group_repository import GroupRepository


class GroupService:
    """Handles group operations."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.repo = GroupRepository(db)

    async def create_group(self, user_id: str, data: GroupCreate) -> GroupInDB:
        """Create a group with creator as admin."""
        group = GroupInDB(
            name=data.name,
            created_by=user_id,
            members=[{"user_id": user_id, "role": MemberRole.ADMIN.value}],
            custom_categories=data.custom_categories or [],
        )
        return await self.repo.create(group)

    def get_member_role(self, group: GroupInDB, user_id: str) -> str | None:
        """Get a user's role in a group. Returns None if not a member."""
        for m in group.members:
            if m.get("user_id") == user_id:
                return m.get("role")
        return None

    def is_admin(self, group: GroupInDB, user_id: str) -> bool:
        """Check if user is admin of the group."""
        return self.get_member_role(group, user_id) == MemberRole.ADMIN.value

    def is_member(self, group: GroupInDB, user_id: str) -> bool:
        """Check if user is a member (any role) of the group."""
        return self.get_member_role(group, user_id) is not None
