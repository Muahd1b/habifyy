import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'An unexpected error occurred';

type CustomQuoteRow = Database['public']['Tables']['custom_quotes']['Row'];
type CustomQuoteInsert = Database['public']['Tables']['custom_quotes']['Insert'];
type CustomQuoteUpdate = Database['public']['Tables']['custom_quotes']['Update'];

const CUSTOM_QUOTES_TABLE: keyof Database['public']['Tables'] = 'custom_quotes';

export const useCustomQuotes = () => {
  const [customQuotes, setCustomQuotes] = useState<CustomQuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomQuotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in for custom quotes');
        setLoading(false);
        return;
      }

      console.log('Fetching custom quotes for user:', user.id);
      const { data, error } = await supabase
        .from(CUSTOM_QUOTES_TABLE)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching custom quotes:', error);
        throw error;
      }
      
      console.log('Custom quotes fetched:', data?.length || 0, 'quotes');
      setCustomQuotes((data as CustomQuoteRow[] | null) ?? []);
    } catch (error) {
      console.error('Error fetching custom quotes:', error);
      toast({
        title: "Error loading quotes",
        description: "Could not load your custom quotes. Please try refreshing.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCustomQuote = async (quoteData: { text: string; author?: string; category?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user logged in when creating quote');
        return;
      }

      console.log('Creating custom quote:', quoteData);
      const newQuote: CustomQuoteInsert = {
        user_id: user.id,
        text: quoteData.text,
        author: quoteData.author || 'You',
        category: quoteData.category || 'personal',
        is_active: true,
      };

      const { data, error } = await supabase
        .from(CUSTOM_QUOTES_TABLE)
        .insert([newQuote satisfies CustomQuoteInsert])
        .select()
        .single();

      if (error) {
        console.error('Error creating quote in Supabase:', error);
        throw error;
      }

      console.log('Quote created successfully:', data);
      setCustomQuotes(prev => [data as CustomQuoteRow, ...prev]);
      toast({
        title: "Quote created!",
        description: "Your personal quote has been added successfully.",
      });

      return data;
    } catch (error) {
      console.error('Error in createCustomQuote:', error);
      toast({
        title: "Error creating quote",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const updateCustomQuote = async (id: string, updates: CustomQuoteUpdate) => {
    try {
      const { data, error } = await supabase
        .from(CUSTOM_QUOTES_TABLE)
        .update(updates satisfies CustomQuoteUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCustomQuotes(prev =>
        prev.map(quote => (quote.id === id ? (data as CustomQuoteRow) : quote))
      );
      toast({
        title: "Quote updated!",
        description: "Your quote has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating quote",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const deleteCustomQuote = async (id: string) => {
    try {
      const { error } = await supabase
        .from(CUSTOM_QUOTES_TABLE)
        .update({ is_active: false } satisfies CustomQuoteUpdate)
        .eq('id', id);

      if (error) throw error;

      setCustomQuotes(prev => prev.filter(quote => quote.id !== id));
      toast({
        title: "Quote deleted",
        description: "Your quote has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error deleting quote",
        description: getErrorMessage(error),
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
