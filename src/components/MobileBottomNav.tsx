import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Calendar,
  Users,
  TrendingUp,
  Crown,
  Settings
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onSettingsClick: () => void;
  onPremiumClick: () => void;
}

const navItems = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    view: 'home'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    view: 'calendar'
  },
  {
    id: 'community',
    label: 'Community',
    icon: Users,
    view: 'community'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: TrendingUp,
    view: 'analytics'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    view: 'settings'
  }
];

export const MobileBottomNav = ({ activeView, onViewChange, onSettingsClick, onPremiumClick }: MobileBottomNavProps) => {
  const isMobile = useIsMobile();

  // Don't render on desktop
  if (!isMobile) return null;

  const handleItemClick = (item: typeof navItems[0]) => {
    if (item.id === 'settings') {
      onSettingsClick();
    } else if (item.id === 'premium') {
      onPremiumClick();
    } else {
      onViewChange(item.view);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.view || (activeView === 'home' && item.id === 'home');
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex-1 flex-col h-12 gap-1 text-xs font-medium transition-colors",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground",
                item.id === 'premium' && "text-warning hover:text-warning/80"
              )}
              onClick={() => handleItemClick(item)}
            >
              <Icon className={cn(
                "h-5 w-5", 
                isActive && "text-primary",
                item.id === 'premium' && "text-warning"
              )} />
              <span className={cn(
                "text-[10px]", 
                isActive && "text-primary font-semibold",
                item.id === 'premium' && "text-warning font-medium"
              )}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-background/95" />
    </nav>
  );
};