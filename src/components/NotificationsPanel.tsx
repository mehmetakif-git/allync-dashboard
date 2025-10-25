import { useState } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Wrench, Zap, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'maintenance' | 'service';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon?: any;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'maintenance',
    title: 'Scheduled Maintenance',
    message: 'System maintenance scheduled for Dec 20, 2024 at 02:00 AM UTC. Expected downtime: 2 hours.',
    timestamp: '2024-12-14 15:30',
    isRead: false,
  },
  {
    id: '2',
    type: 'service',
    title: 'WhatsApp Automation Updated',
    message: 'New features added: Bulk message templates, advanced analytics, and custom webhooks.',
    timestamp: '2024-12-14 10:20',
    isRead: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Text-to-Video AI Now Available',
    message: 'The Text-to-Video AI service is now active and ready to use. Check the services catalog!',
    timestamp: '2024-12-13 14:45',
    isRead: true,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Instagram API Rate Limit',
    message: 'Instagram API experiencing high traffic. Some requests may be delayed. Our team is monitoring.',
    timestamp: '2024-12-12 09:15',
    isRead: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'New Pricing Plans Available',
    message: 'We\'ve introduced flexible monthly and annual pricing options. Contact support for details.',
    timestamp: '2024-12-10 16:00',
    isRead: true,
  },
];

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    if (confirm('Clear all notifications? This action cannot be undone.')) {
      setNotifications([]);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return { Icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'warning':
        return { Icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      case 'info':
        return { Icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 'maintenance':
        return { Icon: Wrench, color: 'text-orange-400', bg: 'bg-orange-500/20' };
      case 'service':
        return { Icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/20' };
      default:
        return { Icon: Bell, color: 'text-muted', bg: 'bg-gray-500/20' };
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      <div className="fixed top-16 right-4 w-96 max-h-[600px] bg-primary border border-primary rounded-xl shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary">
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
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2 p-3 border-b border-primary bg-secondary/30">
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
              Clear all
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-muted text-center">No notifications</p>
              <p className="text-muted text-sm text-center mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {notifications.map((notification) => {
                const { Icon, color, bg } = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-card transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-500/5' : ''
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-white text-sm">{notification.title}</h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-muted mb-2 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center gap-1 text-xs text-muted">
                          <Clock className="w-3 h-3" />
                          {notification.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-primary bg-secondary/30">
          <p className="text-xs text-muted text-center">
            These are system-wide announcements visible to all users
          </p>
        </div>
      </div>
    </>
  );
}
