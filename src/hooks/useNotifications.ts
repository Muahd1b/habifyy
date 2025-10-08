import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Notification, NotificationStats, CreateNotificationData } from '@/types/notifications';
import { useToast } from './use-toast';

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    high_priority: 0
  });

  const normalizeNotification = (notification: any): Notification => ({
    ...notification,
    is_archived: Boolean(notification.is_archived),
    is_read: Boolean(notification.is_read),
  });

  // Fetch notifications
  const fetchNotifications = async (limit = 50, offset = 0) => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const typedData = (data || []).map(normalizeNotification);

      if (offset === 0) {
        setNotifications(typedData);
      } else {
        setNotifications(prev => [...prev, ...typedData]);
      }

      // Update stats
      const activeNotifications = typedData.filter(n => !n.is_archived);
      const total = activeNotifications.length;
      const unread = activeNotifications.filter(n => !n.is_read).length;
      const high_priority = activeNotifications.filter(n => n.priority === 'high' || n.priority === 'critical').length;

      setStats({ total, unread, high_priority });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      const target = notifications.find(n => n.id === notificationId && !n.is_archived);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );

      if (target && !target.is_read) {
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        }));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );

      // Update stats
      setStats(prev => ({ ...prev, unread: 0 }));

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      const target = notifications.find(n => n.id === notificationId);

      setStats(prev => ({
        total: target && !target.is_archived ? Math.max(0, prev.total - 1) : prev.total,
        unread: target && !target.is_archived && !target.is_read ? Math.max(0, prev.unread - 1) : prev.unread,
        high_priority:
          target && !target.is_archived && (target.priority === 'high' || target.priority === 'critical')
            ? Math.max(0, prev.high_priority - 1)
            : prev.high_priority
      }));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const archiveNotification = async (notificationId: string) => {
    if (!user) return;

    const target = notifications.find(n => n.id === notificationId && !n.is_archived);
    if (!target) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_archived: true, is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_archived: true, is_read: true } : n
        )
      );

      setStats(prev => ({
        total: Math.max(0, prev.total - 1),
        unread: target.is_read ? prev.unread : Math.max(0, prev.unread - 1),
        high_priority:
          target.priority === 'high' || target.priority === 'critical'
            ? Math.max(0, prev.high_priority - 1)
            : prev.high_priority,
      }));
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const unarchiveNotification = async (notificationId: string) => {
    if (!user) return;

    const target = notifications.find(n => n.id === notificationId && n.is_archived);
    if (!target) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_archived: false })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_archived: false } : n
        )
      );

      setStats(prev => ({
        total: prev.total + 1,
        unread: prev.unread,
        high_priority:
          target.priority === 'high' || target.priority === 'critical'
            ? prev.high_priority + 1
            : prev.high_priority,
      }));
    } catch (error) {
      console.error('Error unarchiving notification:', error);
    }
  };

  // Create new notification
  const createNotification = async (data: CreateNotificationData) => {
    if (!user) return;

    try {
      const { data: newNotification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          ...data,
          priority: data.priority || 'medium'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const typedNewNotification = normalizeNotification(newNotification);
      setNotifications(prev => [typedNewNotification, ...prev]);
      setStats(prev => ({
        total: prev.total + 1,
        unread: prev.unread + 1,
        high_priority: (data.priority === 'high' || data.priority === 'critical') 
          ? prev.high_priority + 1 
          : prev.high_priority
      }));

      return typedNewNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = normalizeNotification(payload.new);
          setNotifications(prev => [newNotification, ...prev]);
          setStats(prev => ({
            total: prev.total + 1,
            unread: prev.unread + 1,
            high_priority: (newNotification.priority === 'high' || newNotification.priority === 'critical')
              ? prev.high_priority + 1
              : prev.high_priority
          }));

          // Show toast for high priority notifications
          if (newNotification.priority === 'high' || newNotification.priority === 'critical') {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return {
    notifications,
    loading,
    stats,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    archiveNotification,
    unarchiveNotification
  };
};
