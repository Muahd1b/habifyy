import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award, 
  Zap, 
  BarChart3, 
  Activity,
  Flame,
  Star,
  Users,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  ArrowLeft
} from "lucide-react";
import { LiquidTubeComparison } from '@/components/charts/LiquidTubeChart';
import { RadialProgressChart } from '@/components/charts/RadialProgressChart';


import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';
import { format, startOfDay, subDays } from 'date-fns';

interface ModernAnalyticsProps {
  onClose: () => void;
  habitsData?: any[];
  habitsLoadingExternal?: boolean;
  completionsData?: any[];
  getCompletionsForDateExternal?: (date: string) => any[];
  getCompletionStatsExternal?: (habitId: string, days?: number) => any;
  completionsLoadingExternal?: boolean;
}

export const ModernAnalytics = ({ onClose, habitsData, habitsLoadingExternal, completionsData, getCompletionsForDateExternal, getCompletionStatsExternal, completionsLoadingExternal }: ModernAnalyticsProps) => {
  const { user } = useAuth();
  const habits = habitsData ?? [];
  const habitsLoading = habitsLoadingExternal ?? false;

  const completions = completionsData ?? [];
  const getCompletionsForDate = getCompletionsForDateExternal as any;
  const getCompletionStats = getCompletionStatsExternal as any;
  const completionsLoading = completionsLoadingExternal ?? false;
  const { profile, loading: profileLoading } = useProfile(user?.id);
  
  const isLoading = habitsLoading || completionsLoading || profileLoading;

  // Calculate real analytics data based on actual habit completions
  const analyticsData = useMemo(() => {
    if (!completions.length || !habits.length) {
      return {
        overview: { winRate: 0, currentStreak: 0, totalPoints: profile?.points || 0, activeHabits: habits.length, perfectDays: 0 },
        trends: [],
        habits: [],
        weekly: []
      };
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const todaysCompletions = getCompletionsForDate(today);
    const completedToday = todaysCompletions.filter(c => c.progress >= 100).length;
    
    // Calculate 30-day trend data from real completions
    const trendData = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayCompletions = getCompletionsForDate(dateStr);
      const completed = dayCompletions.filter(c => c.progress >= 100).length;
      const totalHabits = habits.length;
      const completionRate = totalHabits > 0 ? (completed / totalHabits) * 100 : 0;
      
      return {
        date: dateStr,
        completion: Math.round(completionRate),
        habits: completed,
        streak: completed === totalHabits ? 1 : 0
      };
    });

    // Calculate streaks for each habit
    const habitStats = habits.map(habit => {
      const stats = getCompletionStats(habit.id, 30);
      const recentCompletions = completions
        .filter(c => c.habit_id === habit.id)
        .sort((a, b) => new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime());
      
      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const checkDate = format(subDays(today, i), 'yyyy-MM-dd');
        const completion = recentCompletions.find(c => c.completion_date === checkDate);
        if (completion && completion.progress >= 100) {
          currentStreak++;
        } else if (i > 0) { // Allow missing today
          break;
        }
      }

      return {
        name: habit.name,
        completion: Math.round(stats.completionRate),
        streak: currentStreak,
        target: habit.target,
        color: habit.color,
        progress: stats.averageProgress,
        totalDays: stats.totalDays,
        completedDays: stats.completedDays
      };
    });

    // Calculate overall stats
    const totalCompletionRate = habitStats.length > 0 ? 
      habitStats.reduce((sum, h) => sum + h.completion, 0) / habitStats.length : 0;
    const maxStreak = Math.max(...habitStats.map(h => h.streak), 0);
    const perfectDays = trendData.filter(d => d.completion === 100).length;

    // Weekly data from real completions
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayCompletions = getCompletionsForDate(dateStr);
      const completed = dayCompletions.filter(c => c.progress >= 100).length;
      const total = habits.length;
      const percentage = total > 0 ? (completed / total) * 100 : 0;

      return {
        day: format(date, 'EEE'),
        completed,
        total,
        percentage: Math.round(percentage)
      };
    });

    return {
      overview: {
        winRate: Math.round(totalCompletionRate),
        currentStreak: maxStreak,
        totalPoints: profile?.points || 0,
        activeHabits: habits.length,
        perfectDays
      },
      trends: trendData,
      habits: habitStats,
      weekly: weeklyData
    };
  }, [habits, completions, profile, getCompletionsForDate, getCompletionStats]);

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend }: any) => (
    <Card className="relative overflow-hidden group hover:shadow-strong transition-all duration-300 glass-card active:scale-95 cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold text-foreground animate-[fadeInUp_0.5s_ease-out]">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          {trend && (
            <div className={`flex items-center gap-1 animate-[bounceSoft_1s_ease-out] ${
              trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {trend === 'up' && <ArrowUp className="w-3 h-3" />}
              {trend === 'down' && <ArrowDown className="w-3 h-3" />}
              {trend === 'stable' && <Minus className="w-3 h-3" />}
            </div>
          )}
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-success opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Card>
  );

  const AnimatedProgress = ({ value, className = "", color = "primary" }: any) => (
    <div className={`relative ${className}`}>
      <Progress 
        value={value} 
        className="h-3 bg-muted/30" 
      />
      <div 
        className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-1000 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center gap-4 p-4 border-b bg-background/95 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Analytics</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onClose} className="interactive-press">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Analytics</h1>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-6 pb-app-safe max-w-7xl">
          <Tabs defaultValue="overview" className="w-full">
            {/* Tab Navigation */}
            <div className="mb-6">
              <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/30">
                <TabsTrigger value="overview" className="flex items-center gap-2 interactive-press">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2 interactive-press">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Performance</span>
                </TabsTrigger>
                <TabsTrigger value="habits" className="flex items-center gap-2 interactive-press">
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Habits</span>
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2 interactive-press">
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Insights</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Success Rate"
                  value={`${analyticsData.overview.winRate}%`}
                  subtitle={`Based on ${analyticsData.habits.length} habits`}
                  icon={Target}
                  trend={analyticsData.overview.winRate >= 70 ? 'up' : analyticsData.overview.winRate >= 50 ? 'stable' : 'down'}
                />
                <MetricCard
                  title="Current Streak"
                  value={`${analyticsData.overview.currentStreak} days`}
                  subtitle={`Perfect days: ${analyticsData.overview.perfectDays}`}
                  icon={Flame}
                  trend={analyticsData.overview.currentStreak > 0 ? 'up' : 'down'}
                />
                <MetricCard
                  title="Total Points"
                  value={analyticsData.overview.totalPoints.toLocaleString()}
                  subtitle={`Level ${profile?.level || 1} member`}
                  icon={Award}
                  trend="stable"
                />
                <MetricCard
                  title="Active Habits"
                  value={analyticsData.overview.activeHabits}
                  subtitle={analyticsData.overview.activeHabits > 0 ? "Keep it up!" : "Add your first habit"}
                  icon={Calendar}
                  trend="stable"
                />
              </div>

              {/* Liquid Tube Charts - Modern Visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 glass-card overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="px-6 py-4 bg-muted/50 border-b border-border relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          Weekly Performance Overview
                        </CardTitle>
                        <CardDescription>Liquid tube visualization of your habit consistency</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-primary/5 animate-pulse">
                        Live Data
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="relative z-10 pt-6">
                    <LiquidTubeComparison
                      data={analyticsData.weekly.map((day, idx) => ({
                        label: day.day,
                        percentage: day.percentage,
                        color: idx === 6 ? 'primary' : day.percentage >= 80 ? 'success' : day.percentage >= 50 ? 'warning' : 'accent'
                      }))}
                      height={200}
                    />
                  </CardContent>
                </Card>

                {/* Radial Progress Summary */}
                <Card className="glass-card">
                  <div className="px-6 py-4 bg-muted/50 border-b border-border">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Success Rate
                    </CardTitle>
                    <CardDescription>Overall completion this week</CardDescription>
                  </div>
                  <CardContent className="flex flex-col items-center justify-center py-6 space-y-6">
                    <RadialProgressChart
                      percentage={analyticsData.overview.winRate}
                      size={140}
                      strokeWidth={12}
                      color={analyticsData.overview.winRate >= 80 ? 'success' : analyticsData.overview.winRate >= 50 ? 'primary' : 'warning'}
                      showValue={true}
                    />
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {analyticsData.overview.winRate >= 80 ? 'Excellent Performance!' : 
                         analyticsData.overview.winRate >= 50 ? 'Good Progress!' : 
                         'Keep Going!'}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Flame className="w-3 h-3 mr-1" />
                          {analyticsData.overview.currentStreak} day streak
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Habit Performance Comparison */}
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Habit Performance
                    </CardTitle>
                    <CardDescription>Individual habit completion rates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {analyticsData.habits.map((habit, index) => (
                      <div key={habit.name} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: habit.color }}
                            />
                            <span className="font-medium">{habit.name}</span>
                          </div>
                          <div className="text-right">
                            <Badge variant={habit.completion >= 80 ? "default" : "secondary"}>
                              {habit.completion}%
                            </Badge>
                          </div>
                        </div>
                        <AnimatedProgress value={habit.completion} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{habit.streak} day streak</span>
                          <span>{habit.completedDays}/{habit.totalDays} days</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Performance Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Performance Insights
                    </CardTitle>
                    <CardDescription>AI-powered recommendations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analyticsData.overview.winRate >= 70 ? (
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="w-4 h-4 text-green-600" />
                          <h4 className="font-semibold text-green-800 dark:text-green-400">Excellent Progress!</h4>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          You're maintaining a {analyticsData.overview.winRate}% success rate. Keep up the momentum!
                        </p>
                      </div>
                    ) : analyticsData.overview.winRate >= 50 ? (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <h4 className="font-semibold text-blue-800 dark:text-blue-400">Room for Growth</h4>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          You're at {analyticsData.overview.winRate}% success rate. Try focusing on your most important habit first.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-amber-600" />
                          <h4 className="font-semibold text-amber-800 dark:text-amber-400">Getting Started</h4>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          Start small and be consistent. Even completing one habit daily makes a big difference!
                        </p>
                      </div>
                    )}

                    {analyticsData.overview.currentStreak > 0 && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Flame className="w-4 h-4 text-purple-600" />
                          <h4 className="font-semibold text-purple-800 dark:text-purple-400">Streak Power</h4>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          You're on a {analyticsData.overview.currentStreak}-day streak! Don't break the chain today.
                        </p>
                      </div>
                    )}

                    {analyticsData.weekly.some(d => d.percentage === 100) && (
                      <div className="p-4 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-cyan-600" />
                          <h4 className="font-semibold text-cyan-800 dark:text-cyan-400">Perfect Days!</h4>
                        </div>
                        <p className="text-sm text-cyan-700 dark:text-cyan-300">
                          You've had {analyticsData.weekly.filter(d => d.percentage === 100).length} perfect completion days this week!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Habits Tab */}
            <TabsContent value="habits" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyticsData.habits.map((habit, index) => (
                  <Card key={habit.name} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: habit.color }}
                          />
                          <CardTitle className="text-base">{habit.name}</CardTitle>
                        </div>
                        <Badge variant={habit.streak > 7 ? "default" : "secondary"}>
                          {habit.streak}d
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Completion</span>
                          <span className="text-sm font-medium">{habit.completion}%</span>
                        </div>
                        <AnimatedProgress value={habit.completion} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-2 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold text-primary">{habit.streak}</div>
                          <div className="text-xs text-muted-foreground">Current</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold text-secondary">{habit.target}</div>
                          <div className="text-xs text-muted-foreground">Target</div>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Achievement Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Recent Achievements
                    </CardTitle>
                    <CardDescription>Your latest milestones and badges</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { icon: Trophy, title: "Week Warrior", desc: "7-day streak achieved", color: "text-yellow-500" },
                      { icon: Target, title: "Perfect Score", desc: "100% completion rate", color: "text-green-500" },
                      { icon: Flame, title: "Streak Master", desc: "15-day consistency", color: "text-orange-500" },
                      { icon: Star, title: "Point Champion", desc: "1000 points earned", color: "text-blue-500" }
                    ].map((achievement, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="p-2 bg-background rounded-full">
                          <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Smart Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Smart Recommendations
                    </CardTitle>
                    <CardDescription>Personalized tips to improve your habits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                      <h4 className="font-semibold mb-2">🎯 Consistency Booster</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Schedule your habits at the same time daily for 23% better results.
                      </p>
                      <Button size="sm" variant="outline">Apply Suggestion</Button>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-lg border border-secondary/20">
                      <h4 className="font-semibold mb-2">📱 Smart Reminders</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Enable location-based reminders for 40% higher completion rates.
                      </p>
                      <Button size="sm" variant="outline">Enable Reminders</Button>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-lg border border-accent/20">
                      <h4 className="font-semibold mb-2">🏆 Challenge Mode</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Join weekly challenges to stay motivated and engaged.
                      </p>
                      <Button size="sm" variant="outline">Join Challenge</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};