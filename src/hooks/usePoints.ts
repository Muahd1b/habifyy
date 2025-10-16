import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useCommunity } from './useCommunity';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'An unexpected error occurred';

export interface PointTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string; // 'earned' | 'spent' but stored as text in DB
  source: string;
  source_id?: string;
  description?: string;
  created_at: string;
}

export const usePoints = () => {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile, refetch } = useCommunity();

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const awardPoints = async (amount: number, source: string, sourceId?: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert([{
          user_id: user.id,
          amount,
          transaction_type: 'earned',
          source,
          source_id: sourceId,
          description
        }]);

      if (transactionError) throw transactionError;

      // Update user's total points
      const currentPoints = profile?.points || 0;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          points: currentPoints + amount,
          level: Math.floor((currentPoints + amount) / 100) + 1 // Simple level calculation
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Points earned!",
        description: `+${amount} points ${description ? `for ${description}` : ''}`,
      });

      fetchTransactions();
      refetch.profile();
    } catch (error) {
      toast({
        title: "Error awarding points",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const spendPoints = async (amount: number, source: string, sourceId?: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const currentPoints = profile?.points || 0;
      if (currentPoints < amount) {
        toast({
          title: "Insufficient points",
          description: `You need ${amount - currentPoints} more points for this purchase.`,
          variant: "destructive",
        });
        return false;
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert([{
          user_id: user.id,
          amount: -amount,
          transaction_type: 'spent',
          source,
          source_id: sourceId,
          description
        }]);

      if (transactionError) throw transactionError;

      // Update user's total points
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ points: currentPoints - amount })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Points spent!",
        description: `-${amount} points ${description ? `for ${description}` : ''}`,
      });

      fetchTransactions();
      refetch.profile();
      return true;
    } catch (error) {
      toast({
        title: "Error spending points",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTransactions();

    // Set up real-time subscription
    const channel = supabase
      .channel('point_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'point_transactions'
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    transactions,
    loading,
    awardPoints,
    spendPoints,
    refetch: fetchTransactions
  };
};
