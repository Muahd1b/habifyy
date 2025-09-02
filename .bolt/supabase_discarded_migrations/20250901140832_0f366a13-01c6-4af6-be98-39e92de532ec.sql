-- Fix security issue: Correct privacy_profile logic in RLS policy
-- The current policy is backwards - it shows profiles when privacy_profile = true (private)
-- It should show profiles when privacy_profile = false (public) or when it's the user's own profile

DROP POLICY IF EXISTS "Users can view all public profiles" ON public.profiles;

-- Create correct policy: only show public profiles (privacy_profile = false) or user's own profile
CREATE POLICY "Users can view public profiles and own profile" 
ON public.profiles 
FOR SELECT 
USING (
  (privacy_profile = false) OR (auth.uid() = user_id)
);