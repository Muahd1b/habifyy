export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          points_reward: number | null
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          points_reward?: number | null
          requirement_type: string
          requirement_value: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          points_reward?: number | null
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      activity_feed: {
        Row: {
          activity_type: string
          content: Json | null
          created_at: string
          id: string
          is_public: boolean | null
          user_id: string
        }
        Insert: {
          activity_type: string
          content?: Json | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          user_id: string
        }
        Update: {
          activity_type?: string
          content?: Json | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          location: string | null
          member_count: number | null
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          member_count?: number | null
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          member_count?: number | null
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_participants: {
        Row: {
          competition_id: string
          id: string
          joined_at: string
          rank: number | null
          score: number | null
          team_name: string | null
          user_id: string
        }
        Insert: {
          competition_id: string
          id?: string
          joined_at?: string
          rank?: number | null
          score?: number | null
          team_name?: string | null
          user_id: string
        }
        Update: {
          competition_id?: string
          id?: string
          joined_at?: string
          rank?: number | null
          score?: number | null
          team_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_participants_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          habit_category: string | null
          id: string
          max_participants: number | null
          prize_points: number | null
          start_date: string
          status: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          habit_category?: string | null
          id?: string
          max_participants?: number | null
          prize_points?: number | null
          start_date: string
          status?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          habit_category?: string | null
          id?: string
          max_participants?: number | null
          prize_points?: number | null
          start_date?: string
          status?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_quotes: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completion_date: string
          created_at: string
          habit_id: string
          id: string
          notes: string | null
          progress: number
          user_id: string
        }
        Insert: {
          completion_date?: string
          created_at?: string
          habit_id: string
          id?: string
          notes?: string | null
          progress?: number
          user_id: string
        }
        Update: {
          completion_date?: string
          created_at?: string
          habit_id?: string
          id?: string
          notes?: string | null
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          category: string | null
          color: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          target?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_premium: boolean | null
          name: string
          price_points: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_premium?: boolean | null
          name: string
          price_points: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_premium?: boolean | null
          name?: string
          price_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          competition_updates: boolean | null
          created_at: string | null
          email_enabled: boolean | null
          friend_activities: boolean | null
          habit_reminders: boolean | null
          id: string
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          streak_milestones: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          competition_updates?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          friend_activities?: boolean | null
          habit_reminders?: boolean | null
          id?: string
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          streak_milestones?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          competition_updates?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          friend_activities?: boolean | null
          habit_reminders?: boolean | null
          id?: string
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          streak_milestones?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          action_data_schema: Json | null
          created_at: string | null
          id: string
          message_template: string
          template_key: string
          title_template: string
        }
        Insert: {
          action_data_schema?: Json | null
          created_at?: string | null
          id?: string
          message_template: string
          template_key: string
          title_template: string
        }
        Update: {
          action_data_schema?: Json | null
          created_at?: string | null
          id?: string
          message_template?: string
          template_key?: string
          title_template?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_data: Json | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_delivered: boolean | null
          is_read: boolean | null
          message: string
          notification_type: string
          priority: string | null
          scheduled_time: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_delivered?: boolean | null
          is_read?: boolean | null
          message: string
          notification_type: string
          priority?: string | null
          scheduled_time?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_data?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_delivered?: boolean | null
          is_read?: boolean | null
          message?: string
          notification_type?: string
          priority?: string | null
          scheduled_time?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          source: string
          source_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          source: string
          source_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          source?: string
          source_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_image_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_verified: boolean | null
          latitude: number | null
          level: number | null
          location: string | null
          longitude: number | null
          points: number | null
          privacy_location: boolean | null
          privacy_profile: boolean | null
          status: string | null
          theme: string | null
          timezone: string | null
          updated_at: string
          user_id: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          level?: number | null
          location?: string | null
          longitude?: number | null
          points?: number | null
          privacy_location?: boolean | null
          privacy_profile?: boolean | null
          status?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          level?: number | null
          location?: string | null
          longitude?: number | null
          points?: number | null
          privacy_location?: boolean | null
          privacy_profile?: boolean | null
          status?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_verified: boolean | null
          platform: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_verified?: boolean | null
          platform: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_verified?: boolean | null
          platform?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_locations: {
        Row: {
          id: string
          is_visible: boolean | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_visible?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_visible?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          id: string
          item_id: string
          points_spent: number
          purchased_at: string
          user_id: string
        }
        Insert: {
          id?: string
          item_id: string
          points_spent: number
          purchased_at?: string
          user_id: string
        }
        Update: {
          id?: string
          item_id?: string
          points_spent?: number
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_records: {
        Row: {
          achieved_at: string
          category: string
          created_at: string
          habit_id: string | null
          id: string
          record_type: string
          record_value: number
          user_id: string
        }
        Insert: {
          achieved_at?: string
          category: string
          created_at?: string
          habit_id?: string | null
          id?: string
          record_type: string
          record_value: number
          user_id: string
        }
        Update: {
          achieved_at?: string
          category?: string
          created_at?: string
          habit_id?: string | null
          id?: string
          record_type?: string
          record_value?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_payment_function: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
