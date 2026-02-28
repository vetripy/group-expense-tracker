"""Group repository for MongoDB operations."""

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.group import GroupInDB, MemberRole


class GroupRepository:
    """Handles group CRUD operations."""

    COLLECTION = "groups"

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.db = db
        self.collection = db[self.COLLECTION]

    async def create(self, group: GroupInDB) -> GroupInDB:
        """Create a new group."""
        data = group.model_dump(by_alias=True, exclude={"id", "_id"})
        result = await self.collection.insert_one(data)
        group.id = result.inserted_id
        return group

    async def get_by_id(self, group_id: str) -> GroupInDB | None:
        """Get group by ID."""
        doc = await self.collection.find_one({"_id": ObjectId(group_id)})
        return GroupInDB(**doc) if doc else None

    async def get_user_groups(self, user_id: str) -> list[GroupInDB]:
        """Get all groups where user is a member."""
        cursor = self.collection.find(
            {"members.user_id": user_id}
        ).sort("created_at", -1)
        return [GroupInDB(**doc) async for doc in cursor]

    async def add_member(self, group_id: str, user_id: str, role: str = "member") -> bool:
        """Add a member to a group."""
        result = await self.collection.update_one(
            {"_id": ObjectId(group_id)},
            {
                "$addToSet": {
                    "members": {"user_id": user_id, "role": role}
                }
            },
        )
        return result.modified_count > 0

    async def update_member_role(self, group_id: str, user_id: str, role: str) -> bool:
        """Update a member's role (e.g. promote to admin)."""
        result = await self.collection.update_one(
            {"_id": ObjectId(group_id), "members.user_id": user_id},
            {"$set": {"members.$.role": role}},
        )
        return result.modified_count > 0

    async def remove_member(self, group_id: str, user_id: str) -> bool:
        """Remove a member from a group."""
        result = await self.collection.update_one(
            {"_id": ObjectId(group_id)},
            {"$pull": {"members": {"user_id": user_id}}},
        )
        return result.modified_count > 0

    async def add_custom_category(self, group_id: str, category: str) -> bool:
        """Add a custom category to the group."""
        result = await self.collection.update_one(
            {"_id": ObjectId(group_id)},
            {"$addToSet": {"custom_categories": category}},
        )
        return result.modified_count > 0
