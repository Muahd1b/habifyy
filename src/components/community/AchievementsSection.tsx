import React, { useState } from 'react';
import { Award, Trophy, Zap, Target, Users, Calendar, Crown, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCommunity } from '@/hooks/useCommunity';

const AchievementsSection = () => {
  const { achievements, userAchievements, profile } = useCommunity();

  const earnedAchievements = userAchievements.map(ua => ua.achievement).filter(Boolean);
  const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id));
  const availableAchievements = achievements.filter(a => !unlockedAchievementIds.has(a.id));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'streaks': return <Target className="h-4 w-4" />;
      case 'habits': return <Zap className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'competitions': return <Trophy className="h-4 w-4" />;
      case 'milestones': return <Crown className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'streaks': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'habits': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'social': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'competitions': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'milestones': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getProgressForAchievement = (achievement: any) => {
    // Mock progress calculation - in a real app, this would come from user data
    switch (achievement.requirement_type) {
      case 'streak':
        return Math.min(15, achievement.requirement_value); // Mock current streak
      case 'habit_count':
        return Math.min(5, achievement.requirement_value); // Mock habit count
      case 'friend_count':
        return Math.min(2, achievement.requirement_value); // Mock friend count
      case 'competition_win':
        return Math.min(0, achievement.requirement_value); // Mock wins
      case 'community_participation':
        return Math.min(3, achievement.requirement_value); // Mock participation
      default:
        return 0;
    }
  };

  const AchievementCard = ({ achievement, isEarned = false, earnedDate }: { 
    achievement: any, 
    isEarned?: boolean, 
    earnedDate?: string 
  }) => {
    const progress = isEarned ? achievement.requirement_value : getProgressForAchievement(achievement);
    const progressPercentage = Math.min(100, (progress / achievement.requirement_value) * 100);

    return (
      <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
        isEarned ? 'bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30' : 'hover:-translate-y-1'
      }`}>
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-accent/30 to-transparent" />
        
        {isEarned && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
              <Award className="h-3 w-3 text-success-foreground" />
            </div>
          </div>
        )}

        {!isEarned && progressPercentage < 100 && (
          <div className="absolute top-2 right-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{achievement.icon || '🏆'}</div>
            <div className="flex-1">
              <CardTitle className="text-lg">{achievement.name}</CardTitle>
              <CardDescription className="mt-1">{achievement.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={`${getCategoryColor(achievement.category)} border-0`}>
              {getCategoryIcon(achievement.category)}
              <span className="ml-1 capitalize">{achievement.category}</span>
            </Badge>
            <div className="flex items-center gap-1 text-sm font-medium text-primary">
              <Zap className="h-3 w-3" />
              {achievement.points_reward} points
            </div>
          </div>

          {!isEarned && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}/{achievement.requirement_value}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {isEarned && earnedDate && (
            <div className="flex items-center gap-2 text-sm text-success">
              <Calendar className="h-3 w-3" />
              <span>Earned {new Date(earnedDate).toLocaleDateString()}</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {achievement.requirement_type === 'streak' && `Maintain a ${achievement.requirement_value}-day streak`}
            {achievement.requirement_type === 'habit_count' && `Complete ${achievement.requirement_value} different habits`}
            {achievement.requirement_type === 'friend_count' && `Add ${achievement.requirement_value} friends`}
            {achievement.requirement_type === 'competition_win' && `Win ${achievement.requirement_value} competition${achievement.requirement_value > 1 ? 's' : ''}`}
            {achievement.requirement_type === 'community_participation' && `Participate in ${achievement.requirement_value} community activities`}
          </div>
        </CardContent>
      </Card>
    );
  };

  const categoryStats = achievements.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) {
      acc[category] = { total: 0, earned: 0 };
    }
    acc[category].total++;
    if (unlockedAchievementIds.has(achievement.id)) {
      acc[category].earned++;
    }
    return acc;
  }, {} as Record<string, { total: number; earned: number }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Achievements</h2>
          <p className="text-muted-foreground">Track your progress and unlock rewards</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Award className="h-4 w-4 mr-1" />
            {earnedAchievements.length}/{achievements.length} Unlocked
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(categoryStats).map(([category, stats]) => (
          <Card key={category}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(category)}
                <span className="text-sm font-medium capitalize">{category}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.earned}/{stats.total}</div>
              <Progress value={(stats.earned / stats.total) * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements Tabs */}
      <Tabs defaultValue="earned" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="earned">
            Earned ({earnedAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available ({availableAchievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earned" className="space-y-4">
          {earnedAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAchievements.map((userAchievement) => (
                userAchievement.achievement && (
                  <AchievementCard
                    key={userAchievement.id}
                    achievement={userAchievement.achievement}
                    isEarned={true}
                    earnedDate={userAchievement.earned_at}
                  />
                )
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Achievements Yet</h3>
                <p className="text-muted-foreground text-center">
                  Start completing habits and building streaks to earn your first achievement!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {availableAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isEarned={false}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">All Achievements Unlocked!</h3>
                <p className="text-muted-foreground text-center">
                  Congratulations! You've earned all available achievements. New ones are added regularly.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Achievement Tips */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Achievement Tips
          </CardTitle>
          <CardDescription>
            Maximize your achievement progress with these strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-medium">Consistency is key</span>
              </div>
              <p className="text-muted-foreground ml-4">
                Focus on maintaining daily habits rather than perfection
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span className="font-medium">Join competitions</span>
              </div>
              <p className="text-muted-foreground ml-4">
                Participate in community challenges to unlock social achievements
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="font-medium">Add friends</span>
              </div>
              <p className="text-muted-foreground ml-4">
                Connect with others to unlock social and milestone achievements
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="font-medium">Track multiple habits</span>
              </div>
              <p className="text-muted-foreground ml-4">
                Diversify your habits to unlock category-specific achievements
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementsSection;