import { supabase } from '../supabase';
import logger from '../services/consoleLogger';

// =====================================================
// INTERFACES
// =====================================================

export interface SystemNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'maintenance' | 'service';
  title: string;
  message: string;
  icon?: string | null;
  action_url?: string | null;
  action_label?: string | null;
  target_audience: 'all' | 'super_admins' | 'company_admins' | 'users' | 'specific_companies';
  target_company_ids?: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
  expires_at?: string | null;
  is_active: boolean;
  deleted_at?: string | null;
}

export interface UserNotification {
  id: string;
  user_id: string;
  notification_id: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  notification?: SystemNotification;
}

export interface NotificationWithReadStatus extends SystemNotification {
  is_read: boolean;
  read_at?: string | null;
  user_notification_id?: string;
}

// =====================================================
// SUPER ADMIN - SYSTEM NOTIFICATIONS MANAGEMENT
// =====================================================

// Create a new system notification
export async function createNotification(data: {
  type: SystemNotification['type'];
  title: string;
  message: string;
  icon?: string;
  action_url?: string;
  action_label?: string;
  target_audience?: SystemNotification['target_audience'];
  target_company_ids?: string[];
  expires_at?: string;
  created_by: string;
}) {
  logger.apiRequest('createNotification', 'POST', { title: data.title });

  const { data: notification, error } = await supabase
    .from('system_notifications')
    .insert([{
      type: data.type,
      title: data.title,
      message: data.message,
      icon: data.icon || null,
      action_url: data.action_url || null,
      action_label: data.action_label || null,
      target_audience: data.target_audience || 'all',
      target_company_ids: data.target_company_ids || null,
      expires_at: data.expires_at || null,
      created_by: data.created_by,
      is_active: true,
    }])
    .select()
    .single();

  if (error) {
    logger.error('Failed to create notification', error);
    throw error;
  }

  logger.success('Notification created', { id: notification.id });
  logger.info('Trigger will auto-create user_notifications');
  
  return notification as SystemNotification;
}

// Get all system notifications (Super Admin)
export async function getAllNotifications(filters?: {
  type?: SystemNotification['type'];
  is_active?: boolean;
  include_deleted?: boolean;
}) {
  logger.apiRequest('getAllNotifications', 'GET');

  let query = supabase
    .from('system_notifications')
    .select(`
      *,
      creator:profiles!created_by(id, full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  if (!filters?.include_deleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('getAllNotifications failed', error);
    throw error;
  }

  logger.success('Notifications fetched', { count: data?.length || 0 });
  return data;
}

// Update a system notification
export async function updateNotification(
  notificationId: string,
  updates: Partial<SystemNotification>
) {
  logger.apiRequest('updateNotification', 'PATCH', { id: notificationId });

  const { data, error } = await supabase
    .from('system_notifications')
    .update(updates)
    .eq('id', notificationId)
    .select()
    .single();

  if (error) {
    logger.error('updateNotification failed', error);
    throw error;
  }

  logger.success('Notification updated');
  return data as SystemNotification;
}

// Soft delete a notification
export async function deleteNotification(notificationId: string) {
  logger.apiRequest('deleteNotification', 'DELETE', { id: notificationId });

  const { data, error } = await supabase
    .from('system_notifications')
    .update({ 
      deleted_at: new Date().toISOString(),
      is_active: false 
    })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) {
    logger.error('deleteNotification failed', error);
    throw error;
  }

  logger.success('Notification soft deleted');
  return data;
}

// Hard delete a notification (permanent)
export async function hardDeleteNotification(notificationId: string) {
  logger.apiRequest('hardDeleteNotification', 'DELETE', { id: notificationId });

  const { error } = await supabase
    .from('system_notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    logger.error('hardDeleteNotification failed', error);
    throw error;
  }

  logger.success('Notification permanently deleted');
}

// Toggle notification active status
export async function toggleNotificationStatus(notificationId: string) {
  logger.apiRequest('toggleNotificationStatus', 'PATCH', { id: notificationId });

  const { data: current, error: fetchError } = await supabase
    .from('system_notifications')
    .select('is_active')
    .eq('id', notificationId)
    .single();

  if (fetchError) throw fetchError;

  return updateNotification(notificationId, {
    is_active: !current.is_active
  });
}

// =====================================================
// USER - PERSONAL NOTIFICATIONS
// =====================================================

// Get user's notifications with read status
export async function getUserNotifications(userId: string, filters?: {
  is_read?: boolean;
  type?: SystemNotification['type'];
  limit?: number;
}) {
  logger.apiRequest('getUserNotifications', 'GET', { userId });

  let query = supabase
    .from('user_notifications')
    .select(`
      id,
      is_read,
      read_at,
      created_at,
      notification:system_notifications(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (filters?.is_read !== undefined) {
    query = query.eq('is_read', filters.is_read);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('getUserNotifications failed', error);
    throw error;
  }

  logger.success('User notifications fetched', { count: data?.length || 0 });

  // Transform data to include read status
  const notifications: NotificationWithReadStatus[] = data
    ?.filter((un: any) => un.notification) // Filter out null notifications
    .map((un: any) => ({
      ...un.notification,
      is_read: un.is_read,
      read_at: un.read_at,
      user_notification_id: un.id,
    })) || [];

  // Apply type filter if specified
  if (filters?.type) {
    return notifications.filter(n => n.type === filters.type);
  }

  return notifications;
}

// Get unread notification count
export async function getUnreadCount(userId: string) {
  logger.apiRequest('getUnreadCount', 'GET', { userId });

  const { count, error } = await supabase
    .from('user_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    logger.error('getUnreadCount failed', error);
    throw error;
  }

  logger.success('Unread count fetched', { count });
  return count || 0;
}

// Mark notification as read
export async function markAsRead(userNotificationId: string) {
  logger.apiRequest('markAsRead', 'PATCH', { id: userNotificationId });

  const { data, error } = await supabase
    .from('user_notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', userNotificationId)
    .select()
    .single();

  if (error) {
    logger.error('markAsRead failed', error);
    throw error;
  }

  logger.success('Marked as read');
  return data;
}

// Mark all notifications as read for a user
export async function markAllAsRead(userId: string) {
  logger.apiRequest('markAllAsRead', 'PATCH', { userId });

  const { data, error } = await supabase
    .from('user_notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select();

  if (error) {
    logger.error('markAllAsRead failed', error);
    throw error;
  }

  logger.success('All notifications marked as read', { count: data?.length || 0 });
  return data;
}

// Delete user notification (remove from personal list)
export async function deleteUserNotification(userNotificationId: string) {
  logger.apiRequest('deleteUserNotification', 'DELETE', { id: userNotificationId });

  const { error } = await supabase
    .from('user_notifications')
    .delete()
    .eq('id', userNotificationId);

  if (error) {
    logger.error('deleteUserNotification failed', error);
    throw error;
  }

  logger.success('User notification deleted');
}

// Clear all read notifications for a user
export async function clearReadNotifications(userId: string) {
  logger.apiRequest('clearReadNotifications', 'DELETE', { userId });
  const { error } = await supabase
    .from('user_notifications')
    .delete()
    .eq('user_id', userId)
    .eq('is_read', true);

  if (error) {
    logger.error('clearReadNotifications failed', error);
    throw error;
  }

  logger.success('Read notifications cleared');
}

// =====================================================
// STATISTICS
// =====================================================

// Get notification statistics (Super Admin)
export async function getNotificationStats() {
  logger.apiRequest('getNotificationStats', 'GET');

  const { data: notifications, error } = await supabase
    .from('system_notifications')
    .select('id, type, created_at, is_active')
    .is('deleted_at', null);

  if (error) {
    logger.error('getNotificationStats failed', error);
    throw error;
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const stats = {
    total: notifications.length,
    active: notifications.filter(n => n.is_active).length,
    this_week: notifications.filter(n => new Date(n.created_at) >= weekAgo).length,
    by_type: {
      success: notifications.filter(n => n.type === 'success').length,
      warning: notifications.filter(n => n.type === 'warning').length,
      info: notifications.filter(n => n.type === 'info').length,
      maintenance: notifications.filter(n => n.type === 'maintenance').length,
      service: notifications.filter(n => n.type === 'service').length,
    },
  };

  logger.success('Notification stats calculated', stats);
  return stats;
}

// Get total recipients count
export async function getTotalRecipientsCount() {
  logger.apiRequest('getTotalRecipientsCount', 'GET');

  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true });

  if (error) {
    logger.error('getTotalRecipientsCount failed', error);
    throw error;
  }

  logger.success('Total recipients counted', { count });
  return count || 0;
}

// =====================================================
// REALTIME SUBSCRIPTION (Optional)
// =====================================================

// Subscribe to user notifications changes
export function subscribeToUserNotifications(
  userId: string,
  callback: (notification: NotificationWithReadStatus) => void
) {
  logger.info('Setting up realtime subscription for notifications');

  const subscription = supabase
    .channel(`user-notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_notifications',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        logger.info('New notification received', { id: payload.new.id });
        
        // Fetch full notification details
        const { data } = await supabase
          .from('user_notifications')
          .select(`
            id,
            is_read,
            read_at,
            created_at,
            notification:system_notifications(*)
          `)
          .eq('id', payload.new.id)
          .single();

        if (data && data.notification) {
          const notificationWithStatus: NotificationWithReadStatus = {
            ...data.notification,
            is_read: data.is_read,
            read_at: data.read_at,
            user_notification_id: data.id,
          };
          callback(notificationWithStatus);
        }
      }
    )
    .subscribe();

  return subscription;
}

// Unsubscribe from notifications
export function unsubscribeFromNotifications(subscription: any) {
  logger.info('Cleaning up notification subscription');
  if (subscription) {
    supabase.removeChannel(subscription);
  }
}

// =====================================================
// EXPORT
// =====================================================

export default {
  // Super Admin
  createNotification,
  getAllNotifications,
  updateNotification,
  deleteNotification,
  hardDeleteNotification,
  toggleNotificationStatus,
  
  // User
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteUserNotification,
  clearReadNotifications,
  
  // Stats
  getNotificationStats,
  getTotalRecipientsCount,
  
  // Realtime
  subscribeToUserNotifications,
  unsubscribeFromNotifications,
};