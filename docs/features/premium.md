# Premium Experience

## Purpose
- Outline monetization features, premium-only benefits, and upgrade flows.

## Primary User Goals
- Understand the value proposition and compare tiers.
- Initiate upgrade, manage billing, or explore premium previews.
- Purchase real-money point bundles that accelerate level progression without undermining free earners.

## Core Flows
1. Launch premium page from navigation CTA.
2. Scan feature grid, testimonials, or pricing.
3. Start upgrade (redirect to payment provider) or return to free tier.
4. Buy point bundles or boosters with real-money checkout that immediately reflect in the user’s point ledger and level progress.

## Key States & Edge Cases
- Differentiating access for existing premium members.
- Handling payment errors, cancellations, or expired status.
- Mobile-friendly presentation of pricing and benefits.
- Ensuring point bundle deliveries sync instantly with existing earned balances.

## Metrics
- Upgrade conversion rate.
- Trial-to-paid activation.
- Churn and downgrades.
- Point bundle attach rate and downstream level gains.

## Backend Alignment
- **Tables**: `marketplace_items`, `marketplace_inventory`, `marketplace_transactions`, `point_transactions`, and premium flags on `profiles`.
- **Edge Functions**: Implement `create-payment` (Stripe Checkout) plus webhook handler to persist entitlements, award bonuses, and update `profiles.is_premium`.
- **RPCs**: Expose `commerce.spend_points()` and `commerce.grant_premium(user_id, tier)` to coordinate marketplace items and subscription state transitions.
- **Open Tasks**: Add transactional tests covering double-spend prevention and point bundle fulfillment, ensure RLS restricts premium-only items, and queue post-payment notifications through `notification_events`.
