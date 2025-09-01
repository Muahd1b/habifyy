import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { createSampleNotifications } from '@/utils/notificationHelpers';
import { useToast } from '@/hooks/use-toast';

export const NotificationTestButton: React.FC = () => {
  const { toast } = useToast();

  const handleCreateSamples = async () => {
    try {
      await createSampleNotifications();
      toast({
        title: "Success",
        description: "Sample notifications created! Check your notification center.",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to create sample notifications",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleCreateSamples} variant="outline" size="sm" className="gap-2">
      <Bell className="w-4 h-4" />
      Create Sample Notifications
    </Button>
  );
};