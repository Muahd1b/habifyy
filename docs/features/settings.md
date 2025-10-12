# Settings & Preferences

## Purpose
- Allow users to configure account, notification, theme, and premium-related preferences.

## Primary User Goals
- Adjust personal settings from desktop or mobile contexts.
- Manage premium subscription entry points.
- Access support resources and legal documents.

## Core Flows
1. Open settings (responsive modal or page).
2. Modify toggles or dropdowns and persist via Supabase or client state.
3. Navigate to premium upsell or account management screens.

## Key States & Edge Cases
- Differentiating mobile vs desktop settings presentation.
- Handling partially completed submissions or API failures.
- Permissions for premium-only configuration items.

## Metrics
- Settings saves per user.
- Premium upsell conversion from settings.
- Support links or logout usage rates.

## Backend Alignment
- **Tables**: `notification_preferences`, `notification_channels`, `profiles` (theme/privacy), and `task_runs` (scheduled digests).
- **RPCs**: Provide `settings.update_preferences(user_id, payload)` and `settings.toggle_channel(channel, enabled)` to consolidate validation and quiet-hour logic.
- **Edge Functions**: Digest scheduling and notification queue processing will publish updates when preferences change (e.g., rehydrating `notification_queue` entries).
- **Open Tasks**: Add pgTAP tests for preference defaults, implement optimistic UI updates tied to RPC responses, and ensure RLS respects premium-only toggles.
