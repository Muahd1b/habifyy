import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ExtendedProfile, Follower, SocialLink, UserRecord, ProfileStats } from '@/types/profile';
import { toast } from 'sonner';

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [userRecords, setUserRecords] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || null;

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
      fetchFollowers();
      fetchFollowing();
      fetchSocialLinks();
      fetchUserRecords();
      fetchStats();
      checkIfFollowing();
    }
  }, [targetUserId]);

  useEffect(() => {
    if (!targetUserId) return;

    const channel = supabase
      .channel(`profile-social-${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `following_id=eq.${targetUserId}`
        },
        () => {
          void fetchFollowers();
          void fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `follower_id=eq.${targetUserId}`
        },
        () => {
          void fetchFollowing();
          void fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetUserId]);

  const fetchProfile = async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchFollowers = async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('followers')
        .select(`
          id,
          follower_id,
          following_id,
          created_at
        `)
        .eq('following_id', targetUserId);

      if (error) throw error;
      
      // Fetch profile data separately for each follower
      const followersWithProfiles = await Promise.all(
        (data || []).map(async (follower) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, user_id, username, display_name, avatar_url, points, level')
            .eq('user_id', follower.follower_id)
            .single();
          
          return {
            ...follower,
            profile: profileData
          };
        })
      );
      
      setFollowers(followersWithProfiles);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('followers')
        .select(`
          id,
          follower_id,
          following_id,
          created_at
        `)
        .eq('follower_id', targetUserId);

      if (error) throw error;
      
      // Fetch profile data separately for each following
      const followingWithProfiles = await Promise.all(
        (data || []).map(async (following) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, user_id, username, display_name, avatar_url, points, level')
            .eq('user_id', following.following_id)
            .single();
          
          return {
            ...following,
            profile: profileData
          };
        })
      );
      
      setFollowing(followingWithProfiles);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const fetchSocialLinks = async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
    }
  };

  const fetchUserRecords = async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('user_records')
        .select('*')
        .eq('user_id', targetUserId)
        .order('achieved_at', { ascending: false });

      if (error) throw error;
      setUserRecords(data || []);
    } catch (error) {
      console.error('Error fetching user records:', error);
    }
  };

  const fetchStats = async () => {
    if (!targetUserId) return;

    try {
      // Fetch habits count
      const { count: totalHabits } = await supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId)
        .eq('is_active', true);

      // Fetch today's completions
      const today = new Date().toISOString().split('T')[0];
      const { count: completedToday } = await supabase
        .from('habit_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId)
        .eq('completion_date', today);

      // Calculate streaks (simplified for now)
      const currentStreak = 0; // TODO: Implement streak calculation
      const longestStreak = 0; // TODO: Implement streak calculation

      // Fetch followers/following counts
      const { count: followersCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetUserId);

      const { count: followingCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetUserId);

      // Fetch achievements count
      const { count: achievementsCount } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId);

      setStats({
        totalHabits: totalHabits || 0,
        completedToday: completedToday || 0,
        currentStreak,
        longestStreak,
        totalPoints: profile?.points || 0,
        level: profile?.level || 1,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        achievementsCount: achievementsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFollowing = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !targetUserId || user.id === targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const toggleFollow = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !targetUserId || user.id === targetUserId) return;

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;
        setIsFollowing(false);
        toast.success('Unfollowed successfully');
      } else {
        const { error } = await supabase
          .from('followers')
          .insert({
            follower_id: user.id,
            following_id: targetUserId,
          });

        if (error) throw error;
        setIsFollowing(true);
        toast.success('Following successfully');
      }

      // Refresh followers count
      fetchFollowers();
      fetchStats();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  const addSocialLink = async (platform: string, url: string, displayName?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== targetUserId) return;

    try {
      const { error } = await supabase
        .from('social_links')
        .insert({
          user_id: user.id,
          platform,
          url,
          display_name: displayName,
        });

      if (error) throw error;
      toast.success('Social link added successfully');
      fetchSocialLinks();
    } catch (error) {
      console.error('Error adding social link:', error);
      toast.error('Failed to add social link');
    }
  };

  const removeSocialLink = async (linkId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', linkId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Social link removed successfully');
      fetchSocialLinks();
    } catch (error) {
      console.error('Error removing social link:', error);
      toast.error('Failed to remove social link');
    }
  };

  const updateProfile = async (updates: Partial<ExtendedProfile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== targetUserId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return {
    profile,
    followers,
    following,
    socialLinks,
    userRecords,
    stats,
    isFollowing,
    loading,
    toggleFollow,
    addSocialLink,
    removeSocialLink,
    updateProfile,
    refetch: {
      profile: fetchProfile,
      followers: fetchFollowers,
      following: fetchFollowing,
      socialLinks: fetchSocialLinks,
      userRecords: fetchUserRecords,
      stats: fetchStats,
    },
  };
};
