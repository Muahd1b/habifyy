import React, { useState } from 'react';
import { Trophy, Calendar, Users, Clock, Target, Crown, Medal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommunity } from '@/hooks/useCommunity';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const CompetitionsSection = () => {
  const { competitions, joinCompetition, loading } = useCommunity();
  const { toast } = useToast();
  const [joiningCompetition, setJoiningCompetition] = useState<string | null>(null);

  const handleJoinCompetition = async (competitionId: string, title: string) => {
    setJoiningCompetition(competitionId);
    try {
      await joinCompetition(competitionId);
      toast({
        title: "Joined competition!",
        description: `You've successfully joined "${title}".`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join competition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoiningCompetition(null);
    }
  };

  const activeCompetitions = competitions.filter(c => c.status === 'active');
  const upcomingCompetitions = competitions.filter(c => c.status === 'upcoming');
  const completedCompetitions = competitions.filter(c => c.status === 'completed');

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const CompetitionCard = ({ competition, showJoinButton = true }: { competition: any, showJoinButton?: boolean }) => (
    <Card className="border border-border/60 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">{competition.title}</CardTitle>
            <CardDescription>{competition.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="capitalize">
            {competition.type.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(competition.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{getTimeRemaining(competition.end_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{competition.participants?.length || 0} participants</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span>{competition.prize_points} points</span>
          </div>
        </div>

        {competition.habit_category && (
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">{competition.habit_category}</Badge>
          </div>
        )}

        {showJoinButton && competition.status === 'active' && (
          <Button 
            className="w-full"
            onClick={() => handleJoinCompetition(competition.id, competition.title)}
            disabled={loading || joiningCompetition === competition.id}
          >
            {joiningCompetition === competition.id ? 'Joining...' : 'Join Competition'}
          </Button>
        )}

        {showJoinButton && competition.status === 'upcoming' && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => handleJoinCompetition(competition.id, competition.title)}
            disabled={loading || joiningCompetition === competition.id}
          >
            {joiningCompetition === competition.id ? 'Joining...' : `Join Competition`}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // Mock leaderboard data
  const mockLeaderboard = [
    { id: '1', name: 'Sarah Chen', score: 125, avatar: null, rank: 1 },
    { id: '2', name: 'Mike Johnson', score: 118, avatar: null, rank: 2 }, 
    { id: '3', name: 'Emma Wilson', score: 112, avatar: null, rank: 3 },
    { id: '4', name: 'You', score: 95, avatar: null, rank: 7 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Competitions</h2>
          <p className="text-muted-foreground">Challenge yourself and compete with others</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Competitions List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList className="mx-auto flex w-full flex-wrap items-center justify-center gap-2 rounded-full border border-border/30 bg-background/70 p-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 sm:w-auto">
              <TabsTrigger
                value="active"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-[0_6px_18px_rgba(15,23,42,0.12)] dark:data-[state=active]:bg-slate-950/80"
              >
                Active ({activeCompetitions.length})
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-[0_6px_18px_rgba(15,23,42,0.12)] dark:data-[state=active]:bg-slate-950/80"
              >
                Upcoming ({upcomingCompetitions.length})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-[0_6px_18px_rgba(15,23,42,0.12)] dark:data-[state=active]:bg-slate-950/80"
              >
                Completed ({completedCompetitions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeCompetitions.length > 0 ? (
                activeCompetitions.map((competition) => (
                  <CompetitionCard key={competition.id} competition={competition} />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Active Competitions</h3>
                    <p className="text-muted-foreground text-center">
                      Check back later for new competitions to join!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingCompetitions.length > 0 ? (
                upcomingCompetitions.map((competition) => (
                  <CompetitionCard key={competition.id} competition={competition} showJoinButton={false} />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Competitions</h3>
                    <p className="text-muted-foreground text-center">
                      New competitions are added regularly. Stay tuned!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedCompetitions.length > 0 ? (
                completedCompetitions.map((competition) => (
                  <CompetitionCard key={competition.id} competition={competition} showJoinButton={false} />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Medal className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Completed Competitions</h3>
                    <p className="text-muted-foreground text-center">
                      Your competition history will appear here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Current Competition Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Weekly Challenge Leaderboard
              </CardTitle>
              <CardDescription>30-Day Habit Streak Challenge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {mockLeaderboard.map((user) => (
                  <div key={user.id} className={`flex items-center gap-3 p-2 rounded-lg ${
                    user.name === 'You' ? 'bg-primary/10 border border-primary/20' : 'bg-accent/5'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      user.rank === 1 ? 'bg-warning text-warning-foreground' :
                      user.rank === 2 ? 'bg-muted text-muted-foreground' :
                      user.rank === 3 ? 'bg-secondary text-secondary-foreground' :
                      'bg-accent text-accent-foreground'
                    }`}>
                      {user.rank}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        user.name === 'You' ? 'text-primary' : 'text-foreground'
                      }`}>
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.score} points</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span>Your Progress</span>
                  <span>12/30 days</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Competition Types */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Types</CardTitle>
              <CardDescription>Different ways to compete</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  <span className="text-sm font-medium">Global</span>
                  <span className="text-xs text-muted-foreground ml-auto">Worldwide</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <span className="text-sm font-medium">Local</span>
                  <span className="text-xs text-muted-foreground ml-auto">Your area</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                  <span className="text-sm font-medium">Weekly</span>
                  <span className="text-xs text-muted-foreground ml-auto">Short term</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
                  <span className="text-sm font-medium">Monthly</span>
                  <span className="text-xs text-muted-foreground ml-auto">Long term</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500" />
                  <span className="text-sm font-medium">Team</span>
                  <span className="text-xs text-muted-foreground ml-auto">Group effort</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompetitionsSection;
