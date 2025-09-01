import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Bell, 
  Settings, 
  User, 
  Calendar,
  Users,
  Crown,
  TrendingUp
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCenter } from './NotificationCenter';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  onCalendarClick?: () => void;
  onSettingsClick?: () => void;
  onCommunityClick?: () => void;
  onAnalyticsClick?: () => void;
  onPremiumClick?: () => void;
  onProfileClick?: () => void;
}

export const Header = ({ onCalendarClick, onSettingsClick, onCommunityClick, onAnalyticsClick, onPremiumClick, onProfileClick }: HeaderProps) => {
  const { stats } = useNotifications();
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Habify</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Build Better Habits
              </p>
            </div>
          </div>

          {/* Desktop Navigation - Hidden on Mobile */}
          {!isMobile && (
            <nav className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={onCalendarClick}
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={onCommunityClick}
              >
                <Users className="w-4 h-4" />
                Community
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={onAnalyticsClick}
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-warning hover:text-warning/80"
                onClick={onPremiumClick}
              >
                <Crown className="w-4 h-4" />
                Premium
              </Button>
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => setIsNotificationCenterOpen(true)}
            >
              <Bell className="w-4 h-4" />
              {stats.unread > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-destructive text-destructive-foreground">
                  {stats.unread > 99 ? '99+' : stats.unread}
                </Badge>
              )}
            </Button>

            {/* Settings - Hidden on Mobile (available in bottom nav) */}
            {!isMobile && (
              <Button variant="ghost" size="sm" onClick={onSettingsClick}>
                <Settings className="w-4 h-4" />
              </Button>
            )}

            {/* Profile */}
            <Button variant="outline" size="sm" className="gap-2" onClick={onProfileClick}>
              <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </div>
        </div>
      </div>
      
      <NotificationCenter 
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </header>
  );
};