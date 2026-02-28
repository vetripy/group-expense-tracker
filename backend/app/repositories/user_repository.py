"""User repository for MongoDB operations."""

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.user import UserInDB


class UserRepository:
    """Handles user CRUD operations."""

    COLLECTION = "users"

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.db = db
        self.collection = db[self.COLLECTION]

    async def get_by_id(self, user_id: str) -> UserInDB | None:
        """Get user by ID."""
        doc = await self.collection.find_one({"_id": ObjectId(user_id)})
        return UserInDB(**doc) if doc else None

    async def get_by_email(self, email: str) -> UserInDB | None:
        """Get user by email."""
        doc = await self.collection.find_one({"email": email.lower()})
        return UserInDB(**doc) if doc else None

    async def create(self, user: UserInDB) -> UserInDB:
        """Create a new user."""
        data = user.model_dump(by_alias=True, exclude={"id", "_id"})
        result = await self.collection.insert_one(data)
        user.id = result.inserted_id
        return user
