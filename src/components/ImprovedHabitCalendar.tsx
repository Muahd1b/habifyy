import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  const handleJumpToToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDate(today);
  };

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayData = (date: Date) => {
    const isTodayDate = isSameDay(date, new Date());
    const dayHabits = habits.map(habit => ({
      ...habit,
      completed: isTodayDate && habit.completedToday
    }));
    const completedCount = dayHabits.filter(h => h.completed).length;
    const completionRate = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

    return { dayHabits, completedCount, completionRate };
  };

  const selectedDayData = getDayData(selectedDate);
  const isToday = isSameDay(selectedDate, new Date());
  const isPast = selectedDate < new Date() && !isToday;
  const selectedCompletionPercent = Math.round(selectedDayData.completionRate);
  const bestStreak = Math.max(...habits.map(h => h.longestStreak), 0);

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
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4 max-w-6xl">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose} className="interactive-press">
              <X className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Habit Calendar</h1>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Stay aligned with your routines
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleJumpToToday} className="interactive-press">
              Today
            </Button>
            <div className="flex items-center gap-1 rounded-md border bg-muted/30 p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewDate(subMonths(viewDate, 1))}
                className="h-8 w-8 interactive-press"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="px-3 text-sm font-medium">
                {format(viewDate, 'MMM yyyy')}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewDate(addMonths(viewDate, 1))}
                className="h-8 w-8 interactive-press"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" onClick={onAddHabit} className="bg-gradient-primary text-primary-foreground interactive-press">
              <Plus className="mr-2 h-4 w-4" />
              Add Habit
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="overflow-hidden border border-border/60 shadow-sm">
              <div className="grid grid-cols-7 gap-1 border-b bg-muted/40 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 p-3 sm:gap-2 sm:p-4">
                {dateRange.map((date) => {
                  const dayData = getDayData(date);
                  const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                  const isTodayCell = isSameDay(date, new Date());
                  const isSelected = isSameDay(date, selectedDate);
                  const completionRate = dayData.completionRate;
                  const progressWidth = Math.min(100, Math.max(0, completionRate));
                  const dayButtonClasses = [
                    'group relative flex h-16 sm:h-20 flex-col items-center justify-center rounded-lg border px-1 text-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 hover:bg-muted/40',
                    isCurrentMonth ? 'border-border/70 bg-background' : 'border-border/40 text-muted-foreground/60',
                    isSelected ? 'border-transparent bg-primary text-primary-foreground shadow-lg hover:bg-primary' : '',
                    !isSelected && isTodayCell ? 'border-primary bg-primary/10 text-primary font-semibold' : '',
                    !isSelected && !isTodayCell && completionRate === 100 && dayData.completedCount > 0 ? 'border-success/40 bg-success/10 text-success' : '',
                    !isSelected && !isTodayCell && completionRate > 0 && completionRate < 100 ? 'border-warning/40 bg-warning/10 text-warning' : ''
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={dayButtonClasses}
                    >
                      <span className="text-sm font-semibold">{format(date, 'd')}</span>
                      <div className="mt-2 h-1.5 w-10 rounded-full bg-muted/60">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{ width: `${progressWidth}%` }}
                        />
                      </div>
                      {isSelected && habits.length > 0 && (
                        <span className="mt-1 text-[10px] font-medium">
                          {dayData.completedCount}/{habits.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span>100% complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-warning" />
                  <span>Partial progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  <span>No progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full border border-primary" />
                  <span>Today</span>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </CardTitle>
                  <CardDescription>{generateBriefing()}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant="outline">
                    {selectedDayData.completedCount} / {habits.length} completed
                  </Badge>
                  {selectedCompletionPercent > 0 && (
                    <span className="text-sm font-medium text-primary">
                      {selectedCompletionPercent}%
                    </span>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-1 border-b bg-muted/30">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-4 w-4 text-primary" />
                    {isToday ? "Today's Habits" : isPast ? 'Past Habits' : 'Planned Habits'}
                  </CardTitle>
                  <CardDescription>
                    Tap a habit to update completion
                  </CardDescription>
                </CardHeader>
                <ScrollArea className="max-h-[22rem]">
                  <div className="space-y-3 p-4">
                    {selectedDayData.dayHabits.length > 0 ? (
                      selectedDayData.dayHabits.map((habit) => (
                        <div
                          key={habit.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex flex-1 items-center gap-3">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: habit.color }}
                            />
                            <div>
                              <p className="text-sm font-medium">{habit.name}</p>
                              {habit.target && (
                                <p className="text-[11px] text-muted-foreground">
                                  Target: {habit.target}
                                </p>
                              )}
                            </div>
                          </div>
                          {habit.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : isToday ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => onHabitProgress(habit.id, habit.target)}
                              className="interactive-press"
                            >
                              Complete
                            </Button>
                          ) : (
                            <div className="h-5 w-5 rounded-full border border-dashed border-muted-foreground/40" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center gap-3 px-4 py-10 text-center text-sm text-muted-foreground">
                        <Target className="h-10 w-10 opacity-40" />
                        <div>
                          {isToday ? 'No habits scheduled for today yet.' : 'Nothing planned for this day.'}
                        </div>
                        <Button size="sm" variant="outline" onClick={onAddHabit} className="interactive-press">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Habit
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>

              <Card>
                <CardHeader className="space-y-1 border-b bg-muted/30">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Quick Stats
                  </CardTitle>
                  <CardDescription>
                    Snapshot for {format(selectedDate, 'MMM d')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Habits tracked</span>
                    <Badge variant="secondary">{habits.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <Badge variant="outline">
                      {selectedDayData.completedCount}/{habits.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completion</span>
                    <Badge variant="outline">
                      {selectedCompletionPercent}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Best streak</span>
                    <Badge variant="secondary">
                      <Flame className="mr-1 h-3 w-3" />
                      {bestStreak} days
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
