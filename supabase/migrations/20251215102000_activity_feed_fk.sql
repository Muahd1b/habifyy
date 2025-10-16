-- Ensure activity_feed rows can join to profile data for social surfaces

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activity_feed_user_id_fkey'
  ) THEN
    ALTER TABLE public.activity_feed
      ADD CONSTRAINT activity_feed_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.profiles (user_id)
      ON DELETE CASCADE;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS activity_feed_user_id_idx
  ON public.activity_feed (user_id);
