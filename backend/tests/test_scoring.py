"""
Unit Tests for Commitment Score Algorithm

This module contains comprehensive tests for the scoring.py module,
verifying that the commitment score calculation works correctly.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Import scoring constants and functions
from app.scoring import (
    calculate_score,
    apply_withdrawal_penalty,
    update_score_on_contribution,
    get_score_breakdown,
    BASE_SCORE,
    CONTRIBUTION_FREQUENCY_BONUS,
    CONTRIBUTION_FREQUENCY_MAX,
    GOAL_COMPLETION_BONUS,
    GOAL_COMPLETION_MAX,
    EARLY_WITHDRAWAL_PENALTY,
    BUSINESS_APPROVED_WITHDRAWAL
)

# Import models
from app.models import Base, User, Contribution, Goal, Withdrawal


# =============================================================================
# Test Fixtures
# =============================================================================

@pytest.fixture
def db_session():
    """
    Create an in-memory SQLite database session for testing.
    """
    engine = create_engine('sqlite:///:memory:', echo=False)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def test_user(db_session):
    """
    Create a test user in the database.
    """
    user = User(
        username='test_user',
        email='test@example.com',
        hashed_password='$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.X2.X2.X2.X2.X2'
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


# =============================================================================
# Test: Base Score
# =============================================================================

class TestBaseScore:
    """Tests for base score functionality."""

    def test_new_user_has_base_score(self, db_session, test_user):
        """A new user with no activity should have the base score."""
        score = calculate_score(test_user.id, db_session)
        assert score == BASE_SCORE
        assert score == 50

    def test_base_score_constant(self):
        """Verify the base score constant is set correctly."""
        assert BASE_SCORE == 50


# =============================================================================
# Test: Contribution Frequency Bonus
# =============================================================================

class TestContributionFrequencyBonus:
    """Tests for contribution frequency bonus calculations."""

    def test_single_contribution_bonus(self, db_session, test_user):
        """One on-time contribution should add CONTRIBUTION_FREQUENCY_BONUS points."""
        # Create an on-time contribution
        contribution = Contribution(
            user_id=test_user.id,
            amount=100.0,
            is_on_time=True
        )
        db_session.add(contribution)
        db_session.commit()

        score = calculate_score(test_user.id, db_session)
        expected = BASE_SCORE + CONTRIBUTION_FREQUENCY_BONUS
        assert score == expected

    def test_max_contribution_bonus(self, db_session, test_user):
        """Contribution bonus should be capped at CONTRIBUTION_FREQUENCY_MAX."""
        # Create 15 on-time contributions (would be 30 points without cap)
        for i in range(15):
            contribution = Contribution(
                user_id=test_user.id,
                amount=100.0,
                is_on_time=True
            )
            db_session.add(contribution)
        db_session.commit()

        score = calculate_score(test_user.id, db_session)
        expected = BASE_SCORE + CONTRIBUTION_FREQUENCY_MAX
        assert score == expected
        assert score == 50 + 20  # Base + max bonus

    def test_exact_max_contributions(self, db_session, test_user):
        """Exactly 10 contributions should hit the max bonus exactly."""
        # Create exactly 10 on-time contributions (10 * 2 = 20 points)
        for i in range(10):
            contribution = Contribution(
                user_id=test_user.id,
                amount=100.0,
                is_on_time=True
            )
            db_session.add(contribution)
        db_session.commit()

        score = calculate_score(test_user.id, db_session)
        expected = BASE_SCORE + (10 * CONTRIBUTION_FREQUENCY_BONUS)
        assert score == expected
        assert score == 70

    def test_late_contributions_no_bonus(self, db_session, test_user):
        """Late contributions should not add bonus points."""
        # Create late contributions
        for i in range(5):
            contribution = Contribution(
                user_id=test_user.id,
                amount=100.0,
                is_on_time=False
            )
            db_session.add(contribution)
        db_session.commit()

        score = calculate_score(test_user.id, db_session)
        assert score == BASE_SCORE  # No bonus for late contributions


# =============================================================================
# Test: Goal Completion Bonus
# =============================================================================

class TestGoalCompletionBonus:
    """Tests for goal completion bonus calculations."""

    def test_single_goal_completion_bonus(self, db_session, test_user):
        """One completed goal should add GOAL_COMPLETION_BONUS points."""
        goal = Goal(
            user_id=test_user.id,
            description='Test goal',
            target_amount=1000.0,
            is_completed=True,
            completed_at=datetime.utcnow()
        )
        db_session.add(goal)
        db_session.commit()

        score = calculate_score(test_user.id, db_session)
        expected = BASE_SCORE + GOAL_COMPLETION_BONUS
        assert score == expected

    def test_max_goal_completion_bonus(self, db_session, test_user):
        """Goal completion bonus should be capped at GOAL_COMPLETION_MAX."""
        # Create 5 completed goals (would be 50 points without cap)
        for i in range(5):
            goal = Goal(
                user_id=test_user.id,
                description=f'Test goal {i}',
                target_amount=1000.0,
                is_completed=True,
                completed_at=datetime.utcnow()
            )
            db_session.add(goal)
        db_session.commit()

        score = calculate_score(test_user.id, db_session)
        expected = BASE_SCORE + GOAL_COMPLETION_MAX
        assert score == expected
        assert score == 50 + 30  # Base + max bonus

    def test_exact_max_goals(self, db_session, test_user):
        """Exactly 3 completed goals should hit the max bonus exactly."""
        # Create exactly 3 completed goals (3 * 10 = 30 points)
        for i in range(3):
            goal = Goal(
                user_id=test_user.id,
                description=f'Test goal {i}',
                target_amount=1000.0,
                is_completed=True,
                completed_at=datetime.utcnow()
            )
            db_session.add(goal)
        db_session.commit()

        score = calculate_score(test_user.id, db_session)
        expected = BASE_SCORE + (3 * GOAL_COMPLETION_BONUS)
        assert score == expected
        assert score == 80

    def test_incomplete_goals_no_bonus(self, db_session, test_user):
        """Incomplete goals should not add bonus points."""
        # Create incomplete goals
        for i in range(5):
            goal = Goal(
                user_id=test_user.id,
                description=f'Test goal {i}',
                target_amount=1000.0,
                is_completed=False
            )
            db_session.add(goal)
        db_session.commit()

        score = calculate_score(test_user.id, db_session)
        assert score == BASE_SCORE  # No bonus for incomplete goals


# =============================================================================
# Test: Withdrawal Penalties
# =============================================================================

class TestWithdrawalPenalties:
    """Tests for withdrawal penalty calculations."""

    def test_unapproved_withdrawal_penalty(self, db_session, test_user):
        """Unapproved withdrawal should apply EARLY_WITHDRAWAL_PENALTY."""
        withdrawal = Withdrawal(
            user_id=test_user.id,
            amount=500.0,
            reason_tag='early',
            is_approved=False,
            penalty_applied=EARLY_WITHDRAWAL_PENALTY
        )
        db_session.add(withdrawal)
        db_session.commit()

        score = calculate_score(test_user.id, db_session)
        expected = BASE_SCORE + EARLY_WITHDRAWAL_PENALTY
        assert score == expected
        assert score == 50 - 15  # Base - penalty

    def test_approved_withdrawal_no_penalty(self, db_session, test_user):
        """Business-approved withdrawal should have no penalty."""
        withdrawal = Withdrawal(
            user_id=test_user.id,
            amount=500.0,
            reason_tag='business_approved',
            is_approved=True,
            penalty_applied=BUSINESS_APPROVED_WITHDRAWAL
        )
        db_session.add(withdrawal)
        db_session.commit()

        score = calculate_score(test_user.id, db_session)
        assert score == BASE_SCORE  # No penalty for approved withdrawal

    def test_multiple_unapproved_withdrawals(self, db_session, test_user):
        """Multiple unapproved withdrawals should stack penalties."""
        # Create 3 unapproved withdrawals
        for i in range(3):
            withdrawal = Withdrawal(
                user_id=test_user.id,
                amount=500.0,
                reason_tag='early',
                is_approved=False,
                penalty_applied=EARLY_WITHDRAWAL_PENALTY
            )
            db_session.add(withdrawal)
        db_session.commit()

        score = calculate_score(test_user.id, db_session)
        expected = BASE_SCORE + (3 * EARLY_WITHDRAWAL_PENALTY)
        assert score == expected
        assert score == 50 - 45  # Base - 3 * 15

    def test_apply_withdrawal_penalty_unapproved(self, db_session, test_user):
        """apply_withdrawal_penalty should create record and return new score."""
        new_score = apply_withdrawal_penalty(
            user_id=test_user.id,
            amount=500.0,
            reason_tag='early',
            db_session=db_session
        )

        expected = BASE_SCORE + EARLY_WITHDRAWAL_PENALTY
        assert new_score == expected

        # Verify withdrawal was created
        withdrawals = db_session.query(Withdrawal).filter(
            Withdrawal.user_id == test_user.id
        ).all()
        assert len(withdrawals) == 1
        assert withdrawals[0].is_approved == False

    def test_apply_withdrawal_penalty_approved(self, db_session, test_user):
        """apply_withdrawal_penalty with approved tag should have no penalty."""
        new_score = apply_withdrawal_penalty(
            user_id=test_user.id,
            amount=500.0,
            reason_tag='business_approved',
            db_session=db_session
        )

        assert new_score == BASE_SCORE  # No penalty

        # Verify withdrawal was marked as approved
        withdrawals = db_session.query(Withdrawal).filter(
            Withdrawal.user_id == test_user.id
        ).all()
        assert len(withdrawals) == 1
        assert withdrawals[0].is_approved == True


# =============================================================================
# Test: Score Bounds
# =============================================================================

class TestScoreBounds:
    """Tests to verify score stays within 0-100 bounds."""

    def test_score_minimum_zero(self, db_session, test_user):
        """Score should never go below 0."""
        # Create many unapproved withdrawals to drive score negative
        for i in range(10):
            withdrawal = Withdrawal(
                user_id=test_user.id,
                amount=500.0,
                reason_tag='early',
                is_approved=False,
                penalty_applied=EARLY_WITHDRAWAL_PENALTY
            )
            db_session.add(withdrawal)
        db_session.commit()

        score = calculate_score(test_user.id, db_session)
        assert score >= 0
        assert score == 0  # Should be clamped to 0

    def test_score_maximum_hundred(self, db_session, test_user):
        """Score should never exceed 100."""
        # Max out contributions and goals
        for i in range(15):  # More than needed for max
            contribution = Contribution(
                user_id=test_user.id,
                amount=100.0,
                is_on_time=True
            )
            db_session.add(contribution)

        for i in range(5):  # More than needed for max
            goal = Goal(
                user_id=test_user.id,
                description=f'Test goal {i}',
                target_amount=1000.0,
                is_completed=True,
                completed_at=datetime.utcnow()
            )
            db_session.add(goal)
        db_session.commit()

        score = calculate_score(test_user.id, db_session)
        assert score <= 100
        # Base (50) + contribution max (20) + goal max (30) = 100
        assert score == 100

    def test_score_with_mixed_factors(self, db_session, test_user):
        """Score with mixed positive and negative factors should be bounded."""
        # Add max contributions
        for i in range(10):
            contribution = Contribution(
                user_id=test_user.id,
                amount=100.0,
                is_on_time=True
            )
            db_session.add(contribution)

        # Add max goals
        for i in range(3):
            goal = Goal(
                user_id=test_user.id,
                description=f'Test goal {i}',
                target_amount=1000.0,
                is_completed=True,
                completed_at=datetime.utcnow()
            )
            db_session.add(goal)

        # Add some withdrawals
        for i in range(2):
            withdrawal = Withdrawal(
                user_id=test_user.id,
                amount=500.0,
                reason_tag='early',
                is_approved=False,
                penalty_applied=EARLY_WITHDRAWAL_PENALTY
            )
            db_session.add(withdrawal)
        db_session.commit()

        score = calculate_score(test_user.id, db_session)
        # 50 + 20 + 30 - 30 = 70
        assert score == 70
        assert 0 <= score <= 100


# =============================================================================
# Test: Update Score on Contribution
# =============================================================================

class TestUpdateScoreOnContribution:
    """Tests for update_score_on_contribution function."""

    def test_update_score_adds_bonus(self, db_session, test_user):
        """update_score_on_contribution should reflect new contribution."""
        # Create a contribution first
        contribution = Contribution(
            user_id=test_user.id,
            amount=100.0,
            is_on_time=True
        )
        db_session.add(contribution)
        db_session.commit()

        new_score = update_score_on_contribution(test_user.id, db_session)
        expected = BASE_SCORE + CONTRIBUTION_FREQUENCY_BONUS
        assert new_score == expected

    def test_update_score_respects_cap(self, db_session, test_user):
        """update_score_on_contribution should respect contribution cap."""
        # Create 10 contributions (max bonus)
        for i in range(10):
            contribution = Contribution(
                user_id=test_user.id,
                amount=100.0,
                is_on_time=True
            )
            db_session.add(contribution)
        db_session.commit()

        new_score = update_score_on_contribution(test_user.id, db_session)
        assert new_score == BASE_SCORE + CONTRIBUTION_FREQUENCY_MAX


# =============================================================================
# Test: Score Breakdown
# =============================================================================

class TestScoreBreakdown:
    """Tests for get_score_breakdown function."""

    def test_breakdown_new_user(self, db_session, test_user):
        """Breakdown for new user should show all zeros except base."""
        breakdown = get_score_breakdown(test_user.id, db_session)

        assert breakdown['base_score'] == BASE_SCORE
        assert breakdown['contribution_bonus'] == 0
        assert breakdown['contribution_count'] == 0
        assert breakdown['goal_bonus'] == 0
        assert breakdown['completed_goals'] == 0
        assert breakdown['withdrawal_penalty'] == 0
        assert breakdown['unapproved_withdrawals'] == 0
        assert breakdown['raw_score'] == BASE_SCORE
        assert breakdown['final_score'] == BASE_SCORE

    def test_breakdown_with_all_factors(self, db_session, test_user):
        """Breakdown should accurately reflect all scoring factors."""
        # Add 5 contributions
        for i in range(5):
            contribution = Contribution(
                user_id=test_user.id,
                amount=100.0,
                is_on_time=True
            )
            db_session.add(contribution)

        # Add 2 completed goals
        for i in range(2):
            goal = Goal(
                user_id=test_user.id,
                description=f'Test goal {i}',
                target_amount=1000.0,
                is_completed=True,
                completed_at=datetime.utcnow()
            )
            db_session.add(goal)

        # Add 1 unapproved withdrawal
        withdrawal = Withdrawal(
            user_id=test_user.id,
            amount=500.0,
            reason_tag='early',
            is_approved=False,
            penalty_applied=EARLY_WITHDRAWAL_PENALTY
        )
        db_session.add(withdrawal)
        db_session.commit()

        breakdown = get_score_breakdown(test_user.id, db_session)

        assert breakdown['contribution_count'] == 5
        assert breakdown['contribution_bonus'] == 10  # 5 * 2
        assert breakdown['completed_goals'] == 2
        assert breakdown['goal_bonus'] == 20  # 2 * 10
        assert breakdown['unapproved_withdrawals'] == 1
        assert breakdown['withdrawal_penalty'] == -15
        assert breakdown['raw_score'] == 50 + 10 + 20 - 15  # 65
        assert breakdown['final_score'] == 65


# =============================================================================
# Test: Constants Configuration
# =============================================================================

class TestConstantsConfiguration:
    """Tests verifying scoring constants are properly configured."""

    def test_contribution_bonus_constant(self):
        """Verify contribution frequency bonus constant."""
        assert CONTRIBUTION_FREQUENCY_BONUS == 2

    def test_contribution_max_constant(self):
        """Verify contribution frequency max constant."""
        assert CONTRIBUTION_FREQUENCY_MAX == 20

    def test_goal_bonus_constant(self):
        """Verify goal completion bonus constant."""
        assert GOAL_COMPLETION_BONUS == 10

    def test_goal_max_constant(self):
        """Verify goal completion max constant."""
        assert GOAL_COMPLETION_MAX == 30

    def test_withdrawal_penalty_constant(self):
        """Verify early withdrawal penalty constant."""
        assert EARLY_WITHDRAWAL_PENALTY == -15

    def test_approved_withdrawal_constant(self):
        """Verify business approved withdrawal penalty constant."""
        assert BUSINESS_APPROVED_WITHDRAWAL == 0
