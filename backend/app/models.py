"""
Database Models for Commitment Score Application

This module defines the SQLAlchemy ORM models for tracking user contributions,
goals, and withdrawals.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()


class User(Base):
    """
    User model representing a participant in the commitment score system.
    """
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    contributions = relationship('Contribution', back_populates='user')
    goals = relationship('Goal', back_populates='user')
    withdrawals = relationship('Withdrawal', back_populates='user')


class Contribution(Base):
    """
    Contribution model tracking user contributions to their commitment goals.

    Attributes:
        id: Primary key
        user_id: Foreign key to User
        amount: The contribution amount
        is_on_time: Whether the contribution was made on time (affects scoring)
        created_at: Timestamp of the contribution
    """
    __tablename__ = 'contributions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    amount = Column(Float, nullable=False)
    is_on_time = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship('User', back_populates='contributions')


class Goal(Base):
    """
    Goal model tracking user goals and their completion status.

    Attributes:
        id: Primary key
        user_id: Foreign key to User
        description: Description of the goal
        target_amount: Target amount for the goal
        deadline: Deadline for achieving the goal
        is_completed: Whether the goal has been completed (affects scoring)
        created_at: Timestamp of goal creation
        completed_at: Timestamp of goal completion
    """
    __tablename__ = 'goals'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    description = Column(String(500), nullable=False)
    target_amount = Column(Float, nullable=False)
    deadline = Column(DateTime, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationship
    user = relationship('User', back_populates='goals')


class Withdrawal(Base):
    """
    Withdrawal model tracking user withdrawals and their approval status.

    Attributes:
        id: Primary key
        user_id: Foreign key to User
        amount: The withdrawal amount
        reason_tag: Tag indicating the reason for withdrawal
        is_approved: Whether the withdrawal was business-approved
        penalty_applied: The penalty points applied to the user's score
        created_at: Timestamp of the withdrawal
    """
    __tablename__ = 'withdrawals'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    amount = Column(Float, nullable=False)
    reason_tag = Column(String(100), nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)
    penalty_applied = Column(Integer, default=-15, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship('User', back_populates='withdrawals')
