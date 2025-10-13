import React, { useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: string;
  user_id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  points: number;
  level: number;
  bio: string;
  is_friend?: boolean;
  has_pending_request?: boolean;
  pending_request_id?: string | null;
  has_incoming_request?: boolean;
}

interface FindFriendsModalProps {
  open: boolean;
  onClose: () => void;
  onFriendRequest: (friendId: string, friendName: string) => Promise<void>;
  onCancelFriendRequest: (requestId: string) => Promise<void>;
  onPreviewProfile?: (userId: string) => void;
}

export const FindFriendsModal = ({
  open,
  onClose,
  onFriendRequest,
  onCancelFriendRequest,
  onPreviewProfile,
}: FindFriendsModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [cancellingRequest, setCancellingRequest] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const searchUsers = async (query: string) => {
    if (!query.trim() || !user) return;
    
    setLoading(true);
    try {
      // Search for users by display name or username
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          display_name,
          username,
          avatar_url,
          points,
          level,
          bio
        `)
        .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
        .neq('user_id', user.id)
        .eq('privacy_profile', false)
        .limit(20);

      if (error) throw error;

      // Check existing friendships and pending requests
      const userIds = profiles?.map(p => p.user_id) || [];
      if (userIds.length === 0) {
        setSearchResults(profiles || []);
        setLoading(false);
        return;
      }

      const { data: friendships } = await supabase
        .from('friendships')
        .select('friend_id, status')
        .eq('user_id', user.id)
        .in('friend_id', userIds);

      const [{ data: outgoingRequests, error: outgoingError }, { data: incomingRequests, error: incomingError }] = await Promise.all([
        supabase
          .from('friend_requests')
          .select('id, recipient_id')
          .eq('requester_id', user.id)
          .eq('status', 'pending')
          .in('recipient_id', userIds),
        supabase
          .from('friend_requests')
          .select('id, requester_id')
          .eq('recipient_id', user.id)
          .eq('status', 'pending')
          .in('requester_id', userIds)
      ]);

      if (outgoingError) throw outgoingError;
      if (incomingError) throw incomingError;

      // Map the results with friendship status
      const resultsWithStatus = profiles?.map(profile => ({
        ...profile,
        is_friend: friendships?.some(f => f.friend_id === profile.user_id && f.status === 'active'),
        has_pending_request:
          outgoingRequests?.some(r => r.recipient_id === profile.user_id) ||
          incomingRequests?.some(r => r.requester_id === profile.user_id),
        pending_request_id:
          outgoingRequests?.find(r => r.recipient_id === profile.user_id)?.id ?? null,
        has_incoming_request: incomingRequests?.some(r => r.requester_id === profile.user_id) ?? false,
      })) || [];

      setSearchResults(resultsWithStatus);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Error",
        description: "Failed to search for users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(searchQuery);
  };

  const handleSendFriendRequest = async (friendId: string, friendName: string) => {
    setSendingRequest(friendId);
    try {
      await onFriendRequest(friendId, friendName);
      await searchUsers(searchQuery);
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setSendingRequest(null);
    }
  };

  const handleCancelFriendRequest = async (requestId: string | null, friendId: string) => {
    if (!requestId) return;
    setCancellingRequest(friendId);
    try {
      await onCancelFriendRequest(requestId);
      await searchUsers(searchQuery);
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      toast({
        title: "Unable to cancel request",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancellingRequest(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Friends
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.display_name?.[0] || user.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <button
                        type="button"
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                        onClick={() => onPreviewProfile?.(user.user_id)}
                      >
                        {user.display_name || user.username || 'Anonymous'}
                      </button>
                      {user.username && user.display_name !== user.username && (
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      )}
                      {user.bio && (
                        <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          Level {user.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {user.points} points
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {user.is_friend ? (
                      <Badge variant="default">Friends</Badge>
                    ) : user.has_pending_request ? (
                      user.pending_request_id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelFriendRequest(user.pending_request_id, user.user_id)}
                          disabled={cancellingRequest === user.user_id}
                        >
                          {cancellingRequest === user.user_id ? 'Cancelling...' : 'Cancel Request'}
                        </Button>
                      ) : (
                        <Badge variant="outline">
                          {user.has_incoming_request ? 'Request Pending' : 'Request Sent'}
                        </Badge>
                      )
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => handleSendFriendRequest(user.user_id, user.display_name || user.username || 'User')}
                        disabled={sendingRequest === user.user_id}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        {sendingRequest === user.user_id ? 'Sending...' : 'Add Friend'}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : searchQuery && !loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No users found matching "{searchQuery}"</p>
                <p className="text-sm">Try searching with a different name or username</p>
              </div>
            ) : !searchQuery ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Search for friends by name or username</p>
                <p className="text-sm">Enter a search term above to get started</p>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
