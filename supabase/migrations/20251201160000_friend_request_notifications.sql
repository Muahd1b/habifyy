-- Friend request notifications and actionable responses

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS friend_request_id uuid REFERENCES public.friend_requests (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS notifications_friend_request_id_idx
  ON public.notifications (friend_request_id);

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
        'challenge_invitation',
        'competition_update',
        'marketplace_purchase',
        'system_update',
        'security_alert'
      ]
    )
  );

CREATE OR REPLACE FUNCTION public.create_friend_request_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requester_profile RECORD;
  v_display_name text;
BEGIN
  SELECT display_name, username
  INTO v_requester_profile
  FROM public.profiles
  WHERE user_id = NEW.requester_id;

  v_display_name := COALESCE(v_requester_profile.display_name, v_requester_profile.username, 'A new user');

  INSERT INTO public.notifications (
    user_id,
    notification_type,
    title,
    message,
    action_data,
    priority,
    friend_request_id
  )
  VALUES (
    NEW.recipient_id,
    'friend_request_received',
    'New friend request',
    v_display_name || ' wants to connect with you.',
    jsonb_build_object(
      'request_id', NEW.id,
      'requester_id', NEW.requester_id
    ),
    'medium',
    NEW.id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS friend_requests_create_notification ON public.friend_requests;
CREATE TRIGGER friend_requests_create_notification
  AFTER INSERT ON public.friend_requests
  FOR EACH ROW EXECUTE FUNCTION public.create_friend_request_notification();

INSERT INTO public.notifications (
  user_id,
  notification_type,
  title,
  message,
  action_data,
  priority,
  friend_request_id
)
SELECT
  fr.recipient_id,
  'friend_request_received',
  'New friend request',
  COALESCE(p.display_name, p.username, 'A new user') || ' wants to connect with you.',
  jsonb_build_object(
    'request_id', fr.id,
    'requester_id', fr.requester_id
  ),
  'medium',
  fr.id
FROM public.friend_requests fr
LEFT JOIN public.notifications n
  ON n.friend_request_id = fr.id
  AND n.notification_type = 'friend_request_received'
LEFT JOIN public.profiles p
  ON p.user_id = fr.requester_id
WHERE fr.status = 'pending'
  AND n.id IS NULL;

CREATE OR REPLACE FUNCTION community.handle_friend_request(
  request_id uuid,
  action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request friend_requests%ROWTYPE;
  v_auth_user uuid := auth.uid();
  v_now timestamptz := timezone('utc', now());
  v_action text := lower(trim(action));
  v_friendship_ids uuid[];
  v_requester_profile RECORD;
  v_recipient_profile RECORD;
BEGIN
  IF v_auth_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT *
  INTO v_request
  FROM friend_requests
  WHERE id = request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request % not found', request_id;
  END IF;

  IF v_action NOT IN ('accept', 'decline', 'block', 'cancel') THEN
    RAISE EXCEPTION 'Unsupported action %', v_action;
  END IF;

  IF v_action = 'cancel' THEN
    IF v_request.requester_id <> v_auth_user THEN
      RAISE EXCEPTION 'Only the requester can cancel this friend request';
    END IF;

    DELETE FROM friend_requests
    WHERE id = request_id;

    UPDATE public.notifications
      SET is_read = true, read_at = v_now, archived_at = COALESCE(archived_at, v_now)
      WHERE friend_request_id = request_id;

    RETURN jsonb_build_object(
      'status', 'cancelled',
      'requestId', request_id
    );
  END IF;

  IF v_request.status <> 'pending' THEN
    RETURN jsonb_build_object(
      'status', v_request.status,
      'requestId', request_id
    );
  END IF;

  IF v_request.recipient_id <> v_auth_user AND v_request.requester_id <> v_auth_user THEN
    RAISE EXCEPTION 'Not authorized to update this friend request';
  END IF;

  SELECT display_name, username INTO v_requester_profile
  FROM public.profiles
  WHERE user_id = v_request.requester_id;

  SELECT display_name, username INTO v_recipient_profile
  FROM public.profiles
  WHERE user_id = v_request.recipient_id;

  IF v_action = 'accept' THEN
    UPDATE friend_requests
    SET status = 'accepted',
        responded_at = v_now,
        updated_at = v_now
    WHERE id = request_id;

    INSERT INTO friendships (user_id, friend_id, source_request_id, status, created_at, updated_at)
    VALUES
      (v_request.requester_id, v_request.recipient_id, v_request.id, 'active', v_now, v_now),
      (v_request.recipient_id, v_request.requester_id, v_request.id, 'active', v_now, v_now)
    ON CONFLICT (user_id, friend_id) DO UPDATE
      SET status = 'active',
          source_request_id = EXCLUDED.source_request_id,
          updated_at = EXCLUDED.updated_at;

    INSERT INTO followers (follower_id, following_id, created_at)
    VALUES (v_request.requester_id, v_request.recipient_id, v_now)
    ON CONFLICT (follower_id, following_id) DO NOTHING;

    INSERT INTO followers (follower_id, following_id, created_at)
    VALUES (v_request.recipient_id, v_request.requester_id, v_now)
    ON CONFLICT (follower_id, following_id) DO NOTHING;

    SELECT coalesce(array_agg(id), ARRAY[]::uuid[])
    INTO v_friendship_ids
    FROM friendships
    WHERE source_request_id = v_request.id;

    UPDATE public.notifications
      SET is_read = true, read_at = v_now, archived_at = COALESCE(archived_at, v_now)
      WHERE friend_request_id = request_id
        AND notification_type = 'friend_request_received';

    INSERT INTO public.notifications (
      user_id,
      notification_type,
      title,
      message,
      action_data,
      priority,
      friend_request_id
    )
    VALUES (
      v_request.requester_id,
      'friend_request_accepted',
      'Friend request accepted',
      COALESCE(v_recipient_profile.display_name, v_recipient_profile.username, 'Your friend') || ' accepted your friend request.',
      jsonb_build_object(
        'request_id', v_request.id,
        'recipient_id', v_request.recipient_id
      ),
      'medium',
      v_request.id
    );

    RETURN jsonb_build_object(
      'status', 'accepted',
      'requestId', request_id,
      'friendshipIds', v_friendship_ids
    );
  ELSIF v_action = 'decline' THEN
    UPDATE friend_requests
    SET status = 'declined',
        responded_at = v_now,
        updated_at = v_now
    WHERE id = request_id;

    UPDATE public.notifications
      SET is_read = true, read_at = v_now, archived_at = COALESCE(archived_at, v_now)
      WHERE friend_request_id = request_id
        AND notification_type = 'friend_request_received';

    INSERT INTO public.notifications (
      user_id,
      notification_type,
      title,
      message,
      action_data,
      priority,
      friend_request_id
    )
    VALUES (
      v_request.requester_id,
      'friend_request_declined',
      'Friend request declined',
      COALESCE(v_recipient_profile.display_name, v_recipient_profile.username, 'The recipient') || ' declined your friend request.',
      jsonb_build_object(
        'request_id', v_request.id,
        'recipient_id', v_request.recipient_id
      ),
      'low',
      v_request.id
    );

    RETURN jsonb_build_object(
      'status', 'declined',
      'requestId', request_id
    );
  ELSE
    UPDATE friend_requests
    SET status = 'blocked',
        responded_at = v_now,
        updated_at = v_now
    WHERE id = request_id;

    UPDATE friendships
    SET status = 'blocked',
        updated_at = v_now
    WHERE (user_id = v_request.requester_id AND friend_id = v_request.recipient_id)
       OR (user_id = v_request.recipient_id AND friend_id = v_request.requester_id);

    DELETE FROM followers
    WHERE (follower_id = v_request.requester_id AND following_id = v_request.recipient_id)
       OR (follower_id = v_request.recipient_id AND following_id = v_request.requester_id);

    UPDATE public.notifications
      SET is_read = true, read_at = v_now, archived_at = COALESCE(archived_at, v_now)
      WHERE friend_request_id = request_id
        AND notification_type = 'friend_request_received';

    INSERT INTO public.notifications (
      user_id,
      notification_type,
      title,
      message,
      action_data,
      priority,
      friend_request_id
    )
    VALUES (
      v_request.requester_id,
      'friend_request_blocked',
      'Friend request blocked',
      COALESCE(v_recipient_profile.display_name, v_recipient_profile.username, 'The recipient') || ' blocked your friend request.',
      jsonb_build_object(
        'request_id', v_request.id,
        'recipient_id', v_request.recipient_id
      ),
      'medium',
      v_request.id
    );

    RETURN jsonb_build_object(
      'status', 'blocked',
      'requestId', request_id
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION community.respond_to_friend_request_notification(
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

  IF v_notification.friend_request_id IS NULL THEN
    RAISE EXCEPTION 'Notification is not linked to a friend request';
  END IF;

  IF v_notification.notification_type <> 'friend_request_received' THEN
    RAISE EXCEPTION 'Notification is not actionable';
  END IF;

  IF v_action NOT IN ('accept', 'decline', 'block') THEN
    RAISE EXCEPTION 'Unsupported action %', v_action;
  END IF;

  SELECT community.handle_friend_request(v_notification.friend_request_id, v_action)
  INTO v_result;

  UPDATE public.notifications
    SET is_read = true,
        read_at = now(),
        archived_at = COALESCE(archived_at, now())
  WHERE id = notification_id;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION community.respond_to_friend_request_notification(uuid, text) TO authenticated;
