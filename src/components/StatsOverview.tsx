import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Flame, Trophy, TrendingUp } from 'lucide-react';

interface StatsOverviewProps {
  completedToday: number;
  totalHabits: number;
  totalStreak: number;
  longestStreak: number;
}

export const StatsOverview = ({ 
  completedToday, 
  totalHabits, 
  totalStreak, 
  longestStreak 
}: StatsOverviewProps) => {
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const stats = [
    {
      label: "Completed Today",
      value: `${completedToday}/${totalHabits}`,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: `${completionRate}% completion rate`
    },
    {
      label: "Active Streaks",
      value: totalStreak,
      icon: Flame,
      color: "text-success",
      bgColor: "bg-success/10",
      description: "Total streak days"
    },
    {
      label: "Best Streak",
      value: longestStreak,
      icon: Trophy,
      color: "text-warning",
      bgColor: "bg-warning/10",
      description: "Longest single streak"
    },
    {
      label: "Growth Score",
      value: Math.min(100, Math.round((totalStreak + longestStreak + completedToday) / 3)),
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
      description: "Overall progress"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label} 
          className="p-6 habit-card space-y-4 animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            
            {stat.label === "Completed Today" && completionRate === 100 && totalHabits > 0 && (
              <Badge className="streak-badge text-xs">
                Perfect Day!
              </Badge>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm font-medium text-foreground">
              {stat.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {stat.description}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};