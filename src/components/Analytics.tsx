import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, Calendar, Award, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface AnalyticsProps {
  open: boolean;
  onClose: () => void;
}

// Mock data for demonstration
const performanceData = [
  { date: '2024-01-01', completion: 85 },
  { date: '2024-01-02', completion: 92 },
  { date: '2024-01-03', completion: 78 },
  { date: '2024-01-04', completion: 95 },
  { date: '2024-01-05', completion: 88 },
  { date: '2024-01-06', completion: 90 },
  { date: '2024-01-07', completion: 94 }
];

const habitComparison = [
  { name: 'Exercise', completion: 92, target: 100 },
  { name: 'Reading', completion: 85, target: 100 },
  { name: 'Meditation', completion: 78, target: 100 },
  { name: 'Water Intake', completion: 95, target: 100 }
];

const streakData = [
  { habit: 'Exercise', current: 12, best: 28 },
  { habit: 'Reading', current: 8, best: 15 },
  { habit: 'Meditation', current: 5, best: 22 },
  { habit: 'Water Intake', current: 18, best: 25 }
];

const achievementCategories = [
  { name: 'Consistency', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Streaks', value: 25, color: 'hsl(var(--secondary))' },
  { name: 'Goals', value: 20, color: 'hsl(var(--accent))' },
  { name: 'Social', value: 20, color: 'hsl(var(--muted))' }
];

export const Analytics = ({ open, onClose }: AnalyticsProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analytics Dashboard
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Win Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87.5%</div>
                  <p className="text-xs text-muted-foreground">+2.1% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12 Days</div>
                  <p className="text-xs text-muted-foreground">Personal best: 28 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">+156 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">All habits active</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance Trend</CardTitle>
                <CardDescription>Your completion rate over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="completion" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Habit Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Habit Performance Comparison</CardTitle>
                  <CardDescription>Compare completion rates across all habits</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={habitComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completion" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Individual Habit Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Individual Habit Progress</CardTitle>
                  <CardDescription>Detailed progress for each active habit</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {habitComparison.map((habit) => (
                    <div key={habit.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{habit.name}</span>
                        <span className="text-sm text-muted-foreground">{habit.completion}%</span>
                      </div>
                      <Progress value={habit.completion} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="streaks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current vs Best Streaks */}
              <Card>
                <CardHeader>
                  <CardTitle>Streak Analysis</CardTitle>
                  <CardDescription>Current streaks vs personal bests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {streakData.map((item) => (
                    <div key={item.habit} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.habit}</span>
                        <div className="flex gap-2">
                          <Badge variant="default">{item.current} days</Badge>
                          <Badge variant="outline">Best: {item.best}</Badge>
                        </div>
                      </div>
                      <Progress value={(item.current / item.best) * 100} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Streak Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Streak Insights</CardTitle>
                  <CardDescription>Tips to maintain and improve your streaks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-green-600 mb-2">🔥 On Fire!</h4>
                    <p className="text-sm">You're crushing your exercise streak! Keep up the momentum.</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-yellow-600 mb-2">⚠️ At Risk</h4>
                    <p className="text-sm">Your meditation streak needs attention. Set a reminder for tomorrow.</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-blue-600 mb-2">💡 Tip</h4>
                    <p className="text-sm">Morning habits have a 23% higher success rate. Consider shifting your routine.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Achievement Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Achievement Categories</CardTitle>
                  <CardDescription>Distribution of your earned achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={achievementCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {achievementCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                  <CardDescription>Your latest unlocked badges and milestones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div>
                      <h4 className="font-semibold">Week Warrior</h4>
                      <p className="text-sm text-muted-foreground">Completed all habits for 7 days straight</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Target className="h-8 w-8 text-green-500" />
                    <div>
                      <h4 className="font-semibold">Perfect Score</h4>
                      <p className="text-sm text-muted-foreground">100% completion rate for 3 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Zap className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="font-semibold">Early Bird</h4>
                      <p className="text-sm text-muted-foreground">Completed morning routine 5 times</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Next Achievements</CardTitle>
                <CardDescription>Close to unlocking these badges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Month Champion</h4>
                      <p className="text-sm text-muted-foreground">Complete all habits for 30 days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">18/30</div>
                    <Progress value={60} className="w-16 h-2 mt-1" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Point Master</h4>
                      <p className="text-sm text-muted-foreground">Earn 2000 total points</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">1247/2000</div>
                    <Progress value={62.4} className="w-16 h-2 mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};