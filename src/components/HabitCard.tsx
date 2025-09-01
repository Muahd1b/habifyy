import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Target, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { type HabitWithProgress } from '@/hooks/useHabits';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: HabitWithProgress;
  onProgressUpdate: (habitId: string, progress: number) => void;
}

export const HabitCard = ({ habit, onProgressUpdate }: HabitCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const progressPercentage = (habit.completed / habit.target) * 100;
  const isCompleted = habit.completedToday;

  const handleIncrement = () => {
    if (habit.completed < habit.target) {
      setIsUpdating(true);
      setTimeout(() => {
        onProgressUpdate(habit.id, habit.completed + 1);
        setIsUpdating(false);
      }, 200);
    }
  };

  const handleDecrement = () => {
    if (habit.completed > 0) {
      setIsUpdating(true);
      setTimeout(() => {
        onProgressUpdate(habit.id, habit.completed - 1);
        setIsUpdating(false);
      }, 200);
    }
  };

  return (
    <Card className={cn(
      "habit-card p-6 space-y-4 relative overflow-hidden",
      isCompleted && "habit-card-completed",
      isUpdating && "animate-bounce-soft"
    )}>
      {/* Background Gradient */}
      <div className={cn(
        "absolute inset-0 opacity-5 bg-gradient-to-br",
        habit.color
      )} />
      
      {/* Header */}
      <div className="relative space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{habit.name}</h3>
            {habit.description && (
              <p className="text-sm text-muted-foreground">{habit.description}</p>
            )}
          </div>
          {isCompleted && (
            <CheckCircle2 className="w-6 h-6 text-success animate-bounce-soft" />
          )}
        </div>
        
        {/* Streak Badge */}
        {habit.currentStreak > 0 && (
          <Badge className="streak-badge">
            <Flame className="w-3 h-3 mr-1" />
            {habit.currentStreak} day streak
          </Badge>
        )}
      </div>

      {/* Progress Section */}
      <div className="relative space-y-3">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {habit.completed} / {habit.target}
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-muted"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            disabled={habit.completed === 0 || isUpdating}
            className="h-8 w-8 p-0 rounded-full border-2"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(progressPercentage)}%
            </div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrement}
            disabled={habit.completed >= habit.target || isUpdating}
            className="h-8 w-8 p-0 rounded-full border-2 hover:bg-success/10 hover:border-success"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="relative pt-3 border-t border-border/50">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Current Streak</div>
            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-success">
              <Flame className="w-4 h-4" />
              {habit.currentStreak}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Best Streak</div>
            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-primary">
              <Target className="w-4 h-4" />
              {habit.longestStreak}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};