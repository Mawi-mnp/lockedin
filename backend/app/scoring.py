"""
Commitment Score Algorithm

This module implements the Commitment Score calculation system for tracking
user commitment based on contribution frequency, goal completion, and withdrawal behavior.

SCORING FORMULA:
================
The Commitment Score is calculated as follows:

    score = BASE_SCORE 
            + contribution_frequency_bonus 
            + goal_completion_bonus 
            - withdrawal_penalties

Where:
    - BASE_SCORE: Starting score for all users (50 points)
    - contribution_frequency_bonus: +2 points per on-time contribution (capped at +20)
    - goal_completion_bonus: +10 points per completed goal (capped at +30)
    - withdrawal_penalties: -15 points per unapproved withdrawal (0 for approved)

The final score is clamped to the range [0, 100].

CONSTANTS:
==========
All scoring constants are configurable at the top of this module.
"""

from typing import Optional
from sqlalchemy.orm import Session

# =============================================================================
# CONFIGURABLE SCORING CONSTANTS
# =============================================================================

BASE_SCORE = 50
"""Starting base score for all users (0-100 scale)"""

CONTRIBUTION_FREQUENCY_BONUS = 2
"""Points awarded per on-time contribution"""

CONTRIBUTION_FREQUENCY_MAX = 20
"""Maximum bonus points from contribution frequency"""

GOAL_COMPLETION_BONUS = 10
"""Points awarded per completed goal"""

GOAL_COMPLETION_MAX = 30
"""Maximum bonus points from goal completion"""

EARLY_WITHDRAWAL_PENALTY = -15
"""Penalty points for unapproved withdrawal"""

BUSINESS_APPROVED_WITHDRAWAL = 0
"""Penalty for business-approved withdrawal (no penalty)"""

# =============================================================================
# SCORING FUNCTIONS
# =============================================================================


def calculate_score(user_id: int, db_session: Session) -> int:
    """
    Calculate the Commitment Score for a user.

    The score is computed based on:
    1. Base score (50 points)
    2. Contribution frequency bonus (+2 per on-time contribution, max +20)
    3. Goal completion bonus (+10 per completed goal, max +30)
    4. Withdrawal penalties (-15 per unapproved withdrawal)

    Args:
        user_id: The unique identifier of the user
        db_session: SQLAlchemy database session for querying user data

    Returns:
        int: The calculated commitment score, clamped to range [0, 100]

    Formula:
        score = BASE_SCORE 
                + min(contribution_count * CONTRIBUTION_FREQUENCY_BONUS, CONTRIBUTION_FREQUENCY_MAX)
                + min(completed_goals * GOAL_COMPLETION_BONUS, GOAL_COMPLETION_MAX)
                + (unapproved_withdrawals * EARLY_WITHDRAWAL_PENALTY)

        final_score = max(0, min(100, score))
    """
    # Import models here to avoid circular imports
    from .models import Contribution, Goal, Withdrawal

    # Start with base score
    score = BASE_SCORE

    # Calculate contribution frequency bonus
    # Count on-time contributions for this user
    on_time_contributions = db_session.query(Contribution).filter(
        Contribution.user_id == user_id,
        Contribution.is_on_time == True
    ).count()

    contribution_bonus = min(
        on_time_contributions * CONTRIBUTION_FREQUENCY_BONUS,
        CONTRIBUTION_FREQUENCY_MAX
    )
    score += contribution_bonus

    # Calculate goal completion bonus
    # Count completed goals for this user
    completed_goals = db_session.query(Goal).filter(
        Goal.user_id == user_id,
        Goal.is_completed == True
    ).count()

    goal_bonus = min(
        completed_goals * GOAL_COMPLETION_BONUS,
        GOAL_COMPLETION_MAX
    )
    score += goal_bonus

    # Calculate withdrawal penalties
    # Count unapproved withdrawals for this user
    unapproved_withdrawals = db_session.query(Withdrawal).filter(
        Withdrawal.user_id == user_id,
        Withdrawal.is_approved == False
    ).count()

    withdrawal_penalty = unapproved_withdrawals * EARLY_WITHDRAWAL_PENALTY
    score += withdrawal_penalty

    # Clamp score to valid range [0, 100]
    final_score = max(0, min(100, score))

    return final_score


def apply_withdrawal_penalty(
    user_id: int,
    amount: float,
    reason_tag: str,
    db_session: Session
) -> int:
    """
    Apply a withdrawal penalty to a user's commitment score.

    This function creates a withdrawal record and returns the new score
    after applying the appropriate penalty based on approval status.

    Penalty Rules:
    - Unapproved withdrawal: -15 points (EARLY_WITHDRAWAL_PENALTY)
    - Business-approved withdrawal: 0 points (BUSINESS_APPROVED_WITHDRAWAL)

    Args:
        user_id: The unique identifier of the user
        amount: The withdrawal amount (used for record-keeping)
        reason_tag: Tag indicating the reason for withdrawal
                   Common tags: 'early', 'emergency', 'business_approved', etc.
        db_session: SQLAlchemy database session for database operations

    Returns:
        int: The user's new commitment score after penalty application

    Side Effects:
        Creates a new Withdrawal record in the database
    """
    from .models import Withdrawal

    # Determine if this withdrawal is approved based on reason tag
    # Business-approved withdrawals have no penalty
    is_approved = reason_tag.lower() in ['business_approved', 'approved', 'business']
    penalty = BUSINESS_APPROVED_WITHDRAWAL if is_approved else EARLY_WITHDRAWAL_PENALTY

    # Create withdrawal record
    withdrawal = Withdrawal(
        user_id=user_id,
        amount=amount,
        reason_tag=reason_tag,
        is_approved=is_approved,
        penalty_applied=penalty
    )
    db_session.add(withdrawal)
    db_session.commit()

    # Recalculate and return the new score
    new_score = calculate_score(user_id, db_session)

    return new_score


def update_score_on_contribution(user_id: int, db_session: Session) -> int:
    """
    Update a user's commitment score after making a contribution.

    This function should be called when a user makes an on-time contribution.
    It recalculates the score based on the updated contribution count.

    Args:
        user_id: The unique identifier of the user
        db_session: SQLAlchemy database session for database operations

    Returns:
        int: The user's updated commitment score

    Note:
        This function assumes the contribution record has already been
        created in the database before calling. It simply recalculates
        the score based on current state.
    """
    new_score = calculate_score(user_id, db_session)
    return new_score


def get_score_breakdown(user_id: int, db_session: Session) -> dict:
    """
    Get a detailed breakdown of how a user's commitment score was calculated.

    This is useful for debugging and for showing users how their score
    was determined.

    Args:
        user_id: The unique identifier of the user
        db_session: SQLAlchemy database session for querying user data

    Returns:
        dict: A dictionary containing:
            - base_score: The starting base score
            - contribution_bonus: Points from contribution frequency
            - contribution_count: Number of on-time contributions
            - goal_bonus: Points from goal completion
            - completed_goals: Number of completed goals
            - withdrawal_penalty: Points lost from withdrawals
            - unapproved_withdrawals: Count of unapproved withdrawals
            - raw_score: Score before clamping
            - final_score: Final score clamped to [0, 100]
    """
    from .models import Contribution, Goal, Withdrawal

    # Count on-time contributions
    on_time_contributions = db_session.query(Contribution).filter(
        Contribution.user_id == user_id,
        Contribution.is_on_time == True
    ).count()

    contribution_bonus = min(
        on_time_contributions * CONTRIBUTION_FREQUENCY_BONUS,
        CONTRIBUTION_FREQUENCY_MAX
    )

    # Count completed goals
    completed_goals = db_session.query(Goal).filter(
        Goal.user_id == user_id,
        Goal.is_completed == True
    ).count()

    goal_bonus = min(
        completed_goals * GOAL_COMPLETION_BONUS,
        GOAL_COMPLETION_MAX
    )

    # Count unapproved withdrawals
    unapproved_withdrawals = db_session.query(Withdrawal).filter(
        Withdrawal.user_id == user_id,
        Withdrawal.is_approved == False
    ).count()

    withdrawal_penalty = unapproved_withdrawals * EARLY_WITHDRAWAL_PENALTY

    # Calculate raw and final scores
    raw_score = BASE_SCORE + contribution_bonus + goal_bonus + withdrawal_penalty
    final_score = max(0, min(100, raw_score))

    return {
        'base_score': BASE_SCORE,
        'contribution_bonus': contribution_bonus,
        'contribution_count': on_time_contributions,
        'contribution_max': CONTRIBUTION_FREQUENCY_MAX,
        'goal_bonus': goal_bonus,
        'completed_goals': completed_goals,
        'goal_max': GOAL_COMPLETION_MAX,
        'withdrawal_penalty': withdrawal_penalty,
        'unapproved_withdrawals': unapproved_withdrawals,
        'raw_score': raw_score,
        'final_score': final_score
    }
