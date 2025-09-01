import { supabase } from '@/integrations/supabase/client';

export const createSampleNotifications = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('notification-processor', {
      body: {
        action: 'create_sample_notifications',
        data: {
          user_id: 'current-user' // This will be handled by RLS
        }
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating sample notifications:', error);
    throw error;
  }
};

export const createHabitReminder = async (habitId: string, habitName: string, streakCount: number) => {
  try {
    const { data, error } = await supabase.functions.invoke('notification-processor', {
      body: {
        action: 'create_habit_reminder',
        data: {
          habit_id: habitId,
          habit_name: habitName,
          streak_count: streakCount
        }
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating habit reminder:', error);
    throw error;
  }
};

export const createStreakMilestone = async (habitId: string, habitName: string, milestone: number) => {
  try {
    const { data, error } = await supabase.functions.invoke('notification-processor', {
      body: {
        action: 'create_streak_milestone',
        data: {
          habit_id: habitId,
          habit_name: habitName,
          milestone
        }
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating streak milestone:', error);
    throw error;
  }
};