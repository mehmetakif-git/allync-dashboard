import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUnreadCount, getUserNotifications } from '../lib/api/notifications';

export default function NotificationDebugger() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleDebug = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [unreadCount, allNotifications] = await Promise.all([
        getUnreadCount(user.id),
        getUserNotifications(user.id, { limit: 20 }),
      ]);

      setDebugInfo({
        userId: user.id,
        userRole: user.role,
        unreadCount,
        totalNotifications: allNotifications.length,
        unreadNotifications: allNotifications.filter(n => !n.is_read),
        notifications: allNotifications,
      });

      console.log('🐛 [DEBUG] Notification info:', {
        unreadCount,
        totalNotifications: allNotifications.length,
        notifications: allNotifications,
      });
    } catch (error) {
      console.error('❌ [DEBUG] Error:', error);
      setDebugInfo({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'company_admin' && user?.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleDebug}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg font-medium transition-colors"
      >
        {loading ? 'Loading...' : '🐛 Debug Notifications'}
      </button>

      {debugInfo && (
        <div className="mt-2 p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-md max-h-96 overflow-auto">
          <h3 className="text-white font-bold mb-2">Debug Info</h3>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          <button
            onClick={() => setDebugInfo(null)}
            className="mt-2 text-xs text-red-400 hover:text-red-300"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
