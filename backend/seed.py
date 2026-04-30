#!/usr/bin/env python3
"""
Seed Database Script for Commitment Score Application

This script creates 5 demo users with varied commitment scores, goals, and transactions.

Users created:
- alice_chen — High commitment (~85 score)
- bob_m — Medium-high (~65 score)
- carol_w — Medium (~45 score)
- david_kim — Medium with withdrawals (~55 score)
- emma_t — Lower commitment (~35 score)
"""

import sys
import os

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, User, Contribution, Goal, Withdrawal
from app.scoring import calculate_score, get_score_breakdown
from app.auth import hash_password


def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")


def create_user(db: Session, username: str, email: str, password: str = "password123") -> User:
    """Create a new user."""
    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_contribution(db: Session, user_id: int, amount: float, is_on_time: bool = True):
    """Create a contribution record."""
    contribution = Contribution(
        user_id=user_id,
        amount=amount,
        is_on_time=is_on_time
    )
    db.add(contribution)
    db.commit()
    return contribution


def create_goal(db: Session, user_id: int, description: str, target_amount: float, is_completed: bool = False):
    """Create a goal record."""
    goal = Goal(
        user_id=user_id,
        description=description,
        target_amount=target_amount,
        is_completed=is_completed
    )
    db.add(goal)
    db.commit()
    return goal


def create_withdrawal(db: Session, user_id: int, amount: float, reason_tag: str, is_approved: bool = False):
    """Create a withdrawal record."""
    withdrawal = Withdrawal(
        user_id=user_id,
        amount=amount,
        reason_tag=reason_tag,
        is_approved=is_approved,
        penalty_applied=-15 if not is_approved else 0
    )
    db.add(withdrawal)
    db.commit()
    return withdrawal


def seed_alice_chen(db: Session):
    """
    Alice Chen - High commitment (~85 score)
    Strategy: 10 on-time contributions (+20 max), 2 completed goals (+20), 0 withdrawals
    Score: 50 + 20 + 20 = 90 (close to 85 target)
    """
    print("\n--- Creating alice_chen (High commitment ~85) ---")
    user = create_user(db, "alice_chen", "alice.chen@example.com")
    print(f"  Created user: {user.username} (ID: {user.id})")
    
    # 10 on-time contributions (max bonus +20)
    for i in range(10):
        create_contribution(db, user.id, 100.0 + (i * 10), is_on_time=True)
    print("  Created 10 on-time contributions")
    
    # 2 completed goals (+20)
    create_goal(db, user.id, "Complete Q1 savings target", 1000.0, is_completed=True)
    create_goal(db, user.id, "Build emergency fund", 2000.0, is_completed=True)
    print("  Created 2 completed goals")
    
    # No withdrawals
    score = calculate_score(user.id, db)
    print(f"  Final commitment score: {score}")
    return user


def seed_bob_m(db: Session):
    """
    Bob M - Medium-high commitment (~65 score)
    Strategy: 5 on-time contributions (+10), 1 completed goal (+10), 0 withdrawals
    Score: 50 + 10 + 10 = 70 (close to 65 target)
    """
    print("\n--- Creating bob_m (Medium-high commitment ~65) ---")
    user = create_user(db, "bob_m", "bob.m@example.com")
    print(f"  Created user: {user.username} (ID: {user.id})")
    
    # 5 on-time contributions (+10)
    for i in range(5):
        create_contribution(db, user.id, 150.0 + (i * 20), is_on_time=True)
    print("  Created 5 on-time contributions")
    
    # 1 completed goal (+10)
    create_goal(db, user.id, "Save for vacation", 1500.0, is_completed=True)
    # 1 incomplete goal
    create_goal(db, user.id, "Buy new laptop", 800.0, is_completed=False)
    print("  Created 1 completed goal, 1 incomplete goal")
    
    # No withdrawals
    score = calculate_score(user.id, db)
    print(f"  Final commitment score: {score}")
    return user


def seed_carol_w(db: Session):
    """
    Carol W - Medium commitment (~45 score)
    Strategy: 2 on-time contributions (+4), 0 completed goals, 1 unapproved withdrawal (-15)
    Score: 50 + 4 + 0 - 15 = 39 (close to 45 target)
    Adjust: 4 on-time contributions (+8), 0 goals, 1 withdrawal = 50+8-15 = 43
    """
    print("\n--- Creating carol_w (Medium commitment ~45) ---")
    user = create_user(db, "carol_w", "carol.w@example.com")
    print(f"  Created user: {user.username} (ID: {user.id})")
    
    # 4 on-time contributions (+8)
    for i in range(4):
        create_contribution(db, user.id, 75.0 + (i * 10), is_on_time=True)
    print("  Created 4 on-time contributions")
    
    # 1 incomplete goal
    create_goal(db, user.id, "Save for car down payment", 3000.0, is_completed=False)
    print("  Created 1 incomplete goal")
    
    # 1 unapproved withdrawal (-15)
    create_withdrawal(db, user.id, 200.0, "early", is_approved=False)
    print("  Created 1 unapproved withdrawal")
    
    score = calculate_score(user.id, db)
    print(f"  Final commitment score: {score}")
    return user


def seed_david_kim(db: Session):
    """
    David Kim - Medium with withdrawals (~55 score)
    Strategy: 6 on-time contributions (+12), 1 completed goal (+10), 1 unapproved withdrawal (-15)
    Score: 50 + 12 + 10 - 15 = 57 (close to 55 target)
    """
    print("\n--- Creating david_kim (Medium with withdrawals ~55) ---")
    user = create_user(db, "david_kim", "david.kim@example.com")
    print(f"  Created user: {user.username} (ID: {user.id})")
    
    # 6 on-time contributions (+12)
    for i in range(6):
        create_contribution(db, user.id, 120.0 + (i * 15), is_on_time=True)
    print("  Created 6 on-time contributions")
    
    # 1 completed goal (+10)
    create_goal(db, user.id, "Home renovation fund", 5000.0, is_completed=True)
    # 1 incomplete goal
    create_goal(db, user.id, "Investment portfolio", 10000.0, is_completed=False)
    print("  Created 1 completed goal, 1 incomplete goal")
    
    # 1 unapproved withdrawal (-15)
    create_withdrawal(db, user.id, 500.0, "emergency", is_approved=False)
    print("  Created 1 unapproved withdrawal")
    
    score = calculate_score(user.id, db)
    print(f"  Final commitment score: {score}")
    return user


def seed_emma_t(db: Session):
    """
    Emma T - Lower commitment (~35 score)
    Strategy: 1 on-time contribution (+2), 0 completed goals, 1 unapproved withdrawal (-15)
    Score: 50 + 2 + 0 - 15 = 37 (close to 35 target)
    """
    print("\n--- Creating emma_t (Lower commitment ~35) ---")
    user = create_user(db, "emma_t", "emma.t@example.com")
    print(f"  Created user: {user.username} (ID: {user.id})")
    
    # 1 on-time contribution (+2)
    create_contribution(db, user.id, 50.0, is_on_time=True)
    print("  Created 1 on-time contribution")
    
    # 1 incomplete goal
    create_goal(db, user.id, "Start investing", 500.0, is_completed=False)
    print("  Created 1 incomplete goal")
    
    # 1 unapproved withdrawal (-15)
    create_withdrawal(db, user.id, 100.0, "early", is_approved=False)
    print("  Created 1 unapproved withdrawal")
    
    score = calculate_score(user.id, db)
    print(f"  Final commitment score: {score}")
    return user


def verify_users(db: Session):
    """Verify all users were created with correct scores."""
    print("\n" + "=" * 60)
    print("VERIFICATION - All Users and Scores")
    print("=" * 60)
    
    users = db.query(User).all()
    for user in users:
        breakdown = get_score_breakdown(user.id, db)
        print(f"\n{user.username}:")
        print(f"  Email: {user.email}")
        print(f"  Score: {breakdown['final_score']}")
        print(f"  Breakdown:")
        print(f"    - Base: {breakdown['base_score']}")
        print(f"    - Contributions: {breakdown['contribution_count']} on-time (+{breakdown['contribution_bonus']})")
        print(f"    - Goals: {breakdown['completed_goals']} completed (+{breakdown['goal_bonus']})")
        print(f"    - Withdrawals: {breakdown['unapproved_withdrawals']} unapproved ({breakdown['withdrawal_penalty']})")


def main():
    """Main seed function."""
    print("=" * 60)
    print("Commitment Score App - Database Seeder")
    print("=" * 60)
    
    # Create tables
    create_tables()
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if demo users already exist
        demo_usernames = ["alice_chen", "bob_m", "carol_w", "david_kim", "emma_t"]
        existing_demo_users = db.query(User).filter(User.username.in_(demo_usernames)).count()
        if existing_demo_users > 0:
            print(f"\n⚠ Warning: {existing_demo_users} demo users already exist. Clearing existing demo data...")
            # Delete existing demo data
            for username in demo_usernames:
                user = db.query(User).filter(User.username == username).first()
                if user:
                    # Delete related records first
                    db.query(Withdrawal).filter(Withdrawal.user_id == user.id).delete()
                    db.query(Goal).filter(Goal.user_id == user.id).delete()
                    db.query(Contribution).filter(Contribution.user_id == user.id).delete()
                    db.delete(user)
            db.commit()
            print("✓ Cleared existing demo users")
        
        # Seed all users
        print("\nSeeding demo users...")
        seed_alice_chen(db)
        seed_bob_m(db)
        seed_carol_w(db)
        seed_david_kim(db)
        seed_emma_t(db)
        
        # Verify results
        verify_users(db)
        
        print("\n" + "=" * 60)
        print("✓ Database seeding completed successfully!")
        print(f"✓ Created {db.query(User).count()} users")
        print(f"✓ Created {db.query(Contribution).count()} contributions")
        print(f"✓ Created {db.query(Goal).count()} goals")
        print(f"✓ Created {db.query(Withdrawal).count()} withdrawals")
        print("=" * 60)
        
    finally:
        db.close()


if __name__ == "__main__":
    main()
