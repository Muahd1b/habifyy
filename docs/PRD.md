# Habifyy Product Requirements Document (PRD)

**Document Version:** 1.0  
**Prepared by:** Codex Support (with Habifyy engineering inputs)  
**Last Updated:** 2025-02-15

---

## 1. Executive Summary
Habifyy is a habit-building platform focused on blending personal productivity with social motivation. The product enables users to create and track habits, visualize progress, and stay accountable through analytics and community features. This PRD captures the end-to-end scope for achieving a feature-complete web application that is performant on desktop and mobile browsers.

### 1.1 Vision
Empower individuals to build sustainable routines by combining intuitive tracking, actionable insights, and a supportive community.

### 1.2 Strategic Objectives
1. **Onboard quickly:** Enable new users to define their first habit and understand the value proposition within the first session.
2. **Promote consistency:** Provide daily feedback loops (calendar, streaks, analytics) that reinforce positive behavior.
3. **Leverage community:** Encourage collaboration and light competition to increase retention and virality.
4. **Enable monetization:** Offer premium capabilities that enhance insights and customization without blocking core usage.

---

## 2. Scope Overview
| Area | Description | Feature Doc |
|------|-------------|-------------|
| Core Habit Tracking | Create, edit, and progress individual habits with streak logic and visual feedback. | [Habit Tracking](features/habit-tracking.md) |
| Calendar | Visualize progress across days, complete tasks in context, and surface quick stats. | [Habit Calendar](features/calendar.md) |
| Analytics | Deliver weekly performance overviews, habit comparisons, and recommendations. | [Analytics Dashboard](features/analytics.md) |
| Community | Friends, competitions, marketplace, and achievements to drive engagement. | [Community Hub](features/community.md) |
| Profile | Personalized dashboard with stats, followers, following, and records. | [Profile & Social Presence](features/profile.md) |
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
| Routine Builder | Signs up, creates first habit, logs daily completion. | Understands progress and sees streak badges within 3 days. |
| Data-Driven Achiever | Reviews weekly performance on mobile. | Identifies underperforming habits and receives actionable insights. |
| Social Motivator | Joins community competitions, follows friends. | Increased engagement, shared accomplishments in feed. |
| Premium Pro | Upgrades plan to unlock advanced analytics. | Access to premium content, minimal friction during billing. |

---

## 4. Detailed Functional Requirements
### 4.1 Habit Creation & Tracking
- CRUD operations for habits with target units, colors, descriptions, and categories.
- Increment/decrement controls update Supabase `habit_completions` table and refresh streak calculations.
- Real-time visual indicators (progress bar, streak badge) respond to completion state.
- Zero-state card nudges new users to create a first habit.

### 4.2 Calendar Experience
- Monthly grid with day headers, selection state, and coloring for completion percentage.
- Day briefing summarizing achievements, motivational copy, and quick stats.
- Inline habit list allows completing tasks for selected day (including past/future states with constraints).
- Legend clarifies color coding (perfect, partial, none, today).
- Responsive adaptation: horizontal scroll or compressed cards on mobile; keyboard support on desktop.

### 4.3 Analytics Dashboard
- Overview tab: key metrics (success rate, streak, points, active habits) and weekly tube chart.
- Performance tab: list each habit with completion percent, streak metrics, and average progress.
- Habits tab: card deck with detailed insights, goal callouts, and progress grid.
- Insights tab: achievements display and recommendations with CTA buttons.
- Backend integration: analytics derived from `habits` and `habit_completions` via hooks (`useHabits`, `useHabitCompletions`).
- Mobile layout: tab list adopts glass pill UI, charts overflow gracefully with horizontal scroll.

### 4.4 Community Hub
- Tabbed navigation for Overview, Friends, Competitions, Marketplace, Achievements.
- Overview: stats cards, activity feed with avatars, and quick actions.
- Friends: searchable list, suggested friends state, leaderboard, friend requests (future).
- Competitions: active/upcoming/completed sections with join CTA and time remaining.
- Marketplace: filterable catalog, purchase flow consuming points, empty-state messaging.
- Achievements: earned vs available tabs with progress bars, category stats.

### 4.5 Profile Modal
- Overview: avatar, bio, location, website, stats grid, social links, personal records.
- Social tab: glass-styled tab list between followers/following, scrollable card list with metadata.
- Records tab: chronological list of achievements with timestamps.
- Edit mode: forms for display name, bio, location, website.
- Permissions: only owner can edit or manage social links; follow/unfollow CTA for other profiles.

### 4.6 Settings & Premium
- Settings modal responsive to device: toggles, premium CTA, support/legal links.
- Premium page highlights plan features, risk-reversal messaging, and upgrade button (integration placeholder).
- Premium flag gating inside analytics or marketplace for exclusive content (future).

### 4.7 Authentication
- Initial screen gating: show Auth component if `useAuth` indicates not authenticated.
- Sign-in/up flows via Supabase email/password.
- Loading states while Auth verifies session tokens.
- Logout from profile modal with confirmation dialog.

### 4.8 Mobile Experience
- Bottom navigation (Home, Calendar, Community, Analytics, Premium).
- Mobile-specific community/settings modals (`MobileCommunity`, `MobileSettings`).
- Safe-area padding and scrollable card layouts.
- Chart and calendar components shrink gracefully; horizontal scroll wrappers to prevent clipping.

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
- ✅ Responsive QA (desktop/mobile)

---

## 8. Dependencies & Integrations
- **Supabase**: Auth, Postgres DB, realtime channels.
- **Shadcn/UI + Tailwind**: Component library used throughout.
- **Vite + React**: Build environment.
- **Lucide Icons**: UI iconography.
- **Date-fns**: Date manipulation in calendar and analytics.
- **Potential future**: Payment provider (Stripe), analytics tool, push notifications service.

Risks include Supabase rate limits, realtime channel reliability, and data consistency across hooks.

---

## 9. Analytics & Telemetry Plan
- Track habit CRUD events, daily completion, streak resets.
- Calendar and analytics page views with dwell time.
- Community actions (friend request, competition join, marketplace purchase).
- Profile follow/unfollow actions.
- Premium CTA impressions vs conversions.

Instrumentation will be centralized once final analytics provider chosen; until then, maintain event interface wrappers.

---

## 10. Risks & Mitigations
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
