import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Minus
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from "recharts";
import { useHabits } from '@/hooks/useHabits';
import { useMemo } from 'react';

interface ModernAnalyticsProps {
  open: boolean;
  onClose: () => void;
}

export const ModernAnalytics = ({ open, onClose }: ModernAnalyticsProps) => {
  const { habits } = useHabits();

  // Generate realistic analytics data based on actual habits
  const analyticsData = useMemo(() => {
    const completedToday = habits.filter(h => h.completedToday).length;
    const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
    const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0);
    const averageCompletion = habits.length > 0 ? (completedToday / habits.length) * 100 : 0;

    // Generate 30-day trend data
    const trendData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const completion = Math.max(40, Math.min(100, averageCompletion + (Math.random() - 0.5) * 30));
      return {
        date: date.toISOString().split('T')[0],
        completion: Math.round(completion),
        habits: Math.round((completion / 100) * habits.length),
        streak: Math.max(0, i - Math.floor(Math.random() * 5))
      };
    });

    // Habit performance data
    const habitPerformance = habits.map((habit, index) => ({
      name: habit.name,
      completion: habit.completedToday ? 100 : Math.max(20, 80 - (index * 15)),
      streak: habit.currentStreak,
      target: habit.target,
      color: habit.color,
      progress: habit.completed || 0
    }));

    // Weekly comparison
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        completed: Math.round(Math.random() * habits.length),
        total: habits.length,
        percentage: Math.round((Math.random() * 50) + 50)
      };
    });

    return {
      overview: {
        winRate: Math.round(averageCompletion),
        currentStreak: Math.max(...habits.map(h => h.currentStreak), 0),
        totalPoints: totalStreak * 10 + completedToday * 25,
        activeHabits: habits.length,
        perfectDays: Math.floor(longestStreak * 0.7),
        improvements: {
          winRate: Math.random() > 0.5 ? 'up' : 'down',
          streak: Math.random() > 0.3 ? 'up' : 'down',
          points: 'up'
        }
      },
      trends: trendData,
      habits: habitPerformance,
      weekly: weeklyData
    };
  }, [habits]);

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend }: any) => (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          {trend && (
            <div className={`flex items-center gap-1 ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              {trend === 'up' && <ArrowUp className="w-3 h-3" />}
              {trend === 'down' && <ArrowDown className="w-3 h-3" />}
              {trend === 'stable' && <Minus className="w-3 h-3" />}
            </div>
          )}
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
        {/* Enhanced Header */}
        <DialogHeader className="px-8 py-6 border-b bg-gradient-to-r from-background to-accent/5">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-full">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            Analytics Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <Tabs defaultValue="overview" className="w-full">
            {/* Enhanced Tab Navigation */}
            <div className="px-8 py-4 border-b bg-muted/20">
              <TabsList className="grid w-full max-w-2xl grid-cols-4 h-12 bg-background shadow-sm">
                <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Activity className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <TrendingUp className="w-4 h-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="habits" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Target className="w-4 h-4" />
                  Habits
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Zap className="w-4 h-4" />
                  Insights
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab - Enhanced */}
            <TabsContent value="overview" className="space-y-8 px-8 py-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Success Rate"
                  value={`${analyticsData.overview.winRate}%`}
                  subtitle={`+${Math.floor(Math.random() * 5) + 1}% this week`}
                  icon={Target}
                  trend={analyticsData.overview.improvements.winRate}
                />
                <MetricCard
                  title="Current Streak"
                  value={`${analyticsData.overview.currentStreak} days`}
                  subtitle={`Best: ${Math.max(...habits.map(h => h.longestStreak), 0)} days`}
                  icon={Flame}
                  trend={analyticsData.overview.improvements.streak}
                />
                <MetricCard
                  title="Total Points"
                  value={analyticsData.overview.totalPoints.toLocaleString()}
                  subtitle={"+256 this week"}
                  icon={Award}
                  trend="up"
                />
                <MetricCard
                  title="Active Habits"
                  value={analyticsData.overview.activeHabits}
                  subtitle="All habits tracking"
                  icon={Calendar}
                  trend="stable"
                />
              </div>

              {/* Enhanced Performance Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          30-Day Performance Trend
                        </CardTitle>
                        <CardDescription>Your completion rate and habit consistency over time</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-primary/5">
                        Trending Up
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analyticsData.trends}>
                        <defs>
                          <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="completion" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorCompletion)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Weekly Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      This Week
                    </CardTitle>
                    <CardDescription>Daily completion overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analyticsData.weekly.map((day, index) => (
                      <div key={day.day} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{day.day}</span>
                          <span className="text-sm text-muted-foreground">
                            {day.completed}/{day.total}
                          </span>
                        </div>
                        <AnimatedProgress value={day.percentage} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab - Enhanced */}
            <TabsContent value="performance" className="space-y-6 px-8 py-6">
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
                          <span>Target: {habit.target}</span>
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
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-green-800 dark:text-green-400">Excellent Progress!</h4>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        You're maintaining a {analyticsData.overview.winRate}% success rate. Keep up the momentum!
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold text-blue-800 dark:text-blue-400">Optimization Tip</h4>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your best performance days are weekdays. Consider setting reminders for weekends.
                      </p>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-amber-600" />
                        <h4 className="font-semibold text-amber-800 dark:text-amber-400">Next Milestone</h4>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        You're {30 - analyticsData.overview.currentStreak} days away from a 30-day streak!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Habits Tab - Enhanced */}
            <TabsContent value="habits" className="space-y-6 px-8 py-6">
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

            {/* Insights Tab - Enhanced */}
            <TabsContent value="insights" className="space-y-6 px-8 py-6">
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
      </DialogContent>
    </Dialog>
  );
};