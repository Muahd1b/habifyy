# Habit Calendar

## Purpose
- Provide an interactive calendar view to review daily performance and plan ahead.

## Primary User Goals
- Switch between days/months to inspect habit completion.
- Identify completion rates via color-coded cells and quick stats.
- Complete habits directly from selected day context.
- Receive alerts about streak risk and bonus point opportunities tied to each day.

## Core Flows
1. Open calendar from header navigation.
2. Navigate months/weeks and select a day.
3. Review briefing, quick stats, and habit list for selected date.
4. Complete or adjust habit progress inline.
5. Acknowledge streak warnings or bonus prompts surfaced for that day.

## Key States & Edge Cases
- No habits assigned to a given day.
- Multiple habits completed with partial progress.
- Responsive layout for mobile scroll interactions.
- Quiet hour handling when alerts need to be deferred.

## Metrics
- Daily completion distribution.
- Calendar engagement (opens per week).
- Perfect day count per month.
- Alert acknowledgement rate and bonuses claimed.

## Backend Alignment
- **Views**: Consume `habit_daily_summary` for cell heatmaps and `habit_weekly_summary` for quick stats; both materialized nightly to keep page loads <150ms.
- **RPCs**: Add `calendar.get_day_overview(date, user_id)` to bundle completions, streak status, level milestones, and motivational copy instead of multiple client round-trips.
- **Realtime**: Subscribe to `habit_completions` changes via a dedicated channel that filters on `user_id`, mirroring the upcoming RPC contracts.
- **Open Tasks**: Build pgTAP tests for the day overview RPC, add pagination for history exports, and document retention (only keep 18 months of raw completions in hot storage).
