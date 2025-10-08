import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  BarChart3, 
  Users, 
  Settings, 
  Crown,
  Search,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useIsMobile } from '@/hooks/use-mobile';
import logo from '@/assets/habifyy-logo.png';

interface ModernHeaderProps {
  onCalendarClick: () => void;
  onSettingsClick: () => void;
  onCommunityClick: () => void;
  onAnalyticsClick: () => void;
  onPremiumClick: () => void;
  onProfileClick: () => void;
}

export const ModernHeader = ({
  onCalendarClick,
  onSettingsClick,
  onCommunityClick,
  onAnalyticsClick,
  onPremiumClick,
  onProfileClick
}: ModernHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();
  const isMobile = useIsMobile();

  const navigationItems = [
    { 
      label: 'Calendar', 
      icon: Calendar, 
      onClick: onCalendarClick,
      badge: null
    },
    { 
      label: 'Analytics', 
      icon: BarChart3, 
      onClick: onAnalyticsClick,
      badge: null
    },
    { 
      label: 'Community', 
      icon: Users, 
      onClick: onCommunityClick,
      badge: null
    },
    { 
      label: 'Settings', 
      icon: Settings, 
      onClick: onSettingsClick,
      badge: null
    }
  ];

  const MobileMenu = () => (
    <div className={`
      fixed inset-0 z-50 bg-background/95 backdrop-blur-lg transform transition-transform duration-300
      ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      md:hidden
    `}>
      <div className="flex flex-col h-full">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
              onClick={() => {
                item.onClick();
                setIsMobileMenuOpen(false);
              }}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.badge && (
                <Badge variant="destructive" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
          
          <div className="border-t pt-4 mt-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              onClick={() => {
                onPremiumClick();
                setIsMobileMenuOpen(false);
              }}
            >
              <Crown className="w-5 h-5" />
              Premium
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Section - Enhanced */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={logo} alt="Habifyy Logo" className="w-10 h-10 rounded-xl shadow-sm" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Habifyy
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Personal Growth Platform
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden md:flex items-center gap-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    size="sm"
                    onClick={item.onClick}
                    className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {item.badge && (
                      <Badge variant="destructive">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                ))}
              </nav>
            )}

            {/* Right Section - Enhanced */}
            <div className="flex items-center gap-3">
              {/* Search Button - Desktop only */}
              {!isMobile && (
                <Button variant="ghost" size="icon" className="hover:bg-muted">
                  <Search className="w-4 h-4" />
                </Button>
              )}

              {/* Premium Button - Enhanced */}
              <Button
                variant="outline"
                size="sm"
                onClick={onPremiumClick}
                className="hidden md:flex gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-700 hover:from-amber-500/20 hover:to-orange-500/20 hover:border-amber-300 transition-all duration-200"
              >
                <Crown className="w-4 h-4" />
                Premium
              </Button>

              {/* Enhanced Profile Avatar */}
              <Button
                variant="ghost"
                onClick={onProfileClick}
                className="relative p-1 hover:bg-muted rounded-full"
              >
                <Avatar className="w-8 h-8 ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200">
                  <AvatarImage 
                    src={profile?.avatar_url || undefined} 
                    alt={profile?.display_name || 'User'} 
                  />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold">
                    {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {profile?.is_verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </Button>

              {/* Mobile Menu Toggle */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu />
    </>
  );
};
