/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

interface HabitReminderPayload {
  user_id: string;
  habit_id?: string;
  habit_name: string;
  streak_count: number;
}

interface StreakMilestonePayload {
  user_id: string;
  habit_id?: string;
  habit_name: string;
  milestone: number;
}

interface FriendActivityPayload {
  user_id: string;
  habit_id?: string;
  friend_id: string;
  friend_name: string;
  habit_name: string;
  streak_count: number;
}

interface SampleNotificationPayload {
  user_id: string;
}

type NotificationRequest =
  | { action: 'create_habit_reminder'; data: HabitReminderPayload }
  | { action: 'create_streak_milestone'; data: StreakMilestonePayload }
  | { action: 'create_friend_activity'; data: FriendActivityPayload }
  | { action: 'create_sample_notifications'; data: SampleNotificationPayload };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data } = await req.json() as NotificationRequest;
    console.log('Processing notification action:', action, data);

    switch (action) {
      case 'create_habit_reminder':
        return await createHabitReminder(supabaseClient, data);
      
      case 'create_streak_milestone':
        return await createStreakMilestone(supabaseClient, data);
      
      case 'create_friend_activity':
        return await createFriendActivity(supabaseClient, data);
      
      case 'create_sample_notifications':
        return await createSampleNotifications(supabaseClient, data);
      
      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in notification processor:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createHabitReminder(supabase: SupabaseClient, data: HabitReminderPayload) {
  const { user_id, habit_name, streak_count } = data;

  const notification = {
    user_id,
    notification_type: 'habit_reminder',
    title: `Time for ${habit_name}!`,
    message: `Don't forget to complete your ${habit_name} habit today. You're on a ${streak_count} day streak!`,
    action_data: { habit_id: data.habit_id, action: 'complete' },
    priority: 'medium' as NotificationPriority
  };

  const { data: result, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ success: true, notification: result }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createStreakMilestone(supabase: SupabaseClient, data: StreakMilestonePayload) {
  const { user_id, habit_name, milestone } = data;

  let title, message;
  if (milestone === 3) {
    title = '3-Day Streak! 🔥';
    message = `Congratulations! You've completed ${habit_name} for 3 days in a row. Keep it up!`;
  } else if (milestone === 7) {
    title = 'One Week Strong! ⭐';
    message = `Amazing! You've maintained your ${habit_name} habit for a full week. You're building real momentum!`;
  } else if (milestone === 30) {
    title = 'Month Master! 🏆';
    message = `Incredible! 30 days of ${habit_name} - you're officially building a lasting habit!`;
  } else {
    title = `${milestone}-Day Streak!`;
    message = `Fantastic! You've kept up ${habit_name} for ${milestone} days straight!`;
  }

  const notification = {
    user_id,
    notification_type: 'streak_milestone',
    title,
    message,
    action_data: { habit_id: data.habit_id, milestone },
    priority: (milestone >= 30 ? 'high' : 'medium') as NotificationPriority
  };

  const { data: result, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ success: true, notification: result }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createFriendActivity(supabase: SupabaseClient, data: FriendActivityPayload) {
  const { user_id, friend_name, habit_name, streak_count } = data;

  const notification = {
    user_id,
    notification_type: 'friend_activity',
    title: 'Friend Achievement',
    message: `${friend_name} just completed their ${habit_name} habit! They're on a ${streak_count} day streak.`,
    action_data: { friend_id: data.friend_id, habit_id: data.habit_id },
    priority: 'low' as NotificationPriority
  };

  const { data: result, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ success: true, notification: result }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createSampleNotifications(supabase: SupabaseClient, data: SampleNotificationPayload) {
  const { user_id } = data;

  const sampleNotifications = [
    {
      user_id,
      notification_type: 'streak_milestone',
      title: '7-Day Streak! ⭐',
      message: 'Amazing! You\'ve maintained your meditation habit for a full week. You\'re building real momentum!',
      action_data: { habit_id: 'sample-habit-1', milestone: 7 },
      priority: 'medium' as NotificationPriority
    },
    {
      user_id,
      notification_type: 'habit_reminder',
      title: 'Time for your evening workout! 💪',
      message: 'Don\'t forget to complete your workout habit today. You\'re on a 12 day streak!',
      action_data: { habit_id: 'sample-habit-2', action: 'complete' },
      priority: 'medium' as NotificationPriority
    },
    {
      user_id,
      notification_type: 'friend_activity',
      title: 'Friend Achievement',
      message: 'Sarah just completed their reading habit! They\'re on a 15 day streak.',
      action_data: { friend_id: 'sample-friend', habit_id: 'sample-habit-3' },
      priority: 'low' as NotificationPriority
    },
    {
      user_id,
      notification_type: 'competition_update',
      title: 'Competition Update',
      message: 'Your ranking in "30-Day Meditation Challenge" has improved! You\'re now in position 3.',
      action_data: { competition_id: 'sample-competition', rank: 3 },
      priority: 'medium' as NotificationPriority
    }
  ];

  const { data: results, error } = await supabase
    .from('notifications')
    .insert(sampleNotifications)
    .select();

  if (error) throw error;

  return new Response(JSON.stringify({ success: true, notifications: results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
