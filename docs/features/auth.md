# Authentication & Access Control

## Purpose
- Secure user access via Supabase auth, supporting onboarding and ongoing sessions.

## Primary User Goals
- Sign up, sign in, and recover accounts smoothly.
- Persist sessions across devices with minimal friction.

## Core Flows
1. Load auth component when user is not authenticated.
2. Complete email/password sign-in or sign-up sequence.
3. Handle password recovery and email verification (if enabled).
4. Transition to main app upon successful authentication.

## Key States & Edge Cases
- Auth loading vs logged-out vs logged-in gating.
- Error messaging for invalid credentials or network issues.
- Session expiration and refresh token handling.

## Metrics
- Conversion from sign-up to active user.
- Failed vs successful sign-in attempts.
- Recovery flow completion rate.
