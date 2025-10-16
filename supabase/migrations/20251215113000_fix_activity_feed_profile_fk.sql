-- Align activity_feed foreign key to profiles for embedding support
ALTER TABLE public.activity_feed
  DROP CONSTRAINT IF EXISTS activity_feed_user_id_fkey;

ALTER TABLE public.activity_feed
  ADD CONSTRAINT activity_feed_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles (user_id)
  ON DELETE CASCADE;
