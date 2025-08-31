export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  profile?: {
    id: string;
    user_id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    points: number;
    level: number;
  };
}

export interface SocialLink {
  id: string;
  user_id: string;
  platform: string;
  url: string;
  display_name?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRecord {
  id: string;
  user_id: string;
  category: string;
  record_type: string;
  record_value: number;
  habit_id?: string;
  achieved_at: string;
  created_at: string;
}

export interface ExtendedProfile {
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
  website?: string;
  theme: string;
  is_verified: boolean;
  cover_image_url?: string;
  status?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileStats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
  followersCount: number;
  followingCount: number;
  achievementsCount: number;
}