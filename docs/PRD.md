# Habifyy Product Requirements Document (PRD)

**Document Version:** 1.0  
**Prepared by:** Codex Support (with Habifyy engineering inputs)  
**Last Updated:** 2025-02-15

---

## 1. Executive Summary
Habifyy is a habit-building platform focused on blending personal productivity with social motivation. The product enables users to create and track habits, visualize progress, and stay accountable through analytics and community features. This PRD captures the end-to-end scope for achieving a feature-complete web application that is performant on desktop and mobile browsers.

### 1.1 Vision
Empower individuals to build sustainable routines by combining intuitive tracking, actionable insights, and a supportive community, reinforced by a transparent level-and-point progression that celebrates streaks and healthy competition while permitting optional real-money point bundles.

### 1.2 Strategic Objectives
1. **Onboard quickly:** Enable new users to define their first habit and understand the value proposition within the first session.
2. **Promote consistency:** Provide daily feedback loops (calendar, streaks, analytics) that reinforce positive behavior.
3. **Leverage community:** Encourage collaboration and light competition to increase retention and virality.
4. **Enable monetization:** Offer premium capabilities that enhance insights and customization without blocking core usage.
5. **Celebrate progression:** Tie habit streaks, competitions, and optional point purchases to a level ladder that surfaces timely alerts and keeps motivation high.

---

## 2. Scope Overview
| Area | Description | Feature Doc |
|------|-------------|-------------|
| Core Habit Tracking | Create, edit, and progress individual habits with streak logic, Supabase persistence, and realtime sync. | [Habit Tracking](features/habit-tracking.md) |
| Calendar | Visualize progress across days, complete tasks in context, and surface quick stats (backed by `habit_completions`). | [Habit Calendar](features/calendar.md) |
| Analytics | Deliver weekly performance overviews, habit comparisons, and recommendations generated from Supabase aggregations/RPCs. | [Analytics Dashboard](features/analytics.md) |
| Community | Friends, competitions, marketplace, achievements, notifications, all powered by dedicated Supabase schema and edge functions. | [Community Hub](features/community.md) |
| Profile | Personalized dashboard with stats, followers, following, and records computed via materialized views. | [Profile & Social Presence](features/profile.md) |
| Settings | Account-level configuration, premium entry points, support links. | [Settings & Preferences](features/settings.md) |
| Premium | Tiered offering, upgrade flow, and access gating. | [Premium Experience](features/premium.md) |
| Authentication | Supabase-powered auth flows for sign-up, sign-in, and recovery. | [Authentication & Access Control](features/auth.md) |
| Mobile Experience | Touch-first responsive layouts and mobile navigation paradigms. | [Mobile Experience](features/mobile-experience.md) |

Out of scope: native mobile apps, full push-notification infrastructure, deep integration with wearables, and enterprise multi-tenant controls.

---

## 3. Personas & Use Cases
### 3.1 Personas
1. **Routine Builder (Primary):** Wants simple habit tracking, seeks motivation through streaks and gentle reminders. Typically early in habit-building journey.
2. **Data-Driven Achiever:** Interested in analytics, trends, and optimization. Seeks detailed insights and customization.
3. **Social Motivator:** Values community accountability, competitions, and gamification. Likely to invite friends.
4. **Premium Pro:** Existing power user exploring advanced analytics and premium rewards.

### 3.2 Core Use Cases
| Persona | Scenario | Expected Outcome |
|---------|----------|------------------|
| Routine Builder | Signs up, creates first habit, logs daily completion. | Understands progress, receives streak alerts, and sees early level-ups within 3 days. |
| Data-Driven Achiever | Reviews weekly performance on mobile. | Identifies underperforming habits, toggles deeper analysis levels, and receives actionable insights. |
| Social Motivator | Joins community competitions, follows friends. | Increased engagement, shared accomplishments in feed, and levels up through competitions and streak bonuses. |
| Premium Pro | Upgrades plan to unlock advanced analytics. | Access to premium content, minimal friction during billing. |

---

## 4. Detailed Functional Requirements
### 4.1 Habit Creation & Tracking
- CRUD operations for habits with target units, colors, descriptions, and categories.
- Increment/decrement controls update Supabase `habit_completions` table and refresh streak calculations.
- Real-time visual indicators (progress bar, streak badge) respond to completion state.
- Habit completions award points and experience toward user levels, with proactive alerts when streak momentum is at risk.
- Zero-state card nudges new users to create a first habit.

### 4.2 Calendar Experience
- Monthly grid with day headers, selection state, and coloring for completion percentage.
- Day briefing summarizing achievements, motivational copy, and quick stats.
- Alert banners highlight upcoming streak breaks, point bonuses, and level milestones tied to the selected day.
- Inline habit list allows completing tasks for selected day (including past/future states with constraints).
- Legend clarifies color coding (perfect, partial, none, today).
- Responsive adaptation: horizontal scroll or compressed cards on mobile; keyboard support on desktop.

### 4.3 Analytics Dashboard
- Overview tab: key metrics (success rate, streak, points, active habits) and weekly tube chart.
- Performance tab: list each habit with completion percent, streak metrics, and average progress.
- Habits tab: card deck with detailed insights, goal callouts, and progress grid.
- Insights tab: achievements display and recommendations with CTA buttons.
- Insight depth toggles (Snapshot, Guided, Deep Dive) tailor the technical rigour of charts and narratives to the user’s appetite.
- Impact statements cover work, personal, health, mental wellbeing, and other chosen domains, annotating why a habit helps or harms each area.
- Backend integration: analytics derived from `habits` and `habit_completions` via hooks (`useHabits`, `useHabitCompletions`).
- Mobile layout: tab list adopts glass pill UI, charts overflow gracefully with horizontal scroll.

### 4.4 Community Hub
- Tabbed navigation for Overview, Friends, Competitions, Marketplace, Achievements.
- Overview: stats cards, activity feed with avatars, and quick actions backed by `community_activity_feed` populated via triggers from competitions, achievements, and follow events.
- Friends: searchable list, suggested friends state, leaderboard, friend requests, implemented with `followers`, `friend_requests`, and a `friend_leaderboard_view`.
- Competitions: active/upcoming/completed sections with join CTA and time remaining driven by `competitions`, `competition_stages`, `competition_participants`, plus RPC `join_competition`, awarding points and experience toward levels based on placement.
- Marketplace: filterable catalog (`marketplace_items`), purchase flow consuming points via `point_transactions` and `user_inventory` with transactional RPC to ensure atomic debits, and optional point top-ups purchased through premium billing.
- Achievements: earned vs available tabs with progress bars referencing `achievements`, `user_achievements`, and `achievement_progress_view`, spotlighting the next level milestone.
- Notifications: community events enqueue entries in `notifications` and `notification_recipients`, surfaced through `useNotifications` hook (in-app) and optional email/push edge function.
- Realtime: Supabase channel subscriptions broadcast updates for friends, competitions, and marketplace purchases; fallback polling available.

### 4.5 Profile Modal
- Overview: avatar, bio, location, website, stats grid (including current level, points, and streak alerts), social links, personal records aggregated via `profiles`, `profile_stats_view`, `social_links`, `user_records`.
- Social tab: glass-styled tab list between followers/following, scrollable card list with metadata from `followers` and `following_view`.
- Records tab: chronological list of achievements with timestamps from `user_records` and `user_achievements`, annotated with the domain (work, personal, health, mental) each habit affects.
- Edit mode: forms for display name, bio, location, website writing to `profiles`; validation handled client-side and via database constraints.
- Permissions: only owner can edit or manage social links; follow/unfollow CTA for other profiles triggers RPC `toggle_follow` which manages `followers`, notifications, and prevents duplicates.
- Background jobs: Supabase Edge Function recomputes `profile_stats_view` nightly and on relevant events.

### 4.6 Settings & Premium
- Settings modal responsive to device: toggles persisted to `user_settings` table, premium CTA, support/legal links, and granular alert cadence/preferences.
- Premium page highlights plan features, risk-reversal messaging, upgrade button integrated with Stripe (webhook updates `user_subscriptions`), and optional point bundle purchases.
- Premium flag gating inside analytics or marketplace for exclusive content; server checks `user_subscriptions` and RLS for premium-only rows.

### 4.7 Authentication
- Initial screen gating: show Auth component if `useAuth` indicates not authenticated.
- Sign-in/up flows via Supabase email/password and optional OAuth providers.
- Session management handled by Supabase Auth helpers; refresh tokens stored securely; auto refresh via `onAuthStateChange`.
- Loading states while Auth verifies session tokens.
- Logout from profile modal with confirmation dialog and Supabase sign-out call.
- RLS policies ensure users only access own data; service role keys limited to backend functions.

### 4.8 Mobile Experience
- Bottom navigation (Home, Calendar, Community, Analytics, Premium).
- Mobile-specific community/settings modals (`MobileCommunity`, `MobileSettings`).
- Safe-area padding and scrollable card layouts.
- Chart and calendar components shrink gracefully; horizontal scroll wrappers to prevent clipping.
- Edge caching and selective Supabase queries reduce mobile data consumption (e.g., feed pagination default 20 items).

---

## 5. Non-Functional Requirements
1. **Performance**
   - Initial load (core bundle) < 3s on 4G mobile.
   - Interactions respond within 150ms for primary flows.
   - Use lazy loading for heavy charts and community subviews.
2. **Reliability**
   - Supabase queries gracefully handle network failure with toasts.
   - Realtime updates subscribe to `habit_completions`; fallback re-fetch if channel disconnects.
3. **Security & Privacy**
   - Only authenticated users may access habit and community data.
   - Follow best practices with Supabase row-level security (RLS).
   - Never expose secrets in client bundle; rely on environment variables.
4. **Accessibility**
   - Keyboard reachable controls, focus states, and appropriate ARIA labels.
   - Color selections meet contrast guidelines where possible.
5. **Localization**
   - Initially English-only; structure UI copy for future translation.

---

## 6. Success Metrics
| Metric | Target (post-launch) | Notes |
|--------|----------------------|-------|
| Day-7 habit completion rate | ≥ 40% of active users | Indicates ongoing habit engagement. |
| Weekly community interactions | ≥ 2 actions/user | Includes friend additions, competition joins, or marketplace visits. |
| Analytics dashboard usage | ≥ 50% of weekly actives | Measures insight feature relevance. |
| Level advancement rate | ≥ 60% reach Level 3 within first 30 days | Validates that the progression loop sustains motivation. |
| Premium upgrade conversion | ≥ 3% of monthly actives | Assess monetization effectiveness. |
| Retention D30 | ≥ 25% | Baseline for further iterations. |

Instrumentation via Supabase events or client analytics (PostHog/Segment) to be decided.

---

## 7. Release & Milestones
| Milestone | Scope | Target Date |
|-----------|-------|-------------|
| **MVP** | Core habit tracking, calendar, basic analytics, authentication | Month 1 |
| **Beta** | Community hub (friends, competitions), profile stats, premium marketing | Month 2 |
| **GA** | Marketplace, achievements, advanced analytics, mobile polish | Month 3 |
| **Post-GA** | Premium upsell funnel, push notifications, integrations | Continuous |

### Launch Checklist
- ✅ Authentication gating
- ✅ Supabase schema migrations
- 🔄 Analytics instrumentation (pending)
- 🔄 Premium billing integration
- 🔄 Notification queue instrumentation (pending)
- 🔄 RPC + pgTAP coverage (pending)
- ✅ Responsive QA (desktop/mobile)


## 8. Backend Architecture Roadmap

### 8.1 Guiding Principles
- Treat each domain (habits, analytics, community, notifications, monetization) as a self-contained module with documented tables, views, and RPC contracts.
- Keep row-level security enabled everywhere and encapsulate privileged changes in `SECURITY DEFINER` routines per Supabase guidance on declarative schemas and safe function execution.
- Prefer RPCs, views, and edge functions over direct table mutations from the client to reduce duplicated business logic and to enable test coverage and observability.
- Broadcast realtime changes through database triggers only after the write path is validated, using `realtime.broadcast_changes` where live updates are required (e.g., competition leaderboards).

### 8.2 Domain Blueprint
| Domain | Current Assets | Immediate Gaps | Backend Actions |
|--------|----------------|----------------|-----------------|
| Auth & Profiles | `profiles` trigger (`handle_new_user`), privacy flags, `profile_stats_daily` MV | Counts recalculated client-side; no consolidated settings surface | Add RPCs for profile updates (privacy, themes), hydrate follower/following counts via triggers, refresh `profile_stats_daily` on schedule. |
| Habit Tracking | `habits`, `habit_completions`, `streak_history` (new) | Streak math runs in React; no batched copy/undo; analytics tables unused | Introduce `habit_increment`, `habit_bulk_complete`, `habit_clone_day` RPCs, backfill `streak_history`, add `habit_daily_summary` view for charts. |
| Calendar & Analytics | `profile_stats_daily`, planned weekly rollups | Dashboard aggregates recomputed in hooks | Materialize `habit_weekly_summary` and `profile_trends_weekly`, refresh nightly via `task_runs`, expose read-only analytics RPCs. |
| Community & Social | New `friend_requests`, `friendships`, `community_invites`, `competition_*`, `activity_events` | Hooks still write to legacy `friends`, no validation, no pagination | Replace client inserts with `community.handle_friend_request()` RPC, add competition enrollment function with capacity checks, surface paginated views for feed/invites. |
| Notifications | `notifications`, `notification_events`, `notification_queue`, `notification_preferences`, edge function `notification-processor` | Client inserts bypass queue, no retry/delivery audit | Route all notification creation through `notification_events` + queue, extend edge function to dequeue, add metrics in `task_runs`, auto-archive >90 day rows. |
| Points & Marketplace | `point_transactions`, `marketplace_inventory`, `marketplace_transactions` | UI still uses missing `user_purchases`, no transactional guard | Ship `commerce.spend_points()` RPC to atomically insert transaction + debit balance, expose `point_balances` view, add fulfillment status workflow. |
| Premium & Billing | Stripe-ready `create-payment` reference, premium flags on tables | Edge function missing, no entitlement sync | Implement `create-payment` edge function + webhook handler, store entitlements on `profiles`, guard premium-only resources via RLS. |

### 8.3 Implementation Phases
| Phase | Target Milestone | Scope |
|-------|------------------|-------|
| Foundation | Late MVP | Apply outstanding migrations (inventory, queue tables), create missing edge function scaffolds, generate RPCs for friend workflow, habit updates, and points ledger. |
| Service Layer | Beta | Migrate React hooks to RPC/edge functions, deprecate direct table writes, add pgTAP coverage, and refresh materialized views with scheduled tasks. |
| Event & Analytics | GA | Finalize notification queue processors, enable realtime broadcasts for competitions, automate aggregation refresh (`task_runs`), and backfill analytics/history tables. |
| Sustainment | Post-GA | Add retention policies, archive jobs, GDPR export routines, and operational runbooks per domain. |

### 8.4 Testing & Observability
- Add pgTAP suites for every new RPC (habit completion, friend requests, marketplace spending).
- Record synthetic events in staging to validate `notification_queue` retries and realtime feeds.
- Monitor with Supabase logs + custom metrics: queue depth, job success rate, RPC latency, and aggregated KPI drifts.
- Backstop with React Query integration tests mocking RPC contracts before front-end migration.

## 9. Dependencies & Integrations
- **Supabase**: Auth, Postgres DB, realtime channels, Edge Functions (notifications, nightly aggregates), migrations.
- **Shadcn/UI + Tailwind**: Component library used throughout.
- **Vite + React**: Build environment.
- **Lucide Icons**: UI iconography.
- **Date-fns**: Date manipulation in calendar and analytics.
- **Potential future**: Payment provider (Stripe), analytics tool, push notifications service.

Risks include Supabase rate limits, realtime channel reliability, and data consistency across hooks.


## 10. Analytics & Telemetry Plan
- Track habit CRUD events, daily completion, streak resets.
- Calendar and analytics page views with dwell time.
- Community actions (friend request, competition join, marketplace purchase).
- Profile follow/unfollow actions.
- Premium CTA impressions vs conversions.
- Level progression milestones, alert interactions, and point purchase conversions.

Instrumentation will be centralized once final analytics provider chosen; until then, maintain event interface wrappers.


## 11. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase schema drift | Data inconsistency | Maintain migrations, add integration tests checking hook outputs. |
| Mobile performance issues | Poor user retention | Leverage code splitting, reduce animation cost, monitor Lighthouse scores. |
| Low community adoption | Weak social loop | Provide default suggestions, highlight benefits in onboarding. |
| Premium conversion lag | Monetization failure | Run copy tests, add in-app previews in analytics/marketplace. |

---

## 11. Open Questions
1. Will premium tiers include exclusive habits, AI insights, or coach access?
2. Are push reminders and notifications required for MVP?
3. What external analytics provider will instrument metrics (PostHog vs Mixpanel)?
4. What is the expected cadence for competitions (auto-generated vs user-created)?
5. Product Development & Launch Questions
6.V1 Web Deployment (Vercel)

6.1.What is the current status of the web application - is it already developed locally or starting from scratch?
6.2.What specific features are included in V1 that need to be deployed?
6.3.Are there any environment variables or API keys that need to be configured in Vercel?
6.4.Do you have a custom domain ready, or will you use Vercel's default subdomain initially?
6.5.What does "Updates to 1.4" refer to - is this a framework version, dependency update, or feature set?

7.Custom Browser Icon (Favicon)

7.1.Do you have a favicon/app icon already designed, or does one need to be created?
7.2.What are your preferred icon sizes and formats (favicon.ico, PNG, SVG)?
7.3.Should the icon match any existing brand colors or logo?
7.4.Do you need app icons for mobile devices (iOS/Android) as well?

8.Safety Measurements

8.1.What type of safety measures are you implementing - data security, content moderation, user authentication, or compliance   features?
8.2.Are you implementing rate limiting, DDoS protection, or input validation?
8.3.Do you need security audits or penetration testing before launch?
8.4.What user data will be collected, and how will it be protected?

9.Stripe Integration (V1.5)

9.1.What payment model are you implementing - one-time payments, subscriptions, or both?
9.2.Do you need support for multiple currencies?
9.3.Will you offer tiered pricing or a single pricing plan?
9.4.Do you need invoice generation and receipt emails?
9.5.Are you targeting B2C, B2B, or both?

10.Legal Compliance

10.1.Which jurisdictions/regions are you targeting (affects GDPR, CCPA, etc.)?
10.2.Do you need Terms of Service, Privacy Policy, and Cookie Policy drafted?
10.3.Are you collecting user data that requires consent mechanisms?
10.4.Do you need business registration, tax compliance, or payment processing licenses?

11.Marketing Strategy

11.1.Who is your target audience/ideal customer?
11.2.What is your unique value proposition?
11.3.What type of content are you creating with Canva - social media posts, landing pages, infographics?
11.4.What video content are you producing with CapCut - product demos, testimonials, ads?
11.5.What is ElevenLabs being used for - voiceovers, AI narration, audio content?
11.6.Which marketing channels are you prioritizing (social media, content marketing, paid ads, email)?
11.7.What is your pre-launch timeline - when do you want to go live?
11.8.Do you have a budget allocated for paid marketing campaigns?

12.General Project Questions

What is the core problem your product solves?
Do you have competitors, and how do you differentiate from them?
What metrics will you track to measure success?
Do you have a team, or are you working solo on this project?

---

## 12. Appendices
- Feature Detail Docs: See `/docs/features/*.md`
- Component Inventory: `src/components/` for current implementations.
- Hooks/Data Layer: `src/hooks/useHabits.ts`, `src/hooks/useHabitCompletions.ts`, `src/hooks/useProfile.ts`.

---

**End of Document**
