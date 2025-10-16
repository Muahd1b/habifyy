-- Community invite notification actions and social graph integrations

-- Ensure notifications can be linked to community invites
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS community_invite_id uuid REFERENCES public.community_invites (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS notifications_community_invite_id_idx
  ON public.notifications (community_invite_id);

-- Expand notification types to include community invites
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_notification_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_notification_type_check
  CHECK (
    notification_type = ANY (
      ARRAY[
        'habit_reminder',
        'streak_milestone',
        'streak_risk',
        'habit_completion',
        'friend_request',
        'friend_request_received',
        'friend_request_accepted',
        'friend_request_declined',
        'friend_request_blocked',
        'friend_activity',
        'community_invite',
        'challenge_invitation',
        'competition_update',
        'marketplace_purchase',
        'system_update',
        'security_alert'
      ]
    )
  );

-- Maintain unique community membership pairs so invite acceptance can idempotently add members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'community_members_unique_member'
  ) THEN
    ALTER TABLE public.community_members
      ADD CONSTRAINT community_members_unique_member UNIQUE (community_id, user_id);
  END IF;
END;
$$;

-- Automatically notify invitees when a community invite is created
CREATE OR REPLACE FUNCTION public.create_community_invite_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inviter_profile RECORD;
  v_community RECORD;
  v_inviter_name text;
BEGIN
  SELECT display_name, username
  INTO v_inviter_profile
  FROM public.profiles
  WHERE user_id = NEW.inviter_id;

  SELECT id, name
  INTO v_community
  FROM public.communities
  WHERE id = NEW.community_id;

  v_inviter_name := COALESCE(v_inviter_profile.display_name, v_inviter_profile.username, 'A community member');

  INSERT INTO public.notifications (
    user_id,
    notification_type,
    title,
    message,
    action_data,
    priority,
    community_invite_id
  )
  VALUES (
    NEW.invitee_id,
    'community_invite',
    COALESCE(v_community.name, 'Community invitation'),
    v_inviter_name || ' invited you to join ' || COALESCE(v_community.name, 'their community') || '.',
    jsonb_build_object(
      'invite_id', NEW.id,
      'community_id', NEW.community_id,
      'inviter_id', NEW.inviter_id
    ),
    'medium',
    NEW.id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_invites_create_notification ON public.community_invites;
CREATE TRIGGER community_invites_create_notification
  AFTER INSERT ON public.community_invites
  FOR EACH ROW EXECUTE FUNCTION public.create_community_invite_notification();

-- Backfill notifications for existing pending invites that have not yet generated notifications
INSERT INTO public.notifications (
  user_id,
  notification_type,
  title,
  message,
  action_data,
  priority,
  community_invite_id
)
SELECT
  ci.invitee_id,
  'community_invite',
  COALESCE(c.name, 'Community invitation'),
  COALESCE(p.display_name, p.username, 'A community member') || ' invited you to join ' || COALESCE(c.name, 'their community') || '.',
  jsonb_build_object(
    'invite_id', ci.id,
    'community_id', ci.community_id,
    'inviter_id', ci.inviter_id
  ),
  'medium',
  ci.id
FROM public.community_invites ci
LEFT JOIN public.notifications n
  ON n.community_invite_id = ci.id
  AND n.notification_type = 'community_invite'
LEFT JOIN public.profiles p
  ON p.user_id = ci.inviter_id
LEFT JOIN public.communities c
  ON c.id = ci.community_id
WHERE ci.status = 'pending'
  AND n.id IS NULL;

-- Community invite handler mirrors friend request workflow
CREATE OR REPLACE FUNCTION community.handle_community_invite(
  invite_id uuid,
  action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite community_invites%ROWTYPE;
  v_auth_user uuid := auth.uid();
  v_action text := lower(trim(action));
  v_now timestamptz := timezone('utc', now());
  v_membership_id uuid;
  v_inviter_profile RECORD;
  v_community RECORD;
BEGIN
  IF v_auth_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT *
  INTO v_invite
  FROM public.community_invites
  WHERE id = invite_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Community invite % not found', invite_id;
  END IF;

  IF v_action NOT IN ('accept', 'decline', 'cancel') THEN
    RAISE EXCEPTION 'Unsupported action %', v_action;
  END IF;

  IF v_action = 'cancel' THEN
    IF v_invite.inviter_id <> v_auth_user THEN
      RAISE EXCEPTION 'Only the inviter can cancel this invite';
    END IF;

    DELETE FROM public.community_invites
    WHERE id = invite_id;

    UPDATE public.notifications
      SET is_read = true,
          read_at = v_now,
          archived_at = COALESCE(archived_at, v_now)
    WHERE community_invite_id = invite_id;

    RETURN jsonb_build_object(
      'status', 'cancelled',
      'inviteId', invite_id
    );
  END IF;

  IF v_invite.status <> 'pending' THEN
    RETURN jsonb_build_object(
      'status', v_invite.status,
      'inviteId', invite_id
    );
  END IF;

  IF v_invite.invitee_id <> v_auth_user THEN
    RAISE EXCEPTION 'Only the invitee can respond to this community invite';
  END IF;

  IF v_action = 'accept' THEN
    UPDATE public.community_invites
      SET status = 'accepted',
          updated_at = v_now
    WHERE id = invite_id;

    INSERT INTO public.community_members (community_id, user_id, role, joined_at)
    VALUES (v_invite.community_id, v_invite.invitee_id, 'member', v_now)
    ON CONFLICT (community_id, user_id) DO NOTHING
    RETURNING id INTO v_membership_id;

    IF v_membership_id IS NULL THEN
      UPDATE public.community_members
        SET joined_at = v_now
      WHERE community_id = v_invite.community_id
        AND user_id = v_invite.invitee_id;
    ELSE
      UPDATE public.communities
        SET member_count = COALESCE(member_count, 0) + 1,
            updated_at = v_now
      WHERE id = v_invite.community_id;
    END IF;

    UPDATE public.notifications
      SET is_read = true,
          read_at = v_now,
          archived_at = COALESCE(archived_at, v_now)
    WHERE community_invite_id = invite_id
      AND notification_type = 'community_invite';

    SELECT display_name, username
    INTO v_inviter_profile
    FROM public.profiles
    WHERE user_id = v_invite.inviter_id;

    SELECT id, name
    INTO v_community
    FROM public.communities
    WHERE id = v_invite.community_id;

    INSERT INTO public.notifications (
      user_id,
      notification_type,
      title,
      message,
      priority,
      action_data
    )
    VALUES (
      v_invite.inviter_id,
      'community_invite',
      COALESCE(v_community.name, 'Community update'),
      COALESCE(v_inviter_profile.display_name, v_inviter_profile.username, 'A member') || ' accepted your invitation.',
      'low',
      jsonb_build_object(
        'invite_id', invite_id,
        'community_id', v_invite.community_id,
        'status', 'accepted'
      )
    );

    RETURN jsonb_build_object(
      'status', 'accepted',
      'inviteId', invite_id,
      'communityId', v_invite.community_id
    );
  ELSE
    UPDATE public.community_invites
      SET status = 'declined',
          updated_at = v_now
    WHERE id = invite_id;

    UPDATE public.notifications
      SET is_read = true,
          read_at = v_now,
          archived_at = COALESCE(archived_at, v_now)
    WHERE community_invite_id = invite_id
      AND notification_type = 'community_invite';

    RETURN jsonb_build_object(
      'status', 'declined',
      'inviteId', invite_id
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION community.handle_community_invite(uuid, text) TO authenticated;

-- Allow users to respond to community invites directly from notifications
CREATE OR REPLACE FUNCTION community.respond_to_community_invite_notification(
  notification_id uuid,
  action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification notifications%ROWTYPE;
  v_auth_user uuid := auth.uid();
  v_action text := lower(trim(action));
  v_result jsonb;
BEGIN
  IF v_auth_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT *
  INTO v_notification
  FROM public.notifications
  WHERE id = notification_id
    AND user_id = v_auth_user;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Notification % not found', notification_id;
  END IF;

  IF v_notification.community_invite_id IS NULL THEN
    RAISE EXCEPTION 'Notification is not linked to a community invite';
  END IF;

  IF v_notification.notification_type <> 'community_invite' THEN
    RAISE EXCEPTION 'Notification is not actionable';
  END IF;

  IF v_action NOT IN ('accept', 'decline') THEN
    RAISE EXCEPTION 'Unsupported action %', v_action;
  END IF;

  SELECT community.handle_community_invite(v_notification.community_invite_id, v_action)
  INTO v_result;

  UPDATE public.notifications
    SET is_read = true,
        read_at = now(),
        archived_at = COALESCE(archived_at, now())
  WHERE id = notification_id;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION community.respond_to_community_invite_notification(uuid, text) TO authenticated;
