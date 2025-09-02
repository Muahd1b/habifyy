import React, { useState } from 'react';
import { 
  Users, 
  Trophy, 
  ShoppingBag, 
  Award,
  MapPin,
  ArrowLeft,
  MessageSquare,
  Zap,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCommunity } from '@/hooks/useCommunity';
import FriendsSection from './community/FriendsSection';
import CompetitionsSection from './community/CompetitionsSection';
import MarketplaceSection from './community/MarketplaceSection';
import AchievementsSection from './community/AchievementsSection';
import MapSection from './community/MapSection';

interface MobileCommunityProps {
  onClose: () => void;
}

const MobileCommunity = ({ onClose }: MobileCommunityProps) => {
  const { 
    profile, 
    friends, 
    competitions, 
    marketplaceItems, 
    achievements, 
    userAchievements, 
    activityFeed, 
    loading,
    refetch
  } = useCommunity();

  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetch.profile(),
      refetch.friends(),
      refetch.competitions(),
      refetch.marketplaceItems(),
      refetch.achievements(),
      refetch.activityFeed()
    ]);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Community</h1>
            <div className="w-10" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Points',
      value: profile?.points || 0,
      icon: <Zap className="h-5 w-5 text-primary" />,
      description: 'Earned from habits'
    },
    {
      title: 'Friends',
      value: friends.length,
      icon: <Users className="h-5 w-5 text-secondary" />,
      description: 'Connected'
    },
    {
      title: 'Competitions',
      value: competitions.filter(c => c.status === 'active').length,
      icon: <Trophy className="h-5 w-5 text-success" />,
      description: 'Active'
    },
    {
      title: 'Achievements',
      value: userAchievements.length,
      icon: <Award className="h-5 w-5 text-warning" />,
      description: 'Unlocked'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activityFeed.slice(0, 3).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg bg-accent/5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-sm font-semibold">
                {activity.profile?.display_name?.[0] || activity.profile?.username?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
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
            <div className="text-center py-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="h-12 flex-col gap-1"
          onClick={() => setActiveTab('friends')}
        >
          <Users className="h-4 w-4" />
          <span className="text-xs">Find Friends</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-12 flex-col gap-1"
          onClick={() => setActiveTab('competitions')}
        >
          <Trophy className="h-4 w-4" />
          <span className="text-xs">Competitions</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-12 flex-col gap-1"
          onClick={() => setActiveTab('marketplace')}
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="text-xs">Marketplace</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-12 flex-col gap-1"
          onClick={() => setActiveTab('map')}
        >
          <MapPin className="h-4 w-4" />
          <span className="text-xs">Explore</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold">Community</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                Level {profile?.level || 1}
              </Badge>
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xs font-semibold">
                {profile?.display_name?.[0] || profile?.username?.[0] || 'U'}
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            {/* Tab Navigation - Horizontal Scroll */}
            <div className="border-b bg-background/95">
              <ScrollArea className="w-full">
                <TabsList className="inline-flex h-12 items-center justify-start rounded-none bg-transparent p-0 w-max">
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="friends" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Friends
                  </TabsTrigger>
                  <TabsTrigger 
                    value="competitions" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Compete
                  </TabsTrigger>
                  <TabsTrigger 
                    value="marketplace" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Shop
                  </TabsTrigger>
                  <TabsTrigger 
                    value="achievements" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Rewards
                  </TabsTrigger>
                  <TabsTrigger 
                    value="map" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Map
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <TabsContent value="overview" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    {renderOverview()}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="friends" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <FriendsSection />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="competitions" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <CompetitionsSection />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="marketplace" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <MarketplaceSection />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="achievements" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <AchievementsSection />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="map" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <MapSection />
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

export default MobileCommunity;