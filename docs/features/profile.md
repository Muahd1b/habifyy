# Profile & Social Presence

## Purpose
- Provide each user with a personalized profile, stats overview, and social graph controls.

## Primary User Goals
- View personal progress, streaks, and records.
- Manage followers/following relationships and social links.
- Edit profile details and sign out securely.

## Core Flows
1. Open profile modal from header avatar.
2. Review overview metrics, social tabs, or records.
3. Follow/unfollow other users and manage links.
4. Edit profile information or sign out.

## Key States & Edge Cases
- Viewing another user’s profile vs own (editable vs read-only).
- Missing stats data and onboarding first-time profiles.
- Responsive modal presentation on mobile vs desktop.

## Metrics
- Profile views per active user.
- Follow/follower growth.
- Social link engagement (click-through, if tracked).

## Backend Alignment
- **Tables**: `profiles`, `streak_history`, `followers`, `social_links`, `user_records`, `notification_channels` enable the profile surface; ensure follower counts are updated via triggers when friendships/follows mutate.
- **Views**: Pull summary cards from `profile_stats_daily` and expose RPC `profiles.get_overview(target_user_id, viewer_id)` to enforce privacy and block rules.
- **RPCs**: Centralize follow/unfollow and social link mutations via `profiles.toggle_follow()` and `profiles.upsert_social_link()` to gate premium or privacy conditions.
- **Open Tasks**: Refresh materialized views nightly, wire profile presence updates to `task_runs`, and align mobile/desktop surfaces on truncated data sets (pagination).
