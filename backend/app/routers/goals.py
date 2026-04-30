"""
Goals Router for Commitment Score Application

This module provides REST API endpoints for managing commitment goals.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List

from app.database import get_db
from app.models import Goal, User, Contribution
from app.auth import get_current_user, verify_password

router = APIRouter(prefix="/goals", tags=["Goals"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# =============================================================================
# Pydantic Schemas
# =============================================================================

class GoalCreate(BaseModel):
    """Schema for creating a new goal."""
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=1000)
    target_amount: float = Field(..., gt=0)
    deadline: datetime


class GoalResponse(BaseModel):
    """Schema for goal response."""
    id: int
    title: str
    description: str
    target_amount: float
    current_amount: float
    deadline: datetime
    creator_id: int
    creator_username: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ContributionCreate(BaseModel):
    """Schema for creating a contribution."""
    amount: float = Field(..., gt=0)


# =============================================================================
# Helper Functions
# =============================================================================

def get_current_user_from_token(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from token."""
    return get_current_user(token, db)


def calculate_goal_status(goal: Goal) -> str:
    """Calculate goal status based on current progress and deadline."""
    if goal.is_completed:
        return "completed"
    
    now = datetime.utcnow()
    if now > goal.deadline:
        return "failed"
    
    return "active"


def get_goal_current_amount(db: Session, goal_id: int) -> float:
    """Get the current contributed amount for a goal."""
    contributions = db.query(Contribution).filter(
        Contribution.user_id == Goal.user_id,
        Contribution.created_at >= Goal.created_at
    ).all()
    
    # For simplicity, sum all contributions by the goal creator
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        return 0.0
    
    user_contributions = db.query(Contribution).filter(
        Contribution.user_id == goal.user_id
    ).all()
    
    return sum(c.amount for c in user_contributions)


# =============================================================================
# Goals Endpoints
# =============================================================================

@router.get("/", response_model=List[GoalResponse])
def get_all_goals(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get all goals with optional filtering.
    
    Args:
        skip: Number of goals to skip for pagination
        limit: Maximum number of goals to return
        status_filter: Filter by status (active, completed, failed)
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of goals
    """
    query = db.query(Goal)
    
    if status_filter:
        # Filter by status logic would go here
        pass
    
    goals = query.offset(skip).limit(limit).all()
    
    result = []
    for goal in goals:
        current_amount = get_goal_current_amount(db, goal.id)
        status = calculate_goal_status(goal)
        
        result.append(GoalResponse(
            id=goal.id,
            title=goal.description[:50] if len(goal.description) > 50 else goal.description,
            description=goal.description,
            target_amount=goal.target_amount,
            current_amount=current_amount,
            deadline=goal.deadline,
            creator_id=goal.user_id,
            creator_username=goal.user.username,
            status=status,
            created_at=goal.created_at
        ))
    
    return result


@router.get("/user/{user_id}", response_model=List[GoalResponse])
def get_user_goals(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get all goals for a specific user.
    
    Args:
        user_id: ID of the user whose goals to retrieve
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of user's goals
    """
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    
    result = []
    for goal in goals:
        current_amount = get_goal_current_amount(db, goal.id)
        status = calculate_goal_status(goal)
        
        result.append(GoalResponse(
            id=goal.id,
            title=goal.description[:50] if len(goal.description) > 50 else goal.description,
            description=goal.description,
            target_amount=goal.target_amount,
            current_amount=current_amount,
            deadline=goal.deadline,
            creator_id=goal.user_id,
            creator_username=goal.user.username,
            status=status,
            created_at=goal.created_at
        ))
    
    return result


@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Create a new goal.
    
    Args:
        goal_data: Goal creation data
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Created goal
    """
    new_goal = Goal(
        user_id=current_user.id,
        description=f"{goal_data.title}: {goal_data.description}",
        target_amount=goal_data.target_amount,
        deadline=goal_data.deadline,
        is_completed=False
    )
    
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    
    return GoalResponse(
        id=new_goal.id,
        title=goal_data.title,
        description=goal_data.description,
        target_amount=goal_data.target_amount,
        current_amount=0.0,
        deadline=goal_data.deadline,
        creator_id=current_user.id,
        creator_username=current_user.username,
        status="active",
        created_at=new_goal.created_at
    )


@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get a specific goal by ID.
    
    Args:
        goal_id: ID of the goal
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Goal details
        
    Raises:
        HTTPException: 404 if goal not found
    """
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    current_amount = get_goal_current_amount(db, goal_id)
    status = calculate_goal_status(goal)
    
    return GoalResponse(
        id=goal.id,
        title=goal.description[:50] if len(goal.description) > 50 else goal.description,
        description=goal.description,
        target_amount=goal.target_amount,
        current_amount=current_amount,
        deadline=goal.deadline,
        creator_id=goal.user_id,
        creator_username=goal.user.username,
        status=status,
        created_at=goal.created_at
    )


@router.post("/{goal_id}/contribute", response_model=GoalResponse)
def contribute_to_goal(
    goal_id: int,
    contribution_data: ContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Contribute to a goal.
    
    Args:
        goal_id: ID of the goal to contribute to
        contribution_data: Contribution amount
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Updated goal
        
    Raises:
        HTTPException: 404 if goal not found
    """
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Check if goal is still active
    if goal.is_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot contribute to completed goal"
        )
    
    # Create contribution record
    contribution = Contribution(
        user_id=current_user.id,
        amount=contribution_data.amount,
        is_on_time=True
    )
    
    db.add(contribution)
    
    # Check if goal is now completed
    current_amount = get_goal_current_amount(db, goal_id)
    if current_amount >= goal.target_amount:
        goal.is_completed = True
        goal.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(goal)
    
    status = calculate_goal_status(goal)
    
    return GoalResponse(
        id=goal.id,
        title=goal.description[:50] if len(goal.description) > 50 else goal.description,
        description=goal.description,
        target_amount=goal.target_amount,
        current_amount=current_amount,
        deadline=goal.deadline,
        creator_id=goal.user_id,
        creator_username=goal.user.username,
        status=status,
        created_at=goal.created_at
    )
