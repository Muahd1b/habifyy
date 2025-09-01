import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const { action, data } = await req.json();
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

async function createHabitReminder(supabase: any, data: any) {
  const { user_id, habit_name, streak_count } = data;

  const notification = {
    user_id,
    notification_type: 'habit_reminder',
    title: `Time for ${habit_name}!`,
    message: `Don't forget to complete your ${habit_name} habit today. You're on a ${streak_count} day streak!`,
    action_data: { habit_id: data.habit_id, action: 'complete' },
    priority: 'medium'
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

async function createStreakMilestone(supabase: any, data: any) {
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
    priority: milestone >= 30 ? 'high' : 'medium'
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

async function createFriendActivity(supabase: any, data: any) {
  const { user_id, friend_name, habit_name, streak_count } = data;

  const notification = {
    user_id,
    notification_type: 'friend_activity',
    title: 'Friend Achievement',
    message: `${friend_name} just completed their ${habit_name} habit! They're on a ${streak_count} day streak.`,
    action_data: { friend_id: data.friend_id, habit_id: data.habit_id },
    priority: 'low'
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

async function createSampleNotifications(supabase: any, data: any) {
  const { user_id } = data;

  const sampleNotifications = [
    {
      user_id,
      notification_type: 'streak_milestone',
      title: '7-Day Streak! ⭐',
      message: 'Amazing! You\'ve maintained your meditation habit for a full week. You\'re building real momentum!',
      action_data: { habit_id: 'sample-habit-1', milestone: 7 },
      priority: 'medium'
    },
    {
      user_id,
      notification_type: 'habit_reminder',
      title: 'Time for your evening workout! 💪',
      message: 'Don\'t forget to complete your workout habit today. You\'re on a 12 day streak!',
      action_data: { habit_id: 'sample-habit-2', action: 'complete' },
      priority: 'medium'
    },
    {
      user_id,
      notification_type: 'friend_activity',
      title: 'Friend Achievement',
      message: 'Sarah just completed their reading habit! They\'re on a 15 day streak.',
      action_data: { friend_id: 'sample-friend', habit_id: 'sample-habit-3' },
      priority: 'low'
    },
    {
      user_id,
      notification_type: 'competition_update',
      title: 'Competition Update',
      message: 'Your ranking in "30-Day Meditation Challenge" has improved! You\'re now in position 3.',
      action_data: { competition_id: 'sample-competition', rank: 3 },
      priority: 'medium'
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