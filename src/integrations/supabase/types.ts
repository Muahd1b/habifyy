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
      achievement_progress: {
        Row: {
          achievement_id: string
          created_at: string
          current_value: number
          id: string
          last_increment_at: string | null
          metadata: Json | null
          progress_percent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          current_value?: number
          id?: string
          last_increment_at?: string | null
          metadata?: Json | null
          progress_percent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          current_value?: number
          id?: string
          last_increment_at?: string | null
          metadata?: Json | null
          progress_percent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_progress_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievement_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
      activity_events: {
        Row: {
          actor_id: string
          audience: Json | null
          community_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          target_user_id: string | null
          verb: string
          visibility: string
        }
        Insert: {
          actor_id: string
          audience?: Json | null
          community_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          target_user_id?: string | null
          verb: string
          visibility?: string
        }
        Update: {
          actor_id?: string
          audience?: Json | null
          community_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          target_user_id?: string | null
          verb?: string
          visibility?: string
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
        Relationships: [
          {
            foreignKeyName: "activity_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "activity_events_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
      community_invites: {
        Row: {
          community_id: string
          created_at: string
          expires_at: string | null
          id: string
          invitee_id: string
          inviter_id: string
          message: string | null
          metadata: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          community_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          invitee_id: string
          inviter_id: string
          message?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          invitee_id?: string
          inviter_id?: string
          message?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_invites_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_invites_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_invites_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
      competition_rounds: {
        Row: {
          competition_id: string
          created_at: string
          ends_at: string | null
          id: string
          metadata: Json | null
          position: number
          round_type: string
          scoring_rule: string | null
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          ends_at?: string | null
          id?: string
          metadata?: Json | null
          position?: number
          round_type?: string
          scoring_rule?: string | null
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          metadata?: Json | null
          position?: number
          round_type?: string
          scoring_rule?: string | null
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_rounds_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_scores: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          participant_id: string
          rank: number | null
          round_id: string | null
          score: number
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          participant_id: string
          rank?: number | null
          round_id?: string | null
          score?: number
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          participant_id?: string
          rank?: number | null
          round_id?: string | null
          score?: number
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_scores_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "competition_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_scores_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "competition_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      competition_rewards: {
        Row: {
          competition_id: string
          created_at: string
          id: string
          is_premium: boolean
          placement: number
          reward_metadata: Json | null
          reward_type: string
          reward_value: number
          updated_at: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          id?: string
          is_premium?: boolean
          placement: number
          reward_metadata?: Json | null
          reward_type?: string
          reward_value?: number
          updated_at?: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          id?: string
          is_premium?: boolean
          placement?: number
          reward_metadata?: Json | null
          reward_type?: string
          reward_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_rewards_competition_id_fkey"
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
        Relationships: [
          {
            foreignKeyName: "streak_history_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streak_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
          updated_at: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
          updated_at?: string
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
      friend_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          recipient_id: string
          requester_id: string
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          recipient_id: string
          requester_id: string
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          recipient_id?: string
          requester_id?: string
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "friend_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          source_request_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          source_request_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          source_request_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "friendships_source_request_id_fkey"
            columns: ["source_request_id"]
            isOneToOne: false
            referencedRelation: "friend_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
      marketplace_inventory: {
        Row: {
          created_at: string
          id: string
          is_limited: boolean
          item_id: string
          metadata: Json | null
          quantity: number | null
          reserved: number
          restock_at: string | null
          sku: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_limited?: boolean
          item_id: string
          metadata?: Json | null
          quantity?: number | null
          reserved?: number
          restock_at?: string | null
          sku?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_limited?: boolean
          item_id?: string
          metadata?: Json | null
          quantity?: number | null
          reserved?: number
          restock_at?: string | null
          sku?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_transactions: {
        Row: {
          awarded_points: number | null
          canceled_at: string | null
          created_at: string
          fulfillment_payload: Json | null
          id: string
          inventory_id: string | null
          item_id: string
          point_transaction_id: string | null
          points_spent: number
          status: string
          updated_at: string
          user_id: string
          fulfilled_at: string | null
        }
        Insert: {
          awarded_points?: number | null
          canceled_at?: string | null
          created_at?: string
          fulfillment_payload?: Json | null
          id?: string
          inventory_id?: string | null
          item_id: string
          point_transaction_id?: string | null
          points_spent?: number
          status?: string
          updated_at?: string
          user_id: string
          fulfilled_at?: string | null
        }
        Update: {
          awarded_points?: number | null
          canceled_at?: string | null
          created_at?: string
          fulfillment_payload?: Json | null
          id?: string
          inventory_id?: string | null
          item_id?: string
          point_transaction_id?: string | null
          points_spent?: number
          status?: string
          updated_at?: string
          user_id?: string
          fulfilled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_transactions_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "marketplace_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_transactions_point_transaction_id_fkey"
            columns: ["point_transaction_id"]
            isOneToOne: false
            referencedRelation: "point_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
      notification_channels: {
        Row: {
          address: string | null
          channel: string
          created_at: string
          id: string
          last_used_at: string | null
          metadata: Json | null
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          address?: string | null
          channel: string
          created_at?: string
          id?: string
          last_used_at?: string | null
          metadata?: Json | null
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          address?: string | null
          channel?: string
          created_at?: string
          id?: string
          last_used_at?: string | null
          metadata?: Json | null
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      notification_deliveries: {
        Row: {
          created_at: string
          delivered_at: string | null
          error_code: string | null
          id: string
          provider: string | null
          queue_id: string
          response_payload: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          id?: string
          provider?: string | null
          queue_id: string
          response_payload?: Json | null
          status?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          id?: string
          provider?: string | null
          queue_id?: string
          response_payload?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "notification_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_events: {
        Row: {
          actor_id: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          payload: Json | null
          subject_id: string | null
          triggered_at: string
        }
        Insert: {
          actor_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          subject_id?: string | null
          triggered_at?: string
        }
        Update: {
          actor_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          subject_id?: string | null
          triggered_at?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          attempts: number
          channel: string
          created_at: string
          event_id: string | null
          id: string
          last_attempt_at: string | null
          payload: Json | null
          priority: string
          scheduled_for: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attempts?: number
          channel?: string
          created_at?: string
          event_id?: string | null
          id?: string
          last_attempt_at?: string | null
          payload?: Json | null
          priority?: string
          scheduled_for?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attempts?: number
          channel?: string
          created_at?: string
          event_id?: string | null
          id?: string
          last_attempt_at?: string | null
          payload?: Json | null
          priority?: string
          scheduled_for?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "notification_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channel_settings: Json
          competition_updates: boolean | null
          created_at: string | null
          email_enabled: boolean | null
          friend_activities: boolean | null
          habit_reminders: boolean | null
          id: string
          digest_frequency: string
          push_enabled: boolean | null
          rate_limit_per_hour: number
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          streak_milestones: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel_settings?: Json
          competition_updates?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          friend_activities?: boolean | null
          habit_reminders?: boolean | null
          id?: string
          digest_frequency?: string
          push_enabled?: boolean | null
          rate_limit_per_hour?: number
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          streak_milestones?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel_settings?: Json
          competition_updates?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          friend_activities?: boolean | null
          habit_reminders?: boolean | null
          id?: string
          digest_frequency?: string
          push_enabled?: boolean | null
          rate_limit_per_hour?: number
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
          archived_at: string | null
          channel: string | null
          created_at: string | null
          delivered_via: string | null
          expires_at: string | null
          id: string
          event_id: string | null
          is_delivered: boolean | null
          is_archived: boolean | null
          is_read: boolean | null
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          scheduled_time: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          archived_at?: string | null
          channel?: string | null
          created_at?: string | null
          delivered_via?: string | null
          expires_at?: string | null
          id?: string
          event_id?: string | null
          is_delivered?: boolean | null
          is_archived?: boolean | null
          is_read?: boolean | null
          message: string
          notification_type: string
          priority?: string | null
          read_at?: string | null
          scheduled_time?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_data?: Json | null
          archived_at?: string | null
          channel?: string | null
          created_at?: string | null
          delivered_via?: string | null
          expires_at?: string | null
          id?: string
          event_id?: string | null
          is_delivered?: boolean | null
          is_archived?: boolean | null
          is_read?: boolean | null
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
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
          community_rank: number | null
          current_streak: number | null
          display_name: string | null
          id: string
          is_verified: boolean | null
          latitude: number | null
          last_active_at: string | null
          level: number | null
          location: string | null
          longest_streak: number | null
          longitude: number | null
          followers_count: number | null
          following_count: number | null
          points: number | null
          privacy_location: boolean | null
          privacy_profile: boolean | null
          privacy_settings: Json
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
          community_rank?: number | null
          current_streak?: number | null
          display_name?: string | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          last_active_at?: string | null
          level?: number | null
          location?: string | null
          longest_streak?: number | null
          longitude?: number | null
          followers_count?: number | null
          following_count?: number | null
          points?: number | null
          privacy_location?: boolean | null
          privacy_profile?: boolean | null
          privacy_settings?: Json
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
          community_rank?: number | null
          current_streak?: number | null
          display_name?: string | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          last_active_at?: string | null
          level?: number | null
          location?: string | null
          longest_streak?: number | null
          longitude?: number | null
          followers_count?: number | null
          following_count?: number | null
          points?: number | null
          privacy_location?: boolean | null
          privacy_profile?: boolean | null
          privacy_settings?: Json
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
      streak_history: {
        Row: {
          created_at: string
          habit_id: string | null
          id: string
          last_event_at: string | null
          max_length: number
          metadata: Json | null
          streak_end: string | null
          streak_start: string
          user_id: string
        }
        Insert: {
          created_at?: string
          habit_id?: string | null
          id?: string
          last_event_at?: string | null
          max_length: number
          metadata?: Json | null
          streak_end?: string | null
          streak_start: string
          user_id: string
        }
        Update: {
          created_at?: string
          habit_id?: string | null
          id?: string
          last_event_at?: string | null
          max_length?: number
          metadata?: Json | null
          streak_end?: string | null
          streak_start?: string
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
      task_runs: {
        Row: {
          attempts: number
          created_at: string
          error: string | null
          id: string
          last_run_at: string | null
          metadata: Json | null
          next_run_at: string | null
          status: string
          task_name: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error?: string | null
          id?: string
          last_run_at?: string | null
          metadata?: Json | null
          next_run_at?: string | null
          status?: string
          task_name: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error?: string | null
          id?: string
          last_run_at?: string | null
          metadata?: Json | null
          next_run_at?: string | null
          status?: string
          task_name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      follow_network: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string | null
          updated_at: string | null
        }
        Insert: never
        Update: never
      }
      community_metrics_daily: {
        Row: {
          active_members: number
          community_id: string
          competition_entries: number
          marketplace_spend: number
          member_count: number
          metric_date: string
        }
        Insert: never
        Update: never
      }
      point_balances: {
        Row: {
          balance: number
          user_id: string
        }
        Insert: never
        Update: never
      }
      profile_stats_daily: {
        Row: {
          user_id: string
          metric_date: string
          current_streak: number | null
          longest_streak: number | null
          total_habits: number
          completed_today: number
          points: number | null
          level: number | null
          followers_count: number | null
          following_count: number | null
          achievements_count: number
        }
        Insert: never
        Update: never
      }
    }
    Functions: {
      "community.handle_friend_request": {
        Args: {
          action: string
          request_id: string
        }
        Returns: Json
      }
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
