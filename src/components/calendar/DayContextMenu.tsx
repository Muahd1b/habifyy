import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  CheckCircle2, 
  RotateCcw, 
  Calendar,
  ClipboardCopy,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

interface DayContextMenuProps {
  date: Date;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onAddCompletion: (date: Date) => void;
  onLogPastActivity: (date: Date) => void;
  onViewDayDetails: (date: Date) => void;
  onCopyFromYesterday: (date: Date) => void;
  onMarkAllComplete: (date: Date) => void;
}

export const DayContextMenu = ({
  date,
  isVisible,
  position,
  onClose,
  onAddCompletion,
  onLogPastActivity,
  onViewDayDetails,
  onCopyFromYesterday,
  onMarkAllComplete
}: DayContextMenuProps) => {
  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Context Menu */}
      <Card 
        className="fixed z-50 w-64 p-2 bg-popover border shadow-strong animate-scale-in"
        style={{
          left: Math.min(position.x, window.innerWidth - 256),
          top: Math.min(position.y, window.innerHeight - 300)
        }}
      >
        <div className="p-2 border-b border-border/50">
          <h3 className="font-medium text-sm">
            {format(date, 'EEEE, MMM d')}
          </h3>
          <p className="text-xs text-muted-foreground">
            Quick actions for this day
          </p>
        </div>

        <div className="space-y-1 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onAddCompletion(date);
              onClose();
            }}
            className="w-full justify-start h-8 px-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Habit Completion
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onMarkAllComplete(date);
              onClose();
            }}
            className="w-full justify-start h-8 px-2 hover:bg-success/10"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark All Complete
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onCopyFromYesterday(date);
              onClose();
            }}
            className="w-full justify-start h-8 px-2 hover:bg-primary/10"
          >
            <ClipboardCopy className="w-4 h-4 mr-2" />
            Copy from Yesterday
          </Button>

          <Separator className="my-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onLogPastActivity(date);
              onClose();
            }}
            className="w-full justify-start h-8 px-2"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Log Past Activity
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onViewDayDetails(date);
              onClose();
            }}
            className="w-full justify-start h-8 px-2"
          >
            <Calendar className="w-4 h-4 mr-2" />
            View Day Details
          </Button>
        </div>
      </Card>
    </>
  );
};