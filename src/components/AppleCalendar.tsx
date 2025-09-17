import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Search, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { HabitWithProgress } from '@/hooks/useHabits';

interface AppleCalendarProps {
  habits: HabitWithProgress[];
  onClose: () => void;
  onAddHabit: () => void;
  onDateSelect?: (date: Date) => void;
}

export const AppleCalendar = ({ habits, onClose, onAddHabit, onDateSelect }: AppleCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayHabits = (date: Date) => {
    // For now, only show completion status for today
    const isToday = isSameDay(date, new Date());
    if (!isToday) return [];
    
    return habits.filter(habit => habit.completedToday);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden">
        {/* Apple-style Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'MMM yyyy')}
            </h2>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-8"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Calendar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-8"
            >
              <Search className="w-4 h-4 mr-1" />
              Search
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddHabit}
              className="text-white hover:bg-white/20 h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar dates */}
          <div className="grid grid-cols-7 gap-1">
            {dateRange.map((date, index) => {
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isToday = isSameDay(date, new Date());
              const isSelected = isSameDay(date, selectedDate);
              const dayHabits = getDayHabits(date);
              const hasCompletions = dayHabits.length > 0;

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    relative h-12 w-full rounded-lg text-sm font-medium transition-all duration-200
                    ${isCurrentMonth 
                      ? 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700' 
                      : 'text-gray-400 dark:text-gray-600'
                    }
                    ${isToday 
                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                      : ''
                    }
                    ${isSelected && !isToday 
                      ? 'bg-gray-200 dark:bg-gray-600' 
                      : ''
                    }
                  `}
                >
                  <span className="relative z-10">
                    {format(date, 'd')}
                  </span>
                  
                  {/* Habit completion indicators */}
                  {hasCompletions && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {dayHabits.slice(0, 3).map((_, habitIndex) => (
                        <div
                          key={habitIndex}
                          className={`w-1 h-1 rounded-full ${
                            isToday ? 'bg-white' : 'bg-orange-500'
                          }`}
                        />
                      ))}
                      {dayHabits.length > 3 && (
                        <div className="text-xs">+</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected date info */}
        {isSameDay(selectedDate, new Date()) && (
          <div className="p-4 border-t bg-white dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Today's Progress
            </h3>
            <div className="space-y-2">
              {habits.map(habit => (
                <div key={habit.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{habit.name}</span>
                  <div className={`w-3 h-3 rounded-full ${
                    habit.completedToday ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                </div>
              ))}
              {habits.length === 0 && (
                <p className="text-gray-500 text-sm">No habits yet. Start building your routine!</p>
              )}
            </div>
          </div>
        )}

        {/* Close button */}
        <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
          <Button 
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white"
          >
            Close Calendar
          </Button>
        </div>
      </Card>
    </div>
  );
};