-- Fix the security warning by setting search_path on the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    display_name,
    points,
    level,
    theme,
    privacy_profile,
    privacy_location,
    is_verified
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User'),
    0,
    1,
    'default',
    true,
    true,
    false
  );
  
  RETURN NEW;
END;
$$;