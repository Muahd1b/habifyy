import { useState } from 'react';
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

interface HeaderProps {
  onCalendarClick?: () => void;
  onSettingsClick?: () => void;
  onCommunityClick?: () => void;
  onAnalyticsClick?: () => void;
}

export const Header = ({ onCalendarClick, onSettingsClick, onCommunityClick, onAnalyticsClick }: HeaderProps) => {
  const [notifications] = useState(2);
  
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

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
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
            <Button variant="ghost" size="sm" className="gap-2 text-warning">
              <Crown className="w-4 h-4" />
              Premium
            </Button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-destructive text-destructive-foreground">
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="sm" onClick={onSettingsClick}>
              <Settings className="w-4 h-4" />
            </Button>

            {/* Profile */}
            <Button variant="outline" size="sm" className="gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};