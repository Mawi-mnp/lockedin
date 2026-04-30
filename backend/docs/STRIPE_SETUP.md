# Stripe Subscription Integration Guide

This document explains how to set up and use the Stripe subscription backend for the Commitment Score app.

## Overview

The subscription system provides:
- **Free Tier**: $0/month - Basic features
- **Pro Tier**: $12/month - Advanced features with 7-day free trial
- **Team Tier**: $39/month - All features with 7-day free trial

## Setup Instructions

### 1. Create Stripe Products & Prices

In your Stripe Dashboard (test mode):

1. Go to **Products** → **Add Product**
2. Create two products:

**Pro Plan:**
- Name: `Pro`
- Pricing: $12 USD per month
- Note the Price ID (e.g., `price_123abc...`)

**Team Plan:**
- Name: `Team`
- Pricing: $39 USD per month
- Note the Price ID (e.g., `price_456def...`)

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your Stripe credentials:

```bash
# Stripe API Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_xxx  # Pro tier price ID
STRIPE_PRICE_ID_TEAM=price_yyy  # Team tier price ID

# Frontend URL for portal redirects
FRONTEND_URL=http://localhost:3000
```

### 3. Get Webhook Secret

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. Set endpoint URL: `https://your-domain.com/api/billing/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing Secret** to `STRIPE_WEBHOOK_SECRET`

### 4. Run Database Migration

```bash
cd backend
python migrations/add_subscription_table.py
```

## API Endpoints

### Create Checkout Session
```http
POST /api/billing/checkout-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "tier": "pro",  // or "team"
  "success_url": "http://localhost:3000/success",
  "cancel_url": "http://localhost:3000/cancel"
}
```

Response:
```json
{
  "session_id": "cs_test_...",
  "url": "https://checkout.stripe.com/...",
  "tier": "pro",
  "trial_end_date": "2026-05-07T12:00:00Z"
}
```

### Get Current Subscription
```http
GET /api/billing/subscription
Authorization: Bearer <token>
```

Response:
```json
{
  "tier": "pro",
  "status": "trialing",
  "trial_end_date": "2026-05-07T12:00:00Z",
  "current_period_end": null,
  "created_at": "2026-04-30T12:00:00Z"
}
```

### Cancel Subscription
```http
POST /api/billing/cancel
Authorization: Bearer <token>
```

### Create Portal Session (Manage Subscription)
```http
POST /api/billing/portal-session
Authorization: Bearer <token>
```

Response:
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### Webhook Handler
```http
POST /api/billing/webhook
Content-Type: application/json
Stripe-Signature: t=...,v1=...
```

Handles Stripe events automatically.

## Feature Gating

Use the middleware dependencies to protect premium features:

### In Routers

```python
from app.middleware.auth import require_pro_tier, require_team_tier

@router.get("/analytics")
def get_analytics(
    subscription: Subscription = Depends(require_pro_tier),
    db: Session = Depends(get_db)
):
    # Only Pro and Team users can access
    ...

@router.get("/team-collab")
def get_team_collab(
    subscription: Subscription = Depends(require_team_tier),
    db: Session = Depends(get_db)
):
    # Only Team users can access
    ...
```

### Available Dependencies

- `require_active_subscription` - Any paid tier (trialing or active)
- `require_pro_tier` - Pro or Team tier
- `require_team_tier` - Team tier only
- `require_feature("feature_name")` - Check specific feature access

### Feature Definitions

**Free Tier:**
- `basic_goals`
- `basic_contributions`
- `view_own_profile`
- `commitment_score_basic`

**Pro Tier (+ Free):**
- `advanced_analytics`
- `custom_goals`
- `priority_support`
- `api_access`
- `export_data`
- `commitment_score_pro`

**Team Tier (+ Pro):**
- `team_collaboration`
- `cofounder_requests`
- `team_analytics`
- `admin_dashboard`
- `white_label`
- `dedicated_support`

## Testing

### Test Cards (Stripe Test Mode)

Use these test cards in checkout:

- **Success**: `4242 4242 4242 4242` (any future date, any CVC)
- **Decline**: `4000 0000 0000 0002`
- **Require 3D Secure**: `4000 0027 6000 3184`

### Test Webhooks Locally

Use Stripe CLI:

```bash
stripe listen --forward-to localhost:8000/api/billing/webhook
```

Then trigger test events:

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

## Subscription Flow

1. User clicks "Upgrade to Pro"
2. Frontend calls `POST /api/billing/checkout-session`
3. User is redirected to Stripe Checkout URL
4. User enters payment details (7-day trial starts)
5. Stripe redirects to success_url
6. Stripe sends `checkout.session.completed` webhook
7. Backend updates subscription status to `trialing`
8. After 7 days, Stripe charges card
9. Stripe sends `invoice.payment_succeeded` webhook
10. Backend updates status to `active`

## Cancellation Flow

1. User clicks "Cancel Subscription" or uses Stripe Portal
2. Stripe sends `customer.subscription.deleted` webhook
3. Backend sets status to `cancelled`
4. User retains access until `current_period_end`
5. After period ends, user downgrades to Free tier

## Troubleshooting

### Common Issues

**"No subscription found"**
- User hasn't created a subscription yet
- Call checkout session endpoint first

**"Trial period has expired"**
- Check `trial_end_date` in database
- User needs to subscribe to continue

**Webhook signature verification failed**
- Ensure `STRIPE_WEBHOOK_SECRET` matches webhook endpoint
- For local testing, comment out signature verification in billing.py

**Stripe error: Invalid price ID**
- Verify `STRIPE_PRICE_ID_PRO` and `STRIPE_PRICE_ID_TEAM` are correct
- Make sure prices are in active status in Stripe

## Security Notes

- Always use environment variables for Stripe keys
- Enable webhook signature verification in production
- Use HTTPS for all endpoints in production
- Store customer IDs securely (already handled by Stripe)
