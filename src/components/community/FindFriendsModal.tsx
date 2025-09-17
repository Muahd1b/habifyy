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
}

interface FindFriendsModalProps {
  open: boolean;
  onClose: () => void;
  onFriendRequest: (friendId: string, friendName: string) => Promise<void>;
}

export const FindFriendsModal = ({ open, onClose, onFriendRequest }: FindFriendsModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
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
      
      const { data: friendships } = await supabase
        .from('friends')
        .select('friend_id, status')
        .eq('user_id', user.id)
        .in('friend_id', userIds);

      const { data: pendingRequests } = await supabase
        .from('friends')
        .select('user_id')
        .eq('friend_id', user.id)
        .eq('status', 'pending')
        .in('user_id', userIds);

      // Map the results with friendship status
      const resultsWithStatus = profiles?.map(profile => ({
        ...profile,
        is_friend: friendships?.some(f => f.friend_id === profile.user_id && f.status === 'accepted'),
        has_pending_request: friendships?.some(f => f.friend_id === profile.user_id && f.status === 'pending') ||
                           pendingRequests?.some(r => r.user_id === profile.user_id)
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
      // Update the local state to reflect the sent request
      setSearchResults(prev => 
        prev.map(user => 
          user.user_id === friendId 
            ? { ...user, has_pending_request: true }
            : user
        )
      );
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setSendingRequest(null);
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
                      <h4 className="font-semibold text-foreground">
                        {user.display_name || user.username || 'Anonymous'}
                      </h4>
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
                      <Badge variant="outline">Request Sent</Badge>
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