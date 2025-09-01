import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit3, List, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarToolbarProps {
  viewDate: Date;
  totalHabits: number;
  onAddHabit: () => void;
  onEditMode: () => void;
  onViewAllHabits: () => void;
  onFilter: () => void;
  editMode: boolean;
}

export const CalendarToolbar = ({
  viewDate,
  totalHabits,
  onAddHabit,
  onEditMode,
  onViewAllHabits,
  onFilter,
  editMode
}: CalendarToolbarProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
          <CalendarIcon className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{format(viewDate, 'MMMM yyyy')}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Tracking {totalHabits} habits</span>
            <Badge variant="outline" className="text-xs">
              Calendar View
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onFilter}
          className="hover:bg-primary/10"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAllHabits}
          className="hover:bg-accent/10"
        >
          <List className="w-4 h-4 mr-2" />
          All Habits
        </Button>

        <Button
          variant={editMode ? "default" : "outline"}
          size="sm"
          onClick={onEditMode}
          className={editMode ? "bg-warning text-warning-foreground" : "hover:bg-warning/10"}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          {editMode ? "Exit Edit" : "Edit Mode"}
        </Button>

        <Button
          size="sm"
          onClick={onAddHabit}
          className="bg-gradient-primary hover:shadow-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </div>
    </div>
  );
};