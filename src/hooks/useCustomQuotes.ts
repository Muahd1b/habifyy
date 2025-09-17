import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface CustomQuote {
  id: string;
  user_id: string;
  text: string;
  author?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCustomQuotes = () => {
  const [customQuotes, setCustomQuotes] = useState<CustomQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomQuotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('custom_quotes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomQuotes(data || []);
    } catch (error: any) {
      console.error('Error fetching custom quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCustomQuote = async (quoteData: { text: string; author?: string; category?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('custom_quotes')
        .insert([{
          user_id: user.id,
          text: quoteData.text,
          author: quoteData.author || 'You',
          category: quoteData.category || 'personal'
        }])
        .select()
        .single();

      if (error) throw error;

      setCustomQuotes(prev => [data, ...prev]);
      toast({
        title: "Quote created!",
        description: "Your personal quote has been added successfully.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error creating quote",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateCustomQuote = async (id: string, updates: Partial<CustomQuote>) => {
    try {
      const { data, error } = await supabase
        .from('custom_quotes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCustomQuotes(prev => prev.map(quote => quote.id === id ? data : quote));
      toast({
        title: "Quote updated!",
        description: "Your quote has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating quote",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteCustomQuote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_quotes')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setCustomQuotes(prev => prev.filter(quote => quote.id !== id));
      toast({
        title: "Quote deleted",
        description: "Your quote has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting quote",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCustomQuotes();

    // Set up real-time subscription
    const channel = supabase
      .channel('custom_quotes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_quotes'
        },
        () => {
          fetchCustomQuotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    customQuotes,
    loading,
    createCustomQuote,
    updateCustomQuote,
    deleteCustomQuote,
    refetch: fetchCustomQuotes
  };
};