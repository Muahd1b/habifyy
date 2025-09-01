import { cn } from '@/lib/utils';

interface HabitDayIndicatorsProps {
  habits: Array<{
    id: string;
    name: string;
    color: string;
    completed: boolean;
  }>;
  className?: string;
}

export const HabitDayIndicators = ({ habits, className }: HabitDayIndicatorsProps) => {
  if (habits.length === 0) return null;

  const completedHabits = habits.filter(h => h.completed);
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? (completedHabits.length / totalHabits) * 100 : 0;

  // Show individual dots for up to 4 habits, then use a summary indicator
  const showIndividualDots = habits.length <= 4;

  return (
    <div className={cn("flex items-center justify-center gap-0.5 mt-1", className)}>
      {showIndividualDots ? (
        // Individual colored dots for each habit
        habits.map((habit) => (
          <div
            key={habit.id}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-200",
              habit.completed 
                ? `bg-gradient-to-r ${habit.color.replace('from-', 'from-').replace('to-', 'to-')} opacity-100 scale-110` 
                : "bg-muted opacity-40"
            )}
            title={`${habit.name}: ${habit.completed ? 'Completed' : 'Not completed'}`}
          />
        ))
      ) : (
        // Summary indicator for many habits
        <div className="flex items-center gap-1">
          <div 
            className={cn(
              "w-2 h-2 rounded-full",
              completionRate === 100 ? "bg-success" :
              completionRate >= 50 ? "bg-warning" :
              completionRate > 0 ? "bg-primary/60" : "bg-muted"
            )}
          />
          <span className="text-[10px] text-muted-foreground font-medium">
            {completedHabits.length}/{totalHabits}
          </span>
        </div>
      )}
    </div>
  );
};