import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Friend, Competition, MarketplaceItem, Achievement, UserAchievement, ActivityFeed } from '@/types/community';
import { useToast } from '@/components/ui/use-toast';

export const useCommunity = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
    fetchFriends();
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
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;
      setFriends((data || []) as Friend[]);
    } catch (error: any) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompetitions((data || []) as Competition[]);
    } catch (error: any) {
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
      setMarketplaceItems((data || []) as MarketplaceItem[]);
    } catch (error: any) {
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
      setAchievements((data || []) as Achievement[]);
    } catch (error: any) {
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
      setUserAchievements((data || []) as UserAchievement[]);
    } catch (error: any) {
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
      setActivityFeed((data || []) as ActivityFeed[]);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching activity feed:', error);
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('friends')
        .insert([{
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Friend request sent!",
        description: "Your friend request has been sent successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error sending friend request",
        description: error.message,
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
    } catch (error: any) {
      toast({
        title: "Error joining competition",
        description: error.message,
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
    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    profile,
    friends,
    competitions,
    marketplaceItems,
    achievements,
    userAchievements,
    activityFeed,
    loading,
    sendFriendRequest,
    joinCompetition,
    purchaseItem,
    refetch: {
      profile: fetchUserProfile,
      friends: fetchFriends,
      competitions: fetchCompetitions,
      marketplaceItems: fetchMarketplaceItems,
      achievements: fetchAchievements,
      userAchievements: fetchUserAchievements,
      activityFeed: fetchActivityFeed,
    }
  };
};