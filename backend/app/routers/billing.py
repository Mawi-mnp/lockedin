"""
Billing Router for Commitment Score Application

This module provides REST API endpoints for Stripe subscription management,
including checkout session creation and webhook handling.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from typing import Optional, Literal
import stripe
import os

from app.database import get_db
from app.models import User
from app.auth import get_current_user
from app.subscription import Subscription, SubscriptionTier, SubscriptionStatus

router = APIRouter(prefix="/billing", tags=["Billing"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# =============================================================================
# Stripe Configuration
# =============================================================================

# Use environment variables for Stripe keys (test mode by default)
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_...")
STRIPE_PRICE_ID_PRO = os.getenv("STRIPE_PRICE_ID_PRO", "price_pro_monthly")
STRIPE_PRICE_ID_TEAM = os.getenv("STRIPE_PRICE_ID_TEAM", "price_team_monthly")

# Configure Stripe
stripe.api_key = STRIPE_SECRET_KEY

# Pricing configuration
PRICING = {
    SubscriptionTier.FREE: {"price": 0, "name": "Free"},
    SubscriptionTier.PRO: {"price": 1200, "name": "Pro", "currency": "usd", "interval": "month"},
    SubscriptionTier.TEAM: {"price": 3900, "name": "Team", "currency": "usd", "interval": "month"},
}

TRIAL_PERIOD_DAYS = 7

# =============================================================================
# Pydantic Schemas
# =============================================================================

class CheckoutSessionRequest(BaseModel):
    """Schema for creating a checkout session."""
    tier: Literal["pro", "team"]
    success_url: str
    cancel_url: str


class CheckoutSessionResponse(BaseModel):
    """Schema for checkout session response."""
    session_id: str
    url: str
    tier: str
    trial_end_date: Optional[datetime]


class SubscriptionResponse(BaseModel):
    """Schema for subscription response."""
    tier: str
    status: str
    trial_end_date: Optional[datetime]
    current_period_end: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class WebhookEvent(BaseModel):
    """Schema for webhook event (for documentation)."""
    type: str
    data: dict


# =============================================================================
# Helper Functions
# =============================================================================

def get_current_user_from_token(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from token."""
    return get_current_user(token, db)


def get_or_create_subscription(db: Session, user: User) -> Subscription:
    """Get existing subscription or create a new free one."""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == user.id
    ).first()
    
    if not subscription:
        # Create Stripe customer
        customer = stripe.Customer.create(
            email=user.email,
            metadata={"user_id": str(user.id)}
        )
        
        subscription = Subscription(
            user_id=user.id,
            stripe_customer_id=customer.id,
            tier=SubscriptionTier.FREE,
            status=SubscriptionStatus.TRIALING
        )
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
    
    return subscription


def calculate_trial_end_date() -> datetime:
    """Calculate trial end date (7 days from now)."""
    return datetime.utcnow() + timedelta(days=TRIAL_PERIOD_DAYS)


# =============================================================================
# Checkout Session Endpoints
# =============================================================================

@router.post("/checkout-session", response_model=CheckoutSessionResponse)
def create_checkout_session(
    session_data: CheckoutSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Create a Stripe checkout session for subscription upgrade.
    
    Args:
        session_data: Checkout session request with tier and URLs
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Checkout session ID and URL
        
    Raises:
        HTTPException: 400 if invalid tier or Stripe error
    """
    try:
        tier = SubscriptionTier(session_data.tier)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid tier. Must be 'pro' or 'team'"
        )
    
    # Get or create subscription
    subscription = get_or_create_subscription(db, current_user)
    
    # Get price ID based on tier
    price_id = STRIPE_PRICE_ID_PRO if tier == SubscriptionTier.PRO else STRIPE_PRICE_ID_TEAM
    
    # Calculate trial end date
    trial_end = calculate_trial_end_date()
    
    try:
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=subscription.stripe_customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
                "quantity": 1,
            }],
            mode="subscription",
            success_url=session_data.success_url,
            cancel_url=session_data.cancel_url,
            subscription_data={
                "trial_period_days": TRIAL_PERIOD_DAYS,
                "metadata": {
                    "user_id": str(current_user.id),
                    "tier": tier.value
                }
            },
            metadata={
                "user_id": str(current_user.id),
                "tier": tier.value
            }
        )
        
        # Update subscription with pending tier
        subscription.tier = tier
        subscription.status = SubscriptionStatus.TRIALING
        subscription.trial_end_date = trial_end
        db.commit()
        
        return CheckoutSessionResponse(
            session_id=checkout_session.id,
            url=checkout_session.url,
            tier=tier.value,
            trial_end_date=trial_end
        )
        
    except stripe.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )


@router.get("/subscription", response_model=SubscriptionResponse)
def get_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get current user's subscription details.
    
    Args:
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Subscription details
    """
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).first()
    
    if not subscription:
        # Create a free subscription
        subscription = get_or_create_subscription(db, current_user)
    
    return SubscriptionResponse(
        tier=subscription.tier.value,
        status=subscription.status.value,
        trial_end_date=subscription.trial_end_date,
        current_period_end=subscription.current_period_end,
        created_at=subscription.created_at
    )


@router.post("/cancel")
def cancel_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Cancel current user's subscription.
    
    Args:
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Cancellation confirmation
        
    Raises:
        HTTPException: 400 if no active subscription or Stripe error
    """
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).first()
    
    if not subscription or subscription.tier == SubscriptionTier.FREE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription to cancel"
        )
    
    try:
        # Cancel Stripe subscription if it exists
        if subscription.stripe_subscription_id:
            stripe.Subscription.delete(subscription.stripe_subscription_id)
        
        # Update local subscription
        subscription.status = SubscriptionStatus.CANCELLED
        subscription.cancelled_at = datetime.utcnow()
        # Keep access until end of billing period
        db.commit()
        
        return {"message": "Subscription cancelled successfully", 
                "access_until": subscription.current_period_end}
        
    except stripe.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )


# =============================================================================
# Webhook Handler
# =============================================================================

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Stripe webhook events.
    
    This endpoint receives events from Stripe about subscription lifecycle:
    - checkout.session.completed: Payment completed
    - customer.subscription.updated: Subscription updated
    - customer.subscription.deleted: Subscription cancelled
    - invoice.payment_succeeded: Payment successful
    - invoice.payment_failed: Payment failed
    
    Args:
        request: FastAPI request with raw body
        db: Database session
        
    Returns:
        Webhook acknowledgment
        
    Raises:
        HTTPException: 400 if signature verification fails or invalid event
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    # Verify webhook signature in production
    if STRIPE_WEBHOOK_SECRET and sig_header:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payload"
            )
        except stripe.error.SignatureVerificationError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid signature"
            )
    else:
        # For local testing without webhook secret
        event = payload.decode("utf-8")
        import json
        event = json.loads(event)
    
    event_type = event.get("type")
    event_data = event.get("data", {}).get("object", {})
    
    # Handle different event types
    if event_type == "checkout.session.completed":
        await handle_checkout_completed(event_data, db)
    
    elif event_type == "customer.subscription.updated":
        await handle_subscription_updated(event_data, db)
    
    elif event_type == "customer.subscription.deleted":
        await handle_subscription_deleted(event_data, db)
    
    elif event_type == "invoice.payment_succeeded":
        await handle_payment_succeeded(event_data, db)
    
    elif event_type == "invoice.payment_failed":
        await handle_payment_failed(event_data, db)
    
    else:
        # Unhandled event type
        return {"status": "ignored", "event_type": event_type}
    
    return {"status": "success", "event_type": event_type}


async def handle_checkout_completed(session_data: dict, db: Session):
    """Handle checkout.session.completed event."""
    user_id = int(session_data.get("metadata", {}).get("user_id"))
    tier_value = session_data.get("metadata", {}).get("tier", "pro")
    subscription_id = session_data.get("subscription")
    
    if not user_id:
        return
    
    subscription = db.query(Subscription).filter(
        Subscription.user_id == user_id
    ).first()
    
    if subscription:
        subscription.stripe_subscription_id = subscription_id
        subscription.tier = SubscriptionTier(tier_value)
        subscription.status = SubscriptionStatus.TRIALING
        subscription.trial_end_date = calculate_trial_end_date()
        db.commit()


async def handle_subscription_updated(subscription_data: dict, db: Session):
    """Handle customer.subscription.updated event."""
    stripe_sub_id = subscription_data.get("id")
    status_value = subscription_data.get("status")
    tier_value = subscription_data.get("metadata", {}).get("tier", "pro")
    
    # Map Stripe status to our status
    status_map = {
        "trialing": SubscriptionStatus.TRIALING,
        "active": SubscriptionStatus.ACTIVE,
        "past_due": SubscriptionStatus.ACTIVE,
        "unpaid": SubscriptionStatus.ACTIVE,
        "canceled": SubscriptionStatus.CANCELLED,
        "incomplete_expired": SubscriptionStatus.EXPIRED,
    }
    
    subscription_status = status_map.get(status_value, SubscriptionStatus.ACTIVE)
    
    subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == stripe_sub_id
    ).first()
    
    if subscription:
        subscription.status = subscription_status
        subscription.tier = SubscriptionTier(tier_value)
        
        # Update period dates
        current_period_start = subscription_data.get("current_period_start")
        current_period_end = subscription_data.get("current_period_end")
        
        if current_period_start:
            subscription.current_period_start = datetime.fromtimestamp(current_period_start)
        if current_period_end:
            subscription.current_period_end = datetime.fromtimestamp(current_period_end)
        
        # Update trial end date
        trial_end = subscription_data.get("trial_end")
        if trial_end:
            subscription.trial_end_date = datetime.fromtimestamp(trial_end)
        
        db.commit()


async def handle_subscription_deleted(subscription_data: dict, db: Session):
    """Handle customer.subscription.deleted event."""
    stripe_sub_id = subscription_data.get("id")
    
    subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == stripe_sub_id
    ).first()
    
    if subscription:
        subscription.status = SubscriptionStatus.CANCELLED
        subscription.cancelled_at = datetime.utcnow()
        # Downgrade to free tier
        subscription.tier = SubscriptionTier.FREE
        db.commit()


async def handle_payment_succeeded(invoice_data: dict, db: Session):
    """Handle invoice.payment_succeeded event."""
    subscription_id = invoice_data.get("subscription")
    
    subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription_id
    ).first()
    
    if subscription and subscription.status == SubscriptionStatus.TRIALING:
        # Trial ended, subscription is now active
        subscription.status = SubscriptionStatus.ACTIVE
        db.commit()


async def handle_payment_failed(invoice_data: dict, db: Session):
    """Handle invoice.payment_failed event."""
    subscription_id = invoice_data.get("subscription")
    
    subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription_id
    ).first()
    
    if subscription:
        # Keep as active but could add dunning logic here
        # For now, just log the failed payment
        pass


# =============================================================================
# Portal Session (for managing subscriptions)
# =============================================================================

@router.post("/portal-session")
def create_portal_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Create a Stripe billing portal session for subscription management.
    
    Allows users to manage their subscription, update payment method,
    download invoices, etc.
    
    Args:
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Portal session URL
        
    Raises:
        HTTPException: 400 if no subscription or Stripe error
    """
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).first()
    
    if not subscription or not subscription.stripe_customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No subscription found"
        )
    
    try:
        portal_session = stripe.billing_portal.Session.create(
            customer=subscription.stripe_customer_id,
            return_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard"
        )
        
        return {"url": portal_session.url}
        
    except stripe.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
