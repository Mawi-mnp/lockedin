"""
Database Migration Script for Subscription Tables

This script adds the subscription table to the database.
Run this after setting up your Stripe API keys.

Usage:
    python migrations/add_subscription_table.py
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import inspect
from app.database import engine, Base
from app.models import User, Contribution, Goal, Withdrawal
from app.subscription import Subscription


def add_subscription_table():
    """Add subscription table to the database."""
    # Check if table already exists
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    print(f"Existing tables: {existing_tables}")
    
    if 'subscriptions' in existing_tables:
        print("✓ Subscriptions table already exists")
    else:
        print("Creating subscriptions table...")
        Subscription.__table__.create(engine)
        print("✓ Subscriptions table created")
    
    # Verify the relationship works
    print("\nVerifying model relationships...")
    from sqlalchemy.orm import Session
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        # Check if User has subscription relationship
        user_attrs = dir(User)
        if 'subscription' in user_attrs:
            print("✓ User.subscription relationship configured")
        else:
            print("✗ User.subscription relationship NOT configured")
        
        # Check if Subscription has user relationship
        sub_attrs = dir(Subscription)
        if 'user' in sub_attrs:
            print("✓ Subscription.user relationship configured")
        else:
            print("✗ Subscription.user relationship NOT configured")
            
    finally:
        db.close()
    
    print("\nMigration complete!")


if __name__ == "__main__":
    add_subscription_table()
