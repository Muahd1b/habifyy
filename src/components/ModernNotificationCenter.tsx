import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  CheckCheck, 
  Search, 
  Clock,
  Users,
  Settings,
  X,
  Filter,
  Archive,
  Star
} from 'lucide-react';
import { ModernNotificationItem } from './ModernNotificationItem';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/types/notifications';

interface ModernNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModernNotificationCenter: React.FC<ModernNotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const { notifications, loading, stats, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  if (!isOpen) return null;

  const filterNotifications = (notifications: Notification[]) => {
    let filtered = notifications;

    // Filter by tab
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (activeTab === 'important') {
      filtered = filtered.filter(n => n.priority === 'high' || n.priority === 'critical');
    } else if (activeTab === 'habits') {
      filtered = filtered.filter(n => 
        ['habit_reminder', 'streak_milestone', 'streak_risk', 'habit_completion'].includes(n.notification_type)
      );
    } else if (activeTab === 'social') {
      filtered = filtered.filter(n => 
        ['friend_request', 'friend_activity', 'challenge_invitation', 'competition_update'].includes(n.notification_type)
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
      case 'important': return <Star className="w-4 h-4" />;
      case 'habits': return <Clock className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTabCount = (tab: string) => {
    const count = filterNotifications(notifications.filter(n => {
      if (tab === 'unread') return !n.is_read;
      if (tab === 'important') return n.priority === 'high' || n.priority === 'critical';
      if (tab === 'habits') return ['habit_reminder', 'streak_milestone', 'streak_risk', 'habit_completion'].includes(n.notification_type);
      if (tab === 'social') return ['friend_request', 'friend_activity', 'challenge_invitation', 'competition_update'].includes(n.notification_type);
      return true;
    })).length;
    return count;
  };

  const quickActions = [
    { label: 'Mark All Read', icon: CheckCheck, action: markAllAsRead, disabled: stats.unread === 0 },
    { label: 'Archive All', icon: Archive, action: () => console.log('Archive all'), disabled: false },
    { label: 'Filters', icon: Filter, action: () => setShowFilters(!showFilters), disabled: false },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background animate-[fadeIn_0.3s_ease-out]">
      <div className="fixed right-0 top-0 h-full w-full max-w-md border-l border-border shadow-2xl bg-background">
        <Card className="h-full rounded-none border-0 bg-background shadow-none">
          {/* Header */}
          <div className="px-6 py-4 bg-background border-b border-border">
             <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    Notifications
                  </h2>
                  {stats.unread > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {stats.unread} unread updates
                    </p>
                  )}
                </div>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive interactive-press"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <CardHeader className="pb-4">

            {/* Enhanced Search with Glass Effect */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                 type="text"
                 placeholder="Search notifications..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-10 border border-input bg-background focus:ring-2 focus:ring-primary/30 transition-all duration-300"
               />
            </div>

            {/* Quick Actions with Interactive Effects */}
            <div className="flex items-center gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="glass"
                  size="sm"
                  onClick={action.action}
                  disabled={action.disabled}
                  className="h-8 px-3 text-xs interactive-press"
                >
                  <action.icon className="w-3 h-3 mr-1" />
                  {action.label}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="px-0 py-0 flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Enhanced Tab Navigation with Glass Effect */}
              <div className="px-6 py-4 border-b border-border/30 bg-background">
                 <TabsList className="w-full grid grid-cols-4 h-10 bg-background">
                  <TabsTrigger value="all" className="text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">
                    <div className="flex items-center gap-1">
                      All
                      {getTabCount('all') > 0 && (
                        <Badge variant="secondary" className="h-4 text-xs px-1 animate-pulse">
                          {getTabCount('all')}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">
                    <div className="flex items-center gap-1">
                      New
                      {stats.unread > 0 && (
                        <Badge variant="destructive" className="h-4 text-xs px-1 animate-[bounceSoft_1s_ease-out_infinite]">
                          {stats.unread}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="important" className="text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      High
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="habits" className="text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Habits
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Enhanced Content Area */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="px-6 py-4 pb-app-safe">
                     <TabsContent value={activeTab} className="mt-0">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                            <p className="text-sm text-muted-foreground">Loading notifications...</p>
                          </div>
                        </div>
                      ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
                            <Bell className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium text-foreground mb-2">All caught up!</h3>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery ? 'No notifications match your search' : 'No new notifications'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 animate-[fadeInUp_0.5s_ease-out]">
                          {filteredNotifications.map((notification, index) => (
                            <div 
                              key={notification.id}
                              style={{ animationDelay: `${index * 0.05}s` }}
                              className="animate-[fadeInUp_0.5s_ease-out]"
                            >
                              <ModernNotificationItem 
                                notification={notification} 
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </ScrollArea>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};