# Backend Expansion Plan

## 1. Current State Assessment

### 1.1 Community & Social Domain
| Capability | Current Implementation | Gap Summary |
|------------|------------------------|-------------|
| Friend discovery & requests | `friends` table with `status`; `useCommunity.sendFriendRequest` inserts `pending`; no retrieval of incoming requests or acceptance APIs. | No dedicated request workflow, duplicate prevention, or reciprocal friend record creation; lacks blocking and audit trail. |
| Following & social graph | `followers` table queried in `useProfile`; counts computed per request. | Duplicate joins per follower to hydrate profile data; no denormalized counts, no follow suggestions, and limited privacy controls. |
| Community membership & hierarchy | `communities` + `community_members` tables exist but hooks never query them. | No roles/permissions, no membership metadata, no aggregation of member stats. |
| Competitions lifecycle | `competitions` + `competition_participants`; `useCommunity.joinCompetition` inserts participation with static score. | No stages, scoring rules, leaderboards, scheduling, or validation of capacity; no participant stats or rewards history. |
| Marketplace & rewards | `marketplace_items`, `user_purchases`, `point_transactions`; `useCommunity.purchaseItem` decrements profile points client-side. | Lacks inventory, fulfillment status, or transactional safety; no item bundles, expirations, or audit logging. |
| Achievements | `achievements`, `user_achievements`; fetched in `useCommunity`. | No progress tracking, tiered achievements, or automated awarding; requirement metadata free-form. |
| Activity feed | `activity_feed` fetched with public filter in `useCommunity`. | No trigger-based population, personalization, pagination, or privacy beyond `is_public`; payload structure untyped. |
| Direct messaging | `messages` table scaffolded; unused in hooks/UI. | Absent service layer, delivery receipts, or moderation controls. |
| Community metrics | None beyond `member_count` on `communities`. | Missing aggregated KPIs (active members, streak leaders, marketplace revenue) for UI and reporting. |

### 1.2 Notifications Domain
| Capability | Current Implementation | Gap Summary |
|------------|------------------------|-------------|
| In-app notifications | `notifications` table; `useNotifications` handles CRUD and realtime inserts. | Single-channel model; no linkage to source events, batching, or per-device delivery tracking. |
| Notification preferences | `notification_preferences` table plus `useNotificationPreferences`. | Only coarse booleans; quiet hours/timezone fields unused; lacks channel overrides and rate limits. |
| Templates & content | `notification_templates` table exists but is not referenced in code. | No templating engine or merge variables; duplication risk for copy. |
| Processing | Edge function `notification-processor` creates ad-hoc notifications. | No event queue, scheduling, retries, or backoff; relies on synchronous service role key operations. |
| Delivery status | `notifications.is_delivered` boolean; `is_archived` recently added. | No delivery audit, per-channel status, or read receipt history; inability to track email/push responses. |
| External channels | None integrated. | Email/push pathways absent; no provider config, webhooks, or fallbacks. |

### 1.3 Profile & Metrics Domain
| Capability | Current Implementation | Gap Summary |
|------------|------------------------|-------------|
| Core profile | `profiles` table auto-created via trigger; `useProfile.fetchProfile`. | Limited enrichment (no streak snapshots, last active, or social stats); privacy flags only booleans. |
| Social stats | `followers` table counted on demand in `useProfile.fetchStats`. | Expensive counts per load; no cached totals, trending metrics, or badges. |
| Streaks & records | `useHabits.calculateStreak` per habit; `useProfile` TODO for streaks; `user_records` table exists. | Streak history not persisted; profile streaks always zero; records lack categories/validation. |
| Points ledger | `point_transactions` + `usePoints`. | No balance reconciliation or earning rules; manual level calc in hook; no scheduled summaries. |
| Location & presence | `user_locations` table with RLS; not surfaced in hooks/UI. | No consent flow, geospatial indexing, or community tie-in. |
| Achievement progress | `user_achievements` records only completed badges. | No partial progress or timestamps for progression; cannot surface near-complete achievements. |

### 1.4 Shared Observations
- Data model lacks foreign key cascades and views for consolidated stats, leading to verbose client fetches.
- Hooks rely on per-call Supabase queries without caching, pagination, or optimistic responses beyond basic toast messaging.
- RLS policies were recently tightened; new features must respect privacy defaults and public sharing toggles.

## 2. Unified Data Model Design

### 2.1 Community Extensions
- **friend_requests** (new): `id`, `requester_id`, `recipient_id`, `status` (`pending|accepted|declined|blocked`), `message`, `responded_at`, timestamps. Drives invitation workflow; single unique constraint on requester/recipient pairs.
- **friendships** (new) or augment existing `friends`: migrate accepted relationships into symmetric rows (`user_id`, `friend_id`, `created_at`, `source_request_id`). Enables efficient mutual lookups and blocking.
- **community_members** (augment): add `role` enum (`member|moderator|admin|founder`), `joined_via` (`invite|discovery|competition`), `last_active_at`, `streak_snapshot`, `contribution_score`.
- **community_invites** (new): track invites sent by admins including expiry and accepted flag.
- **community_metrics_daily** (new materialized view): aggregates members, active posts, competition entries, marketplace spend per community (`community_id`, `metric_date`, metrics...). Supports dashboards.
- **competition_rounds** (new): phases of competitions with `scoring_rule`, `weight`, schedule.
- **competition_scores** (new): per participant per round metrics (`participant_id`, `round_id`, `score`, `rank_snapshot`, `submitted_at`).
- **competition_rewards** (new): define prize disbursements (points, items) for placements with fulfillment status.
- **marketplace_inventory** (new): `item_id`, `quantity`, `restock_at`, `is_limited`, `sku`.
- **marketplace_transactions** (replace/extend `user_purchases`): track purchase lifecycle (`status`, `fulfillment_payload`, `awarded_points`, `revoked_at`) with references to `point_transactions`.
- **achievement_progress** (new): `user_id`, `achievement_id`, `current_value`, `last_increment_at`, computed progress percent; triggers on relevant events.
- **activity_events** (new): normalized event store with `entity_type`, `entity_id`, `verb`, `metadata`, `visibility`. `activity_feed` becomes view materializing user-specific feed slices.

### 2.2 Notification Extensions
- **notification_events** (new): canonical record of business events (`id`, `event_type`, `actor_id`, `subject_id`, `context`, `triggered_at`).
- **notification_queue** (new): queue entries with `event_id`, `channel` (`in_app|email|push`), `scheduled_for`, `status`, `attempts`, `last_attempt_at`, `payload`.
- **notification_deliveries** (new): stores provider response per attempt (`queue_id`, `provider`, `status`, `response_payload`, `delivered_at`, `error_code`).
- **notification_channels** (new): user-level channel endpoints (`user_id`, `channel`, `address`, `verified`, `last_used_at`).
- **notification_preferences** (augment): replace booleans with JSONB `channel_settings`, add `digest_frequency`, `rate_limit_per_hour`, `quiet_hours_start/end` enforced.
- **notifications** (augment): add `event_id`, `channel`, `delivered_via`, `read_at`, `archived_at`, `expires_at` default; maintain foreign key to queue for traceability.
- **notification_templates** (augment): add `channel`, `locale`, `version`, `subject_template`, `body_template`, `metadata_schema`.

### 2.3 Profile & Metrics Extensions
- **profile_stats_daily** (new materialized view): per user snapshot of streaks, completions, followers, competition entries, marketplace spending.
- **streak_history** (new table): `user_id`, `habit_id`, `streak_start`, `streak_end`, `max_length`, `last_event_at`, enabling retrospectives.
- **profile_records** (augment `user_records`): add `visibility`, `category` enum, `context_json`, `is_personal_best`, indexes for leaderboard queries.
- **profile_badges** (new view) combining `user_achievements`, `achievement_progress`, `competition_rewards`.
- **profiles** (augment): add `current_streak`, `longest_streak`, `last_active_at`, `followers_count`, `following_count`, `community_rank`, `privacy_settings` JSON for granular controls.
- **point_balances** (new view): ensures `profiles.points` matches sum of `point_transactions`; used for auditing.
- **user_locations** (augment): add `region_code`, `country_code`, `last_shared_at`, partial index on `is_visible=true`.

### 2.4 ERD & Dependency Notes
- `friend_requests` ➜ `friendships` (accepted requests create/refresh friendships; deletions cascade).
- `community_members` ties `users` to `communities`; metrics view depends on `community_members`, `activity_events`, `marketplace_transactions`, `competition_participants`.
- `notification_events` consumed by trigger functions to enqueue rows in `notification_queue`; successful delivery inserts into `notification_deliveries` and updates `notifications`.
- `achievement_progress` listens to `habit_completions`, `competition_scores`, `friendships` via triggers, emitting `activity_events`.
- Materialized views (`community_metrics_daily`, `profile_stats_daily`, `point_balances`) refreshed via scheduled edge functions or cron jobs to keep derived statistics in sync.

## 3. Database Migration Plan
- Sequence migrations: (1) create new enums/types, (2) introduce new tables with RLS disabled, (3) backfill data from existing tables (`friends` ➜ `friendships`), (4) add foreign keys and constraints, (5) enable RLS with policies per table, (6) augment existing tables with new columns defaulted and backfilled, (7) add views/materialized views, (8) create triggers/functions for derived data.
- For each new table, author RLS policies covering `SELECT`, `INSERT`, `UPDATE`, and `DELETE`, aligning with privacy requirements (e.g., requesters can view their `friend_requests`, admins manage `community_members` roles).
- Write migration helpers (e.g., stored procedures) to migrate existing pending friendships into the new schema; include `transaction` blocks for rollback safety.
- Seed datasets: demo competitions with rounds and participants, marketplace inventory, baseline achievements with progress rules, notification templates for major event types.
- Provide rollback scripts: drop dependent triggers/views first, remove new columns (with `IF EXISTS` guards), truncate new tables inside `BEGIN...EXCEPTION...END` blocks to revert seeds.
- Document migration order in `/supabase/docs/` (or README snippet) so deployments follow `migrations -> seeds -> views refresh`.

## 4. Service Layer & Hooks
- Introduce Supabase RPCs or Edge Functions for high-level actions (`join_competition`, `leave_competition`, `submit_competition_score`, `resolve_friend_request`, `redeem_marketplace_item`, `issue_notification`, `log_activity_event`), encapsulating multi-table transactions.
- Refactor `useCommunity` to consume new endpoints, manage friend requests workflow, fetch communities with pagination/filters, and hydrate metrics from views.
- Extend `useProfile` to fetch `profile_stats_daily`, `streak_history`, and cached social counts; replace client-side counts with view-backed selects and optimistic updates.
- Revise `useHabits` streak calculation to leverage `streak_history` and denormalized stats; add caching using `range` queries for large completion histories.
- Add `useNotifications` improvements: batched pagination, queue status insights, mutation helpers for read receipts, and channel preferences editing.
- Implement caching strategies (`range`/`limit`, keyset pagination) and optimistic UI updates for purchases, friend approvals, and competition joins; integrate React Query or internal caching if allowed.

## 5. Notification Engine
- Delivery mix: maintain in-app notifications, add email via Resend and push via OneSignal; store provider credentials in Supabase secrets.
- Create triggers or background jobs that transform business events (habit milestones, friend acceptance, competition ending, streak risk) into `notification_events`.
- Edge Function worker polls `notification_queue`, renders templates, dispatches via provider SDKs, and records `notification_deliveries`; failed attempts re-queued with exponential backoff respecting rate limits.
- Expose API/hook to fetch unread counts segmented by channel and batch mark-as-read operations (`mark_queue_item_read`).
- Implement scheduling by populating `scheduled_for` and a cron worker scanning due queue rows.
- Log email/push statuses (delivered, bounced, opened) via provider webhooks, updating `notification_deliveries` and surfacing in UI.

## 6. Profile Metrics Pipeline
- Materialized views (`profile_stats_daily`, `point_balances`) refreshed nightly via Edge Function scheduled on Supabase cron; on-demand refresh triggered after significant events (e.g., achievement unlocked).
- Background job calculates streak rollups, updates `profiles.current_streak/longest_streak`, and records entries in `streak_history`.
- Hooks read from views, falling back to live queries if view stale beyond SLA; add UI indicators when metrics last refreshed.
- Store computation jobs in `task_runs` table (new) for monitoring and retries.

## 7. Community Activity Feed
- Replace direct inserts with server-side triggers capturing habit completions, achievement unlocks, competition joins, friend acceptance, marketplace purchases -> write normalized `activity_events`.
- Generate user-specific feed via SQL view that joins `activity_events` with privacy settings and friendship/community relationships; support filters (friends, local community, competitions).
- Implement pagination (keyset on `created_at`) and caching, with `useCommunity` subscribing to incremental updates.
- Provide moderation controls: flagging capability, soft deletes, audit logging of feed mutations.

## 8. Testing & Quality
- SQL unit tests using Supabase CLI for each function/RPC (friend request resolution, join competition scoring, notification enqueue).
- Integration tests (Playwright/Vitest) hitting Supabase local instance through hooks to validate RLS coverage and optimistic UI flows.
- Load testing scripts (k6 or Supabase load testing harness) focusing on competition joins, notification queue throughput, and marketplace purchases.
- Automate migrations validation in CI: spin up ephemeral Supabase, apply migrations, seed, run tests.

## 9. Security & Governance
- Define RLS for new tables ensuring users access only their records or shared community data; moderators/admins get scoped policies through `auth.jwt()` role claims.
- Add audit logging tables for admin-sensitive actions (marketplace price edits, competition result overrides) with triggers capturing `auth.uid()` and `request_id`.
- Enforce data retention policies: e.g., auto-archive notifications older than 90 days, purge activity events after 12 months unless flagged.
- Document GDPR/CCPA considerations: allow export/delete of profile metrics, notification history, and social graph.

## 10. Deployment & Monitoring
- Rollout sequence: apply migrations ➜ backfill scripts ➜ seed data ➜ deploy Edge Functions/cron jobs ➜ update hooks/services ➜ release UI behind feature flags.
- Configure monitoring: Supabase logs, Sentry (or similar) for function errors, analytics events aligned to PRD metrics (community interactions, notification engagement).
- Use feature flags or Supabase Config to enable new notifications/community features for beta cohort before global rollout; collect feedback via dedicated metrics dashboards.
- Establish alerting for queue backlog, failed notification deliveries, and anomalies in competition joins.

## 11. Documentation & Handover
- Update `/docs/features/*.md` to capture backend architecture, tables, RPC contracts, and data flow diagrams.
- Extend PRD appendices with finalized schema diagrams (ERD) and dependency matrix; embed migration checklist and rollback plan.
- Provide runbooks covering notification resend, manual competition resolution, marketplace refund, and cron job troubleshooting.
- Maintain data dictionary for all new tables/views with ownership, refresh cadence, and retention schedules to support operations.

