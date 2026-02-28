"""Expense repository for MongoDB operations."""

from datetime import date

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import date, datetime, timezone

from app.models.expense import ExpenseInDB


class ExpenseRepository:
    """Handles expense CRUD and aggregation operations."""

    COLLECTION = "expenses"

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.db = db
        self.collection = db[self.COLLECTION]

    async def create(self, expense: ExpenseInDB) -> ExpenseInDB:
        """Create a new expense."""
        data = expense.model_dump(by_alias=True, exclude={"id", "_id"})
        # Serialize date for MongoDB
        data["date"] = datetime.combine(expense.date, datetime.min.time(), tzinfo=timezone.utc)
        result = await self.collection.insert_one(data)
        expense.id = result.inserted_id
        return expense

    async def get_by_group(
        self,
        group_id: str,
        skip: int = 0,
        limit: int = 20,
        sort_order: int = -1,
    ) -> list[ExpenseInDB]:
        """Get expenses for a group with pagination and date sorting."""
        cursor = (
            self.collection.find({"group_id": group_id})
            .sort("date", sort_order)
            .skip(skip)
            .limit(limit)
        )
        return [ExpenseInDB(**doc) async for doc in cursor]

    async def count_by_group(self, group_id: str) -> int:
        """Count total expenses in a group."""
        return await self.collection.count_documents({"group_id": group_id})
