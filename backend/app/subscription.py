"""
Subscription Model for Commitment Score Application

This module defines the SQLAlchemy ORM model for tracking user subscriptions
and Stripe integration.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum

from app.database import Base


class SubscriptionTier(str, Enum):
    """Subscription tier options."""
    FREE = "free"
    PRO = "pro"
    TEAM = "team"


class SubscriptionStatus(str, Enum):
    """Subscription status options."""
    TRIALING = "trialing"
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class Subscription(Base):
    """
    Subscription model tracking user subscription status and Stripe integration.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to User
        stripe_customer_id: Stripe customer ID
        stripe_subscription_id: Stripe subscription ID
        tier: Subscription tier (free/pro/team)
        status: Subscription status (trialing/active/cancelled/expired)
        trial_end_date: End date of free trial (if applicable)
        current_period_start: Start of current billing period
        current_period_end: End of current billing period
        created_at: Timestamp of subscription creation
        updated_at: Timestamp of last update
        cancelled_at: Timestamp of cancellation (if applicable)
    """
    __tablename__ = 'subscriptions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True)
    
    # Stripe identifiers
    stripe_customer_id = Column(String(255), nullable=True, unique=True)
    stripe_subscription_id = Column(String(255), nullable=True, unique=True)
    
    # Subscription details
    tier = Column(SQLEnum(SubscriptionTier), nullable=False, default=SubscriptionTier.FREE)
    status = Column(SQLEnum(SubscriptionStatus), nullable=False, default=SubscriptionStatus.TRIALING)
    
    # Trial and billing periods
    trial_end_date = Column(DateTime, nullable=True)
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    cancelled_at = Column(DateTime, nullable=True)

    # Relationship - back_populates is set in models.py
    user = relationship('User', back_populates='subscription')
