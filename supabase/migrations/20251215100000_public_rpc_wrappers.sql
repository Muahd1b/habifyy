-- Public schema wrappers for community RPCs to ensure REST exposure

CREATE OR REPLACE FUNCTION public.handle_friend_request(
  request_id uuid,
  action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN community.handle_friend_request(request_id, action);
END;
$$;

GRANT EXECUTE ON FUNCTION public.handle_friend_request(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.respond_to_friend_request_notification(
  notification_id uuid,
  action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN community.respond_to_friend_request_notification(notification_id, action);
END;
$$;

GRANT EXECUTE ON FUNCTION public.respond_to_friend_request_notification(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_community_invite(
  invite_id uuid,
  action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN community.handle_community_invite(invite_id, action);
END;
$$;

GRANT EXECUTE ON FUNCTION public.handle_community_invite(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.respond_to_community_invite_notification(
  notification_id uuid,
  action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN community.respond_to_community_invite_notification(notification_id, action);
END;
$$;

GRANT EXECUTE ON FUNCTION public.respond_to_community_invite_notification(uuid, text) TO authenticated;

-- Backwards-compatible aliases matching previous REST paths
CREATE OR REPLACE FUNCTION public."community.handle_friend_request"(
  request_id uuid,
  action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.handle_friend_request(request_id, action);
END;
$$;

GRANT EXECUTE ON FUNCTION public."community.handle_friend_request"(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public."community.respond_to_friend_request_notification"(
  notification_id uuid,
  action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.respond_to_friend_request_notification(notification_id, action);
END;
$$;

GRANT EXECUTE ON FUNCTION public."community.respond_to_friend_request_notification"(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public."community.handle_community_invite"(
  invite_id uuid,
  action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.handle_community_invite(invite_id, action);
END;
$$;

GRANT EXECUTE ON FUNCTION public."community.handle_community_invite"(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public."community.respond_to_community_invite_notification"(
  notification_id uuid,
  action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.respond_to_community_invite_notification(notification_id, action);
END;
$$;

GRANT EXECUTE ON FUNCTION public."community.respond_to_community_invite_notification"(uuid, text) TO authenticated;
