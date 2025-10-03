import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  Calendar as CalendarIcon, 
  Flame, 
  Target, 
  Plus, 
  CheckCircle2, 
  TrendingUp,
  Award,
  Filter,
  RotateCcw,
  Zap,
  Trophy
} from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from 'date-fns';
import type { HabitWithProgress } from '@/hooks/useHabits';
import { CalendarToolbar } from './calendar/CalendarToolbar';
import { DayContextMenu } from './calendar/DayContextMenu';
import { HabitDayIndicators } from './calendar/HabitDayIndicators';
import { EnhancedDayDetails } from './calendar/EnhancedDayDetails';

interface EnhancedCalendarProps {
  habits: HabitWithProgress[];
  onClose: () => void;
  onAddHabit: () => void;
  onEditHabit: (habitId: string) => void;
  onHabitProgress: (habitId: string, progress: number) => void;
  onDeleteHabit: (habitId: string) => void;
}

interface DayData {
  date: Date;
  completedHabits: number;
  totalHabits: number;
  habits: Array<{
    id: string;
    name: string;
    color: string;
    completed: boolean;
    progress: number;
    target: number;
  }>;
}

export const EnhancedCalendar = ({ 
  habits, 
  onClose, 
  onAddHabit, 
  onEditHabit, 
  onHabitProgress,
  onDeleteHabit 
}: EnhancedCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [editMode, setEditMode] = useState(false);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [showFilters, setShowFilters] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
    date: Date | null;
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
    date: null
  });
  const [completedHabits, setCompletedHabits] = useState<Array<{
    habitId: string;
    progress: number;
    notes?: string;
    date: Date;
  }>>([]);

  // Generate enhanced calendar data
  const generateCalendarData = (): DayData[] => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    const days = eachDayOfInterval({ start, end });

    return days.map(date => {
      const dayHabits = habits.map(habit => {
        const isToday = isSameDay(date, new Date());
        const isCompleted = isToday && habit.completedToday;
        const progress = isCompleted ? habit.completed : Math.max(0, Math.random() * 100 - 50);
        
        return {
          id: habit.id,
          name: habit.name,
          color: habit.color,
          completed: isCompleted || progress > 80,
          progress: Math.round(progress),
          target: habit.target
        };
      });

      const completedCount = dayHabits.filter(h => h.completed).length;

      return {
        date,
        completedHabits: completedCount,
        totalHabits: habits.length,
        habits: dayHabits
      };
    });
  };

  const calendarData = generateCalendarData();
  const selectedDayData = calendarData.find(day => isSameDay(day.date, selectedDate));

  const getCompletionRate = (dayData: DayData) => {
    if (dayData.totalHabits === 0) return 0;
    return (dayData.completedHabits / dayData.totalHabits) * 100;
  };

  const getDayModifiers = (date: Date) => {
    const dayData = calendarData.find(day => isSameDay(day.date, date));
    if (!dayData) return {};

    const completionRate = getCompletionRate(dayData);
    
    return {
      perfect: completionRate === 100 && dayData.completedHabits > 0,
      excellent: completionRate >= 80 && completionRate < 100,
      good: completionRate >= 60 && completionRate < 80,
      partial: completionRate > 0 && completionRate < 60,
      empty: completionRate === 0,
      today: isSameDay(date, new Date())
    };
  };

  // Enhanced context menu handlers
  const handleDayRightClick = (event: React.MouseEvent, date: Date) => {
    event.preventDefault();
    setContextMenu({
      isVisible: true,
      position: { x: event.clientX, y: event.clientY },
      date
    });
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isVisible: false }));
  };

  // Calendar action handlers
  const handleMarkAllComplete = (date: Date) => {
    habits.forEach(habit => {
      onHabitProgress(habit.id, habit.target);
    });
  };

  const handleCopyFromYesterday = (date: Date) => {
    const yesterday = subDays(date, 1);
    const yesterdayData = calendarData.find(day => isSameDay(day.date, yesterday));
    if (yesterdayData) {
      yesterdayData.habits.forEach(habit => {
        if (habit.completed) {
          onHabitProgress(habit.id, habit.progress);
        }
      });
    }
  };

  const handleHabitToggle = (habitId: string, completed: boolean) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      onHabitProgress(habitId, completed ? habit.target : 0);
    }
  };

  const handleNotesUpdate = (habitId: string, notes: string) => {
    console.log('Notes updated for habit:', habitId, notes);
  };

  // Calculate monthly statistics
  const monthStats = {
    perfectDays: calendarData.filter(day => getCompletionRate(day) === 100 && day.completedHabits > 0).length,
    activeDays: calendarData.filter(day => day.completedHabits > 0).length,
    averageCompletion: Math.round(calendarData.reduce((sum, day) => sum + getCompletionRate(day), 0) / calendarData.length),
    totalHabits: habits.length,
    currentStreak: Math.max(...habits.map(h => h.currentStreak), 0),
    longestStreak: Math.max(...habits.map(h => h.longestStreak), 0)
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl max-h-[95vh] overflow-hidden glass-card shadow-strong border-border/50">
        
        {/* Enhanced Header */}
        <CardHeader className="pb-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-full">
                <CalendarIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2>Enhanced Calendar View</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  {format(viewDate, 'MMMM yyyy')} • {habits.length} active habits
                </p>
              </div>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={view === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('month')}
                  className="h-8 px-3"
                >
                  Month
                </Button>
                <Button
                  variant={view === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('week')}
                  className="h-8 px-3"
                >
                  Week
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-primary/10 text-primary' : ''}
              >
                <Filter className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Enhanced Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <Card className="text-center p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-success">{monthStats.perfectDays}</div>
                  <div className="text-xs text-muted-foreground">Perfect Days</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-success" />
                </div>
              </div>
            </Card>
            <Card className="text-center p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{monthStats.activeDays}</div>
                  <div className="text-xs text-muted-foreground">Active Days</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
            </Card>
            <Card className="text-center p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-warning">{monthStats.averageCompletion}%</div>
                  <div className="text-xs text-muted-foreground">Avg Rate</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-warning" />
                </div>
              </div>
            </Card>
            <Card className="text-center p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-accent">{monthStats.currentStreak}</div>
                  <div className="text-xs text-muted-foreground">Streak</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-accent" />
                </div>
              </div>
            </Card>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Enhanced Calendar Section */}
          <div className="lg:col-span-3 space-y-4">
            <div className="relative">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={viewDate}
                onMonthChange={setViewDate}
                className="w-full pointer-events-auto bg-background/50 backdrop-blur-sm rounded-lg border shadow-sm"
                modifiers={calendarData.reduce((acc, dayData) => {
                  const modifiers = getDayModifiers(dayData.date);
                  Object.keys(modifiers).forEach(key => {
                    if (modifiers[key as keyof typeof modifiers]) {
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(dayData.date);
                    }
                  });
                  return acc;
                }, {} as Record<string, Date[]>)}
                modifiersClassNames={{
                  perfect: "bg-green-500 text-white hover:bg-green-600 font-bold shadow-md",
                  excellent: "bg-blue-500 text-white hover:bg-blue-600 font-semibold",
                  good: "bg-orange-400 text-white hover:bg-orange-500",
                  partial: "bg-yellow-400 text-white hover:bg-yellow-500",
                  empty: "opacity-40 hover:opacity-60",
                  today: "ring-2 ring-primary ring-offset-2 font-bold"
                }}
                components={{
                  Day: ({ day, ...props }) => {
                    const dayData = calendarData.find(d => isSameDay(d.date, day.date));
                    return (
                      <div
                        {...props}
                        onContextMenu={(e) => handleDayRightClick(e, day.date)}
                        className="relative cursor-pointer group"
                      >
                        <div className="w-full h-full flex flex-col items-center justify-center p-1">
                          <span className="text-sm">{day.date.getDate()}</span>
                          {dayData && dayData.totalHabits > 0 && (
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                              <div className="flex gap-0.5">
                                {dayData.habits.slice(0, 4).map((habit, index) => (
                                  <div
                                    key={habit.id}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      habit.completed ? 'opacity-100' : 'opacity-30'
                                    }`}
                                    style={{ backgroundColor: habit.color }}
                                  />
                                ))}
                                {dayData.habits.length > 4 && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-60" />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                }}
              />
              
              {/* Enhanced Context Menu */}
              <DayContextMenu
                date={contextMenu.date || new Date()}
                isVisible={contextMenu.isVisible}
                position={contextMenu.position}
                onClose={closeContextMenu}
                onAddCompletion={(date) => console.log('Add completion for', date)}
                onLogPastActivity={(date) => console.log('Log past activity for', date)}
                onViewDayDetails={(date) => setSelectedDate(date)}
                onCopyFromYesterday={handleCopyFromYesterday}
                onMarkAllComplete={handleMarkAllComplete}
              />
            </div>
            
            {/* Enhanced Legend */}
            <Card className="glass-card">
              <div className="px-4 py-3 bg-muted/50 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Progress Legend
                </h3>
              </div>
              <div className="px-4 py-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
                  <span>Perfect (100%)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
                  <span>Excellent (80%+)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-orange-400 rounded-full shadow-sm"></div>
                  <span>Good (60%+)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-sm"></div>
                  <span>Partial (&gt;0%)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-muted rounded-full opacity-40"></div>
                  <span>No Progress</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 border-2 border-primary rounded-full"></div>
                  <span>Today</span>
                </div>
              </div>
                <div className="mt-3 p-2 bg-primary/5 rounded text-xs text-muted-foreground">
                  💡 Right-click any day for quick actions • Colored dots show individual habit progress
                </div>
              </div>
            </Card>
          </div>

          {/* Enhanced Day Details Section */}
          <div className="lg:col-span-2 space-y-4">
            <EnhancedDayDetails
              date={selectedDate}
              habits={habits}
              completedHabits={completedHabits.filter(c => isSameDay(c.date, selectedDate))}
              onHabitToggle={handleHabitToggle}
              onProgressUpdate={onHabitProgress}
              onDeleteHabit={onDeleteHabit}
              onNotesUpdate={handleNotesUpdate}
              onMarkAllComplete={() => handleMarkAllComplete(selectedDate)}
              onEditHabit={onEditHabit}
              editMode={editMode}
            />

            {/* Enhanced Monthly Insights */}
            <Card className="glass-card">
              <div className="px-4 py-3 bg-muted/50 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {format(viewDate, 'MMMM')} Insights
                </h3>
              </div>
              <div className="px-4 py-4">
                <div className="space-y-4">
                  {/* Progress Overview */}
                  <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Monthly Progress</span>
                    <span className="text-sm text-muted-foreground">{monthStats.averageCompletion}%</span>
                  </div>
                  <Progress 
                    value={monthStats.averageCompletion} 
                    className="h-2 bg-muted/50" 
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {monthStats.perfectDays} perfect days this month
                  </div>
                </div>

                  {/* Streak Information */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-muted/30 rounded-lg border border-border">
                    <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <div className="text-lg font-bold">{monthStats.currentStreak}</div>
                      <div className="text-xs text-muted-foreground">Current</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg border border-border">
                    <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                    <div className="text-lg font-bold">{monthStats.longestStreak}</div>
                      <div className="text-xs text-muted-foreground">Best</div>
                    </div>
                  </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button 
                    onClick={onAddHabit}
                    className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Habit
                  </Button>
                  <Button 
                    onClick={() => setEditMode(!editMode)}
                    className="w-full justify-start gap-2"
                    variant="outline"
                  >
                    <Zap className="w-4 h-4" />
                    {editMode ? 'Exit Edit Mode' : 'Edit Mode'}
                  </Button>
                </div>
              </div>
            </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};