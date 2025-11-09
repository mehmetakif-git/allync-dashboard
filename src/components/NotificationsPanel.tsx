import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Wrench, Zap, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearReadNotifications,
  subscribeToUserNotifications,
  unsubscribeFromNotifications,
  type NotificationWithReadStatus,
} from '../lib/api/notifications';

interface NotificationsPanelProps {
  onClose: () => void;
  onNotificationRead?: () => void;
  onMarkAllRead?: () => void;
}

export default function NotificationsPanel({ onClose, onNotificationRead, onMarkAllRead }: NotificationsPanelProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithReadStatus[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNotificationIds, setNewNotificationIds] = useState<Set<string>>(new Set());

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const [notifs, count] = await Promise.all([
        getUserNotifications(user.id, { limit: 20 }),
        getUnreadCount(user.id),
      ]);

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err: any) {
      console.error('❌ Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔔 Setting up realtime notifications subscription');

    const subscription = subscribeToUserNotifications(
      user.id,
      (newNotification) => {
        console.log('🔔🔔 [Panel] New notification received:', newNotification);

        // Add to beginning of list
        setNotifications(prev => {
          console.log('📝 [Panel] Adding notification to list, current count:', prev.length);
          return [newNotification, ...prev];
        });
        setUnreadCount(prev => prev + 1);

        // Mark as new for animation (remove after 3 seconds)
        if (newNotification.id) {
          console.log('✨ [Panel] Adding animation for notification:', newNotification.id);
          setNewNotificationIds(prev => new Set(prev).add(newNotification.id));
          setTimeout(() => {
            console.log('🔇 [Panel] Removing animation for notification:', newNotification.id);
            setNewNotificationIds(prev => {
              const updated = new Set(prev);
              updated.delete(newNotification.id);
              return updated;
            });
          }, 3000);
        }

        // Optional: Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/logo.png',
          });
        }
      }
    );

    return () => {
      console.log('🔕 Cleaning up notifications subscription');
      unsubscribeFromNotifications(subscription);
    };
  }, [user?.id]);

  // Handle mark as read
  const handleMarkAsRead = async (userNotificationId: string) => {
    try {
      await markAsRead(userNotificationId);

      // Update local state
      setNotifications(notifications.map(n =>
        n.user_notification_id === userNotificationId
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Notify parent (Header) to update its badge
      onNotificationRead?.();
    } catch (err) {
      console.error('❌ Error marking as read:', err);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await markAllAsRead(user.id);

      // Update local state
      setNotifications(notifications.map(n => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString(),
      })));
      setUnreadCount(0);

      // Notify parent (Header) to update its badge
      onMarkAllRead?.();
    } catch (err) {
      console.error('❌ Error marking all as read:', err);
    }
  };

  // Handle clear all
  const handleClearAll = async () => {
    if (!user?.id) return;

    if (!confirm('Clear all read notifications? This action cannot be undone.')) {
      return;
    }

    try {
      await clearReadNotifications(user.id);

      // Update local state - keep only unread
      setNotifications(notifications.filter(n => !n.is_read));
    } catch (err) {
      console.error('❌ Error clearing notifications:', err);
    }
  };

  // Get notification icon and colors
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return { 
          Icon: CheckCircle, 
          color: 'text-green-400', 
          bg: 'bg-green-500/20',
          border: 'border-green-500/30' 
        };
      case 'warning':
        return { 
          Icon: AlertCircle, 
          color: 'text-yellow-400', 
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30' 
        };
      case 'info':
        return { 
          Icon: Info, 
          color: 'text-blue-400', 
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/30' 
        };
      case 'maintenance':
        return { 
          Icon: Wrench, 
          color: 'text-orange-400', 
          bg: 'bg-orange-500/20',
          border: 'border-orange-500/30' 
        };
      case 'service':
        return { 
          Icon: Zap, 
          color: 'text-purple-400', 
          bg: 'bg-purple-500/20',
          border: 'border-purple-500/30' 
        };
      default:
        return { 
          Icon: Bell, 
          color: 'text-muted', 
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/30' 
        };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] max-h-[600px] bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-muted" />
        </button>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-2 p-3 border-b border-white/10 bg-white/5">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={handleClearAll}
            className="text-xs text-red-400 hover:text-red-300 transition-colors ml-auto"
          >
            Clear read
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <p className="text-red-400 text-center">{error}</p>
            <button
              onClick={fetchNotifications}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300"
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-muted text-center">No notifications</p>
            <p className="text-muted text-sm text-center mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {notifications.map((notification) => {
              const { Icon, color, bg, border } = getNotificationStyle(notification.type);
              const isNew = newNotificationIds.has(notification.id);
              const isUrgent = notification.type === 'warning' && !notification.is_read;

              return (
                <div
                  key={notification.user_notification_id}
                  className={`p-4 hover:bg-white/10 transition-all cursor-pointer ${
                    !notification.is_read ? 'bg-blue-500/10' : ''
                  } ${isNew ? 'animate-slide-in-right border-l-4 border-blue-500' : ''} ${
                    isUrgent ? 'border-l-4 border-yellow-500' : ''
                  }`}
                  onClick={() => {
                    if (!notification.is_read && notification.user_notification_id) {
                      handleMarkAsRead(notification.user_notification_id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 ${bg} border ${border} rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isNew ? 'animate-bounce' : ''
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${color} ${isUrgent ? 'animate-pulse' : ''}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-white text-sm leading-tight">
                          {notification.title}
                          {isNew && (
                            <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded uppercase">
                              New
                            </span>
                          )}
                        </h4>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1 animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-muted mb-2 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(notification.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 bg-white/5">
        <p className="text-xs text-muted text-center">
          System-wide announcements from Allync AI
        </p>
      </div>
    </div>
  );
}