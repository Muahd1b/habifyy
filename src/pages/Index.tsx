import { useState } from "react";
import { Header } from "@/components/Header";
import { HabitCalendar } from "@/components/HabitCalendar";
import { StatsOverview } from "@/components/StatsOverview";
import Community from "@/components/Community";
import { Analytics } from "@/components/Analytics";
import { Settings } from "@/components/Settings";
import { ProfileModal } from "@/components/ProfileModal";
import { Auth } from "@/components/Auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Target, Flame, Trophy, TrendingUp } from 'lucide-react';
import { HabitCard } from '@/components/HabitCard';
import { HabitForm } from '@/components/HabitForm';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  target: number;
  completed: number;
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  lastCompleted?: Date;
  createdAt: Date;
}

const Index = () => {
  console.log("Index component rendering");
  const { user, loading, isAuthenticated } = useAuth();
  console.log("Auth state:", { user: !!user, loading, isAuthenticated });
  const [activeView, setActiveView] = useState("calendar");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Morning Meditation',
      description: 'Start each day with 10 minutes of mindfulness',
      color: 'from-purple-500 to-blue-500',
      target: 1,
      completed: 1,
      currentStreak: 12,
      longestStreak: 25,
      completedToday: true,
      lastCompleted: new Date(),
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Read 30 Pages',
      description: 'Expand knowledge through daily reading',
      color: 'from-green-500 to-emerald-500',
      target: 30,
      completed: 25,
      currentStreak: 8,
      longestStreak: 15,
      completedToday: false,
      createdAt: new Date('2024-01-05')
    },
    {
      id: '3',
      name: 'Exercise',
      description: 'Stay active with daily workouts',
      color: 'from-orange-500 to-red-500',
      target: 1,
      completed: 0,
      currentStreak: 0,
      longestStreak: 7,
      completedToday: false,
      createdAt: new Date('2024-01-10')
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const handleAddHabit = (newHabit: Omit<Habit, 'id' | 'completed' | 'currentStreak' | 'longestStreak' | 'completedToday' | 'createdAt'>) => {
    const habit: Habit = {
      ...newHabit,
      id: Date.now().toString(),
      completed: 0,
      currentStreak: 0,
      longestStreak: 0,
      completedToday: false,
      createdAt: new Date()
    };
    setHabits([...habits, habit]);
    setShowAddForm(false);
  };

  const handleHabitProgress = (habitId: string, progress: number) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCompleted = Math.min(progress, habit.target);
        const wasCompleted = habit.completedToday;
        const isNowCompleted = newCompleted >= habit.target;
        
        let newCurrentStreak = habit.currentStreak;
        let newLongestStreak = habit.longestStreak;
        
        if (!wasCompleted && isNowCompleted) {
          newCurrentStreak += 1;
          newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
        } else if (wasCompleted && !isNowCompleted) {
          newCurrentStreak = Math.max(0, newCurrentStreak - 1);
        }
        
        return {
          ...habit,
          completed: newCompleted,
          completedToday: isNowCompleted,
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastCompleted: isNowCompleted ? new Date() : habit.lastCompleted
        };
      }
      return habit;
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "calendar":
        return (
          <div className="container mx-auto px-4 py-8 space-y-8">
            <HabitCalendar habits={habits} onClose={() => setActiveView("home")} />
          </div>
        );
      case "community":
        return <Community open={true} onClose={() => setActiveView("calendar")} />;
      case "analytics":
        return <Analytics open={true} onClose={() => setActiveView("calendar")} />;
      case "settings":
        return <Settings onClose={() => setActiveView("calendar")} />;
      default:
        return (
          <main className="container mx-auto px-4 py-8 space-y-8">
            {/* Welcome Section */}
            <section className="text-center space-y-4 animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
                Habify
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Transform your life, one habit at a time. Track your progress, build streaks, and achieve your goals.
              </p>
            </section>

            {/* Stats Overview */}
            <StatsOverview 
              completedToday={habits.filter(h => h.completedToday).length}
              totalHabits={habits.length}
              totalStreak={habits.reduce((sum, h) => sum + h.currentStreak, 0)}
              longestStreak={Math.max(...habits.map(h => h.currentStreak), 0)}
            />

            {/* Today's Focus */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Today's Focus
                </h2>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-primary text-primary-foreground hover:scale-105 transition-transform"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Habit
                </Button>
              </div>

              {/* Habit Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habits.map((habit, index) => (
                  <div key={habit.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <HabitCard 
                      habit={habit} 
                      onProgressUpdate={handleHabitProgress}
                    />
                  </div>
                ))}
                
                {habits.length === 0 && (
                  <Card className="col-span-full p-12 text-center border-2 border-dashed border-border">
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                        <Target className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold">Start Your Journey</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        Create your first habit and begin building positive routines that will transform your life.
                      </p>
                      <Button 
                        onClick={() => setShowAddForm(true)}
                        className="bg-gradient-primary text-primary-foreground"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Habit
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </section>

            {/* Motivational Quote */}
            {habits.length > 0 && (
              <Card className="p-8 text-center bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <blockquote className="text-lg italic text-foreground/90">
                  "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
                </blockquote>
                <cite className="text-sm text-muted-foreground mt-2 block">— Aristotle</cite>
              </Card>
            )}
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onCalendarClick={() => setActiveView("calendar")} 
        onSettingsClick={() => setActiveView("settings")}
        onCommunityClick={() => setActiveView("community")}
        onAnalyticsClick={() => setActiveView("analytics")}
        onProfileClick={handleProfileClick}
      />
      
      {renderActiveView()}

      {/* Add Habit Form Modal */}
      {showAddForm && (
        <HabitForm 
          onSubmit={handleAddHabit}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <ProfileModal 
          open={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default Index;
