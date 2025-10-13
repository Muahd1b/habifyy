-- Community friend request RPC plus supporting indexes for scalable social interactions

-- Ensure schema namespace exists for community-specific logic
CREATE SCHEMA IF NOT EXISTS community;

-- De-duplicate existing follower rows before enforcing uniqueness
WITH duplicates AS (
  SELECT
    follower_id,
    following_id,
    MIN(id::text)::uuid AS keep_id,
    ARRAY_REMOVE(ARRAY_AGG(id), MIN(id::text)::uuid) AS duplicate_ids
  FROM public.followers
  GROUP BY follower_id, following_id
  HAVING COUNT(*) > 1
)
DELETE FROM public.followers f
USING duplicates d
WHERE f.follower_id = d.follower_id
  AND f.following_id = d.following_id
  AND f.id = ANY(d.duplicate_ids);

-- Enforce unique follower relationships for deterministic upserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'followers_unique_pair'
  ) THEN
    ALTER TABLE public.followers
    ADD CONSTRAINT followers_unique_pair UNIQUE (follower_id, following_id);
  END IF;
END;
$$;

-- Add indexes regularly used by community queries
CREATE INDEX IF NOT EXISTS friend_requests_recipient_status_idx
  ON public.friend_requests (recipient_id, status);

CREATE INDEX IF NOT EXISTS friend_requests_requester_status_idx
  ON public.friend_requests (requester_id, status);

CREATE INDEX IF NOT EXISTS friendships_user_status_idx
  ON public.friendships (user_id, status);

CREATE INDEX IF NOT EXISTS friendships_friend_status_idx
  ON public.friendships (friend_id, status);

CREATE INDEX IF NOT EXISTS followers_following_idx
  ON public.followers (following_id);

CREATE INDEX IF NOT EXISTS followers_follower_idx
  ON public.followers (follower_id);

-- Centralized friend request handler
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

  IF v_request.recipient_id <> v_auth_user THEN
    RAISE EXCEPTION 'Only the recipient can respond to this friend request';
  END IF;

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

    RETURN jsonb_build_object(
      'status', 'blocked',
      'requestId', request_id
    );
  END IF;
END;
$$;

GRANT USAGE ON SCHEMA community TO authenticated;
GRANT EXECUTE ON FUNCTION community.handle_friend_request(uuid, text) TO authenticated;
