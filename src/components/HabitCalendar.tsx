import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Calendar as CalendarIcon, Flame, Target } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import type { Habit } from '@/pages/Index';

interface HabitCalendarProps {
  habits: Habit[];
  onClose: () => void;
}

interface DayData {
  date: Date;
  completedHabits: number;
  totalHabits: number;
  habits: Habit[];
}

export const HabitCalendar = ({ habits, onClose }: HabitCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());

  // Generate calendar data for the current month
  const generateCalendarData = (): DayData[] => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    const days = eachDayOfInterval({ start, end });

    return days.map(date => {
      const dayHabits = habits.filter(habit => {
        if (!habit.lastCompleted) return false;
        return isSameDay(habit.lastCompleted, date);
      });

      return {
        date,
        completedHabits: dayHabits.length,
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
      empty: completionRate === 0
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-card border-primary/20 shadow-strong">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Habit Calendar</h2>
              <p className="text-muted-foreground">Track your progress over time</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-y-auto">
          {/* Calendar Section */}
          <div className="lg:col-span-2 space-y-4">
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
                completed: "bg-success text-success-foreground hover:bg-success/90",
                partial: "bg-warning text-warning-foreground hover:bg-warning/90",
                empty: "opacity-50"
              }}
            />
            
            {/* Legend */}
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-muted-foreground">All habits completed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-muted-foreground">Partially completed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-muted rounded-full opacity-50"></div>
                <span className="text-muted-foreground">No habits completed</span>
              </div>
            </div>
          </div>

          {/* Day Details Section */}
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <h3 className="font-semibold text-lg mb-2">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
              
              {selectedDayData ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Progress</span>
                    </div>
                    <Badge variant={getCompletionRate(selectedDayData) === 100 ? "default" : "secondary"}>
                      {selectedDayData.completedHabits}/{selectedDayData.totalHabits} habits
                    </Badge>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getCompletionRate(selectedDayData)}%` }}
                    />
                  </div>

                  {selectedDayData.habits.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Completed Habits</h4>
                      {selectedDayData.habits.map(habit => (
                        <div key={habit.id} className="flex items-center gap-2 p-2 bg-success-light rounded-lg">
                          <div className="w-2 h-2 bg-success rounded-full"></div>
                          <span className="text-sm font-medium">{habit.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                    <CalendarIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No data for this day</p>
                </div>
              )}
            </Card>

            {/* Monthly Stats */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                {format(viewDate, 'MMMM')} Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Perfect Days</span>
                  <Badge>
                    {calendarData.filter(day => getCompletionRate(day) === 100 && day.completedHabits > 0).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Days</span>
                  <Badge variant="secondary">
                    {calendarData.filter(day => day.completedHabits > 0).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Rate</span>
                  <Badge variant="outline">
                    {Math.round(calendarData.reduce((sum, day) => sum + getCompletionRate(day), 0) / calendarData.length)}%
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};