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

## Backend Alignment
- **Tables & Triggers**: `auth.users` trigger `handle_new_user` seeds `profiles` + `notification_preferences`; ensure trigger remains `SECURITY DEFINER` with `search_path` scoped to `public`.
- **Session APIs**: Wrap sign-in/out and token refresh inside the Supabase JS client; surface pass-through RPCs only when additional auditing is required.
- **Edge Functions**: Use `notification-processor` for welcome nudges and to queue verification reminders once the queue processor lands.
- **Open Tasks**: Add monitoring for trigger failures, document recovery limits, and ensure auth hooks respect updated backend RPC contracts.
