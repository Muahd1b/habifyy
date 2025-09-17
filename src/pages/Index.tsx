import { useState } from "react";
import { Header } from "@/components/Header";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AppleCalendar } from "@/components/AppleCalendar";
import { StatsOverview } from "@/components/StatsOverview";
import Community from "@/components/Community";
import { ModernAnalytics } from "@/components/ModernAnalytics";
import { Settings } from "@/components/Settings";
import MobileCommunity from "@/components/MobileCommunity";
import MobileSettings from "@/components/MobileSettings";
import { ProfileModal } from "@/components/ProfileModal";
import { PersonalizedQuotes } from "@/components/PersonalizedQuotes";
import { Auth } from "@/components/Auth";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Target, Flame, Trophy, TrendingUp } from 'lucide-react';
import { HabitCard } from '@/components/HabitCard';
import { HabitForm } from '@/components/HabitForm';
import { useHabits, type HabitWithProgress } from '@/hooks/useHabits';
import { useHabitCompletions } from '@/hooks/useHabitCompletions';

// Re-export for compatibility with existing components
export interface Habit extends HabitWithProgress {}

const Index = () => {
  console.log("Index component rendering - start");
  
  // All hooks must be called in the same order every time
  const { user, loading, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // State hooks
  const [activeView, setActiveView] = useState("home");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  console.log("State initialized:", { activeView, isProfileModalOpen, showAddForm });
  console.log("Auth state:", { user: !!user, loading, isAuthenticated });
  
  // Database hooks - only call when user exists
  const { habits, loading: habitsLoading, createHabit, updateHabitProgress, deleteHabit } = useHabits();
  const { updateHabitCompletion } = useHabitCompletions();
  
  console.log("Hooks completed, habits count:", habits?.length || 0);

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const handlePremiumClick = () => {
    navigate('/premium');
  };

  const handleAddHabit = async (newHabit: Omit<Habit, 'id' | 'user_id' | 'is_active' | 'created_at' | 'updated_at' | 'completed' | 'currentStreak' | 'longestStreak' | 'completedToday'>) => {
    await createHabit(newHabit);
    setShowAddForm(false);
  };

  const handleHabitProgress = async (habitId: string, progress: number) => {
    await updateHabitProgress(habitId, progress);
  };

  // Prioritize auth state to avoid spinner when logged out
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

  const isInitialLoading = habitsLoading && habits.length === 0;
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "calendar":
        return <AppleCalendar 
          habits={habits} 
          onClose={() => setActiveView("home")}
          onAddHabit={() => setShowAddForm(true)}
          onDateSelect={(date) => console.log('Selected date:', date)}
        />;
      case "community":
        return isMobile ? 
          <MobileCommunity onClose={() => setActiveView("home")} /> :
          <Community open={true} onClose={() => setActiveView("home")} />;
      case "analytics":
        return <ModernAnalytics open={true} onClose={() => setActiveView("home")} />;
      case "settings":
        return isMobile ?
          <MobileSettings onClose={() => setActiveView("home")} /> :
          <Settings onClose={() => setActiveView("home")} />;
      default:
        return (
          <main className="container mx-auto px-4 py-8 space-y-8">
            {/* Welcome Section with Enhanced Branding */}
            <section className="text-center space-y-6 animate-fade-in-up">
              <div className="relative">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
                  Habifyy
                </h1>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/20 rounded-full animate-pulse" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-accent/30 rounded-full animate-pulse delay-300" />
              </div>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Your personal growth companion. Build lasting habits, track meaningful progress, and celebrate every victory.
              </p>
            </section>

            {/* Personalized Quotes Section - Moved to top */}
            <PersonalizedQuotes />

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
                      onDelete={deleteHabit}
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

          </main>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'pb-16' : ''}`}>
      <Header 
        onCalendarClick={() => setActiveView("calendar")} 
        onSettingsClick={() => setActiveView("settings")}
        onCommunityClick={() => setActiveView("community")}
        onAnalyticsClick={() => setActiveView("analytics")}
        onPremiumClick={handlePremiumClick}
        onProfileClick={handleProfileClick}
      />
      
      {renderActiveView()}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeView={activeView}
        onViewChange={setActiveView}
        onSettingsClick={() => setActiveView("settings")}
        onPremiumClick={handlePremiumClick}
      />

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
