import { Menu, Bell, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationsPanel from './NotificationsPanel';
import { getUnreadCount, subscribeToUserNotifications, unsubscribeFromNotifications } from '../lib/api/notifications';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Fetch initial unread count
  useEffect(() => {
    if (!user?.id) return;

    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount(user.id);
        setUnreadCount(count);
      } catch (error) {
        console.error('❌ [Header] Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [user?.id]);

  // Set up real-time listener for new notifications
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔔 [Header] Setting up notification listener for user:', user.id);

    const subscription = subscribeToUserNotifications(user.id, (newNotification) => {
      console.log('🔔🔔🔔 [Header] New notification received!', newNotification);

      // Update unread count
      setUnreadCount((prev) => {
        const newCount = prev + 1;
        console.log('📊 [Header] Unread count updated:', prev, '->', newCount);
        return newCount;
      });

      // Trigger bell animation
      console.log('🔔 [Header] Triggering ring animation...');

      // Force re-render by toggling state
      setHasNewNotification(false); // First set to false
      setTimeout(() => {
        setHasNewNotification(true); // Then set to true (triggers animation)
        setTimeout(() => {
          setHasNewNotification(false); // Remove after animation completes
          console.log('✅ [Header] Ring animation completed');
        }, 800); // Animation duration is 0.8s
      }, 10); // Small delay to ensure state update

      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        console.log('💬 [Header] Showing browser notification');
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: newNotification.id,
        });
      } else {
        console.log('❌ [Header] Browser notifications not permitted:', Notification?.permission);
      }
    });

    console.log('✅ [Header] Realtime subscription created');

    return () => {
      console.log('🔕 [Header] Cleaning up notification listener');
      unsubscribeFromNotifications(subscription);
    };
  }, [user?.id]);

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Ask for permission after a short delay (better UX)
      setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          console.log('📢 Browser notification permission:', permission);
        });
      }, 2000);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return 'U';
    if (user.full_name) {
      return user.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.[0]?.toUpperCase() || 'U';
  };

  const getRoleName = () => {
    if (!user) return 'User';
    switch (user.role) {
      case 'super_admin':
        return 'Super Admin';
      case 'company_admin':
        return 'Company Admin';
      case 'user':
        return 'User';
      default:
        return 'User';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-primary border-b border-primary px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-muted" />
        </button>

        <div className="flex-1 lg:flex-none">
          <h1 className="text-xl font-bold text-white hidden lg:block">
            Welcome back, {user?.full_name || user?.email || 'User'}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-secondary rounded-lg transition-all"
            >
              <Bell
                className={`w-5 h-5 transition-colors ${
                  unreadCount > 0 ? 'text-blue-400' : 'text-muted'
                } ${hasNewNotification ? 'animate-ring' : ''}`}
                style={{ transformOrigin: 'top center' }}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationsPanel
                onClose={() => setShowNotifications(false)}
                onNotificationRead={() => setUnreadCount((prev) => Math.max(0, prev - 1))}
                onMarkAllRead={() => setUnreadCount(0)}
              />
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {getInitials()}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white">
                  {user?.full_name || user?.email || 'User'}
                </p>
                <p className="text-xs text-muted">{getRoleName()}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-secondary border border-secondary rounded-lg shadow-xl py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:bg-hover transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
}