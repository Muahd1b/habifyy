import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Quote, Plus } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { useCustomQuotes } from '@/hooks/useCustomQuotes';
import { CreateQuoteModal } from '@/components/CreateQuoteModal';

interface QuoteData {
  text: string;
  author: string;
  category: string;
  isPersonalized: boolean;
}

const motivationalQuotes: QuoteData[] = [
  {
    text: "Your habits shape your identity, and your identity shapes your habits.",
    author: "James Clear",
    category: "habits",
    isPersonalized: false
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
    category: "consistency",
    isPersonalized: false
  },
  {
    text: "The compound effect of small improvements is remarkable.",
    author: "Atomic Habits",
    category: "progress",
    isPersonalized: false
  },
  {
    text: "Excellence is not an act, but a habit.",
    author: "Aristotle",
    category: "excellence",
    isPersonalized: false
  },
  {
    text: "Progress, not perfection, is the goal.",
    author: "Habit Tracker Wisdom",
    category: "mindset",
    isPersonalized: false
  }
];

export const PersonalizedQuotes = () => {
  const { habits } = useHabits();
  const { customQuotes, createCustomQuote } = useCustomQuotes();
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const generatePersonalizedQuote = (): QuoteData => {
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => h.completedToday).length;
    const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
    const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0);

    // Convert custom quotes to QuoteData format
    const customQuoteData: QuoteData[] = customQuotes.map(quote => ({
      text: quote.text,
      author: quote.author || 'You',
      category: quote.category,
      isPersonalized: true
    }));

    console.log('Custom quotes available:', customQuoteData.length);

    // Prioritize custom quotes - 60% chance if they exist
    if (customQuoteData.length > 0 && Math.random() < 0.6) {
      const selectedQuote = customQuoteData[Math.floor(Math.random() * customQuoteData.length)];
      console.log('Selected custom quote:', selectedQuote.text.substring(0, 30) + '...');
      return selectedQuote;
    }

    // Personalized quotes based on user's data
    const personalizedQuotes: QuoteData[] = [
      {
        text: `You're building ${totalHabits} powerful habits. Each day is a step toward the person you're becoming.`,
        author: "Your Journey",
        category: "personal",
        isPersonalized: true
      },
      {
        text: `${completedToday} habits completed today. You're proving that consistency beats perfection every time.`,
        author: "Your Progress",
        category: "personal",
        isPersonalized: true
      },
      {
        text: `Your ${longestStreak}-day streak shows what you're capable of. Keep building on that foundation.`,
        author: "Your Achievement",
        category: "personal",
        isPersonalized: true
      },
      {
        text: `${totalStreak} combined days of progress across all habits. That's the power of compound growth.`,
        author: "Your Impact",
        category: "personal",
        isPersonalized: true
      }
    ];

    // Mix personalized and motivational quotes for remaining 40%
    const allQuotes = [...personalizedQuotes, ...motivationalQuotes];
    const selectedQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
    console.log('Selected quote type:', selectedQuote.isPersonalized ? 'personalized' : 'motivational');
    return selectedQuote;
  };

  const refreshQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentQuote(generatePersonalizedQuote());
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    if (habits.length > 0) {
      console.log('Generating initial quote with', customQuotes.length, 'custom quotes available');
      setCurrentQuote(generatePersonalizedQuote());
    }
  }, [habits.length, customQuotes.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshQuote();
    }, 30000); // Auto-refresh every 30 seconds

    return () => clearInterval(interval);
  }, [habits, customQuotes]);

  if (!currentQuote) return null;

  return (
    <Card className={`p-8 text-center bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20 shadow-elegant transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
      <div className="flex items-center justify-center mb-4">
        <Quote className="w-8 h-8 text-primary/60" />
      </div>
      
      <blockquote className={`text-lg md:text-xl font-medium text-foreground/90 mb-4 transition-all duration-500 ${isAnimating ? 'blur-sm' : 'blur-0'}`}>
        "{currentQuote.text}"
      </blockquote>
      
      <div className="flex items-center justify-center gap-4">
        <cite className="text-sm text-muted-foreground">
          — {currentQuote.author}
        </cite>
        
        {currentQuote.isPersonalized && (
          <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs text-primary font-medium">Personal</span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshQuote}
          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
          disabled={isAnimating}
        >
          <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <CreateQuoteModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createCustomQuote}
      />
    </Card>
  );
};