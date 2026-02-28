"""Group management and expense routes."""

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.api.deps import (
    CurrentUserIdDep,
    DatabaseDep,
    ExpenseRepositoryDep,
    ExpenseServiceDep,
    GroupAdminDep,
    GroupMemberDep,
    GroupRepositoryDep,
    GroupServiceDep,
)
from app.models.expense import (
    PREDEFINED_CATEGORIES,
    Expense,
    ExpenseCreate,
)
from app.models.group import Group, GroupCreate, MemberRole

router = APIRouter(prefix="/groups", tags=["Groups"])


# ---- Request/Response schemas ----

class AddMemberRequest(BaseModel):
    user_id: str = Field(..., description="User ID to add")


# ---- Group endpoints ----

@router.post("", response_model=Group, status_code=status.HTTP_201_CREATED)
async def create_group(
    data: GroupCreate,
    user_id: CurrentUserIdDep,
    group_service: GroupServiceDep,
    group_repo: GroupRepositoryDep,
) -> Group:
    """Create a new group. Creator automatically becomes admin."""
    group_in_db = await group_service.create_group(user_id, data)
    return Group(
        id=group_in_db.id,
        name=group_in_db.name,
        created_by=group_in_db.created_by,
        members=group_in_db.members,
        custom_categories=group_in_db.custom_categories,
        created_at=group_in_db.created_at,
    )


@router.get("", response_model=list[Group])
async def list_groups(
    user_id: CurrentUserIdDep,
    group_repo: GroupRepositoryDep,
) -> list[Group]:
    """List all groups the current user belongs to."""
    groups = await group_repo.get_user_groups(user_id)
    return [
        Group(
            id=g.id,
            name=g.name,
            created_by=g.created_by,
            members=g.members,
            custom_categories=g.custom_categories,
            created_at=g.created_at,
        )
        for g in groups
    ]


@router.get("/{group_id}", response_model=Group)
async def get_group(
    group_id: str,
    group: GroupMemberDep,
) -> Group:
    """Get a group by ID (must be a member)."""
    return Group(
        id=group.id,
        name=group.name,
        created_by=group.created_by,
        members=group.members,
        custom_categories=group.custom_categories,
        created_at=group.created_at,
    )


@router.post("/{group_id}/members", status_code=status.HTTP_201_CREATED)
async def add_member(
    group_id: str,
    body: AddMemberRequest,
    group: GroupAdminDep,
    group_repo: GroupRepositoryDep,
) -> dict:
    """Add a member to the group (admin only)."""
    added = await group_repo.add_member(group_id, body.user_id, MemberRole.MEMBER.value)
    if not added:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User may already be a member",
        )
    return {"message": "Member added", "user_id": body.user_id}


@router.patch("/{group_id}/members/{user_id}/promote")
async def promote_member(
    group_id: str,
    user_id: str,
    group: GroupAdminDep,
    group_repo: GroupRepositoryDep,
) -> dict:
    """Promote a member to admin (admin only)."""
    updated = await group_repo.update_member_role(
        group_id, user_id, MemberRole.ADMIN.value
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in group",
        )
    return {"message": "Member promoted to admin", "user_id": user_id}


@router.delete("/{group_id}/members/{user_id}")
async def remove_member(
    group_id: str,
    user_id: str,
    group: GroupAdminDep,
    group_repo: GroupRepositoryDep,
) -> dict:
    """Remove a member from the group (admin only)."""
    # Prevent admin from removing themselves if they're the last admin
    admins = [m for m in group.members if m.get("role") == MemberRole.ADMIN.value]
    if len(admins) == 1 and admins[0].get("user_id") == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the last admin. Transfer admin role first.",
        )
    removed = await group_repo.remove_member(group_id, user_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in group",
        )
    return {"message": "Member removed", "user_id": user_id}


# ---- Expense endpoints ----

@router.post("/{group_id}/expenses", response_model=Expense, status_code=status.HTTP_201_CREATED)
async def create_expense(
    group_id: str,
    data: ExpenseCreate,
    user_id: CurrentUserIdDep,
    group: GroupMemberDep,
    expense_service: ExpenseServiceDep,
) -> Expense:
    """Add an expense to the group (members only)."""
    try:
        expense_in_db = await expense_service.create_expense(group_id, user_id, data)
        return Expense(
            id=expense_in_db.id,
            title=expense_in_db.title,
            amount=expense_in_db.amount,
            category=expense_in_db.category,
            description=expense_in_db.description,
            date=expense_in_db.date,
            created_by=expense_in_db.created_by,
            group_id=expense_in_db.group_id,
            created_at=expense_in_db.created_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{group_id}/expenses")
async def list_expenses(
    group_id: str,
    group: GroupMemberDep,
    expense_repo: ExpenseRepositoryDep,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_order: int = Query(-1, description="1 for ascending, -1 for descending by date"),
) -> dict:
    """List expenses for a group with pagination and date sorting."""
    skip = (page - 1) * limit
    expenses = await expense_repo.get_by_group(group_id, skip=skip, limit=limit, sort_order=sort_order)
    total = await expense_repo.count_by_group(group_id)
    return {
        "items": [
            Expense(
                id=e.id,
                title=e.title,
                amount=e.amount,
                category=e.category,
                description=e.description,
                date=e.date,
                created_by=e.created_by,
                group_id=e.group_id,
                created_at=e.created_at,
            )
            for e in expenses
        ],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


# ---- Categories (for frontend) ----

class AddCategoryRequest(BaseModel):
    category: str = Field(..., min_length=1, max_length=100)


@router.get("/{group_id}/categories")
async def get_categories(
    group: GroupMemberDep,
) -> dict:
    """Get valid expense categories (predefined + group custom)."""
    categories = list(dict.fromkeys(PREDEFINED_CATEGORIES + group.custom_categories))
    return {"categories": categories}


@router.post("/{group_id}/categories", status_code=status.HTTP_201_CREATED)
async def add_custom_category(
    group_id: str,
    body: AddCategoryRequest,
    group: GroupAdminDep,
    group_repo: GroupRepositoryDep,
) -> dict:
    """Add a custom category to the group (admin only)."""
    added = await group_repo.add_custom_category(group_id, body.category)
    if not added:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category may already exist",
        )
    return {"message": "Category added", "category": body.category}


# ---- Stats endpoint ----

@router.get("/{group_id}/stats")
async def get_group_stats(
    group_id: str,
    group: GroupMemberDep,
    db: DatabaseDep,
) -> dict:
    """Expense statistics: total, by category, by user, monthly breakdown (chart-ready)."""
    # Use $dateFromString for date field (stored as string YYYY-MM-DD) or $convert for datetime
    pipeline = [
        {"$match": {"group_id": group_id}},
        {
            "$addFields": {
                "dateObj": {
                    "$cond": {
                        "if": {"$eq": [{"$type": "$date"}, "string"]},
                        "then": {"$dateFromString": {"dateString": {"$concat": ["$date", "T00:00:00Z"]}}},
                        "else": "$date",
                    }
                }
            }
        },
        {
            "$facet": {
                "total": [{"$group": {"_id": None, "total": {"$sum": "$amount"}}}],
                "by_category": [
                    {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
                    {"$sort": {"total": -1}},
                ],
                "by_user": [
                    {"$group": {"_id": "$created_by", "total": {"$sum": "$amount"}}},
                    {"$sort": {"total": -1}},
                ],
                "monthly": [
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$dateObj"},
                                "month": {"$month": "$dateObj"},
                            },
                            "total": {"$sum": "$amount"},
                        }
                    },
                    {"$sort": {"_id.year": 1, "_id.month": 1}},
                ],
            }
        },
    ]
    cursor = db.expenses.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    if not result:
        return {
            "total": 0,
            "by_category": [],
            "by_user": [],
            "monthly": [],
        }
    data = result[0]
    total_val = data["total"][0]["total"] if data["total"] else 0
    return {
        "total": round(total_val, 2),
        "by_category": [{"category": x["_id"], "total": round(x["total"], 2)} for x in data["by_category"]],
        "by_user": [{"user_id": x["_id"], "total": round(x["total"], 2)} for x in data["by_user"]],
        "monthly": [
            {"year": x["_id"]["year"], "month": x["_id"]["month"], "total": round(x["total"], 2)}
            for x in data["monthly"]
        ],
    }
