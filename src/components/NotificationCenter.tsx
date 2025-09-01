import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  CheckCheck, 
  Filter, 
  Search, 
  Trash2,
  Clock,
  Users,
  Settings,
  Trophy,
  X
} from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/types/notifications';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const { notifications, loading, stats, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filterNotifications = (notifications: Notification[]) => {
    let filtered = notifications;

    // Filter by tab
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (activeTab === 'habits') {
      filtered = filtered.filter(n => 
        ['habit_reminder', 'streak_milestone', 'streak_risk', 'habit_completion'].includes(n.notification_type)
      );
    } else if (activeTab === 'social') {
      filtered = filtered.filter(n => 
        ['friend_request', 'friend_activity', 'challenge_invitation', 'competition_update'].includes(n.notification_type)
      );
    } else if (activeTab === 'system') {
      filtered = filtered.filter(n => 
        ['marketplace_purchase', 'system_update', 'security_alert'].includes(n.notification_type)
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredNotifications = filterNotifications(notifications);

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'habits': return <Clock className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTabCount = (tab: string) => {
    const tabNotifications = filterNotifications(notifications.filter(n => {
      if (tab === 'unread') return !n.is_read;
      if (tab === 'habits') return ['habit_reminder', 'streak_milestone', 'streak_risk', 'habit_completion'].includes(n.notification_type);
      if (tab === 'social') return ['friend_request', 'friend_activity', 'challenge_invitation', 'competition_update'].includes(n.notification_type);
      if (tab === 'system') return ['marketplace_purchase', 'system_update', 'security_alert'].includes(n.notification_type);
      return true;
    }));
    return tabNotifications.length;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-md border-l bg-background shadow-lg">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
                {stats.unread > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {stats.unread}
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {stats.unread > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="whitespace-nowrap"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Mark All Read
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-0 py-0 flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="mx-6 grid w-auto grid-cols-5 mb-4">
                <TabsTrigger value="all" className="text-xs">
                  All
                  {getTabCount('all') > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {getTabCount('all')}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Unread
                  {stats.unread > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {stats.unread}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="habits" className="text-xs">
                  Habits
                </TabsTrigger>
                <TabsTrigger value="social" className="text-xs">
                  Social
                </TabsTrigger>
                <TabsTrigger value="system" className="text-xs">
                  System
                </TabsTrigger>
              </TabsList>

              <div className="flex-1">
                <ScrollArea className="h-full px-6">
                  <TabsContent value={activeTab} className="mt-0">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-pulse">Loading notifications...</div>
                      </div>
                    ) : filteredNotifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {searchQuery ? 'No notifications match your search' : 'No notifications yet'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredNotifications.map((notification) => (
                          <NotificationItem 
                            key={notification.id} 
                            notification={notification} 
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </ScrollArea>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};