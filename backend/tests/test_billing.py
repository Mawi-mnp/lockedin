"""
Tests for Stripe Subscription Backend

Run with: pytest tests/test_billing.py -v
"""

import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock
from fastapi import status
from fastapi.testclient import TestClient

from app.main import app
from app.database import get_db, SessionLocal, engine
from app.models import User, Base
from app.subscription import Subscription, SubscriptionTier, SubscriptionStatus
from app.auth import hash_password

# Create test database
Base.metadata.create_all(bind=engine)

client = TestClient(app)


@pytest.fixture(autouse=True)
def override_get_db():
    """Override database dependency for testing."""
    def get_test_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = get_test_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def test_user():
    """Create a test user."""
    db = SessionLocal()
    
    # Clean up existing test data
    db.query(Subscription).filter(Subscription.user_id == 999).delete()
    db.query(User).filter(User.id == 999).delete()
    db.commit()
    
    user = User(
        id=999,
        username="testuser",
        email="test@example.com",
        hashed_password=hash_password("testpass123")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    yield user
    
    # Cleanup
    db.query(Subscription).filter(Subscription.user_id == 999).delete()
    db.query(User).filter(User.id == 999).delete()
    db.commit()
    db.close()


@pytest.fixture
def auth_token(test_user):
    """Get auth token for test user."""
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "testpass123"}
    )
    return response.json()["access_token"]


class TestSubscriptionModel:
    """Test Subscription model."""
    
    def test_subscription_tier_enum(self):
        """Test SubscriptionTier enum values."""
        assert SubscriptionTier.FREE.value == "free"
        assert SubscriptionTier.PRO.value == "pro"
        assert SubscriptionTier.TEAM.value == "team"
    
    def test_subscription_status_enum(self):
        """Test SubscriptionStatus enum values."""
        assert SubscriptionStatus.TRIALING.value == "trialing"
        assert SubscriptionStatus.ACTIVE.value == "active"
        assert SubscriptionStatus.CANCELLED.value == "cancelled"
        assert SubscriptionStatus.EXPIRED.value == "expired"
    
    def test_create_subscription(self, test_user):
        """Test creating a subscription."""
        db = SessionLocal()
        
        subscription = Subscription(
            user_id=test_user.id,
            stripe_customer_id="cus_test123",
            tier=SubscriptionTier.PRO,
            status=SubscriptionStatus.TRIALING,
            trial_end_date=datetime.utcnow() + timedelta(days=7)
        )
        
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        
        assert subscription.id is not None
        assert subscription.tier == SubscriptionTier.PRO
        assert subscription.status == SubscriptionStatus.TRIALING
        
        # Cleanup
        db.delete(subscription)
        db.commit()
        db.close()


class TestFeatureAccess:
    """Test feature gating logic."""
    
    def test_free_tier_features(self):
        """Test free tier has basic features."""
        from app.middleware.auth import FeatureAccess
        
        features = FeatureAccess.get_features_for_tier(SubscriptionTier.FREE)
        
        assert "basic_goals" in features
        assert "advanced_analytics" not in features
        assert "team_collaboration" not in features
    
    def test_pro_tier_features(self):
        """Test pro tier includes free features plus pro features."""
        from app.middleware.auth import FeatureAccess
        
        features = FeatureAccess.get_features_for_tier(SubscriptionTier.PRO)
        
        assert "basic_goals" in features  # From free
        assert "advanced_analytics" in features  # From pro
        assert "export_data" in features  # From pro
        assert "team_collaboration" not in features  # Team only
    
    def test_team_tier_features(self):
        """Test team tier includes all features."""
        from app.middleware.auth import FeatureAccess
        
        features = FeatureAccess.get_features_for_tier(SubscriptionTier.TEAM)
        
        assert "basic_goals" in features  # From free
        assert "advanced_analytics" in features  # From pro
        assert "team_collaboration" in features  # From team
        assert "cofounder_requests" in features  # From team
    
    def test_is_feature_available(self):
        """Test feature availability check."""
        from app.middleware.auth import FeatureAccess
        
        assert FeatureAccess.is_feature_available(SubscriptionTier.FREE, "basic_goals")
        assert not FeatureAccess.is_feature_available(SubscriptionTier.FREE, "advanced_analytics")
        assert FeatureAccess.is_feature_available(SubscriptionTier.PRO, "advanced_analytics")
        assert FeatureAccess.is_feature_available(SubscriptionTier.TEAM, "team_collaboration")


class TestBillingEndpoints:
    """Test billing API endpoints."""
    
    @patch('stripe.Customer.create')
    def test_get_subscription_creates_free(self, mock_customer, auth_token):
        """Test getting subscription creates free tier if none exists."""
        # Mock Stripe customer creation
        mock_customer.return_value = Mock(id="cus_test123")
        
        response = client.get(
            "/api/billing/subscription",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["tier"] == "free"
        assert data["status"] == "trialing"
    
    @patch('stripe.Customer.create')
    def test_get_subscription_authenticated(self, mock_customer, auth_token):
        """Test getting subscription with auth token."""
        # Mock Stripe customer creation
        mock_customer.return_value = Mock(id="cus_test123")
        
        # First call creates subscription
        client.get(
            "/api/billing/subscription",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # Second call retrieves it
        response = client.get(
            "/api/billing/subscription",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_checkout_session_invalid_tier(self, auth_token):
        """Test checkout session with invalid tier."""
        response = client.post(
            "/api/billing/checkout-session",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "tier": "invalid",
                "success_url": "http://localhost:3000/success",
                "cancel_url": "http://localhost:3000/cancel"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    @patch('stripe.Customer.create')
    def test_cancel_no_subscription(self, mock_customer, auth_token):
        """Test canceling when no active subscription exists."""
        # Mock Stripe customer creation for initial subscription
        mock_customer.return_value = Mock(id="cus_test123")
        
        # Create free subscription first
        client.get(
            "/api/billing/subscription",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        response = client.post(
            "/api/billing/cancel",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # Should fail because user only has free tier
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestWebhookHandlers:
    """Test webhook event handlers."""
    
    @patch('stripe.Webhook.construct_event')
    def test_webhook_checkout_completed(self, mock_construct, auth_token):
        """Test checkout.session.completed webhook."""
        # Create subscription first
        client.get(
            "/api/billing/subscription",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # Mock webhook event
        mock_construct.return_value = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "metadata": {"user_id": "999", "tier": "pro"},
                    "subscription": "sub_test123"
                }
            }
        }
        
        response = client.post(
            "/api/billing/webhook",
            json={
                "type": "checkout.session.completed",
                "data": {
                    "object": {
                        "metadata": {"user_id": "999", "tier": "pro"},
                        "subscription": "sub_test123"
                    }
                }
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_webhook_subscription_updated(self, auth_token):
        """Test customer.subscription.updated webhook."""
        response = client.post(
            "/api/billing/webhook",
            json={
                "type": "customer.subscription.updated",
                "data": {
                    "object": {
                        "id": "sub_test123",
                        "status": "active",
                        "metadata": {"tier": "pro"},
                        "current_period_start": int(datetime.utcnow().timestamp()),
                        "current_period_end": int((datetime.utcnow() + timedelta(days=30)).timestamp())
                    }
                }
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_webhook_subscription_deleted(self, auth_token):
        """Test customer.subscription.deleted webhook."""
        response = client.post(
            "/api/billing/webhook",
            json={
                "type": "customer.subscription.deleted",
                "data": {
                    "object": {
                        "id": "sub_test123"
                    }
                }
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_webhook_unhandled_event(self, auth_token):
        """Test unhandled webhook event."""
        response = client.post(
            "/api/billing/webhook",
            json={
                "type": "unknown.event",
                "data": {"object": {}}
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["status"] == "ignored"


class TestTrialPeriod:
    """Test trial period logic."""
    
    def test_trial_end_date_calculation(self):
        """Test trial end date is 7 days from now."""
        from app.routers.billing import calculate_trial_end_date, TRIAL_PERIOD_DAYS
        
        trial_end = calculate_trial_end_date()
        expected_end = datetime.utcnow() + timedelta(days=TRIAL_PERIOD_DAYS)
        
        # Allow 1 second difference
        assert abs((trial_end - expected_end).total_seconds()) < 1
    
    def test_trial_period_days_constant(self):
        """Test TRIAL_PERIOD_DAYS is 7."""
        from app.routers.billing import TRIAL_PERIOD_DAYS
        assert TRIAL_PERIOD_DAYS == 7


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
