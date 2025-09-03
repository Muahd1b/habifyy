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
  Zap,
  ArrowRight,
  Check
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';

interface ModernNotificationItemProps {
  notification: Notification;
}

export const ModernNotificationItem: React.FC<ModernNotificationItemProps> = ({ notification }) => {
  const { markAsRead, deleteNotification } = useNotifications();

  const getNotificationIcon = () => {
    const iconClass = "w-5 h-5";
    switch (notification.notification_type) {
      case 'habit_reminder':
        return <Clock className={`${iconClass} text-blue-500`} />;
      case 'streak_milestone':
        return <Trophy className={`${iconClass} text-yellow-500`} />;
      case 'streak_risk':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      case 'habit_completion':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'friend_request':
        return <User className={`${iconClass} text-blue-500`} />;
      case 'friend_activity':
        return <Users className={`${iconClass} text-purple-500`} />;
      case 'challenge_invitation':
        return <Zap className={`${iconClass} text-orange-500`} />;
      case 'competition_update':
        return <Trophy className={`${iconClass} text-gold-500`} />;
      case 'marketplace_purchase':
        return <Star className={`${iconClass} text-green-500`} />;
      case 'system_update':
        return <Settings className={`${iconClass} text-gray-500`} />;
      case 'security_alert':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      default:
        return <Bell className={`${iconClass} text-primary`} />;
    }
  };

  const getPriorityStyles = () => {
    switch (notification.priority) {
      case 'critical':
        return {
          border: 'border-red-200 dark:border-red-800',
          bg: 'bg-red-50/50 dark:bg-red-950/20',
          badge: 'destructive' as const
        };
      case 'high':
        return {
          border: 'border-orange-200 dark:border-orange-800',
          bg: 'bg-orange-50/50 dark:bg-orange-950/20',
          badge: 'destructive' as const
        };
      case 'medium':
        return {
          border: 'border-blue-200 dark:border-blue-800',
          bg: 'bg-blue-50/30 dark:bg-blue-950/20',
          badge: 'secondary' as const
        };
      default:
        return {
          border: 'border-border',
          bg: 'bg-background',
          badge: 'outline' as const
        };
    }
  };

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Handle action_data if present
    if (notification.action_data) {
      console.log('Notification action:', notification.action_data);
    }
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
  const priorityStyles = getPriorityStyles();

  return (
    <Card
      className={`
        group cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]
        ${!notification.is_read ? `${priorityStyles.bg} ${priorityStyles.border} shadow-sm` : 'hover:bg-accent/50'}
        ${!notification.is_read ? 'animate-fade-in' : ''}
      `}
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Enhanced Icon */}
          <div className={`
            p-2 rounded-full shrink-0 transition-all duration-200
            ${!notification.is_read ? 'bg-primary/15 scale-110' : 'bg-muted group-hover:bg-primary/10'}
          `}>
            {getNotificationIcon()}
          </div>

          {/* Enhanced Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <h4 className={`
                font-medium text-sm leading-5 line-clamp-1
                ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}
              `}>
                {notification.title}
              </h4>
              
              <div className="flex items-center gap-1 shrink-0">
                {notification.priority !== 'low' && (
                  <Badge variant={priorityStyles.badge} className="text-xs py-0 px-2 h-5">
                    {notification.priority}
                  </Badge>
                )}
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>
            </div>

            {/* Message */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {notification.message}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground font-medium">
                {timeAgo}
              </span>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkRead}
                    className="h-7 w-7 p-0 hover:bg-primary/20 hover:text-primary"
                    title="Mark as read"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive"
                  title="Delete notification"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>

                {notification.action_data && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-accent"
                    title="Take action"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar for important notifications */}
        {(notification.priority === 'high' || notification.priority === 'critical') && notification.action_data && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-center gap-2 h-8 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Action:', notification.action_data);
              }}
            >
              Take Action
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};