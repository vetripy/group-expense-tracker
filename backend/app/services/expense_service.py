"""Expense business logic."""

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.expense import ExpenseCreate, ExpenseInDB, PREDEFINED_CATEGORIES
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.group_repository import GroupRepository


class ExpenseService:
    """Handles expense operations."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.repo = ExpenseRepository(db)
        self.group_repo = GroupRepository(db)

    def get_valid_categories(self, group_id: str, custom_categories: list[str]) -> list[str]:
        """Combine predefined and group-specific categories."""
        return list(dict.fromkeys(PREDEFINED_CATEGORIES + custom_categories))

    async def validate_category(
        self, group_id: str, category: str
    ) -> tuple[bool, str | None]:
        """Validate category against predefined + group custom. Returns (valid, error_msg)."""
        group = await self.group_repo.get_by_id(group_id)
        if not group:
            return False, "Group not found"
        allowed = self.get_valid_categories(group_id, group.custom_categories)
        if category not in allowed:
            return False, f"Category must be one of: {', '.join(allowed)}"
        return True, None

    async def create_expense(
        self, group_id: str, user_id: str, data: ExpenseCreate
    ) -> ExpenseInDB:
        """Create an expense for a group."""
        valid, err = await self.validate_category(group_id, data.category)
        if not valid:
            raise ValueError(err or "Invalid category")
        expense = ExpenseInDB(
            title=data.title,
            amount=data.amount,
            category=data.category,
            description=data.description,
            date=data.date,
            created_by=user_id,
            group_id=group_id,
        )
        return await self.repo.create(expense)
