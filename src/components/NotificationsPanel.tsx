import { X, Info, CheckCircle, AlertTriangle, XCircle, Wrench } from 'lucide-react';
import { notifications } from '../data/mockData';

interface NotificationsPanelProps {
  onClose: () => void;
}

export default function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={onClose}></div>
      <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-full sm:w-96 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 shadow-2xl z-50 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-400">{unreadCount} unread</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex gap-2 p-4 border-b border-gray-800">
          <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
            All
          </button>
          <button className="px-3 py-1 text-gray-400 hover:bg-gray-800 rounded-lg text-sm font-medium">
            Unread ({unreadCount})
          </button>
          <button className="px-3 py-1 text-gray-400 hover:bg-gray-800 rounded-lg text-sm font-medium">
            Important
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                !notification.read ? 'bg-blue-500/10' : ''
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-medium text-white ${!notification.read ? 'font-bold' : ''}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{notification.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <button className="w-full px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/10 rounded-lg font-medium transition-colors">
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
}
