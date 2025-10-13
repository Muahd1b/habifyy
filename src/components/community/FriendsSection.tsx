import React, { useState } from 'react';
import { Users, Search, UserPlus, MessageCircle, Crown, Zap, Check, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useCommunity } from '@/hooks/useCommunity';
import { useToast } from '@/hooks/use-toast';
import { FindFriendsModal } from './FindFriendsModal';
import { ProfileModal } from '@/components/ProfileModal';

const FriendsSection = () => {
  const {
    friends,
    incomingFriendRequests,
    outgoingFriendRequests,
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest,
    loading
  } = useCommunity();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFindFriendsModal, setShowFindFriendsModal] = useState(false);
  const [previewProfileUserId, setPreviewProfileUserId] = useState<string | null>(null);
  const [pendingRespondId, setPendingRespondId] = useState<string | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);

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

  const handleRespondToRequest = async (requestId: string, action: 'accepted' | 'declined') => {
    setPendingRespondId(requestId);
    try {
      await respondToFriendRequest(requestId, action);
    } catch (error) {
      toast({
        title: "Unable to update request",
        description: "Please try again shortly.",
        variant: "destructive",
      });
    } finally {
      setPendingRespondId(null);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    setPendingCancelId(requestId);
    try {
      await cancelFriendRequest(requestId);
    } catch (error) {
      toast({
        title: "Unable to cancel request",
        description: "Please try again shortly.",
        variant: "destructive",
      });
    } finally {
      setPendingCancelId(null);
    }
  };

  const filteredFriends = friends.filter(friend => 
    friend.profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasPendingRequests = incomingFriendRequests.length > 0 || outgoingFriendRequests.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Friends</h2>
          <p className="text-muted-foreground">Connect with like-minded habit builders</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowFindFriendsModal(true)}
            className="whitespace-nowrap"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            <span>Find Friends</span>
          </Button>
        </div>
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Friend Requests
          </CardTitle>
          <CardDescription>Manage your incoming and sent invitations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Syncing your social graph…</span>
            </div>
          ) : hasPendingRequests ? (
            <div className="space-y-6">
              {incomingFriendRequests.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Incoming requests</h4>
                    <Badge variant="outline" className="text-xs">
                      {incomingFriendRequests.length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {incomingFriendRequests.map((request) => {
                      const requester = request.requester;
                      const displayName =
                        requester?.display_name || requester?.username || 'Habit builder';
                      const sentOn = new Date(request.created_at).toLocaleDateString();

                      return (
                        <div
                          key={request.id}
                          className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/10 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={requester?.avatar_url} />
                              <AvatarFallback>
                                {displayName[0]?.toUpperCase() || 'F'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground">{displayName}</p>
                              {request.message && (
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                  "{request.message}"
                                </p>
                              )}
                              <p className="mt-1 text-xs text-muted-foreground">
                                Requested on {sentOn}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                              size="sm"
                              onClick={() => handleRespondToRequest(request.id, 'accepted')}
                              disabled={pendingRespondId === request.id}
                            >
                              {pendingRespondId === request.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating…
                                </>
                              ) : (
                                <>
                                  <Check className="mr-1 h-4 w-4" />
                                  Accept
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRespondToRequest(request.id, 'declined')}
                              disabled={pendingRespondId === request.id}
                            >
                              <X className="mr-1 h-4 w-4" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {incomingFriendRequests.length > 0 && outgoingFriendRequests.length > 0 && (
                <Separator />
              )}

              {outgoingFriendRequests.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Sent requests</h4>
                    <Badge variant="outline" className="text-xs">
                      {outgoingFriendRequests.length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {outgoingFriendRequests.map((request) => {
                      const recipient = request.recipient;
                      const displayName =
                        recipient?.display_name || recipient?.username || 'Habit builder';
                      const sentOn = new Date(request.created_at).toLocaleDateString();

                      return (
                        <div
                          key={request.id}
                          className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/10 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={recipient?.avatar_url} />
                              <AvatarFallback>
                                {displayName[0]?.toUpperCase() || 'F'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground">{displayName}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Sent on {sentOn}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelRequest(request.id)}
                              disabled={pendingCancelId === request.id}
                            >
                              {pendingCancelId === request.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Cancelling…
                                </>
                              ) : (
                                <>
                                  <X className="mr-1 h-4 w-4" />
                                  Cancel
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 py-10 text-center text-muted-foreground">
              <Users className="mx-auto mb-3 h-10 w-10 opacity-70" />
              <p className="font-medium text-foreground">No pending requests</p>
              <p className="text-sm">Send or accept requests to grow your circle.</p>
            </div>
          )}
        </CardContent>
      </Card>

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
        onCancelFriendRequest={cancelFriendRequest}
        onPreviewProfile={(userId) => setPreviewProfileUserId(userId)}
      />
      {previewProfileUserId && (
        <ProfileModal
          userId={previewProfileUserId}
          onClose={() => setPreviewProfileUserId(null)}
        />
      )}
    </div>
  );
};

export default FriendsSection;
