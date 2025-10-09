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
  getCompletionStatsExternal?: (habitId: string, target: number, days?: number) => any;
  completionsLoadingExternal?: boolean;
}

export const ModernAnalytics = ({ onClose, habitsData, habitsLoadingExternal, completionsData, getCompletionsForDateExternal, getCompletionStatsExternal, completionsLoadingExternal }: ModernAnalyticsProps) => {
  const { user } = useAuth();
  const habits = habitsData ?? [];
  const habitsLoading = habitsLoadingExternal ?? false;

  const completions = completionsData ?? [];
  const getCompletionsForDate =
    typeof getCompletionsForDateExternal === 'function'
      ? getCompletionsForDateExternal
      : (() => []) as (date: string) => any[];
  const getCompletionStats =
    typeof getCompletionStatsExternal === 'function'
      ? getCompletionStatsExternal
      : (() => ({
          totalDays: 0,
          completedDays: 0,
          completionRate: 0,
          averageProgress: 0,
          currentStreak: 0,
          longestStreak: 0,
        })) as (habitId: string, target: number, days?: number) => any;
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

    const totalHabits = habits.length;
    const today = new Date();

    const calculateDailyCompletion = (dateStr: string) => {
      const dayCompletions = getCompletionsForDate(dateStr);

      let completedCount = 0;
      let progressRatioSum = 0;

      habits.forEach((habit) => {
        const completion = dayCompletions.find((c: any) => c.habit_id === habit.id);
        const progressValue = completion?.progress ?? 0;
        const safeTarget = Math.max(habit.target ?? 1, 1);
        if (progressValue >= safeTarget) {
          completedCount += 1;
        }
        progressRatioSum += Math.min(progressValue / safeTarget, 1);
      });

      const completionRate = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;
      const averageProgress = totalHabits > 0 ? (progressRatioSum / totalHabits) * 100 : 0;

      return {
        completedCount,
        completionRate,
        averageProgress,
      };
    };

    const trendData = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(today, 29 - i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const { completedCount, completionRate } = calculateDailyCompletion(dateStr);

      return {
        date: dateStr,
        completion: Math.round(completionRate),
        habits: completedCount,
        streak: completedCount === totalHabits && totalHabits > 0 ? 1 : 0,
      };
    });

    const habitStats = habits.map((habit) => {
      const stats = getCompletionStats(habit.id, habit.target, 30) || {};

      return {
        name: habit.name,
        completion: Math.round(stats.completionRate ?? 0),
        streak: stats.currentStreak ?? 0,
        longestStreak: stats.longestStreak ?? habit.longestStreak ?? 0,
        target: habit.target,
        color: habit.color,
        progress: Math.round(stats.averageProgress ?? 0),
        totalDays: stats.totalDays ?? 30,
        completedDays: stats.completedDays ?? 0,
      };
    });

    const totalCompletionRate =
      habitStats.length > 0
        ? habitStats.reduce((sum, h) => sum + h.completion, 0) / habitStats.length
        : 0;
    const maxCurrentStreak = Math.max(...habitStats.map((h) => h.streak), 0);
    const perfectDays = trendData.filter((d) => d.completion === 100).length;

    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const { completedCount, completionRate } = calculateDailyCompletion(dateStr);

      return {
        day: format(date, 'EEE'),
        completed: completedCount,
        total: totalHabits,
        percentage: Math.round(completionRate),
      };
    });

    return {
      overview: {
        winRate: Math.round(totalCompletionRate),
        currentStreak: maxCurrentStreak,
        totalPoints: profile?.points || 0,
        activeHabits: totalHabits,
        perfectDays,
      },
      trends: trendData,
      habits: habitStats,
      weekly: weeklyData,
    };
  }, [habits, completions, profile, getCompletionsForDate, getCompletionStats]);

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend }: any) => (
    <Card className="border border-border/60 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardDescription className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold text-foreground">{value}</CardTitle>
        </div>
        <div className="rounded-full bg-muted/40 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{subtitle}</span>
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              trend === 'up'
                ? 'text-success'
                : trend === 'down'
                ? 'text-destructive'
                : 'text-muted-foreground'
            }`}
          >
            {trend === 'up' && <ArrowUp className="h-3 w-3" />}
            {trend === 'down' && <ArrowDown className="h-3 w-3" />}
            {trend === 'stable' && <Minus className="h-3 w-3" />}
            {trend === 'up' ? 'Up' : trend === 'down' ? 'Down' : 'Stable'}
          </span>
        )}
      </CardContent>
    </Card>
  );

  const AnimatedProgress = ({ value, className = "" }: any) => (
    <Progress value={value} className={`h-2 ${className}`} />
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
              <TabsList className="mx-auto flex w-full flex-wrap items-center justify-center gap-2 rounded-full border border-border/30 bg-background/70 p-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 sm:w-auto">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-[0_6px_18px_rgba(15,23,42,0.12)] dark:data-[state=active]:bg-slate-950/80"
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-[0_6px_18px_rgba(15,23,42,0.12)] dark:data-[state=active]:bg-slate-950/80"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Performance</span>
                </TabsTrigger>
                <TabsTrigger
                  value="habits"
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-[0_6px_18px_rgba(15,23,42,0.12)] dark:data-[state=active]:bg-slate-950/80"
                >
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Habits</span>
                </TabsTrigger>
                <TabsTrigger
                  value="insights"
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-[0_6px_18px_rgba(15,23,42,0.12)] dark:data-[state=active]:bg-slate-950/80"
                >
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
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border border-border/60 shadow-sm">
                  <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          Weekly Performance Overview
                        </CardTitle>
                        <CardDescription>Liquid tube visualization of your habit consistency</CardDescription>
                        <CardDescription className="text-xs font-medium text-muted-foreground/80">
                          Last 7 days • updates automatically
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 sm:pt-6">
                    <LiquidTubeComparison
                      className="-mx-2"
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
                <Card className="border border-border/60 shadow-sm">
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="w-5 h-5 text-primary" />
                      Success Rate
                    </CardTitle>
                    <CardDescription>Overall completion this week</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center space-y-6 py-6">
                    <RadialProgressChart
                      percentage={analyticsData.overview.winRate}
                      size={140}
                      strokeWidth={12}
                      color={analyticsData.overview.winRate >= 80 ? 'success' : analyticsData.overview.winRate >= 50 ? 'primary' : 'warning'}
                      showValue={true}
                    />
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {analyticsData.overview.winRate >= 80 ? 'Excellent performance' : 
                         analyticsData.overview.winRate >= 50 ? 'Good progress' : 
                         'Keep going'}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Flame className="mr-1 h-3 w-3" />
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
                {analyticsData.habits.map((habit) => {
                  const completionBadgeVariant =
                    habit.completion >= 80 ? "default" : habit.completion >= 50 ? "secondary" : "outline";
                  const averageProgressPercent = Math.min(100, Math.round(habit.progress ?? 0));

                  return (
                    <Card
                      key={habit.name}
                      className="relative overflow-hidden border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div
                        className="pointer-events-none absolute inset-0 opacity-10"
                        style={{
                          background: `radial-gradient(circle at top, ${habit.color} 0%, transparent 55%)`,
                        }}
                      />
                      <CardHeader className="relative pb-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span
                              className="mt-1 h-3 w-3 rounded-full ring-2 ring-background/70"
                              style={{ backgroundColor: habit.color }}
                            />
                            <div>
                              <CardTitle className="text-base font-semibold">{habit.name}</CardTitle>
                              <CardDescription className="text-xs">
                                Target {habit.target} per day
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant={completionBadgeVariant} className="text-xs">
                            {habit.completion}% complete
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="relative space-y-5">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                            <span>Completion</span>
                            <span>{habit.completion}%</span>
                          </div>
                          <AnimatedProgress value={habit.completion} className="h-2 bg-muted/40" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg border border-border/50 bg-background/70 p-3">
                            <span className="text-xs text-muted-foreground">Current streak</span>
                            <div className="mt-1 flex items-center gap-2 font-semibold text-success">
                              <Flame className="h-4 w-4" />
                              {habit.streak}d
                            </div>
                          </div>
                          <div className="rounded-lg border border-border/50 bg-background/70 p-3">
                            <span className="text-xs text-muted-foreground">Daily goal</span>
                            <div className="mt-1 flex items-center gap-2 font-semibold text-primary">
                              <Target className="h-4 w-4" />
                              {habit.target}
                            </div>
                          </div>
                          <div className="rounded-lg border border-border/50 bg-background/70 p-3">
                            <span className="text-xs text-muted-foreground">Avg. progress</span>
                            <div className="mt-1 text-sm font-semibold text-foreground">
                              {averageProgressPercent}%
                            </div>
                          </div>
                          <div className="rounded-lg border border-border/50 bg-background/70 p-3">
                            <span className="text-xs text-muted-foreground">Days completed</span>
                            <div className="mt-1 text-sm font-semibold text-foreground">
                              {habit.completedDays}/{habit.totalDays}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                      <h4 className="mb-2 font-semibold">🎯 Consistency Booster</h4>
                      <p className="mb-3 text-sm text-muted-foreground">
                        Schedule your habits at the same time daily for 23% better results.
                      </p>
                      <Button size="sm" variant="outline">Apply Suggestion</Button>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                      <h4 className="mb-2 font-semibold">📱 Smart Reminders</h4>
                      <p className="mb-3 text-sm text-muted-foreground">
                        Enable location-based reminders for 40% higher completion rates.
                      </p>
                      <Button size="sm" variant="outline">Enable Reminders</Button>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                      <h4 className="mb-2 font-semibold">🏆 Challenge Mode</h4>
                      <p className="mb-3 text-sm text-muted-foreground">
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
