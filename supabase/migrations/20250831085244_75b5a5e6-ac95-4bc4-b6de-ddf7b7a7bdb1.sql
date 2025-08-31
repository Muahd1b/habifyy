-- Create followers table for non-mutual social connections
CREATE TABLE public.followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Create policies for followers
CREATE POLICY "Users can follow others" 
ON public.followers 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" 
ON public.followers 
FOR DELETE 
USING (auth.uid() = follower_id);

CREATE POLICY "Users can view all follower relationships" 
ON public.followers 
FOR SELECT 
USING (true);

-- Create social_links table for external social media profiles
CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_name TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Create policies for social_links
CREATE POLICY "Users can manage own social links" 
ON public.social_links 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all social links" 
ON public.social_links 
FOR SELECT 
USING (true);

-- Create user_records table for personal bests
CREATE TABLE public.user_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  record_type TEXT NOT NULL, -- 'longest_streak', 'best_week', 'best_month', etc.
  record_value INTEGER NOT NULL,
  habit_id UUID,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_records ENABLE ROW LEVEL SECURITY;

-- Create policies for user_records
CREATE POLICY "Users can manage own records" 
ON public.user_records 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all records" 
ON public.user_records 
FOR SELECT 
USING (true);

-- Extend profiles table with additional fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'default';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Add triggers for updated_at
CREATE TRIGGER update_social_links_updated_at
BEFORE UPDATE ON public.social_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_followers_follower_id ON public.followers(follower_id);
CREATE INDEX idx_followers_following_id ON public.followers(following_id);
CREATE INDEX idx_social_links_user_id ON public.social_links(user_id);
CREATE INDEX idx_user_records_user_id ON public.user_records(user_id);
CREATE INDEX idx_user_records_category ON public.user_records(category);