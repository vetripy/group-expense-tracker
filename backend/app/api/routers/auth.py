"""Authentication routes."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.api.deps import AuthServiceDep, CurrentUserIdDep, UserRepositoryDep
from app.models.user import User, UserCreate
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/register", response_model=User)
async def register(user_create: UserCreate, auth: AuthServiceDep) -> User:
    try:
        user = await auth.register(user_create)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login")
async def login(login_data: LoginRequest, auth: AuthServiceDep) -> dict:
    user = await auth.authenticate(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token, refresh_token = auth.create_tokens(str(user.id))
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/refresh")
async def refresh_token(refresh_data: RefreshRequest, auth: AuthServiceDep) -> dict:
    access_token = auth.refresh_access_token(refresh_data.refresh_token)
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=User)
async def get_current_user(
    user_id: CurrentUserIdDep,
    user_repo: UserRepositoryDep,
) -> User:
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return User(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        created_at=user.created_at,
    )
