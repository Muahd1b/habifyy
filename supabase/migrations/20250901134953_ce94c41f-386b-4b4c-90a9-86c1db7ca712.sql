-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'habit_reminder', 'streak_milestone', 'streak_risk', 'habit_completion',
    'friend_request', 'friend_activity', 'challenge_invitation', 'competition_update',
    'marketplace_purchase', 'system_update', 'security_alert'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_data JSONB,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_read BOOLEAN DEFAULT FALSE,
  is_delivered BOOLEAN DEFAULT FALSE,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  habit_reminders BOOLEAN DEFAULT TRUE,
  streak_milestones BOOLEAN DEFAULT TRUE,
  friend_activities BOOLEAN DEFAULT TRUE,
  competition_updates BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification templates table
CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key VARCHAR(100) UNIQUE NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  action_data_schema JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for notification preferences
CREATE POLICY "Users can view their own preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for notification templates (read-only for users)
CREATE POLICY "Users can view notification templates"
  ON public.notification_templates FOR SELECT
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_scheduled_time ON public.notifications(scheduled_time) WHERE scheduled_time IS NOT NULL;

-- Create function to auto-create notification preferences for new users
CREATE OR REPLACE FUNCTION public.handle_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-creating notification preferences
CREATE TRIGGER on_auth_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_notification_preferences();

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_notification_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_notification_updated_at();

-- Insert default notification templates
INSERT INTO public.notification_templates (template_key, title_template, message_template, action_data_schema) VALUES
('habit_reminder', 'Time for {{habit_name}}!', 'Don''t forget to complete your {{habit_name}} habit today. You''re on a {{streak_count}} day streak!', '{"habit_id": "uuid", "action": "complete"}'),
('streak_milestone_3', '3-Day Streak! 🔥', 'Congratulations! You''ve completed {{habit_name}} for 3 days in a row. Keep it up!', '{"habit_id": "uuid", "milestone": 3}'),
('streak_milestone_7', 'One Week Strong! ⭐', 'Amazing! You''ve maintained your {{habit_name}} habit for a full week. You''re building real momentum!', '{"habit_id": "uuid", "milestone": 7}'),
('streak_milestone_30', 'Month Master! 🏆', 'Incredible! 30 days of {{habit_name}} - you''re officially building a lasting habit!', '{"habit_id": "uuid", "milestone": 30}'),
('streak_risk', 'Don''t Break Your Streak!', 'You have {{hours_left}} hours left to complete {{habit_name}} and maintain your {{streak_count}} day streak!', '{"habit_id": "uuid", "streak_count": "number"}'),
('friend_request', 'New Friend Request', '{{sender_name}} wants to connect with you on Habify!', '{"sender_id": "uuid", "action": "accept_decline"}'),
('friend_activity', 'Friend Achievement', '{{friend_name}} just completed their {{habit_name}} habit! They''re on a {{streak_count}} day streak.', '{"friend_id": "uuid", "habit_id": "uuid"}'),
('competition_update', 'Competition Update', 'Your ranking in "{{competition_name}}" has changed! You''re now in position {{rank}}.', '{"competition_id": "uuid", "rank": "number"}')