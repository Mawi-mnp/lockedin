"""
Feature Gating Middleware for Commitment Score Application

This module provides dependency functions and middleware for checking
subscription status before allowing access to premium features.
"""

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from functools import wraps
from typing import List, Optional, Callable

from app.database import get_db
from app.models import User
from app.auth import get_current_user
from app.subscription import Subscription, SubscriptionTier, SubscriptionStatus


# =============================================================================
# Feature Definitions
# =============================================================================

class FeatureAccess:
    """
    Defines which features are available at each subscription tier.
    """
    
    # Free tier features
    FREE_FEATURES = {
        "basic_goals",           # Create basic goals
        "basic_contributions",   # Make basic contributions
        "view_own_profile",      # View own profile
        "commitment_score_basic" # Basic commitment score
    }
    
    # Pro tier features (includes all Free features)
    PRO_FEATURES = {
        "advanced_analytics",    # Advanced analytics dashboard
        "custom_goals",          # Custom goal templates
        "priority_support",      # Priority customer support
        "api_access",           # API access
        "export_data",          # Export data
        "commitment_score_pro"  # Pro commitment score with insights
    }
    
    # Team tier features (includes all Free + Pro features)
    TEAM_FEATURES = {
        "team_collaboration",    # Team collaboration features
        "cofounder_requests",    # Co-founder matching
        "team_analytics",        # Team analytics
        "admin_dashboard",       # Admin dashboard
        "white_label",          # White-label options
        "dedicated_support"     # Dedicated support
    }
    
    @classmethod
    def get_features_for_tier(cls, tier: SubscriptionTier) -> set:
        """Get all features available for a subscription tier."""
        features = cls.FREE_FEATURES.copy()
        
        if tier in [SubscriptionTier.PRO, SubscriptionTier.TEAM]:
            features.update(cls.PRO_FEATURES)
        
        if tier == SubscriptionTier.TEAM:
            features.update(cls.TEAM_FEATURES)
        
        return features
    
    @classmethod
    def is_feature_available(cls, tier: SubscriptionTier, feature: str) -> bool:
        """Check if a feature is available for a subscription tier."""
        return feature in cls.get_features_for_tier(tier)


# =============================================================================
# Subscription Check Dependencies
# =============================================================================

def get_user_subscription(
    current_user: User,
    db: Session = Depends(get_db)
) -> Optional[Subscription]:
    """
    Get the current user's subscription.
    
    Args:
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Subscription object or None if not found
    """
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).first()
    
    return subscription


def require_active_subscription(
    current_user: User,
    db: Session = Depends(get_db)
) -> Subscription:
    """
    Dependency to require an active subscription (any paid tier).
    
    Args:
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Active subscription
        
    Raises:
        HTTPException: 403 if no active subscription
    """
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No subscription found. Please upgrade to access this feature."
        )
    
    # Check if subscription is active or in trial
    if subscription.status not in [
        SubscriptionStatus.ACTIVE, 
        SubscriptionStatus.TRIALING
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Subscription is not active. Please renew to access this feature."
        )
    
    # Check if trial has expired
    if subscription.status == SubscriptionStatus.TRIALING:
        from datetime import datetime
        if subscription.trial_end_date and datetime.utcnow() > subscription.trial_end_date:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Trial period has expired. Please subscribe to continue."
            )
    
    return subscription


def require_tier(
    required_tier: SubscriptionTier,
    current_user: User,
    db: Session = Depends(get_db)
) -> Subscription:
    """
    Dependency to require a minimum subscription tier.
    
    Args:
        required_tier: Minimum required tier
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Subscription meeting tier requirement
        
    Raises:
        HTTPException: 403 if subscription tier is insufficient
    """
    subscription = require_active_subscription(current_user, db)
    
    # Define tier hierarchy
    tier_hierarchy = {
        SubscriptionTier.FREE: 0,
        SubscriptionTier.PRO: 1,
        SubscriptionTier.TEAM: 2
    }
    
    user_tier_level = tier_hierarchy.get(subscription.tier, 0)
    required_tier_level = tier_hierarchy.get(required_tier, 0)
    
    if user_tier_level < required_tier_level:
        tier_names = {
            SubscriptionTier.FREE: "Free",
            SubscriptionTier.PRO: "Pro",
            SubscriptionTier.TEAM: "Team"
        }
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This feature requires {tier_names[required_tier]} tier or higher. "
                   f"Your current tier: {tier_names[subscription.tier]}"
        )
    
    return subscription


def require_feature(
    feature: str,
    current_user: User,
    db: Session = Depends(get_db)
) -> Subscription:
    """
    Dependency to require access to a specific feature.
    
    Args:
        feature: Feature name to check
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Subscription with feature access
        
    Raises:
        HTTPException: 403 if feature is not available
    """
    subscription = require_active_subscription(current_user, db)
    
    if not FeatureAccess.is_feature_available(subscription.tier, feature):
        # Find minimum tier that has this feature
        required_tier = None
        for tier in [SubscriptionTier.PRO, SubscriptionTier.TEAM]:
            if FeatureAccess.is_feature_available(tier, feature):
                required_tier = tier
                break
        
        tier_names = {
            SubscriptionTier.FREE: "Free",
            SubscriptionTier.PRO: "Pro",
            SubscriptionTier.TEAM: "Team"
        }
        
        if required_tier:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires {tier_names[required_tier]} tier. "
                       f"Upgrade to access."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This feature is not available at any tier."
            )
    
    return subscription


# =============================================================================
# Convenience Dependencies
# =============================================================================

def require_pro_tier(
    current_user: User,
    db: Session = Depends(get_db)
) -> Subscription:
    """Require Pro tier or higher."""
    return require_tier(SubscriptionTier.PRO, current_user, db)


def require_team_tier(
    current_user: User,
    db: Session = Depends(get_db)
) -> Subscription:
    """Require Team tier."""
    return require_tier(SubscriptionTier.TEAM, current_user, db)


# =============================================================================
# Feature-Specific Dependencies for Common Premium Actions
# =============================================================================

def require_advanced_analytics(
    current_user: User,
    db: Session = Depends(get_db)
) -> Subscription:
    """Require access to advanced analytics (Pro+)."""
    return require_feature("advanced_analytics", current_user, db)


def require_custom_goals(
    current_user: User,
    db: Session = Depends(get_db)
) -> Subscription:
    """Require access to custom goals (Pro+)."""
    return require_feature("custom_goals", current_user, db)


def require_team_collaboration(
    current_user: User,
    db: Session = Depends(get_db)
) -> Subscription:
    """Require access to team collaboration (Team)."""
    return require_feature("team_collaboration", current_user, db)


def require_cofounder_requests(
    current_user: User,
    db: Session = Depends(get_db)
) -> Subscription:
    """Require access to co-founder requests (Team)."""
    return require_feature("cofounder_requests", current_user, db)


def require_export_data(
    current_user: User,
    db: Session = Depends(get_db)
) -> Subscription:
    """Require access to data export (Pro+)."""
    return require_feature("export_data", current_user, db)


def require_api_access(
    current_user: User,
    db: Session = Depends(get_db)
) -> Subscription:
    """Require API access (Pro+)."""
    return require_feature("api_access", current_user, db)


# =============================================================================
# Subscription Status Check (Non-Blocking)
# =============================================================================

def get_subscription_status(
    current_user: User,
    db: Session = Depends(get_db)
) -> dict:
    """
    Get subscription status without blocking access.
    
    Useful for endpoints that want to show subscription info
    but work for all users.
    
    Args:
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Dictionary with subscription status and available features
    """
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).first()
    
    if not subscription:
        return {
            "tier": "free",
            "status": "none",
            "features": list(FeatureAccess.FREE_FEATURES),
            "trial_end_date": None
        }
    
    return {
        "tier": subscription.tier.value,
        "status": subscription.status.value,
        "features": list(FeatureAccess.get_features_for_tier(subscription.tier)),
        "trial_end_date": subscription.trial_end_date,
        "current_period_end": subscription.current_period_end
    }
