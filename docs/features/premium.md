# Premium Experience

## Purpose
- Outline monetization features, premium-only benefits, and upgrade flows.

## Primary User Goals
- Understand the value proposition and compare tiers.
- Initiate upgrade, manage billing, or explore premium previews.

## Core Flows
1. Launch premium page from navigation CTA.
2. Scan feature grid, testimonials, or pricing.
3. Start upgrade (redirect to payment provider) or return to free tier.

## Key States & Edge Cases
- Differentiating access for existing premium members.
- Handling payment errors, cancellations, or expired status.
- Mobile-friendly presentation of pricing and benefits.

## Metrics
- Upgrade conversion rate.
- Trial-to-paid activation.
- Churn and downgrades.

## Backend Alignment
- **Tables**: `marketplace_items`, `marketplace_inventory`, `marketplace_transactions`, `point_transactions`, and premium flags on `profiles`.
- **Edge Functions**: Implement `create-payment` (Stripe Checkout) plus webhook handler to persist entitlements, award bonuses, and update `profiles.is_premium`.
- **RPCs**: Expose `commerce.spend_points()` and `commerce.grant_premium(user_id, tier)` to coordinate marketplace items and subscription state transitions.
- **Open Tasks**: Add transactional tests covering double-spend prevention, ensure RLS restricts premium-only items, and queue post-payment notifications through `notification_events`.
