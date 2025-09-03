import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Bell, Shield, Palette, Smartphone, Info, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface MobileSettingsProps {
  onClose: () => void;
}

const MobileSettings = ({ onClose }: MobileSettingsProps) => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, loading: profileLoading } = useProfile(user?.id);
  const { preferences, updatePreferences } = useNotificationPreferences();
  const { toast } = useToast();
  
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    display_name: '',
    bio: '',
    location: '',
    website: ''
  });
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Privacy settings based on profile
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showLocation: true
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
      });
      setPrivacy({
        profilePublic: !profile.privacy_profile,
        showLocation: !profile.privacy_location
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData);
      setEditMode(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePrivacy = async (updates: Partial<typeof privacy>) => {
    const newPrivacy = { ...privacy, ...updates };
    setPrivacy(newPrivacy);
    
    try {
      // Update profile with privacy settings
      await updateProfile({
        privacy_profile: !newPrivacy.profilePublic,
        privacy_location: !newPrivacy.showLocation,
      });
      toast({
        title: "Privacy updated",
        description: "Your privacy settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    try {
      await updatePreferences({ [key]: value });
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="profile" className="flex flex-col h-full">
            {/* Tab Navigation */}
            <div className="border-b bg-background/95">
              <ScrollArea className="w-full">
                <TabsList className="inline-flex h-12 items-center justify-start rounded-none bg-transparent p-0 w-max">
                  <TabsTrigger 
                    value="profile" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger 
                    value="privacy" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Privacy
                  </TabsTrigger>
                  <TabsTrigger 
                    value="mobile" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Mobile
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <TabsContent value="profile" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {/* Profile Header */}
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Avatar className="h-20 w-20 mx-auto mb-4">
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                            {profile?.display_name?.[0] || profile?.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-lg font-semibold">{profile?.display_name || 'Anonymous'}</h3>
                        <p className="text-sm text-muted-foreground">{profile?.username || 'No username'}</p>
                        <div className="flex items-center justify-center gap-4 mt-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">{profile?.points || 0}</div>
                            <div className="text-xs text-muted-foreground">Points</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-secondary">{profile?.level || 1}</div>
                            <div className="text-xs text-muted-foreground">Level</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Profile Details */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base">Profile Information</CardTitle>
                        <Button 
                          variant={editMode ? "default" : "outline"} 
                          size="sm"
                          onClick={editMode ? handleSaveProfile : () => setEditMode(true)}
                        >
                          {editMode ? 'Save' : 'Edit'}
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="display_name">Display Name</Label>
                          <Input
                            id="display_name"
                            value={profileData.display_name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                            disabled={!editMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                            disabled={!editMode}
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                            disabled={!editMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={profileData.website}
                            onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                            disabled={!editMode}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Logout Button */}
                    <Card className="p-6">
                      <Button
                        variant="outline"
                        onClick={() => setShowLogoutDialog(true)}
                        className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="notifications" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Notification Preferences
                        </CardTitle>
                        <CardDescription>
                          Choose what notifications you'd like to receive
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="habit-reminders">Habit Reminders</Label>
                            <p className="text-sm text-muted-foreground">Get reminded about your daily habits</p>
                          </div>
                          <Switch
                            id="habit-reminders"
                            checked={preferences?.habit_reminders || false}
                            onCheckedChange={(checked) => handleNotificationToggle('habit_reminders', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="streak-milestones">Streak Milestones</Label>
                            <p className="text-sm text-muted-foreground">Celebrate your achievement streaks</p>
                          </div>
                          <Switch
                            id="streak-milestones"
                            checked={preferences?.streak_milestones || false}
                            onCheckedChange={(checked) => handleNotificationToggle('streak_milestones', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="friend-activities">Friend Activities</Label>
                            <p className="text-sm text-muted-foreground">See updates from your friends</p>
                          </div>
                          <Switch
                            id="friend-activities"
                            checked={preferences?.friend_activities || false}
                            onCheckedChange={(checked) => handleNotificationToggle('friend_activities', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="competition-updates">Competition Updates</Label>
                            <p className="text-sm text-muted-foreground">Updates about competitions you joined</p>
                          </div>
                          <Switch
                            id="competition-updates"
                            checked={preferences?.competition_updates || false}
                            onCheckedChange={(checked) => handleNotificationToggle('competition_updates', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="privacy" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Privacy Settings
                        </CardTitle>
                        <CardDescription>
                          Control who can see your information and activity
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                         <div className="flex items-center justify-between">
                           <div>
                             <Label>Public Profile</Label>
                             <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
                           </div>
                           <Switch
                             checked={privacy.profilePublic}
                             onCheckedChange={(checked) => handleUpdatePrivacy({ profilePublic: checked })}
                           />
                         </div>
                         
                         <div className="flex items-center justify-between">
                           <div>
                             <Label>Share Location</Label>
                             <p className="text-sm text-muted-foreground">Show your location to friends</p>
                           </div>
                           <Switch
                             checked={privacy.showLocation}
                             onCheckedChange={(checked) => handleUpdatePrivacy({ showLocation: checked })}
                           />
                         </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="mobile" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Mobile Settings
                        </CardTitle>
                        <CardDescription>
                          Optimize your mobile experience
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Haptic Feedback</Label>
                            <p className="text-sm text-muted-foreground">Feel vibrations for interactions</p>
                          </div>
                          <Switch defaultChecked={true} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Reduce Motion</Label>
                            <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                          </div>
                          <Switch defaultChecked={false} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Dark Mode</Label>
                            <p className="text-sm text-muted-foreground">Use dark theme</p>
                          </div>
                          <Switch defaultChecked={false} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* App Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          App Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Version</span>
                          <Badge variant="outline">1.0.0</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Last Updated</span>
                          <span className="text-sm">Today</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Storage Used</span>
                          <span className="text-sm">2.3 MB</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MobileSettings;