# Settings & Preferences

## Purpose
- Allow users to configure account, notification, theme, and premium-related preferences.

## Primary User Goals
- Adjust personal settings from desktop or mobile contexts.
- Manage premium subscription entry points.
- Access support resources and legal documents.
- Tune alert cadence for streak warnings, point bonuses, and level milestones.

## Core Flows
1. Open settings (responsive modal or page).
2. Modify toggles or dropdowns and persist via Supabase or client state.
3. Navigate to premium upsell or account management screens.
4. Review alert previews to confirm how habit, level, and domain impact notifications will appear.

## Key States & Edge Cases
- Differentiating mobile vs desktop settings presentation.
- Handling partially completed submissions or API failures.
- Permissions for premium-only configuration items.
- Respecting quiet hours or muted domains while still surfacing critical streak alerts.

## Metrics
- Settings saves per user.
- Premium upsell conversion from settings.
- Support links or logout usage rates.
- Alert toggle engagement and alert satisfaction scores.

## Backend Alignment
- **Tables**: `notification_preferences`, `notification_channels`, `profiles` (theme/privacy), and `task_runs` (scheduled digests) store streak, point bonus, and level alert options.
- **RPCs**: Provide `settings.update_preferences(user_id, payload)` and `settings.toggle_channel(channel, enabled)` to consolidate validation, quiet-hour logic, and domain impact opt-ins.
- **Edge Functions**: Digest scheduling and notification queue processing will publish updates when preferences change (e.g., rehydrating `notification_queue` entries).
- **Open Tasks**: Add pgTAP tests for preference defaults, implement optimistic UI updates tied to RPC responses, and ensure RLS respects premium-only toggles.
