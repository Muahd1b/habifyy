export interface Profile {
  id: string;
  user_id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  privacy_location: boolean;
  privacy_profile: boolean;
  points: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  source_request_id?: string | null;
  status: 'active' | 'blocked' | 'removed';
  created_at: string;
  updated_at: string;
  profile?: Profile;
  friend_profile?: Profile;
}

export interface FriendRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  message?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  recipient?: Profile;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  type: 'city' | 'state' | 'country' | 'global' | 'habit';
  location?: string;
  member_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Competition {
  id: string;
  title: string;
  description?: string;
  type: 'local' | 'global' | 'weekly' | 'monthly' | 'habit_specific' | 'team';
  habit_category?: string;
  start_date: string;
  end_date: string;
  max_participants?: number;
  prize_points: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  created_by?: string;
  created_at: string;
  updated_at: string;
  participants?: CompetitionParticipant[];
}

export interface CompetitionParticipant {
  id: string;
  competition_id: string;
  user_id: string;
  team_name?: string;
  score: number;
  rank?: number;
  joined_at: string;
  profile?: Profile;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description?: string;
  category: 'themes' | 'badges' | 'customizations' | 'streak_insurance' | 'premium';
  price_points: number;
  image_url?: string;
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description?: string;
  category: 'streaks' | 'habits' | 'social' | 'competitions' | 'milestones';
  icon?: string;
  points_reward: number;
  requirement_type: 'streak' | 'habit_count' | 'friend_count' | 'competition_win' | 'community_participation';
  requirement_value: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface ActivityFeed {
  id: string;
  user_id: string;
  activity_type: 'habit_completed' | 'streak_milestone' | 'achievement_earned' | 'competition_joined' | 'friend_added';
  content: any;
  is_public: boolean;
  created_at: string;
  profile?: Profile;
}

export interface CommunityInvite {
  id: string;
  community_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at?: string | null;
  message?: string | null;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}
