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
    id: 'premium',
    label: 'Premium',
    icon: Crown,
    view: 'premium'
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around h-16 px-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.view || (activeView === 'home' && item.id === 'home');
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex-1 flex-col h-14 gap-0.5 text-xs font-medium transition-all relative min-w-[60px]",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground active:scale-95",
                item.id === 'premium' && "text-warning hover:text-warning/80"
              )}
              onClick={() => handleItemClick(item)}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
              )}
              
              <Icon className={cn(
                "h-6 w-6 transition-transform", 
                isActive && "scale-110 text-primary",
                item.id === 'premium' && "text-warning"
              )} />
              <span className={cn(
                "text-[10px] leading-tight", 
                isActive && "text-primary font-semibold",
                item.id === 'premium' && "text-warning font-medium"
              )}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};