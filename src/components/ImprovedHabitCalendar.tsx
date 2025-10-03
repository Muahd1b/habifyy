import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Calendar as CalendarIcon, 
  Flame, 
  Plus, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  Target,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import type { HabitWithProgress } from '@/hooks/useHabits';

interface ImprovedHabitCalendarProps {
  habits: HabitWithProgress[];
  onClose: () => void;
  onAddHabit: () => void;
  onEditHabit: (habitId: string) => void;
  onHabitProgress: (habitId: string, progress: number) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const ImprovedHabitCalendar = ({ 
  habits, 
  onClose, 
  onAddHabit, 
  onEditHabit, 
  onHabitProgress,
  onDeleteHabit 
}: ImprovedHabitCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayData = (date: Date) => {
    const isToday = isSameDay(date, new Date());
    const dayHabits = habits.map(habit => ({
      ...habit,
      completed: isToday && habit.completedToday
    }));
    const completedCount = dayHabits.filter(h => h.completed).length;
    const completionRate = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

    return { dayHabits, completedCount, completionRate };
  };

  const selectedDayData = getDayData(selectedDate);
  const isToday = isSameDay(selectedDate, new Date());
  const isPast = selectedDate < new Date() && !isToday;

  // Generate day briefing
  const generateBriefing = () => {
    if (isToday) {
      const completed = selectedDayData.completedCount;
      const total = habits.length;
      if (completed === 0) return "Let's start building great habits today! 🚀";
      if (completed === total) return "Perfect day! All habits completed! 🎉";
      return `You're on track! ${completed} of ${total} habits done. Keep going! 💪`;
    }
    
    if (isPast) {
      const { completedCount, dayHabits } = selectedDayData;
      if (completedCount === dayHabits.length && dayHabits.length > 0) {
        return "Perfect day! You crushed all your habits! ⭐";
      }
      if (completedCount > 0) {
        return `You completed ${completedCount} of ${dayHabits.length} habits. Good effort! 👍`;
      }
      return "Missed this day, but every day is a new chance! 🌅";
    }

    return "Future day - Plan ahead and stay consistent! 📅";
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Apple-Style Header */}
      <div className="bg-gradient-to-r from-primary/90 via-primary to-accent/90 text-white">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white hover:bg-white/20 interactive-press"
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5" />
            <h1 className="text-xl font-semibold">Habit Calendar</h1>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onAddHabit}
            className="text-white hover:bg-white/20 interactive-press"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-4 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewDate(subMonths(viewDate, 1))}
            className="text-white hover:bg-white/20 interactive-press"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <h2 className="text-2xl font-bold">
            {format(viewDate, 'MMMM yyyy')}
          </h2>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewDate(addMonths(viewDate, 1))}
            className="text-white hover:bg-white/20 interactive-press"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Grid */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 p-4 bg-muted/50 border-b">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Dates */}
                <div className="grid grid-cols-7 gap-2 p-4">
                  {dateRange.map((date) => {
                    const dayData = getDayData(date);
                    const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                    const isToday = isSameDay(date, new Date());
                    const isSelected = isSameDay(date, selectedDate);
                    const completionRate = dayData.completionRate;

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          relative h-16 sm:h-20 rounded-xl text-sm font-medium transition-all duration-200 interactive-press
                          ${!isCurrentMonth ? 'opacity-30' : ''}
                          ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                          ${isSelected ? 'bg-primary text-primary-foreground shadow-medium' : ''}
                          ${!isSelected && completionRate === 100 && dayData.completedCount > 0 ? 'bg-success/20 text-success-foreground' : ''}
                          ${!isSelected && completionRate > 0 && completionRate < 100 ? 'bg-warning/20 text-warning-foreground' : ''}
                          ${!isSelected && completionRate === 0 ? 'bg-background hover:bg-muted/50' : ''}
                        `}
                      >
                        <span className="block mb-1">{format(date, 'd')}</span>
                        {dayData.completedCount > 0 && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                            {Array.from({ length: Math.min(dayData.completedCount, 5) }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-primary-foreground' : 'bg-primary'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Legend */}
              <Card className="mt-4 p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Legend
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success/20 rounded-full"></div>
                    <span>Perfect Day (100%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-warning/20 rounded-full"></div>
                    <span>Partial Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-muted rounded-full"></div>
                    <span>No Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-primary rounded-full"></div>
                    <span>Today</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Day Details Sidebar */}
            <div className="space-y-4">
              {/* Day Briefing */}
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <div className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {generateBriefing()}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {selectedDayData.completedCount} / {habits.length} completed
                    </Badge>
                    {selectedDayData.completionRate > 0 && (
                      <span className="text-xs font-medium text-primary">
                        {Math.round(selectedDayData.completionRate)}%
                      </span>
                    )}
                  </div>
                </div>
              </Card>

              {/* Habits for Selected Day */}
              <Card>
                <div className="px-4 py-3 bg-muted/50 border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    {isToday ? "Today's Habits" : isPast ? 'Past Habits' : 'Planned Habits'}
                  </h3>
                </div>
                <ScrollArea className="max-h-96">
                  <div className="p-4 space-y-3">
                    {selectedDayData.dayHabits.length > 0 ? (
                      selectedDayData.dayHabits.map((habit) => (
                        <div 
                          key={habit.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: habit.color }}
                            />
                            <span className="text-sm font-medium">{habit.name}</span>
                          </div>
                          {habit.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : isToday ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onHabitProgress(habit.id, habit.target)}
                              className="interactive-press"
                            >
                              Complete
                            </Button>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-muted-foreground mb-3">No habits yet</p>
                        <Button onClick={onAddHabit} size="sm" className="interactive-press">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Habit
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>

              {/* Quick Stats */}
              <Card>
                <div className="px-4 py-3 bg-muted/50 border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Quick Stats
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Habits</span>
                    <Badge>{habits.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Best Streak</span>
                    <Badge variant="secondary">
                      <Flame className="w-3 h-3 mr-1" />
                      {Math.max(...habits.map(h => h.longestStreak), 0)} days
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Month Progress</span>
                    <Badge variant="outline">
                      {Math.round((habits.filter(h => h.completedToday).length / habits.length) * 100) || 0}%
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
