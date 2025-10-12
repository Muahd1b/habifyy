# Community Hub

## Purpose
- Encourage social accountability and gamified motivation through friends, competitions, marketplace, and achievements.

## Primary User Goals
- Connect with other users, track community activity, and manage friendships.
- Join or create competitions to compete on habit performance.
- Spend earned points in the marketplace and view achievement progress.

## Core Sub-Features
1. **Friends** – search, request, leaderboard, messaging entry points.
2. **Competitions** – browse active/upcoming events, join, and track status.
3. **Marketplace** – filter, sort, and purchase rewards with points.
4. **Achievements** – browse earned vs available badges with progress.

## Key States & Edge Cases
- Empty states for each sub-section (no activity, friends, items, etc.).
- Handling limited points, joining in-progress competitions, or request failures.
- Real-time updates vs polling trade-offs.

## Metrics
- Daily/weekly active community visits.
- Friend request acceptance rate.
- Competition participation and completion.
- Marketplace purchase conversion.

## Backend Alignment
- **Tables**: Migrate from legacy `friends` usage to `friend_requests`, `friendships`, `community_invites`, `competition_rounds`, `competition_scores`, `activity_events`, and `marketplace_transactions`.
- **RPCs**: Ship `community.handle_friend_request(request_id, action)`, `community.join_competition(competition_id)`, and `community.purchase_item(item_id)` to enforce validation, capacity, and transactional point deductions.
- **Realtime**: Broadcast competition leaderboard deltas through `realtime.broadcast_changes` once scoring RPCs are in place; use filtered channels for invites and activity feed.
- **Edge Functions**: Extend `notification-processor` to enqueue social notifications (friend accepted, competition starting) rather than inserting rows directly from the client.
- **Open Tasks**: Backfill new tables from existing data, deprecate direct `.from()` calls in hooks, and add pgTAP tests for reciprocity, blocking, and invite expiry flows.
