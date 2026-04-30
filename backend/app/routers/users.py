"""
Users Router for Commitment Score Application

This module provides REST API endpoints for user profile management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models import User, Goal, Contribution, Withdrawal
from app.auth import get_current_user
from app.scoring import calculate_score

router = APIRouter(prefix="/users", tags=["Users"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# =============================================================================
# Pydantic Schemas
# =============================================================================

class UserProfileResponse(BaseModel):
    """Schema for user profile response with commitment score."""
    id: int
    username: str
    email: str
    commitment_score: int
    wallet_balance: float
    is_co_founder: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# =============================================================================
# Helper Functions
# =============================================================================

def get_current_user_from_token(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from token."""
    return get_current_user(token, db)


def calculate_wallet_balance(db: Session, user_id: int) -> float:
    """Calculate user's wallet balance based on contributions and withdrawals."""
    contributions = db.query(Contribution).filter(Contribution.user_id == user_id).all()
    withdrawals = db.query(Withdrawal).filter(
        Withdrawal.user_id == user_id,
        Withdrawal.is_approved == True
    ).all()
    
    total_contributed = sum(c.amount for c in contributions)
    total_withdrawn = sum(w.amount for w in withdrawals)
    
    return total_contributed - total_withdrawn


def is_co_founder(score: int) -> bool:
    """Determine if user qualifies as co-founder based on score."""
    return score >= 80


# =============================================================================
# Users Endpoints
# =============================================================================

@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get the current authenticated user's profile.
    
    Args:
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Current user's profile with commitment score
    """
    # Calculate commitment score
    score = calculate_score(current_user.id, db)
    
    # Calculate wallet balance
    wallet_balance = calculate_wallet_balance(db, current_user.id)
    
    return UserProfileResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        commitment_score=score,
        wallet_balance=wallet_balance,
        is_co_founder=is_co_founder(score),
        created_at=current_user.created_at
    )


@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get a user's public profile.
    
    Args:
        user_id: ID of the user to retrieve
        db: Database session
        current_user: Authenticated user
        
    Returns:
        User profile with commitment score
        
    Raises:
        HTTPException: 404 if user not found
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Calculate commitment score
    score = calculate_score(user_id, db)
    
    # Calculate wallet balance
    wallet_balance = calculate_wallet_balance(db, user_id)
    
    return UserProfileResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        commitment_score=score,
        wallet_balance=wallet_balance,
        is_co_founder=is_co_founder(score),
        created_at=user.created_at
    )
