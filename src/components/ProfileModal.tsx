import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth'; 
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { 
  User, 
  UserPlus, 
  UserMinus, 
  MapPin, 
  Globe, 
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  Users,
  Star,
  Link as LinkIcon,
  Edit3,
  Edit2,
  LogOut,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  Facebook,
  ArrowLeft
} from 'lucide-react';
import { FindFriendsModal } from '@/components/community/FindFriendsModal';

interface ProfileModalProps {
  userId?: string;
  onClose: () => void;
}

export const ProfileModal = ({ userId, onClose }: ProfileModalProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showFindFriendsModal, setShowFindFriendsModal] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    location: '',
    website: '',
  });
  
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  // Get current user to determine if this is own profile
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      setAuthLoading(false);
    };
    getCurrentUser();
  }, []);
  
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = currentUser?.id === targetUserId;

  const {
    profile,
    followers,
    following,
    socialLinks,
    userRecords,
    stats,
    isFollowing,
    loading,
    toggleFollow,
    addSocialLink,
    removeSocialLink,
    updateProfile,
  } = useProfile(targetUserId);

  if (authLoading || loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile && !authLoading && !loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center gap-4 p-4 border-b">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Profile not found</h3>
            <p className="text-muted-foreground">This user profile doesn't exist or is private.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleEditSubmit = async () => {
    await updateProfile(editForm);
    setIsEditing(false);
  };

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, any> = {
      twitter: Twitter,
      instagram: Instagram,
      linkedin: Linkedin,
      github: Github,
      youtube: Youtube,
      facebook: Facebook,
    };
    return icons[platform.toLowerCase()] || LinkIcon;
  };

  const handleSendFriendRequest = async (friendId: string, friendName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Log in to send friend requests.",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    const { error } = await supabase
      .from('friend_requests')
      .insert([{ requester_id: user.id, recipient_id: friendId, status: 'pending' }]);

    if (error) {
      const message =
        error.code === '23505'
          ? "You already have a pending request with this user."
          : error.message ?? "Unable to send friend request.";

      toast({
        title: "Unable to send request",
        description: message,
        variant: "destructive",
      });

      throw new Error(message);
    }

    toast({
      title: "Friend request sent",
      description: `Your request to ${friendName} is on the way.`,
    });
  };

  const renderOverview = () => (
    <div className="space-y-4 md:space-y-6">
      {/* Profile Header */}
      <div className="relative">
        {profile.cover_image_url && (
          <div className="h-24 md:h-32 bg-gradient-primary rounded-lg mb-3 md:mb-4" />
        )}
        <div className="flex items-start gap-3 md:gap-4">
          <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 md:border-4 border-background">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="text-base md:text-lg">
              {profile.display_name?.[0] || profile.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg md:text-xl font-bold truncate">
                {profile.display_name || profile.username || 'Anonymous User'}
              </h2>
              {profile.is_verified && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-2">
              Level {profile.level} • {profile.points} points
            </p>
            {profile.bio && (
              <p className="text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">{profile.bio}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3 flex-shrink-0" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                     className="hover:text-primary truncate">
                    Website
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="hidden md:inline">Joined </span>
                {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs md:text-sm">
              <span className="font-semibold text-foreground">
                {stats?.followersCount ?? followers.length} <span className="text-muted-foreground font-normal">followers</span>
              </span>
              <span className="font-semibold text-foreground">
                {stats?.followingCount ?? following.length} <span className="text-muted-foreground font-normal">following</span>
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {!isOwnProfile && (
              <Button
                onClick={toggleFollow}
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                className="h-8 md:h-9 px-2 md:px-3"
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                    <span className="hidden md:inline">Unfollow</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                    <span className="hidden md:inline">Follow</span>
                  </>
                )}
              </Button>
            )}
            {isOwnProfile && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="h-8 md:h-9 px-2 md:px-3"
              >
                <Edit3 className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">Edit</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid with Glass Effect */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <Card className="border border-border/60 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="mb-1 flex items-center justify-center md:mb-2">
              <div className="rounded-full bg-primary/10 p-1.5 md:p-2">
                <Target className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </div>
            <div className="text-xl font-bold md:text-2xl">{stats?.totalHabits || 0}</div>
            <div className="text-[10px] text-muted-foreground md:text-xs">Habits</div>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="mb-1 flex items-center justify-center md:mb-2">
              <div className="rounded-full bg-success/10 p-1.5 md:p-2">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-success" />
              </div>
            </div>
            <div className="text-xl font-bold md:text-2xl">{stats?.currentStreak || 0}</div>
            <div className="text-[10px] text-muted-foreground md:text-xs">Streak</div>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="mb-1 flex items-center justify-center md:mb-2">
              <div className="rounded-full bg-accent/10 p-1.5 md:p-2">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-accent" />
              </div>
            </div>
            <div className="text-xl font-bold md:text-2xl">{stats?.followersCount || 0}</div>
            <div className="text-[10px] text-muted-foreground md:text-xs">Followers</div>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="mb-1 flex items-center justify-center md:mb-2">
              <div className="rounded-full bg-warning/10 p-1.5 md:p-2">
                <Trophy className="h-4 w-4 md:h-5 md:w-5 text-warning" />
              </div>
            </div>
            <div className="text-xl font-bold md:text-2xl">{stats?.achievementsCount || 0}</div>
            <div className="text-[10px] text-muted-foreground md:text-xs">Awards</div>
          </CardContent>
        </Card>
      </div>

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Social Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((link) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <Button
                    key={link.id}
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <Icon className="h-4 w-4 mr-2" />
                      {link.display_name || link.platform}
                    </a>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Records */}
      {userRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Records</CardTitle>
            <CardDescription>Your latest achievements and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div>
                    <p className="font-medium">{record.record_type.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">{record.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{record.record_value}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.achieved_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderFollowers = () => (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Social Connections
            </CardTitle>
            <CardDescription>Stay inspired by the people who cheer you on</CardDescription>
          </div>
          {isOwnProfile && (
            <Button
              size="sm"
              onClick={() => setShowFindFriendsModal(true)}
              className="w-full md:w-auto"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Find Friends
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="followers" className="space-y-4">
          <TabsList className="mx-auto flex w-full max-w-md justify-center gap-2 rounded-full border border-border/40 bg-background/70 p-1 backdrop-blur-sm">
            <TabsTrigger
              value="followers"
              className="flex-1 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Followers ({stats?.followersCount || followers.length})
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Following ({stats?.followingCount || following.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers">
            {followers.length > 0 ? (
              <ScrollArea className="max-h-72 pr-2">
                <div className="space-y-3">
                  {followers.map((follower) => {
                    const displayName = follower.profile?.display_name || follower.profile?.username || 'Anonymous';
                    const level = follower.profile?.level || 1;
                    const points = follower.profile?.points || 0;
                    const connectedAt = follower.created_at
                      ? new Date(follower.created_at).toLocaleDateString()
                      : 'Recently';

                    return (
                      <div
                        key={follower.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/40"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={follower.profile?.avatar_url || ''} />
                            <AvatarFallback>
                              {displayName[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{displayName}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="px-2 py-0.5 text-[11px]">
                                Level {level}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {points} pts
                              </span>
                              <span className="text-muted-foreground/80">Since {connectedAt}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/10 p-10 text-center">
                <Users className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-semibold">No followers yet</p>
                  <p className="text-sm text-muted-foreground">Share your progress to build your community.</p>
                </div>
                {isOwnProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFindFriendsModal(true)}
                    className="mt-2"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Find Friends
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following">
            {following.length > 0 ? (
              <ScrollArea className="max-h-72 pr-2">
                <div className="space-y-3">
                  {following.map((follow) => {
                    const displayName = follow.profile?.display_name || follow.profile?.username || 'Anonymous';
                    const level = follow.profile?.level || 1;
                    const points = follow.profile?.points || 0;
                    const connectedAt = follow.created_at
                      ? new Date(follow.created_at).toLocaleDateString()
                      : 'Recently';

                    return (
                      <div
                        key={follow.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/40"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={follow.profile?.avatar_url || ''} />
                            <AvatarFallback>
                              {displayName[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{displayName}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="px-2 py-0.5 text-[11px]">
                                Level {level}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {points} pts
                              </span>
                              <span className="text-muted-foreground/80">Since {connectedAt}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/10 p-10 text-center">
                <UserPlus className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-semibold">You’re not following anyone yet</p>
                  <p className="text-sm text-muted-foreground">Discover and follow creators to get inspired.</p>
                </div>
                {isOwnProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFindFriendsModal(true)}
                    className="mt-2"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Find Friends
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  const renderEditProfile = () => (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={editForm.display_name}
            onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
            placeholder={profile.display_name || ''}
          />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={editForm.bio}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
            placeholder={profile.bio || 'Tell us about yourself...'}
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={editForm.location}
            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
            placeholder={profile.location || ''}
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={editForm.website}
            onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
            placeholder={profile.website || 'https://'}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEditSubmit}>Save Changes</Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background md:bg-background/80 md:backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4 pointer-events-none overflow-hidden">
        <Card className="w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] flex flex-col pointer-events-auto animate-scale-in shadow-2xl md:rounded-xl rounded-none border-0 md:border">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-muted/20 p-4 md:p-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full md:hidden">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold">
                {isOwnProfile ? 'Your Profile' : `${profile.display_name || 'User'}'s Profile`}
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="interactive-press">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 pb-app-safe">
            <div className="p-4 md:p-6">
              {isEditing ? (
                renderEditProfile()
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                  <TabsList className="mx-auto flex w-full flex-wrap items-center justify-center gap-2 rounded-full border border-border/30 bg-background/70 p-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 sm:w-auto">
                    <TabsTrigger
                      value="overview"
                      className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-[0_6px_18px_rgba(15,23,42,0.12)] dark:data-[state=active]:bg-slate-950/80"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="social"
                      className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-[0_6px_18px_rgba(15,23,42,0.12)] dark:data-[state=active]:bg-slate-950/80"
                    >
                      Social
                    </TabsTrigger>
                    <TabsTrigger
                      value="records"
                      className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-[0_6px_18px_rgba(15,23,42,0.12)] dark:data-[state=active]:bg-slate-950/80"
                    >
                      Records
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    {renderOverview()}
                  </TabsContent>

                  <TabsContent value="social">
                    {renderFollowers()}
                  </TabsContent>

                  <TabsContent value="records">
                    <Card>
                      <CardHeader>
                        <CardTitle>All Personal Records</CardTitle>
                        <CardDescription>Complete history of achievements and milestones</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {userRecords.length > 0 ? (
                          <div className="space-y-3">
                            {userRecords.map((record) => (
                              <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                  <p className="font-medium">{record.record_type.replace('_', ' ').toUpperCase()}</p>
                                  <p className="text-sm text-muted-foreground">{record.category}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-primary">{record.record_value}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(record.achieved_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Records Yet</h3>
                            <p className="text-muted-foreground">
                              {isOwnProfile ? 'Keep building habits to earn your first records!' : 'This user hasn\'t earned any records yet.'}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Logout Dialog */}
      <ConfirmationDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        actionLabel="Sign Out"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          const { error } = await signOut();
          if (!error) {
            onClose();
          }
        }}
      />
      <FindFriendsModal
        open={showFindFriendsModal}
        onClose={() => setShowFindFriendsModal(false)}
        onFriendRequest={handleSendFriendRequest}
      />
    </>
  );
};
