import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Calendar, 
  Shield, 
  Crown, 
  Users, 
  BarChart3, 
  Moon, 
  Smartphone, 
  ChevronRight,
  Check,
  X,
  LogOut,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { useToast } from "@/hooks/use-toast";

interface SettingsProps {
  onClose: () => void;
}

export const Settings = ({ onClose }: SettingsProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile data
  const { profile, updateProfile, loading: profileLoading } = useProfile(user?.id);
  const { preferences, updatePreferences, loading: preferencesLoading } = useNotificationPreferences();
  
  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    location: '',
    website: '',
  });

  // Privacy settings based on profile
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showProgress: true,
    allowFriendRequests: true
  });
  const [theme, setTheme] = useState('light');
  const [isPremium, setIsPremium] = useState(false);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setEditForm({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
      });
      setPrivacy({
        profilePublic: !profile.privacy_profile,
        showProgress: profile.privacy_location || true,
        allowFriendRequests: true // Add this to profile schema if needed
      });
    }
  }, [profile]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      onClose();
    }
  };

  const ToggleSwitch = ({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label: string }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-foreground font-medium">{label}</span>
      <div 
        className={`w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
          enabled ? 'bg-primary' : 'bg-muted'
        }`}
        onClick={onChange}
      >
        <div 
          className={`w-5 h-5 bg-card rounded-full shadow-soft transform transition-transform duration-200 mt-0.5 ${
            enabled ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </div>
    </div>
  );

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="mb-4 overflow-hidden">
      <div className="px-4 py-3 bg-muted border-b border-border">
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="px-4 py-2">
        {children}
      </div>
    </Card>
  );

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }: {
    id: string;
    icon: React.ComponentType<any>;
    label: string;
    isActive: boolean;
    onClick: (id: string) => void;
  }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      onClick={() => onClick(id)}
      className={`flex items-center justify-start space-x-2 w-full transition-all duration-200 ${
        isActive 
          ? 'bg-primary text-primary-foreground shadow-soft' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </Button>
  );

  const PremiumBadge = () => (
    <div className="inline-flex items-center space-x-1 bg-gradient-to-r from-warning to-warning-light text-warning-foreground px-2 py-1 rounded-full text-xs font-semibold">
      <Crown size={12} />
      <span>Premium</span>
    </div>
  );

  const handleUpdateProfile = async () => {
    await updateProfile(editForm);
    setIsEditingProfile(false);
  };

  const handleUpdatePrivacy = async (updates: Partial<typeof privacy>) => {
    const newPrivacy = { ...privacy, ...updates };
    setPrivacy(newPrivacy);
    
    // Update profile with privacy settings
    await updateProfile({
      privacy_profile: !newPrivacy.profilePublic,
      privacy_location: !newPrivacy.showProgress,
    });
  };

  const renderProfileSettings = () => (
    <div className="space-y-4">
      {isEditingProfile ? (
        <SettingsSection title="Edit Profile">
          <div className="space-y-4">
            <div>
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={editForm.display_name}
                onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                placeholder="Enter your display name"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                placeholder="Enter your location"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateProfile}>Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </SettingsSection>
      ) : (
        <SettingsSection title="Profile Information">
          <div className="flex items-center space-x-4 py-3">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="text-xl font-bold">
                {profile?.display_name?.[0] || profile?.username?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">
                {profile?.display_name || profile?.username || 'Anonymous User'}
              </h4>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              <p className="text-primary text-sm font-medium">
                Member since {new Date(profile?.created_at || user?.created_at || Date.now()).toLocaleDateString()}
              </p>
              {profile?.bio && (
                <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
              )}
            </div>
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary-dark"
              onClick={() => setIsEditingProfile(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </SettingsSection>
      )}

      <SettingsSection title="Account Settings">
        <div className="space-y-3">
          <button className="flex items-center justify-between w-full py-3 text-left hover:bg-muted/50 rounded-lg px-2 transition-colors">
            <span className="text-foreground font-medium">Change Password</span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between w-full py-3 text-left hover:bg-muted/50 rounded-lg px-2 transition-colors">
            <span className="text-foreground font-medium">Backup & Sync</span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
          <Button 
            variant="outline" 
            className="w-full justify-between" 
            onClick={handleSignOut}
          >
            <span className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </span>
          </Button>
          <button className="flex items-center justify-between w-full py-3 text-left text-destructive hover:bg-destructive/10 rounded-lg px-2 transition-colors">
            <span className="font-medium">Delete Account</span>
            <ChevronRight size={18} className="text-destructive/70" />
          </button>
        </div>
      </SettingsSection>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      <SettingsSection title="Habit Reminders">
        <ToggleSwitch
          enabled={preferences?.habit_reminders ?? true}
          onChange={() => updatePreferences({ habit_reminders: !preferences?.habit_reminders })}
          label="Daily Habit Reminders"
        />
        <div className="border-t border-border pt-3">
          <button className="flex items-center justify-between w-full py-3 text-left hover:bg-muted/50 rounded-lg px-2 transition-colors">
            <span className="text-foreground font-medium">Reminder Times</span>
            <span className="text-muted-foreground text-sm">
              {preferences?.quiet_hours_start && preferences?.quiet_hours_end
                ? `Quiet: ${preferences.quiet_hours_start} - ${preferences.quiet_hours_end}`
                : 'Configure times'}
            </span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Progress & Social">
        <ToggleSwitch
          enabled={preferences?.streak_milestones ?? true}
          onChange={() => updatePreferences({ streak_milestones: !preferences?.streak_milestones })}
          label="Streak Milestones"
        />
        <ToggleSwitch
          enabled={preferences?.competition_updates ?? true}
          onChange={() => updatePreferences({ competition_updates: !preferences?.competition_updates })}
          label="Challenge Updates"
        />
        <ToggleSwitch
          enabled={preferences?.friend_activities ?? true}
          onChange={() => updatePreferences({ friend_activities: !preferences?.friend_activities })}
          label="Friend Activities"
        />
      </SettingsSection>

      <SettingsSection title="Notification Channels">
        <ToggleSwitch
          enabled={preferences?.push_enabled ?? true}
          onChange={() => updatePreferences({ push_enabled: !preferences?.push_enabled })}
          label="Push Notifications"
        />
        <ToggleSwitch
          enabled={preferences?.email_enabled ?? true}
          onChange={() => updatePreferences({ email_enabled: !preferences?.email_enabled })}
          label="Email Notifications"
        />
        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between py-3">
            <span className="text-foreground font-medium">Timezone</span>
            <span className="text-muted-foreground text-sm">
              {preferences?.timezone || 'UTC'}
            </span>
          </div>
        </div>
      </SettingsSection>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-4">
      <SettingsSection title="Profile Visibility">
        <ToggleSwitch
          enabled={privacy.profilePublic}
          onChange={() => handleUpdatePrivacy({ profilePublic: !privacy.profilePublic })}
          label="Public Profile"
        />
        <ToggleSwitch
          enabled={privacy.showProgress}
          onChange={() => handleUpdatePrivacy({ showProgress: !privacy.showProgress })}
          label="Show Location to Others"
        />
        <ToggleSwitch
          enabled={privacy.allowFriendRequests}
          onChange={() => handleUpdatePrivacy({ allowFriendRequests: !privacy.allowFriendRequests })}
          label="Allow Friend Requests"
        />
      </SettingsSection>

      <SettingsSection title="Data & Analytics">
        <div className="space-y-3">
          <button className="flex items-center justify-between w-full py-3 text-left hover:bg-muted/50 rounded-lg px-2 transition-colors">
            <span className="text-foreground font-medium">Download My Data</span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between w-full py-3 text-left hover:bg-muted/50 rounded-lg px-2 transition-colors">
            <span className="text-foreground font-medium">Usage Analytics</span>
            <span className="text-muted-foreground text-sm">Opt-in</span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>
      </SettingsSection>
    </div>
  );

  const renderPremiumSettings = () => (
    <div className="space-y-4">
      {!isPremium ? (
        <div className="bg-gradient-to-r from-warning to-warning-light rounded-xl p-6 text-warning-foreground">
          <div className="flex items-center space-x-2 mb-3">
            <Crown size={24} />
            <h3 className="text-xl font-bold">Upgrade to Premium</h3>
          </div>
          <p className="mb-4 opacity-90">Unlock advanced analytics, unlimited habits, and exclusive features</p>
          <Button className="bg-card text-warning hover:bg-card-hover font-semibold">
            Upgrade Now - $4.99/month
          </Button>
        </div>
      ) : (
        <div className="bg-gradient-success rounded-xl p-6 text-success-foreground">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Crown size={24} />
              <h3 className="text-xl font-bold">Premium Active</h3>
            </div>
            <Check size={24} />
          </div>
          <p className="opacity-90">Thank you for supporting Habifyy!</p>
        </div>
      )}

      <SettingsSection title="Premium Features">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <BarChart3 size={18} className="text-primary" />
              <span className="text-foreground font-medium">Advanced Analytics</span>
            </div>
            {isPremium ? (
              <Check size={18} className="text-success" />
            ) : (
              <PremiumBadge />
            )}
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <Users size={18} className="text-accent" />
              <span className="text-foreground font-medium">Unlimited Habit Tracking</span>
            </div>
            {isPremium ? (
              <Check size={18} className="text-success" />
            ) : (
              <PremiumBadge />
            )}
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <Bell size={18} className="text-warning" />
              <span className="text-foreground font-medium">Custom Reminders</span>
            </div>
            {isPremium ? (
              <Check size={18} className="text-success" />
            ) : (
              <PremiumBadge />
            )}
          </div>
        </div>
      </SettingsSection>
    </div>
  );

  const renderAppSettings = () => (
    <div className="space-y-4">
      <SettingsSection title="Appearance">
        <div className="py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-foreground font-medium">Theme</span>
          </div>
          <div className="flex space-x-3">
            {['light', 'dark', 'auto'].map((themeOption) => (
              <Button
                key={themeOption}
                variant={theme === themeOption ? "default" : "outline"}
                onClick={() => setTheme(themeOption)}
                className="flex-1 capitalize"
              >
                {themeOption}
              </Button>
            ))}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Calendar Integration">
        <button className="flex items-center justify-between w-full py-3 text-left hover:bg-muted/50 rounded-lg px-2 transition-colors">
          <div className="flex items-center space-x-3">
            <Calendar size={18} className="text-primary" />
            <span className="text-foreground font-medium">Google Calendar</span>
          </div>
          <span className="text-success text-sm font-medium">Connected</span>
        </button>
        <div className="border-t border-border pt-3">
          <ToggleSwitch
            enabled={true}
            onChange={() => {}}
            label="Sync Habit Schedules"
          />
        </div>
      </SettingsSection>

      <SettingsSection title="App Preferences">
        <div className="space-y-3">
          <button className="flex items-center justify-between w-full py-3 text-left hover:bg-muted/50 rounded-lg px-2 transition-colors">
            <span className="text-foreground font-medium">Language</span>
            <span className="text-muted-foreground text-sm">English</span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between w-full py-3 text-left hover:bg-muted/50 rounded-lg px-2 transition-colors">
            <span className="text-foreground font-medium">Storage & Cache</span>
            <span className="text-muted-foreground text-sm">2.1 MB</span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between w-full py-3 text-left hover:bg-muted/50 rounded-lg px-2 transition-colors">
            <span className="text-foreground font-medium">App Version</span>
            <span className="text-muted-foreground text-sm">1.2.3</span>
          </button>
        </div>
      </SettingsSection>
    </div>
  );

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'privacy', icon: Shield, label: 'Privacy' },
    { id: 'premium', icon: Crown, label: 'Premium' },
    { id: 'app', icon: Smartphone, label: 'App' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'premium':
        return renderPremiumSettings();
      case 'app':
        return renderAppSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full max-h-[90vh] bg-background rounded-xl shadow-strong border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-lg">
              <SettingsIcon className="text-primary-foreground" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Manage your Habifyy experience</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-100px)]">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 bg-muted/20 border-r border-border p-4">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  id={tab.id}
                  icon={tab.icon}
                  label={tab.label}
                  isActive={activeTab === tab.id}
                  onClick={setActiveTab}
                />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 text-center text-muted-foreground text-sm">
          <p>Need help? <Button variant="link" className="text-primary hover:underline p-0 h-auto">Contact Support</Button></p>
        </div>
      </div>
    </div>
  );
};