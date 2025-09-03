import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, 
  Circle, 
  Target, 
  Plus, 
  Minus, 
  MessageSquare, 
  Edit3, 
  Trash2,
  Flame,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import type { HabitWithProgress } from '@/hooks/useHabits';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';

interface EnhancedDayDetailsProps {
  date: Date;
  habits: HabitWithProgress[];
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
  onDeleteHabit: (habitId: string) => void;
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
  onDeleteHabit,
  editMode
}: EnhancedDayDetailsProps) => {
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const { toast } = useToast();

  const getHabitProgress = (habitId: string) => {
    const completion = completedHabits.find(c => c.habitId === habitId);
    return completion?.progress || 0;
  };

  const getHabitNotes = (habitId: string) => {
    const completion = completedHabits.find(c => c.habitId === habitId);
    return completion?.notes || '';
  };

  const handleDeleteHabit = async () => {
    if (!deletingHabitId) return;
    
    try {
      await onDeleteHabit(deletingHabitId);
      toast({
        title: "Habit deleted",
        description: "Your habit has been successfully removed.",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to delete habit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setDeletingHabitId(null);
    }
  };

  const openDeleteDialog = (habitId: string) => {
    setDeletingHabitId(habitId);
    setShowDeleteDialog(true);
  };

  const completionRate = habits.length > 0 
    ? Math.round((habits.filter(h => getHabitProgress(h.id) >= h.target).length / habits.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xl font-semibold">{format(date, 'EEEE, MMMM d')}</h3>
            <p className="text-sm text-muted-foreground">
              {habits.length} habit{habits.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
          {completionRate === 100 && habits.length > 0 && (
            <Badge className="bg-gradient-to-r from-success to-success-foreground text-success-foreground">
              <Target className="w-3 h-3 mr-1" />
              Perfect Day!
            </Badge>
          )}
        </div>
        
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Daily Progress</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            {habits.filter(h => getHabitProgress(h.id) >= h.target).length} of {habits.length} completed
          </div>
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
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditHabit(habit.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(habit.id)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
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
                  
                  <div className="text-center min-w-[60px]">
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
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {notes ? 'Edit notes' : 'Add notes'}
                </Button>

                {expandedNotes === habit.id && (
                  <div className="space-y-2">
                    <Textarea
                      value={notes}
                      onChange={(e) => onNotesUpdate(habit.id, e.target.value)}
                      placeholder="Add notes about this habit..."
                      className="min-h-[80px] resize-none"
                    />
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Habit"
        description={
          deletingHabitId 
            ? `Are you sure you want to delete "${habits.find(h => h.id === deletingHabitId)?.name}"? This action cannot be undone and all progress will be lost.`
            : "Are you sure you want to delete this habit?"
        }
        actionLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteHabit}
      />
    </div>
  );
};