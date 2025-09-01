import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Clock, 
  Mail, 
  Smartphone, 
  Users, 
  Trophy,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationPreferences: React.FC = () => {
  const { preferences, loading, updatePreferences } = useNotificationPreferences();
  const { createNotification } = useNotifications();

  if (loading || !preferences) {
    return (
      <div className="animate-pulse">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-6 w-10 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  const handleTimezoneChange = (timezone: string) => {
    updatePreferences({ timezone });
  };

  const testNotification = async () => {
    try {
      await createNotification({
        notification_type: 'system_update',
        title: 'Test Notification',
        message: 'This is a test notification to verify your notification settings are working correctly!',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Failed to create test notification:', error);
    }
  };

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  return (
    <div className="space-y-6">
      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <Label htmlFor="habit-reminders" className="text-sm font-medium">
                  Habit Reminders
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get reminded about your daily habits and streaks
                </p>
              </div>
            </div>
            <Switch
              id="habit-reminders"
              checked={preferences.habit_reminders}
              onCheckedChange={(checked) => handleToggle('habit_reminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <div>
                <Label htmlFor="streak-milestones" className="text-sm font-medium">
                  Streak Milestones
                </Label>
                <p className="text-xs text-muted-foreground">
                  Celebrate when you hit important streak milestones
                </p>
              </div>
            </div>
            <Switch
              id="streak-milestones"
              checked={preferences.streak_milestones}
              onCheckedChange={(checked) => handleToggle('streak_milestones', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-green-500" />
              <div>
                <Label htmlFor="friend-activities" className="text-sm font-medium">
                  Friend Activities
                </Label>
                <p className="text-xs text-muted-foreground">
                  Stay updated on your friends' achievements and activities
                </p>
              </div>
            </div>
            <Switch
              id="friend-activities"
              checked={preferences.friend_activities}
              onCheckedChange={(checked) => handleToggle('friend_activities', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-4 h-4 text-purple-500" />
              <div>
                <Label htmlFor="competition-updates" className="text-sm font-medium">
                  Competition Updates
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified about competition rankings and results
                </p>
              </div>
            </div>
            <Switch
              id="competition-updates"
              checked={preferences.competition_updates}
              onCheckedChange={(checked) => handleToggle('competition_updates', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Delivery Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-blue-500" />
              <div>
                <Label htmlFor="push-enabled" className="text-sm font-medium">
                  Push Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications directly on your device
                </p>
              </div>
            </div>
            <Switch
              id="push-enabled"
              checked={preferences.push_enabled}
              onCheckedChange={(checked) => handleToggle('push_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-green-500" />
              <div>
                <Label htmlFor="email-enabled" className="text-sm font-medium">
                  Email Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive weekly summaries and important updates via email
                </p>
              </div>
            </div>
            <Switch
              id="email-enabled"
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => handleToggle('email_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timing & Timezone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Timing & Timezone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="timezone" className="text-sm font-medium mb-2 block">
              Your Timezone
            </Label>
            <Select value={preferences.timezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map(tz => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              This ensures you receive notifications at the right time
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Quiet Hours
            </Label>
            <p className="text-xs text-muted-foreground">
              Coming soon: Set hours when you don't want to receive notifications
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Test Your Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Send Test Notification</p>
              <p className="text-xs text-muted-foreground">
                Verify your notification settings are working correctly
              </p>
            </div>
            <Button onClick={testNotification} variant="outline" size="sm">
              Send Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};