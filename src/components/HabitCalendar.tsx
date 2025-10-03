import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Calendar as CalendarIcon, Flame, Target, Plus, CheckCircle2 } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from 'date-fns';
import type { HabitWithProgress } from '@/hooks/useHabits';
import { CalendarToolbar } from './calendar/CalendarToolbar';
import { DayContextMenu } from './calendar/DayContextMenu';
import { HabitDayIndicators } from './calendar/HabitDayIndicators';
import { EnhancedDayDetails } from './calendar/EnhancedDayDetails';

interface HabitCalendarProps {
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

export const HabitCalendar = ({ 
  habits, 
  onClose, 
  onAddHabit, 
  onEditHabit, 
  onHabitProgress,
  onDeleteHabit 
}: HabitCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [editMode, setEditMode] = useState(false);
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

  // Generate calendar data for the current month
  const generateCalendarData = (): DayData[] => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    const days = eachDayOfInterval({ start, end });

    return days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayHabits = habits.map(habit => {
        // For now, use today's completion status for all dates
        // This should be replaced with actual completion data from the database
        const isToday = isSameDay(date, new Date());
        const isCompleted = isToday && habit.completedToday;
        const progress = isCompleted ? habit.completed : 0;
        
        return {
          id: habit.id,
          name: habit.name,
          color: habit.color,
          completed: isCompleted,
          progress: progress,
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
      completed: completionRate === 100 && dayData.completedHabits > 0,
      partial: completionRate > 0 && completionRate < 100,
      empty: completionRate === 0,
      today: isSameDay(date, new Date())
    };
  };

  // Context menu handlers
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
    // This would typically save to a database
    console.log('Notes updated for habit:', habitId, notes);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[95vh] overflow-hidden glass-card shadow-strong border-border/50">
        {/* Enhanced Toolbar */}
        <CalendarToolbar
          viewDate={viewDate}
          totalHabits={habits.length}
          onAddHabit={onAddHabit}
          onEditMode={() => setEditMode(!editMode)}
          onViewAllHabits={() => console.log('View all habits')}
          onFilter={() => console.log('Filter habits')}
          editMode={editMode}
        />

        {/* Close Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Enhanced Calendar Section */}
          <div className="lg:col-span-3 space-y-4">
            <div className="relative">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={viewDate}
                onMonthChange={setViewDate}
                className="w-full pointer-events-auto"
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
                  completed: "bg-success text-success-foreground hover:bg-success/90 relative",
                  partial: "bg-warning text-warning-foreground hover:bg-warning/90 relative",
                  empty: "opacity-50 relative",
                  today: "ring-2 ring-primary ring-offset-2"
                }}
                 components={{
                   Day: ({ day, ...props }) => {
                     const dayData = calendarData.find(d => isSameDay(d.date, day.date));
                     return (
                       <div
                         {...props}
                         onContextMenu={(e) => handleDayRightClick(e, day.date)}
                         className="relative cursor-pointer"
                       >
                         <div className="w-full h-full flex flex-col items-center justify-center">
                           <span>{day.date.getDate()}</span>
                           {dayData && (
                             <HabitDayIndicators 
                               habits={dayData.habits}
                               className="absolute -bottom-1"
                             />
                           )}
                         </div>
                       </div>
                     );
                   }
                 }}
              />
              
              {/* Context Menu */}
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
                <h3 className="font-semibold text-foreground">Calendar Legend</h3>
              </div>
              <div className="px-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-muted-foreground">Perfect Day</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span className="text-muted-foreground">Partial Progress</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-muted rounded-full opacity-50"></div>
                  <span className="text-muted-foreground">No Progress</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 border-2 border-primary rounded-full"></div>
                  <span className="text-muted-foreground">Today</span>
                </div>
              </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Right-click any day for quick actions
                </div>
              </div>
            </Card>
          </div>

          {/* Enhanced Day Details Section */}
          <div className="lg:col-span-2 space-y-4 overflow-y-auto">
            <EnhancedDayDetails
              date={selectedDate}
              habits={habits}
              completedHabits={completedHabits.filter(c => isSameDay(c.date, selectedDate))}
              onHabitToggle={handleHabitToggle}
              onProgressUpdate={onHabitProgress}
              onDeleteHabit={onDeleteHabit} // Delete habit handler
              onNotesUpdate={handleNotesUpdate}
              onMarkAllComplete={() => handleMarkAllComplete(selectedDate)}
              onEditHabit={onEditHabit}
              editMode={editMode}
            />

            {/* Monthly Stats - Enhanced */}
            <Card className="glass-card">
              <div className="px-4 py-3 bg-muted/50 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4 text-primary" />
                  {format(viewDate, 'MMMM')} Analytics
                </h3>
              </div>
              <div className="px-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="text-2xl font-bold text-success">
                      {calendarData.filter(day => getCompletionRate(day) === 100 && day.completedHabits > 0).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Perfect Days</div>
                  </div>
                  <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="text-2xl font-bold text-primary">
                      {calendarData.filter(day => day.completedHabits > 0).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Active Days</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Average</span>
                    <Badge variant="outline">
                      {Math.round(calendarData.reduce((sum, day) => sum + getCompletionRate(day), 0) / calendarData.length)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Best Streak</span>
                    <Badge>
                      {Math.max(...habits.map(h => h.longestStreak))} days
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Habits</span>
                    <Badge variant="secondary">
                      {habits.length}
                    </Badge>
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