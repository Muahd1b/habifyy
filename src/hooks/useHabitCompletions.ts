import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completion_date: string;
  progress: number;
  notes?: string;
  created_at: string;
}

export interface DayHabitData {
  habitId: string;
  progress: number;
  notes?: string;
  completed: boolean;
}

export const useHabitCompletions = () => {
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch completions for a specific date range
  const fetchCompletions = async (startDate?: string, endDate?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completion_date', { ascending: false });

      if (startDate) {
        query = query.gte('completion_date', startDate);
      }
      
      if (endDate) {
        query = query.lte('completion_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      setCompletions(data || []);
    } catch (err) {
      console.error('Error fetching completions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch completions');
    } finally {
      setLoading(false);
    }
  };

  // Get completions for a specific date
  const getCompletionsForDate = (date: string): HabitCompletion[] => {
    return completions.filter(completion => completion.completion_date === date);
  };

  // Get completion for a specific habit on a specific date
  const getHabitCompletionForDate = (habitId: string, date: string): HabitCompletion | undefined => {
    return completions.find(
      completion => completion.habit_id === habitId && completion.completion_date === date
    );
  };

  // Update or create a habit completion
  const updateHabitCompletion = async (
    habitId: string, 
    date: string, 
    progress: number, 
    notes?: string
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habit_completions')
        .upsert({
          habit_id: habitId,
          user_id: user.id,
          completion_date: date,
          progress: Math.max(0, progress),
          notes: notes || ''
        }, {
          onConflict: 'habit_id,completion_date'
        });

      if (error) throw error;

      // Refresh completions
      await fetchCompletions();

      return true;
    } catch (err) {
      console.error('Error updating completion:', err);
      toast({
        title: "Error",
        description: "Failed to update habit completion. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete a habit completion
  const deleteHabitCompletion = async (habitId: string, date: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .eq('completion_date', date);

      if (error) throw error;

      // Refresh completions
      await fetchCompletions();

      return true;
    } catch (err) {
      console.error('Error deleting completion:', err);
      toast({
        title: "Error",
        description: "Failed to delete habit completion. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Mark all habits complete for a specific date
  const markAllHabitsComplete = async (habitIds: string[], date: string, targets: Record<string, number>) => {
    if (!user) return;

    try {
      const completionPromises = habitIds.map(habitId =>
        updateHabitCompletion(habitId, date, targets[habitId] || 1)
      );

      await Promise.all(completionPromises);

      toast({
        title: "Success",
        description: "All habits marked as complete for this day!",
      });
    } catch (err) {
      console.error('Error marking all complete:', err);
      toast({
        title: "Error",
        description: "Failed to mark all habits complete. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Copy completions from one date to another
  const copyCompletionsFromDate = async (fromDate: string, toDate: string) => {
    if (!user) return;

    try {
      const sourceCompletions = getCompletionsForDate(fromDate);
      
      if (sourceCompletions.length === 0) {
        toast({
          title: "No Data",
          description: "No completions found for the selected date.",
          variant: "destructive",
        });
        return;
      }

      const copyPromises = sourceCompletions.map(completion =>
        updateHabitCompletion(completion.habit_id, toDate, completion.progress, completion.notes)
      );

      await Promise.all(copyPromises);

      toast({
        title: "Success",
        description: `Copied ${sourceCompletions.length} habit completions!`,
      });
    } catch (err) {
      console.error('Error copying completions:', err);
      toast({
        title: "Error",
        description: "Failed to copy completions. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get habit completion statistics
  const getCompletionStats = (habitId: string, target: number = 1, days: number = 30) => {
    const safeTarget = Math.max(target, 1);
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);

    const habitCompletions = completions.filter((completion) => {
      if (completion.habit_id !== habitId) return false;
      const completionDate = new Date(completion.completion_date);
      return completionDate >= startDate && completionDate <= endDate;
    });

    const totalDays = days;
    const progressByDate = new Map<string, number>();
    habitCompletions.forEach((completion) => {
      progressByDate.set(completion.completion_date, completion.progress);
    });

    const isDayComplete = (dateKey: string) =>
      (progressByDate.get(dateKey) ?? 0) >= safeTarget;

    let completedDays = 0;
    let sumProgressRatio = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let runningStreak = 0;

    for (let i = 0; i < totalDays; i++) {
      const dateKey = format(subDays(endDate, i), 'yyyy-MM-dd');
      const progress = progressByDate.get(dateKey) ?? 0;
      const progressRatio = Math.min(progress / safeTarget, 1);

      if (isDayComplete(dateKey)) {
        completedDays += 1;
        runningStreak += 1;
        if (i === 0) {
          currentStreak = runningStreak;
        }
      } else {
        if (i === 0) {
          currentStreak = 0;
        }
        runningStreak = 0;
      }

      longestStreak = Math.max(longestStreak, runningStreak);
      sumProgressRatio += progressRatio;
    }

    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
    const averageProgressPercent =
      totalDays > 0 ? (sumProgressRatio / totalDays) * 100 : 0;

    return {
      totalDays,
      completedDays,
      completionRate,
      averageProgress: averageProgressPercent,
      averageProgressPercent,
      currentStreak,
      longestStreak,
    };
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    // Fetch initial data (last 90 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    fetchCompletions(startDate, endDate);

    // Subscribe to real-time changes
    const channel = supabase
      .channel('completions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habit_completions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch when changes occur
          fetchCompletions(startDate, endDate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    completions,
    loading,
    error,
    fetchCompletions,
    getCompletionsForDate,
    getHabitCompletionForDate,
    updateHabitCompletion,
    deleteHabitCompletion,
    markAllHabitsComplete,
    copyCompletionsFromDate,
    getCompletionStats
  };
};
