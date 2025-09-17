-- Create custom quotes table for user-generated quotes
CREATE TABLE public.custom_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  author TEXT,
  category TEXT DEFAULT 'personal',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for custom quotes
CREATE POLICY "Users can view their own custom quotes" 
ON public.custom_quotes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom quotes" 
ON public.custom_quotes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom quotes" 
ON public.custom_quotes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom quotes" 
ON public.custom_quotes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create point transactions table for tracking points history
CREATE TABLE public.point_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earned' or 'spent'
  source TEXT NOT NULL, -- 'habit_completion', 'streak_milestone', 'achievement', 'purchase', etc.
  source_id UUID, -- Reference to the source (habit_id, achievement_id, etc.)
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for point transactions
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own point transactions" 
ON public.point_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own point transactions" 
ON public.point_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create user locations table for map functionality
CREATE TABLE public.user_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_name TEXT,
  is_visible BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user locations
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own location" 
ON public.user_locations 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view visible locations of others" 
ON public.user_locations 
FOR SELECT 
USING (is_visible = true OR auth.uid() = user_id);

-- Update profiles table to be viewable by others (for community features)
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;

CREATE POLICY "Users can view public profiles" 
ON public.profiles 
FOR SELECT 
USING (privacy_profile = false OR auth.uid() = user_id);

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update activity feed to be more social
DROP POLICY IF EXISTS "Users can view own activities only" ON public.activity_feed;

CREATE POLICY "Users can view public activities" 
ON public.activity_feed 
FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_custom_quotes_updated_at
BEFORE UPDATE ON public.custom_quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_locations_updated_at
BEFORE UPDATE ON public.user_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();