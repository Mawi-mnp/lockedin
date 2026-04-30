"""
Authentication Router for Commitment Score Application

This module provides REST API endpoints for user authentication including
registration, login, and profile retrieval.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.database import get_db
from app.models import User
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    validate_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# =============================================================================
# Pydantic Schemas
# =============================================================================

class UserRegister(BaseModel):
    """Schema for user registration request."""
    username: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    """Schema for user login request."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Schema for user profile response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    username: str
    email: str


class RegisterResponse(BaseModel):
    """Schema for registration response with token."""
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# =============================================================================
# Dependency for getting current user from token
# =============================================================================

def get_current_user_from_token(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current user from JWT token.
    
    Used by protected endpoints to require authentication.
    
    Args:
        token: JWT token from Authorization header
        db: Database session
        
    Returns:
        Authenticated User model instance
        
    Raises:
        HTTPException: 401 if authentication fails
    """
    return get_current_user(token, db)


# =============================================================================
# Authentication Endpoints
# =============================================================================

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Creates a new user with the provided email, password, and username.
    Validates password strength and ensures email uniqueness.
    Returns JWT token for auto-login.
    
    Args:
        user_data: Registration data (username, email, password)
        db: Database session
        
    Returns:
        Access token and user profile
        
    Raises:
        HTTPException: 400 if email already exists or password invalid
    """
    # Validate password strength
    is_valid, error_message = validate_password(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user with hashed password
    hashed_password = hash_password(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token for auto-login
    access_token = create_access_token(
        data={"sub": str(new_user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }


@router.post("/login", response_model=TokenResponse)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT access token.
    
    Validates email and password, returning a JWT token on success.
    
    Args:
        login_data: Login credentials (email, password)
        db: Database session
        
    Returns:
        JWT access token and token type
        
    Raises:
        HTTPException: 401 if credentials are invalid
    """
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token with user_id as string (required by JWT spec)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get the current authenticated user's profile.
    
    Requires a valid JWT token in the Authorization header.
    
    Args:
        current_user: Authenticated user (from JWT token)
        
    Returns:
        User profile information
        
    Raises:
        HTTPException: 401 if token is invalid or user not found
    """
    return current_user
