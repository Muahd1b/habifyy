import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
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
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  Facebook
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileModalProps {
  userId?: string;
  open: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ userId, open, onClose }: ProfileModalProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    location: '',
    website: '',
  });

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
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Profile</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile && !authLoading && !loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Profile Not Found</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Profile not found</h3>
            <p className="text-muted-foreground">This user profile doesn't exist or is private.</p>
          </div>
        </DialogContent>
      </Dialog>
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="relative">
        {profile.cover_image_url && (
          <div className="h-32 bg-gradient-primary rounded-lg mb-4" />
        )}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="text-lg">
              {profile.display_name?.[0] || profile.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold">
                {profile.display_name || profile.username || 'Anonymous User'}
              </h2>
              {profile.is_verified && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Level {profile.level} • {profile.points} points
            </p>
            {profile.bio && (
              <p className="text-sm mb-3">{profile.bio}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {profile.location}
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                     className="hover:text-primary">
                    Website
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isOwnProfile && (
              <Button
                onClick={toggleFollow}
                variant={isFollowing ? "outline" : "default"}
                size="sm"
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
            {isOwnProfile && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats?.totalHabits || 0}</div>
            <div className="text-xs text-muted-foreground">Active Habits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div className="text-2xl font-bold">{stats?.currentStreak || 0}</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div className="text-2xl font-bold">{stats?.followersCount || 0}</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-warning" />
            </div>
            <div className="text-2xl font-bold">{stats?.achievementsCount || 0}</div>
            <div className="text-xs text-muted-foreground">Achievements</div>
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
                <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Followers ({stats?.followersCount || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {followers.slice(0, 5).map((follower) => (
                <div key={follower.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={follower.profile?.avatar_url || ''} />
                    <AvatarFallback>
                      {follower.profile?.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {follower.profile?.display_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Level {follower.profile?.level || 1} • {follower.profile?.points || 0} points
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Following ({stats?.followingCount || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {following.slice(0, 5).map((follow) => (
                <div key={follow.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={follow.profile?.avatar_url || ''} />
                    <AvatarFallback>
                      {follow.profile?.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {follow.profile?.display_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Level {follow.profile?.level || 1} • {follow.profile?.points || 0} points
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isOwnProfile ? 'Your Profile' : `${profile.display_name || 'User'}'s Profile`}
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          renderEditProfile()
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="records">Records</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {renderOverview()}
            </TabsContent>

            <TabsContent value="social" className="mt-6">
              {renderFollowers()}
            </TabsContent>

            <TabsContent value="records" className="mt-6">
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
      </DialogContent>
    </Dialog>
  );
};