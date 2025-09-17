-- Security Fix: Restrict access to sensitive user data
-- Replace overly permissive RLS policies with privacy-focused ones

-- 1. Fix Social Links - Only show to profile owners
DROP POLICY IF EXISTS "Users can view all social links" ON public.social_links;
CREATE POLICY "Users can view own social links" 
ON public.social_links 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Fix User Records - Only show to record owners
DROP POLICY IF EXISTS "Users can view all records" ON public.user_records;
CREATE POLICY "Users can view own records" 
ON public.user_records 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Fix User Achievements - Only show to achievement owners
DROP POLICY IF EXISTS "Users can view all user achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Fix Competition Participants - Only show to participants of the same competition
DROP POLICY IF EXISTS "Users can view competition participants" ON public.competition_participants;
CREATE POLICY "Users can view participants in their competitions" 
ON public.competition_participants 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.competition_participants cp2 
    WHERE cp2.competition_id = competition_participants.competition_id
  )
);

-- 5. Restrict Activity Feed - Remove access to all public activities
DROP POLICY IF EXISTS "Users can view public activities and own activities" ON public.activity_feed;
CREATE POLICY "Users can view own activities only" 
ON public.activity_feed 
FOR SELECT 
USING (auth.uid() = user_id);

-- 6. Harden Database Functions - Fix search_path security
DROP FUNCTION IF EXISTS public.handle_new_user();
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

-- 7. Add privacy controls to profiles - Make profiles private by default
DROP POLICY IF EXISTS "Users can view public profiles and own profile" ON public.profiles;
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 8. Restrict follower relationships - Only show to involved users
DROP POLICY IF EXISTS "Users can view all follower relationships" ON public.followers;
CREATE POLICY "Users can view own follower relationships" 
ON public.followers 
FOR SELECT 
USING (auth.uid() = follower_id OR auth.uid() = following_id);