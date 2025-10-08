-- Add archived flag to notifications table
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;

-- Ensure existing rows have an explicit value
UPDATE public.notifications
SET is_archived = COALESCE(is_archived, false)
WHERE is_archived IS NULL;
