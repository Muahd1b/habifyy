# Analytics Dashboard

## Purpose
- Deliver actionable insights about habit performance, streaks, and consistency trends.

## Primary User Goals
- Monitor weekly performance through adaptive visualizations.
- Compare habits by completion rate, streak strength, and average progress.
- Receive recommendations and celebrate achievements.

## Core Flows
1. Open analytics from navigation.
2. Review overview metrics and weekly tube chart.
3. Drill into performance, habits, and insights tabs.
4. Consume recommendations or achievements for motivation.

## Key States & Edge Cases
- Limited completion data (new users, sparse habits).
- Loading states while fetching Supabase analytics.
- Mobile adaptive layouts for charts and tab navigation.

## Metrics
- Weekly success rate.
- Average habit completion percentage.
- Perfect day count and current streak.

## Backend Alignment
- **Materialized Views**: `profile_stats_daily` (current), `habit_weekly_summary` (planned), and `community_metrics_daily` feed overview, comparison, and community cards; refresh nightly via `task_runs`.
- **RPCs**: Expose read-only endpoints `analytics.get_overview(user_id)` and `analytics.get_habit_trends(user_id, range)` to reduce client joins; honour RLS with `SECURITY DEFINER` wrappers.
- **Edge Functions**: Use the notification processor to push highlights when thresholds are met (e.g., streak milestones), once queue processing is in place.
- **Instrumentation**: Log RPC latency, view refresh duration, and chart load failures; integrate with analytics events defined in the PRD.
