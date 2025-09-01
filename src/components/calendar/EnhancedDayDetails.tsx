import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Target,
  Calendar,
  Plus,
  Minus,
  CheckCircle2,
  Circle,
  Edit3,
  Save,
  MessageCircle,
  TrendingUp,
  Flame
} from 'lucide-react';
import { format } from 'date-fns';
import { Habit } from '@/pages/Index';

interface EnhancedDayDetailsProps {
  date: Date;
  habits: Habit[];
  completedHabits: Array<{
    habitId: string;
    progress: number;
    notes?: string;
  }>;
  onHabitToggle: (habitId: string, completed: boolean) => void;
  onProgressUpdate: (habitId: string, progress: number) => void;
  onNotesUpdate: (habitId: string, notes: string) => void;
  onMarkAllComplete: () => void;
  onEditHabit: (habitId: string) => void;
  editMode: boolean;
}

export const EnhancedDayDetails = ({
  date,
  habits,
  completedHabits,
  onHabitToggle,
  onProgressUpdate,
  onNotesUpdate,
  onMarkAllComplete,
  onEditHabit,
  editMode
}: EnhancedDayDetailsProps) => {
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

  const getHabitProgress = (habitId: string) => {
    return completedHabits.find(c => c.habitId === habitId)?.progress || 0;
  };

  const getHabitNotes = (habitId: string) => {
    return completedHabits.find(c => c.habitId === habitId)?.notes || '';
  };

  const completedCount = completedHabits.length;
  const totalCount = habits.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Day Header */}
      <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {format(date, 'EEEE, MMMM d')}
          </h3>
          {completionRate === 100 && completedCount > 0 && (
            <Badge className="bg-gradient-success">
              <Flame className="w-3 h-3 mr-1" />
              Perfect Day!
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Progress</span>
          </div>
          <Badge variant={completionRate === 100 ? "default" : "secondary"}>
            {completedCount}/{totalCount} habits
          </Badge>
        </div>

        <Progress value={completionRate} className="h-2 mb-3" />

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onMarkAllComplete}
            disabled={completionRate === 100}
            className="bg-gradient-success hover:shadow-glow"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark All Complete
          </Button>
        </div>
      </Card>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.map((habit) => {
          const progress = getHabitProgress(habit.id);
          const notes = getHabitNotes(habit.id);
          const isCompleted = progress >= habit.target;
          const progressPercentage = (progress / habit.target) * 100;

          return (
            <Card key={habit.id} className="p-4 space-y-3">
              {/* Habit Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${habit.color}`}
                  />
                  <div>
                    <h4 className="font-medium">{habit.name}</h4>
                    {habit.description && (
                      <p className="text-sm text-muted-foreground">{habit.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditHabit(habit.id)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress} / {habit.target}</span>
                </div>

                <Progress value={progressPercentage} className="h-2" />

                {/* Progress Slider for targets > 1 */}
                {habit.target > 1 && (
                  <div className="space-y-2">
                    <Slider
                      value={[progress]}
                      onValueChange={([value]) => onProgressUpdate(habit.id, value)}
                      max={habit.target}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>{habit.target}</span>
                    </div>
                  </div>
                )}

                {/* Quick Toggle for simple habits */}
                {habit.target === 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed today</span>
                    <Switch
                      checked={isCompleted}
                      onCheckedChange={(checked) => onHabitToggle(habit.id, checked)}
                    />
                  </div>
                )}

                {/* Plus/Minus Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onProgressUpdate(habit.id, Math.max(0, progress - 1))}
                    disabled={progress === 0}
                    className="w-8 h-8 p-0 rounded-full"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {Math.round(progressPercentage)}%
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onProgressUpdate(habit.id, Math.min(habit.target, progress + 1))}
                    disabled={progress >= habit.target}
                    className="w-8 h-8 p-0 rounded-full hover:bg-success/10 hover:border-success"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedNotes(expandedNotes === habit.id ? null : habit.id)}
                  className="w-full justify-start h-8 px-2"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {notes ? 'Edit notes' : 'Add notes'}
                </Button>

                {expandedNotes === habit.id && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add notes about this habit..."
                      value={notes}
                      onChange={(e) => onNotesUpdate(habit.id, e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>
                )}

                {notes && expandedNotes !== habit.id && (
                  <div className="p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                    {notes.length > 50 ? `${notes.substring(0, 50)}...` : notes}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {habits.length === 0 && (
        <Card className="p-8 text-center">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No habits for this day</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add some habits to start tracking your progress
          </p>
        </Card>
      )}
    </div>
  );
};