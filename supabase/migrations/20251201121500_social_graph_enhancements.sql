-- Social graph enhancements aligned with connection design best practices

-- Ensure followers table tracks timestamps and can be indexed efficiently
ALTER TABLE public.followers
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.followers
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_followers_updated_at ON public.followers;
CREATE TRIGGER update_followers_updated_at
  BEFORE UPDATE ON public.followers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Maintain derived follower/following counts on profiles
CREATE OR REPLACE FUNCTION public.sync_profile_follow_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
      SET followers_count = followers_count + 1,
          updated_at = now()
    WHERE user_id = NEW.following_id;

    UPDATE public.profiles
      SET following_count = following_count + 1,
          updated_at = now()
    WHERE user_id = NEW.follower_id;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
      SET followers_count = GREATEST(followers_count - 1, 0),
          updated_at = now()
    WHERE user_id = OLD.following_id;

    UPDATE public.profiles
      SET following_count = GREATEST(following_count - 1, 0),
          updated_at = now()
    WHERE user_id = OLD.follower_id;

    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle reassignment defensively
    IF NEW.following_id <> OLD.following_id THEN
      UPDATE public.profiles
        SET followers_count = GREATEST(followers_count - 1, 0),
            updated_at = now()
      WHERE user_id = OLD.following_id;

      UPDATE public.profiles
        SET followers_count = followers_count + 1,
            updated_at = now()
      WHERE user_id = NEW.following_id;
    END IF;

    IF NEW.follower_id <> OLD.follower_id THEN
      UPDATE public.profiles
        SET following_count = GREATEST(following_count - 1, 0),
            updated_at = now()
      WHERE user_id = OLD.follower_id;

      UPDATE public.profiles
        SET following_count = following_count + 1,
            updated_at = now()
      WHERE user_id = NEW.follower_id;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_follow_counts_trigger ON public.followers;
CREATE TRIGGER sync_profile_follow_counts_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.followers
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_follow_counts();

-- Backfill counters to ensure consistency with existing data
WITH follower_totals AS (
  SELECT following_id AS user_id, COUNT(*)::integer AS followers
  FROM public.followers
  GROUP BY following_id
),
following_totals AS (
  SELECT follower_id AS user_id, COUNT(*)::integer AS following
  FROM public.followers
  GROUP BY follower_id
)
UPDATE public.profiles p
SET
  followers_count = COALESCE(follower_totals.followers, 0),
  following_count = COALESCE(following_totals.following, 0),
  updated_at = now()
FROM follower_totals
FULL OUTER JOIN following_totals USING (user_id)
WHERE p.user_id = COALESCE(follower_totals.user_id, following_totals.user_id);

-- Provide a read-friendly view of the follow graph for analytics and suggestions
DROP VIEW IF EXISTS public.follow_network CASCADE;
CREATE VIEW public.follow_network
WITH (security_invoker = true)
AS
SELECT
  f.id,
  f.follower_id,
  f.following_id,
  f.created_at,
  f.updated_at
FROM public.followers f;

GRANT SELECT ON public.follow_network TO authenticated;
