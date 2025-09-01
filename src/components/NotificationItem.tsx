import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  Heart,
  MessageCircle,
  Settings,
  Star,
  Trophy,
  Trash2,
  User,
  Users,
  Zap
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead, deleteNotification } = useNotifications();

  const getNotificationIcon = () => {
    switch (notification.notification_type) {
      case 'habit_reminder':
        return <Clock className="w-4 h-4" />;
      case 'streak_milestone':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'streak_risk':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'habit_completion':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'friend_request':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'friend_activity':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'challenge_invitation':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'competition_update':
        return <Trophy className="w-4 h-4 text-orange-500" />;
      case 'marketplace_purchase':
        return <Star className="w-4 h-4 text-green-500" />;
      case 'system_update':
        return <Settings className="w-4 h-4 text-gray-500" />;
      case 'security_alert':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Handle action_data if present
    if (notification.action_data) {
      console.log('Notification action:', notification.action_data);
      // Add navigation or action handling here based on action_data
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:bg-accent/50 ${
        !notification.is_read ? 'bg-accent/20 border-primary/20' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${!notification.is_read ? 'bg-primary/10' : 'bg-muted'}`}>
          {getNotificationIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-sm font-medium truncate ${
              !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {notification.title}
            </h4>
            {notification.priority !== 'low' && (
              <Badge variant={getPriorityColor()} className="text-xs py-0">
                {notification.priority}
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {timeAgo}
            </span>
            
            <div className="flex items-center gap-1">
              {!notification.is_read && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};