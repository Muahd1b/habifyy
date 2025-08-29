import React, { useState } from 'react';
import { 
  Users, 
  Trophy, 
  ShoppingBag, 
  Award,
  MapPin,
  User,
  MessageSquare,
  Calendar,
  ChevronRight,
  Zap,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { useCommunity } from '@/hooks/useCommunity';
import FriendsSection from './community/FriendsSection';
import CompetitionsSection from './community/CompetitionsSection';
import MarketplaceSection from './community/MarketplaceSection';
import AchievementsSection from './community/AchievementsSection';
import MapSection from './community/MapSection';

interface CommunityProps {
  onClose: () => void;
  open: boolean;
}

const Community = ({ onClose, open }: CommunityProps) => {
  const { 
    profile, 
    friends, 
    competitions, 
    marketplaceItems, 
    achievements, 
    userAchievements, 
    activityFeed, 
    loading 
  } = useCommunity();

  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Community</h1>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-96 lg:col-span-2" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const stats = [
    {
      title: 'Your Points',
      value: profile?.points || 0,
      icon: <Zap className="h-6 w-6 text-primary" />,
      description: 'Earned from habits'
    },
    {
      title: 'Friends',
      value: friends.length,
      icon: <Users className="h-6 w-6 text-secondary" />,
      description: 'Connected friends'
    },
    {
      title: 'Competitions',
      value: competitions.filter(c => c.status === 'active').length,
      icon: <Trophy className="h-6 w-6 text-success" />,
      description: 'Active competitions'
    },
    {
      title: 'Achievements',
      value: userAchievements.length,
      icon: <Award className="h-6 w-6 text-warning" />,
      description: 'Unlocked badges'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Community Activity
            </CardTitle>
            <CardDescription>See what your friends are up to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityFeed.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-sm font-semibold">
                  {activity.profile?.display_name?.[0] || activity.profile?.username?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.profile?.display_name || activity.profile?.username || 'Anonymous'}</span>
                    {' '}
                    {activity.activity_type === 'habit_completed' && 'completed a habit'}
                    {activity.activity_type === 'streak_milestone' && 'reached a streak milestone'}
                    {activity.activity_type === 'achievement_earned' && 'earned an achievement'}
                    {activity.activity_type === 'competition_joined' && 'joined a competition'}
                    {activity.activity_type === 'friend_added' && 'made a new friend'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {activityFeed.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No activity yet. Add some friends to see updates!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to popular features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => setActiveTab('friends')}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Find Friends
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => setActiveTab('competitions')}
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Join Competitions
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => setActiveTab('marketplace')}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Browse Marketplace
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => setActiveTab('map')}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Explore Map
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Community</h1>
              <p className="text-muted-foreground">Connect, compete, and grow together</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                Level {profile?.level || 1}
              </Badge>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold">
                {profile?.display_name?.[0] || profile?.username?.[0] || 'U'}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Friends
              </TabsTrigger>
              <TabsTrigger value="competitions" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Competitions
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Map
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {renderOverview()}
            </TabsContent>

            <TabsContent value="friends">
              <FriendsSection />
            </TabsContent>

            <TabsContent value="competitions">
              <CompetitionsSection />
            </TabsContent>

            <TabsContent value="marketplace">
              <MarketplaceSection />
            </TabsContent>

            <TabsContent value="achievements">
              <AchievementsSection />
            </TabsContent>

            <TabsContent value="map">
              <MapSection />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Community;