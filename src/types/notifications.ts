export interface Notification {
  id: string;
  user_id: string;
  notification_type: 
    | 'habit_reminder'
    | 'streak_milestone'
    | 'streak_risk'
    | 'habit_completion'
    | 'friend_request'
    | 'friend_activity'
    | 'challenge_invitation'
    | 'competition_update'
    | 'marketplace_purchase'
    | 'system_update'
    | 'security_alert';
  title: string;
  message: string;
  action_data?: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  is_delivered: boolean;
  scheduled_time?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  habit_reminders: boolean;
  streak_milestones: boolean;
  friend_activities: boolean;
  competition_updates: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  template_key: string;
  title_template: string;
  message_template: string;
  action_data_schema?: any;
  created_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  high_priority: number;
}

export interface CreateNotificationData {
  notification_type: Notification['notification_type'];
  title: string;
  message: string;
  action_data?: any;
  priority?: Notification['priority'];
  scheduled_time?: string;
  expires_at?: string;
}