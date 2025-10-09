-- Backend expansion phase 1: schema foundations for community, notifications, and profile metrics

-- Ensure profiles.user_id remains unique for foreign key references
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END;
$$;

--------------------------------------------------------------------
-- Community & Social Schema
--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  message text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT friend_requests_unique_pair UNIQUE (requester_id, recipient_id),
  CONSTRAINT friend_requests_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  CONSTRAINT friend_requests_no_self CHECK (requester_id <> recipient_id)
);

DROP TRIGGER IF EXISTS update_friend_requests_updated_at ON public.friend_requests;
CREATE TRIGGER update_friend_requests_updated_at
  BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Friend requests visible to involved users" ON public.friend_requests;
CREATE POLICY "Friend requests visible to involved users"
ON public.friend_requests
FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Friend requests can be created by requester" ON public.friend_requests;
CREATE POLICY "Friend requests can be created by requester"
ON public.friend_requests
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Friend requests requester manage" ON public.friend_requests;
CREATE POLICY "Friend requests requester manage"
ON public.friend_requests
FOR UPDATE
USING (auth.uid() = requester_id)
WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Friend requests recipient respond" ON public.friend_requests;
CREATE POLICY "Friend requests recipient respond"
ON public.friend_requests
FOR UPDATE
USING (auth.uid() = recipient_id)
WITH CHECK (
  auth.uid() = recipient_id
  AND status IN ('accepted', 'declined', 'blocked')
);

DROP POLICY IF EXISTS "Friend requests deletable by participants" ON public.friend_requests;
CREATE POLICY "Friend requests deletable by participants"
ON public.friend_requests
FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  source_request_id uuid REFERENCES public.friend_requests (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT friendships_no_self CHECK (user_id <> friend_id),
  CONSTRAINT friendships_status_check CHECK (status IN ('active', 'blocked', 'removed')),
  CONSTRAINT friendships_unique_pair UNIQUE (user_id, friend_id)
);

DROP TRIGGER IF EXISTS update_friendships_updated_at ON public.friendships;
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Friendships visible to participants" ON public.friendships;
CREATE POLICY "Friendships visible to participants"
ON public.friendships
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Friendships maintainable by user" ON public.friendships;
CREATE POLICY "Friendships maintainable by user"
ON public.friendships
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Friendships update by user" ON public.friendships;
CREATE POLICY "Friendships update by user"
ON public.friendships
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Friendships delete by user" ON public.friendships;
CREATE POLICY "Friendships delete by user"
ON public.friendships
FOR DELETE
USING (auth.uid() = user_id);

-- Backfill existing accepted friendships from legacy friends table
INSERT INTO public.friendships (user_id, friend_id, source_request_id, status, created_at, updated_at)
SELECT f.user_id, f.friend_id, NULL, 'active', f.created_at, f.updated_at
FROM public.friends f
WHERE f.status = 'accepted'
ON CONFLICT (user_id, friend_id) DO NOTHING;

INSERT INTO public.friendships (user_id, friend_id, source_request_id, status, created_at, updated_at)
SELECT f.friend_id AS user_id, f.user_id AS friend_id, NULL, 'active', f.created_at, f.updated_at
FROM public.friends f
WHERE f.status = 'accepted'
ON CONFLICT (user_id, friend_id) DO NOTHING;

--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.community_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities (id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  invitee_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz,
  message text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_invites_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  CONSTRAINT community_invites_unique_pair UNIQUE (community_id, inviter_id, invitee_id)
);

DROP TRIGGER IF EXISTS update_community_invites_updated_at ON public.community_invites;
CREATE TRIGGER update_community_invites_updated_at
  BEFORE UPDATE ON public.community_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.community_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Community invites visible to involved users" ON public.community_invites;
CREATE POLICY "Community invites visible to involved users"
ON public.community_invites
FOR SELECT
USING (
  auth.uid() = inviter_id
  OR auth.uid() = invitee_id
);

DROP POLICY IF EXISTS "Community invites created by inviter" ON public.community_invites;
CREATE POLICY "Community invites created by inviter"
ON public.community_invites
FOR INSERT
WITH CHECK (auth.uid() = inviter_id);

DROP POLICY IF EXISTS "Community invites update by participants" ON public.community_invites;
CREATE POLICY "Community invites update by participants"
ON public.community_invites
FOR UPDATE
USING (auth.uid() = inviter_id OR auth.uid() = invitee_id)
WITH CHECK (auth.uid() = inviter_id OR auth.uid() = invitee_id);

DROP POLICY IF EXISTS "Community invites delete by inviter" ON public.community_invites;
CREATE POLICY "Community invites delete by inviter"
ON public.community_invites
FOR DELETE
USING (auth.uid() = inviter_id);

--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.competition_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions (id) ON DELETE CASCADE,
  title text NOT NULL,
  round_type text NOT NULL DEFAULT 'custom',
  position integer NOT NULL DEFAULT 1,
  starts_at timestamptz,
  ends_at timestamptz,
  scoring_rule text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_competition_rounds_updated_at ON public.competition_rounds;
CREATE TRIGGER update_competition_rounds_updated_at
  BEFORE UPDATE ON public.competition_rounds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.competition_rounds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Competition rounds selectable by authenticated users" ON public.competition_rounds;
CREATE POLICY "Competition rounds selectable by authenticated users"
ON public.competition_rounds
FOR SELECT
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Competition rounds managed by service role" ON public.competition_rounds;
CREATE POLICY "Competition rounds managed by service role"
ON public.competition_rounds
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.competition_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES public.competition_participants (id) ON DELETE CASCADE,
  round_id uuid REFERENCES public.competition_rounds (id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  score numeric NOT NULL DEFAULT 0,
  rank integer,
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamptz,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT competition_scores_status_check CHECK (status IN ('pending', 'verified', 'rejected'))
);

DROP TRIGGER IF EXISTS update_competition_scores_updated_at ON public.competition_scores;
CREATE TRIGGER update_competition_scores_updated_at
  BEFORE UPDATE ON public.competition_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.competition_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Competition scores visible to participant" ON public.competition_scores;
CREATE POLICY "Competition scores visible to participant"
ON public.competition_scores
FOR SELECT
USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Competition scores insert by participant" ON public.competition_scores;
CREATE POLICY "Competition scores insert by participant"
ON public.competition_scores
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Competition scores update by participant" ON public.competition_scores;
CREATE POLICY "Competition scores update by participant"
ON public.competition_scores
FOR UPDATE
USING (auth.uid() = user_id OR auth.role() = 'service_role')
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.competition_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions (id) ON DELETE CASCADE,
  placement integer NOT NULL,
  reward_type text NOT NULL DEFAULT 'points',
  reward_value numeric NOT NULL DEFAULT 0,
  reward_metadata jsonb,
  is_premium boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_competition_rewards_updated_at ON public.competition_rewards;
CREATE TRIGGER update_competition_rewards_updated_at
  BEFORE UPDATE ON public.competition_rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.competition_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Competition rewards selectable by authenticated users" ON public.competition_rewards;
CREATE POLICY "Competition rewards selectable by authenticated users"
ON public.competition_rewards
FOR SELECT
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Competition rewards managed by service role" ON public.competition_rewards;
CREATE POLICY "Competition rewards managed by service role"
ON public.competition_rewards
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.marketplace_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.marketplace_items (id) ON DELETE CASCADE,
  quantity integer,
  reserved integer NOT NULL DEFAULT 0,
  restock_at timestamptz,
  is_limited boolean NOT NULL DEFAULT false,
  sku text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_marketplace_inventory_updated_at ON public.marketplace_inventory;
CREATE TRIGGER update_marketplace_inventory_updated_at
  BEFORE UPDATE ON public.marketplace_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.marketplace_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Marketplace inventory visible to authenticated users" ON public.marketplace_inventory;
CREATE POLICY "Marketplace inventory visible to authenticated users"
ON public.marketplace_inventory
FOR SELECT
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Marketplace inventory managed by service role" ON public.marketplace_inventory;
CREATE POLICY "Marketplace inventory managed by service role"
ON public.marketplace_inventory
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.marketplace_items (id) ON DELETE CASCADE,
  inventory_id uuid REFERENCES public.marketplace_inventory (id) ON DELETE SET NULL,
  points_spent integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  fulfillment_payload jsonb,
  awarded_points integer,
  point_transaction_id uuid REFERENCES public.point_transactions (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  fulfilled_at timestamptz,
  canceled_at timestamptz,
  CONSTRAINT marketplace_transactions_status_check CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'))
);

DROP TRIGGER IF EXISTS update_marketplace_transactions_updated_at ON public.marketplace_transactions;
CREATE TRIGGER update_marketplace_transactions_updated_at
  BEFORE UPDATE ON public.marketplace_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Marketplace transactions visible to purchaser" ON public.marketplace_transactions;
CREATE POLICY "Marketplace transactions visible to purchaser"
ON public.marketplace_transactions
FOR SELECT
USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Marketplace transactions insert by purchaser" ON public.marketplace_transactions;
CREATE POLICY "Marketplace transactions insert by purchaser"
ON public.marketplace_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Marketplace transactions update by purchaser" ON public.marketplace_transactions;
CREATE POLICY "Marketplace transactions update by purchaser"
ON public.marketplace_transactions
FOR UPDATE
USING (auth.uid() = user_id OR auth.role() = 'service_role')
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.achievement_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements (id) ON DELETE CASCADE,
  current_value numeric NOT NULL DEFAULT 0,
  progress_percent numeric NOT NULL DEFAULT 0,
  last_increment_at timestamptz,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT achievement_progress_unique UNIQUE (user_id, achievement_id)
);

DROP TRIGGER IF EXISTS update_achievement_progress_updated_at ON public.achievement_progress;
CREATE TRIGGER update_achievement_progress_updated_at
  BEFORE UPDATE ON public.achievement_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.achievement_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Achievement progress visible to owner" ON public.achievement_progress;
CREATE POLICY "Achievement progress visible to owner"
ON public.achievement_progress
FOR SELECT
USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Achievement progress insert by owner" ON public.achievement_progress;
CREATE POLICY "Achievement progress insert by owner"
ON public.achievement_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Achievement progress update by owner" ON public.achievement_progress;
CREATE POLICY "Achievement progress update by owner"
ON public.achievement_progress
FOR UPDATE
USING (auth.uid() = user_id OR auth.role() = 'service_role')
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid,
  verb text NOT NULL,
  visibility text NOT NULL DEFAULT 'public',
  audience jsonb,
  target_user_id uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  community_id uuid REFERENCES public.communities (id) ON DELETE SET NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Activity events visible to permitted users" ON public.activity_events;
CREATE POLICY "Activity events visible to permitted users"
ON public.activity_events
FOR SELECT
USING (
  visibility = 'public'
  OR auth.uid() = actor_id
  OR (target_user_id IS NOT NULL AND auth.uid() = target_user_id)
  OR (
    audience ? auth.uid()::text
  )
);

DROP POLICY IF EXISTS "Activity events insert by actor" ON public.activity_events;
CREATE POLICY "Activity events insert by actor"
ON public.activity_events
FOR INSERT
WITH CHECK (auth.uid() = actor_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Activity events update/delete by service role" ON public.activity_events;
CREATE POLICY "Activity events update/delete by service role"
ON public.activity_events
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS activity_events_created_at_idx
  ON public.activity_events (created_at DESC);

CREATE INDEX IF NOT EXISTS activity_events_actor_idx
  ON public.activity_events (actor_id);

CREATE INDEX IF NOT EXISTS activity_events_target_idx
  ON public.activity_events (target_user_id);

--------------------------------------------------------------------
-- Notification Engine Schema
--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  actor_id uuid,
  subject_id uuid,
  entity_type text,
  entity_id uuid,
  payload jsonb,
  triggered_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notification events managed by service role" ON public.notification_events;
CREATE POLICY "Notification events managed by service role"
ON public.notification_events
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.notification_events (id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  channel text NOT NULL DEFAULT 'in_app',
  status text NOT NULL DEFAULT 'pending',
  priority text NOT NULL DEFAULT 'normal',
  scheduled_for timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_notification_queue_updated_at ON public.notification_queue;
CREATE TRIGGER update_notification_queue_updated_at
  BEFORE UPDATE ON public.notification_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notification queue managed by service role" ON public.notification_queue;
CREATE POLICY "Notification queue managed by service role"
ON public.notification_queue
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS notification_queue_status_scheduled_idx
  ON public.notification_queue (status, scheduled_for);

--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid NOT NULL REFERENCES public.notification_queue (id) ON DELETE CASCADE,
  provider text,
  status text NOT NULL DEFAULT 'pending',
  response_payload jsonb,
  error_code text,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notification deliveries managed by service role" ON public.notification_deliveries;
CREATE POLICY "Notification deliveries managed by service role"
ON public.notification_deliveries
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS notification_deliveries_queue_idx
  ON public.notification_deliveries (queue_id);

--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notification_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  channel text NOT NULL,
  address text,
  verified boolean NOT NULL DEFAULT false,
  last_used_at timestamptz,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS notification_channels_unique
  ON public.notification_channels (user_id, channel, COALESCE(address, ''));

DROP TRIGGER IF EXISTS update_notification_channels_updated_at ON public.notification_channels;
CREATE TRIGGER update_notification_channels_updated_at
  BEFORE UPDATE ON public.notification_channels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notification channels visible to owner" ON public.notification_channels;
CREATE POLICY "Notification channels visible to owner"
ON public.notification_channels
FOR SELECT
USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Notification channels insert by owner" ON public.notification_channels;
CREATE POLICY "Notification channels insert by owner"
ON public.notification_channels
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Notification channels update by owner" ON public.notification_channels;
CREATE POLICY "Notification channels update by owner"
ON public.notification_channels
FOR UPDATE
USING (auth.uid() = user_id OR auth.role() = 'service_role')
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Notification channels delete by owner" ON public.notification_channels;
CREATE POLICY "Notification channels delete by owner"
ON public.notification_channels
FOR DELETE
USING (auth.uid() = user_id OR auth.role() = 'service_role');

--------------------------------------------------------------------

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.notification_events (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS channel text DEFAULT 'in_app',
  ADD COLUMN IF NOT EXISTS delivered_via text,
  ADD COLUMN IF NOT EXISTS read_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

UPDATE public.notifications
SET channel = COALESCE(channel, 'in_app');

ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS channel_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS digest_frequency text NOT NULL DEFAULT 'immediate',
  ADD COLUMN IF NOT EXISTS rate_limit_per_hour integer NOT NULL DEFAULT 60;

--------------------------------------------------------------------
-- Profile Metrics Schema
--------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS followers_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz,
  ADD COLUMN IF NOT EXISTS community_rank integer,
  ADD COLUMN IF NOT EXISTS privacy_settings jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.streak_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  habit_id uuid REFERENCES public.habits (id) ON DELETE SET NULL,
  streak_start date NOT NULL,
  streak_end date,
  max_length integer NOT NULL,
  last_event_at timestamptz,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.streak_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Streak history visible to owner" ON public.streak_history;
CREATE POLICY "Streak history visible to owner"
ON public.streak_history
FOR SELECT
USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Streak history insert by owner" ON public.streak_history;
CREATE POLICY "Streak history insert by owner"
ON public.streak_history
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Streak history update by owner" ON public.streak_history;
CREATE POLICY "Streak history update by owner"
ON public.streak_history
FOR UPDATE
USING (auth.uid() = user_id OR auth.role() = 'service_role')
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS streak_history_user_start_idx
  ON public.streak_history (user_id, streak_start DESC);

--------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.task_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_run_at timestamptz,
  next_run_at timestamptz,
  error text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_task_runs_updated_at ON public.task_runs;
CREATE TRIGGER update_task_runs_updated_at
  BEFORE UPDATE ON public.task_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.task_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Task runs managed by service role" ON public.task_runs;
CREATE POLICY "Task runs managed by service role"
ON public.task_runs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

--------------------------------------------------------------------

DROP MATERIALIZED VIEW IF EXISTS public.community_metrics_daily;
CREATE MATERIALIZED VIEW public.community_metrics_daily AS
SELECT
  c.id AS community_id,
  CURRENT_DATE AS metric_date,
  COUNT(cm.user_id) AS member_count,
  0::bigint AS active_members,
  0::bigint AS competition_entries,
  0::bigint AS marketplace_spend
FROM public.communities c
LEFT JOIN public.community_members cm ON cm.community_id = c.id
GROUP BY c.id;

CREATE UNIQUE INDEX community_metrics_daily_pk
  ON public.community_metrics_daily (community_id, metric_date);

DROP MATERIALIZED VIEW IF EXISTS public.profile_stats_daily;
CREATE MATERIALIZED VIEW public.profile_stats_daily AS
SELECT
  p.user_id,
  CURRENT_DATE AS metric_date,
  p.current_streak,
  p.longest_streak,
  COALESCE((SELECT COUNT(*) FROM public.habits h WHERE h.user_id = p.user_id AND h.is_active = true), 0) AS total_habits,
  COALESCE((SELECT COUNT(*) FROM public.habit_completions hc WHERE hc.user_id = p.user_id AND hc.completion_date = CURRENT_DATE), 0) AS completed_today,
  p.points,
  p.level,
  p.followers_count,
  p.following_count,
  COALESCE((SELECT COUNT(*) FROM public.user_achievements ua WHERE ua.user_id = p.user_id), 0) AS achievements_count
FROM public.profiles p;

CREATE UNIQUE INDEX profile_stats_daily_pk
  ON public.profile_stats_daily (user_id, metric_date);

DROP VIEW IF EXISTS public.point_balances;
CREATE VIEW public.point_balances AS
SELECT
  pt.user_id,
  COALESCE(SUM(pt.amount), 0) AS balance
FROM public.point_transactions pt
GROUP BY pt.user_id;

--------------------------------------------------------------------

-- Refresh new materialized views so consumers read consistent data
REFRESH MATERIALIZED VIEW public.community_metrics_daily;
REFRESH MATERIALIZED VIEW public.profile_stats_daily;
