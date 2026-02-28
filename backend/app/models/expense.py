"""Expense models."""

from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.base import BaseDBModel, PyObjectId

# Predefined expense categories (global)
PREDEFINED_CATEGORIES = [
    "Food & Groceries",
    "Transport",
    "Utilities",
    "Rent",
    "Entertainment",
    "Health",
    "Shopping",
    "Travel",
    "Education",
    "Personal Care",
    "Other",
]


class ExpenseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0, description="Amount in currency units")
    category: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=1000)
    date: date


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseInDB(BaseDBModel):
    title: str
    amount: float
    category: str
    description: str = ""
    date: date
    created_by: str  # user_id
    group_id: str


class Expense(BaseDBModel):
    id: PyObjectId | None = None
    title: str
    amount: float
    category: str
    description: str = ""
    date: date
    created_by: str
    group_id: str
    created_at: datetime | None = None
