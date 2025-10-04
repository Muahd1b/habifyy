import React, { useState } from 'react';
import { 
  Users, 
  Trophy, 
  ShoppingBag, 
  Award,
  User,
  MessageSquare,
  Calendar,
  ChevronRight,
  Zap,
  ArrowLeft
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
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center gap-4 p-4 border-b bg-background/95 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Community</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
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
            
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onClose} className="interactive-press">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Community</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Connect and grow together</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Level {profile?.level || 1}
            </Badge>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-sm font-semibold">
              {profile?.display_name?.[0] || profile?.username?.[0] || 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <div className="mb-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto bg-muted/30">
                <TabsTrigger value="overview" className="flex items-center gap-2 interactive-press py-3">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="friends" className="flex items-center gap-2 interactive-press py-3">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Friends</span>
                </TabsTrigger>
                <TabsTrigger value="competitions" className="flex items-center gap-2 interactive-press py-3">
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline">Compete</span>
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="flex items-center gap-2 interactive-press py-3">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden sm:inline">Shop</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center gap-2 interactive-press py-3">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Rewards</span>
                </TabsTrigger>
              </TabsList>
            </div>

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

          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Community;