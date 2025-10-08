import React, { useState } from 'react';
import { Users, Search, UserPlus, MessageCircle, Crown, Zap, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommunity } from '@/hooks/useCommunity';
import { useToast } from '@/hooks/use-toast';
import { FindFriendsModal } from './FindFriendsModal';

const FriendsSection = () => {
  const { friends, profile, sendFriendRequest, loading } = useCommunity();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFindFriendsModal, setShowFindFriendsModal] = useState(false);

  const handleSendFriendRequest = async (friendId: string, friendName: string) => {
    try {
      await sendFriendRequest(friendId);
      toast({
        title: "Friend request sent!",
        description: `Your request to ${friendName} has been sent.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredFriends = friends.filter(friend => 
    friend.profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const suggestedFriends: any[] = [];

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Friends</h2>
          <p className="text-muted-foreground">Connect with like-minded habit builders</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Friends List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Friends ({friends.length})
              </CardTitle>
              <CardDescription>Stay motivated together</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFriends.length > 0 ? (
                <div className="space-y-4">
                  {filteredFriends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 p-4 transition-colors hover:bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.profile?.avatar_url} />
                          <AvatarFallback>
                            {friend.profile?.display_name?.[0] || friend.profile?.username?.[0] || 'F'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {friend.profile?.display_name || friend.profile?.username || 'Anonymous'}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              Level {friend.profile?.level || 1}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {friend.profile?.points || 0} points
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {searchQuery ? 'No friends found' : 'No friends yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? 'Try a different search term'
                      : 'Start building your habit community by adding friends'
                    }
                  </p>
                  {!searchQuery && (
                    <Button 
                      variant="outline"
                      onClick={() => setShowFindFriendsModal(true)}
                    >
                      Find Friends
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Suggested Friends */}
        <div className="space-y-4">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Suggested Friends
              </CardTitle>
              <CardDescription>People you might know</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No suggested friends available</p>
                <p className="text-sm">Connect with friends to get suggestions</p>
              </div>
            </CardContent>
          </Card>

          {/* Friend Leaderboard */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Friend Leaderboard
              </CardTitle>
              <CardDescription>This week's top performers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {friends.slice(0, 5).map((friend, index) => (
                <div key={friend.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-warning text-warning-foreground' :
                    index === 1 ? 'bg-muted text-muted-foreground' :
                    index === 2 ? 'bg-secondary text-secondary-foreground' :
                    'bg-accent text-accent-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.profile?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {friend.profile?.display_name?.[0] || friend.profile?.username?.[0] || 'F'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {friend.profile?.display_name || friend.profile?.username || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {friend.profile?.points || 0} points
                    </p>
                  </div>
                </div>
              ))}
              {friends.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Add friends to see the leaderboard
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Find Friends Modal */}
      <FindFriendsModal 
        open={showFindFriendsModal}
        onClose={() => setShowFindFriendsModal(false)}
        onFriendRequest={handleSendFriendRequest}
      />
    </div>
  );
};

export default FriendsSection;
