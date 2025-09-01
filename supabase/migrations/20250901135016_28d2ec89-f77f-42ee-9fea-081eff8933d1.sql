-- Fix security issue: Update functions to have proper search_path
DROP FUNCTION IF EXISTS public.handle_notification_preferences();
DROP FUNCTION IF EXISTS public.update_notification_updated_at();

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.handle_notification_preferences()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create function to update updated_at column with proper search_path
CREATE OR REPLACE FUNCTION public.update_notification_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;