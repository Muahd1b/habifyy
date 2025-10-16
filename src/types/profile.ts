export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  profile?: {
    id: string;
    user_id: string;
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
    points: number;
    level: number;
  };
}

export interface SocialLink {
  id: string;
  user_id: string;
  platform: string;
  url: string;
  display_name?: string | null;
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
  habit_id?: string | null;
  achieved_at: string;
  created_at: string;
}

export interface ExtendedProfile {
  id: string;
  user_id: string;
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  privacy_location: boolean;
  privacy_profile: boolean;
  points: number;
  level: number;
  website?: string | null;
  theme: string;
  is_verified: boolean;
  cover_image_url?: string | null;
  status?: string | null;
  timezone?: string | null;
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
