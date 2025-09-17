import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  target: number;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitWithProgress extends Habit {
  completed: number;
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  lastCompleted?: Date;
}

export const useHabits = () => {
  const [habits, setHabits] = useState<HabitWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch habits and their completion data
  const fetchHabits = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch user's habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (habitsError) throw habitsError;

      // Fetch today's completions
      const today = new Date().toISOString().split('T')[0];
      const { data: completionsData, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completion_date', today);

      if (completionsError) throw completionsError;

      // Calculate streaks and progress for each habit
      const habitsWithProgress: HabitWithProgress[] = await Promise.all(
        (habitsData || []).map(async (habit) => {
          // Get today's completion
          const todayCompletion = completionsData?.find(c => c.habit_id === habit.id);
          
          // Calculate streak
          const { currentStreak, longestStreak } = await calculateStreak(habit.id);

          return {
            ...habit,
            completed: todayCompletion?.progress || 0,
            currentStreak,
            longestStreak,
            completedToday: (todayCompletion?.progress || 0) >= habit.target,
            lastCompleted: todayCompletion ? new Date(todayCompletion.created_at) : undefined
          };
        })
      );

      setHabits(habitsWithProgress);
    } catch (err) {
      console.error('Error fetching habits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch habits');
      toast({
        title: "Error",
        description: "Failed to load your habits. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate streak for a habit
  const calculateStreak = async (habitId: string) => {
    try {
      const { data: completions, error } = await supabase
        .from('habit_completions')
        .select('completion_date, progress')
        .eq('habit_id', habitId)
        .eq('user_id', user?.id)
        .order('completion_date', { ascending: false });

      if (error) throw error;

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // Get habit target for comparison
      const { data: habitData } = await supabase
        .from('habits')
        .select('target')
        .eq('id', habitId)
        .single();

      const target = habitData?.target || 1;

      if (completions && completions.length > 0) {
        // Check current streak from today backwards
        let currentDate = new Date();
        let foundGap = false;

        for (let i = 0; i < completions.length && !foundGap; i++) {
          const completion = completions[i];
          const completionDate = new Date(completion.completion_date);
          
          if (completion.progress >= target) {
            if (isSameOrConsecutiveDay(completionDate, currentDate)) {
              currentStreak++;
              currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000); // Go back one day
            } else {
              foundGap = true;
            }
          } else {
            foundGap = true;
          }
        }

        // Calculate longest streak
        tempStreak = 0;
        for (const completion of completions) {
          if (completion.progress >= target) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        }
      }

      return { currentStreak, longestStreak };
    } catch (err) {
      console.error('Error calculating streak:', err);
      return { currentStreak: 0, longestStreak: 0 };
    }
  };

  // Helper function to check if dates are same or consecutive
  const isSameOrConsecutiveDay = (date1: Date, date2: Date) => {
    const diff = Math.abs(date1.getTime() - date2.getTime());
    const daysDiff = diff / (1000 * 60 * 60 * 24);
    return daysDiff <= 1;
  };

  // Create a new habit
  const createHabit = async (habitData: Omit<Habit, 'id' | 'user_id' | 'is_active' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          ...habitData,
          user_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Habit "${habitData.name}" created successfully!`,
      });

      // Refresh habits list
      await fetchHabits();
      return data;
    } catch (err) {
      console.error('Error creating habit:', err);
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update habit progress
  const updateHabitProgress = async (habitId: string, progress: number) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Upsert completion record
      const { error } = await supabase
        .from('habit_completions')
        .upsert({
          habit_id: habitId,
          user_id: user.id,
          completion_date: today,
          progress: progress,
          notes: ''
        }, {
          onConflict: 'habit_id,completion_date'
        });

      if (error) throw error;

      // Refresh habits to update streaks
      await fetchHabits();

      toast({
        title: "Progress Updated",
        description: "Your habit progress has been saved.",
      });
    } catch (err) {
      console.error('Error updating progress:', err);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete habit
  const deleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habitId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Habit Deleted",
        description: "Habit has been successfully removed.",
      });

      await fetchHabits();
    } catch (err) {
      console.error('Error deleting habit:', err);
      toast({
        title: "Error",
        description: "Failed to delete habit. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) {
      // If there's no user, ensure we are not stuck in loading state
      setHabits([]);
      setLoading(false);
      return;
    }

    fetchHabits();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('habits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habits',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchHabits();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habit_completions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchHabits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    habits,
    loading,
    error,
    createHabit,
    updateHabitProgress,
    deleteHabit,
    refetchHabits: fetchHabits
  };
};