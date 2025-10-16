import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Profile,
  Friend,
  FriendRequest,
  Competition,
  MarketplaceItem,
  Achievement,
  UserAchievement,
  ActivityFeed,
  CommunityInvite
} from '@/types/community';
import { useToast } from '@/components/ui/use-toast';
import type { TablesInsert } from '@/integrations/supabase/types';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'An unexpected error occurred';

const getErrorCode = (error: unknown): string | undefined =>
  typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code?: unknown }).code === 'string'
    ? (error as { code: string }).code
    : undefined;

export const useCommunity = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingFriendRequests, setIncomingFriendRequests] = useState<FriendRequest[]>([]);
  const [outgoingFriendRequests, setOutgoingFriendRequests] = useState<FriendRequest[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeed[]>([]);
  const [communityInvites, setCommunityInvites] = useState<CommunityInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
    fetchFriendships();
    fetchFriendRequests();
    fetchCommunityInvites();
    fetchCompetitions();
    fetchMarketplaceItems();
    fetchAchievements();
    fetchUserAchievements();
    fetchActivityFeed();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ user_id: user.id }])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      } else if (error) {
        throw error;
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const respondToFriendRequest = async (requestId: string, action: 'accepted' | 'declined' | 'blocked') => {
    try {
      const actionMap: Record<typeof action, 'accept' | 'decline' | 'block'> = {
        accepted: 'accept',
        declined: 'decline',
        blocked: 'block'
      };

      const { data, error } = await supabase.rpc('handle_friend_request', {
        request_id: requestId,
        action: actionMap[action]
      });

      if (error) throw error;

      const responseStatus =
        (data as { status?: string } | null)?.status ?? (action === 'accepted' ? 'accepted' : action === 'declined' ? 'declined' : 'blocked');

      toast({
        title: responseStatus === 'accepted' ? "Friend request accepted" : "Friend request updated",
        description: responseStatus === 'accepted'
          ? "You're now connected."
          : responseStatus === 'declined'
            ? "The friend request has been declined."
            : "The user has been blocked."
      });

      fetchFriendRequests();
      fetchFriendships();
    } catch (error) {
      console.error('Error responding to friend request:', error);
      toast({
        title: "Unable to update request",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const cancelFriendRequest = async (requestId: string) => {
    try {
      const { data, error } = await supabase.rpc('handle_friend_request', {
        request_id: requestId,
        action: 'cancel'
      });

      if (error) throw error;

      toast({
        title: "Friend request cancelled",
        description: (data as { status?: string } | null)?.status === 'cancelled'
          ? "The outgoing friend request was cancelled."
          : "Any pending friend request has been cleared.",
      });

      fetchFriendRequests();
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      toast({
        title: "Unable to cancel request",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const fetchFriendships = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          friend_profile:profiles!friendships_friend_id_fkey (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const normalized = (data ?? []).map((entry) => {
        const friendEntry = entry as Friend & { friend_profile?: Profile; profile?: Profile };
        return {
          ...friendEntry,
          profile: friendEntry.friend_profile ?? friendEntry.profile,
        };
      });
      setFriends(normalized);
    } catch (error) {
      console.error('Error fetching friendships:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: incoming, error: incomingError }, { data: outgoing, error: outgoingError }] = await Promise.all([
        supabase
          .from('friend_requests')
          .select(`
            *,
            requester:profiles!friend_requests_requester_id_fkey (*)
          `)
          .eq('recipient_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('friend_requests')
          .select(`
            *,
            recipient:profiles!friend_requests_recipient_id_fkey (*)
          `)
          .eq('requester_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
      ]);

      if (incomingError) throw incomingError;
      if (outgoingError) throw outgoingError;

      setIncomingFriendRequests((incoming ?? []) as FriendRequest[]);
      setOutgoingFriendRequests((outgoing ?? []) as FriendRequest[]);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const fetchCommunityInvites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('community_invites')
        .select('*')
        .or(`invitee_id.eq.${user.id},inviter_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunityInvites((data ?? []) as CommunityInvite[]);
    } catch (error) {
      console.error('Error fetching community invites:', error);
    }
  };

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompetitions((data ?? []) as Competition[]);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    }
  };

  const fetchMarketplaceItems = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMarketplaceItems((data ?? []) as MarketplaceItem[]);
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points_reward', { ascending: false });

      if (error) throw error;
      setAchievements((data ?? []) as Achievement[]);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchUserAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setUserAchievements((data ?? []) as UserAchievement[]);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    }
  };

  const fetchActivityFeed = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          profiles!activity_feed_user_id_fkey(*)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivityFeed((data ?? []) as ActivityFeed[]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: string, message?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newRequest: TablesInsert<'friend_requests'> = {
        requester_id: user.id,
        recipient_id: friendId,
        message: message ?? null,
        status: 'pending',
      };

      const { error } = await supabase
        .from('friend_requests')
        .insert(newRequest);

      if (error) throw error;

      toast({
        title: "Friend request sent!",
        description: "Your friend request has been sent successfully.",
      });

      fetchFriendRequests();
    } catch (error) {
      const code = getErrorCode(error);
      const description = code === '23505'
        ? "You already have a pending request with this user."
        : getErrorMessage(error);
      toast({
        title: "Error sending friend request",
        description,
        variant: "destructive",
      });
    }
  };

  const joinCompetition = async (competitionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('competition_participants')
        .insert([{
          competition_id: competitionId,
          user_id: user.id,
          score: 0
        }]);

      if (error) throw error;

      toast({
        title: "Joined competition!",
        description: "You've successfully joined the competition.",
      });

      fetchCompetitions();
    } catch (error) {
      toast({
        title: "Error joining competition",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const purchaseItem = async (itemId: string, points: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!profile || profile.points < points) {
        toast({
          title: "Insufficient points",
          description: "You don't have enough points for this purchase.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('user_purchases')
        .insert([{
          user_id: user.id,
          item_id: itemId,
          points_spent: points
        }]);

      if (error) throw error;

      // Update user points
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: profile.points - points })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Purchase successful!",
        description: "Item purchased successfully.",
      });

      fetchUserProfile();
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return {
    profile,
    friends,
    incomingFriendRequests,
    outgoingFriendRequests,
    competitions,
    marketplaceItems,
    achievements,
    userAchievements,
    activityFeed,
    communityInvites,
    loading,
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest,
    joinCompetition,
    purchaseItem,
    refetch: {
      profile: fetchUserProfile,
      friends: fetchFriendships,
      friendRequests: fetchFriendRequests,
      competitions: fetchCompetitions,
      marketplaceItems: fetchMarketplaceItems,
      achievements: fetchAchievements,
      userAchievements: fetchUserAchievements,
      activityFeed: fetchActivityFeed,
      communityInvites: fetchCommunityInvites,
    }
  };
};
