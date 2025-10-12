# Habit Tracking

## Purpose
- Support users in defining, managing, and progressing through daily habits.

## Primary User Goals
- Create and edit habit definitions with targets, colors, and categories.
- Track daily progress with quick increment/decrement controls.
- Visualize streak health and overall completion rate.

## Core Flows
1. Add new habit with target and metadata.
2. Update progress via card controls or calendar completion.
3. View streak badges and habit-level statistics.

## Key States & Edge Cases
- Zero habits / onboarding state.
- Habit completed before end of day.
- Targets > 1 unit, partial progress, and reset conditions.

## Metrics
- Daily completion rate per habit.
- Average streak length and longest streak.
- Habit retention (active vs archived).

## Backend Alignment
- **Tables**: `habits`, `habit_completions`, `streak_history` (new) remain the single source of truth for definitions, daily entries, and historical streak windows.
- **RPCs (planned)**: `habit_increment`, `habit_bulk_complete`, and `habit_clone_day` will encapsulate all mutations; React hooks should migrate away from direct `.from('habit_completions')` calls once these ship.
- **Views**: Introduce `habit_daily_summary` (chart-ready rollups per habit/day) and reuse `profile_stats_daily` for cross-habit totals.
- **Realtime & Jobs**: Use supabase channel broadcasts only after RPC success; schedule nightly refreshes for streak rollups via `task_runs`.
- **Open Tasks**: Add pgTAP coverage for new RPCs, wire up optimistic UI updates to RPC responses, and document failure modes (validation, rate limiting).
