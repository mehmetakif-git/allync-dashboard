import { useState } from 'react';
import { Bell, Send, Trash2, Info, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'maintenance' | 'service';
  title: string;
  message: string;
  sentDate: string;
  sentBy: string;
  recipientsCount: number;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'maintenance',
    title: 'Scheduled Maintenance',
    message: 'System maintenance scheduled for tonight at 2 AM UTC. Expected downtime: 30 minutes.',
    sentDate: '2024-03-20 10:30',
    sentBy: 'info@allyncai.com',
    recipientsCount: 156,
  },
  {
    id: '2',
    type: 'service',
    title: 'New Service Available',
    message: 'AI Voice Assistant is now available! Check out the new service in your dashboard.',
    sentDate: '2024-03-19 14:15',
    sentBy: 'info@allyncai.com',
    recipientsCount: 156,
  },
  {
    id: '3',
    type: 'success',
    title: 'Platform Update',
    message: 'We have successfully deployed new features including enhanced analytics and performance improvements.',
    sentDate: '2024-03-18 09:00',
    sentBy: 'info@allyncai.com',
    recipientsCount: 156,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Payment Reminder',
    message: 'Some invoices are due this week. Please check your billing section.',
    sentDate: '2024-03-17 11:20',
    sentBy: 'info@allyncai.com',
    recipientsCount: 24,
  },
];

export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'info' as Notification['type'],
    title: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }

    if (confirm(`Send this notification to all users?\n\nTitle: ${formData.title}\nMessage: ${formData.message}`)) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      alert('Notification sent successfully to all users');
      setFormData({
        type: 'info',
        title: '',
        message: '',
      });
    }
  };

  const handleDeleteNotification = async (notification: Notification) => {
    if (confirm(`Delete notification: "${notification.title}"?`)) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotifications(notifications.filter(n => n.id !== notification.id));
      setIsLoading(false);
      alert('Notification deleted successfully');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'maintenance':
        return <Clock className="w-5 h-5" />;
      case 'service':
        return <Bell className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-500/20 text-blue-400';
      case 'success':
        return 'bg-green-500/20 text-green-400';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'maintenance':
        return 'bg-orange-500/20 text-orange-400';
      case 'service':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Notifications Management</h1>
        <p className="text-gray-400 mt-1">Send global notifications to all users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Sent</p>
              <p className="text-3xl font-bold text-white mt-2">{notifications.length}</p>
            </div>
            <Send className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-3xl font-bold text-white mt-2">{notifications.length}</p>
            </div>
            <Bell className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">This Week</p>
              <p className="text-3xl font-bold text-white mt-2">4</p>
            </div>
            <Clock className="w-12 h-12 text-purple-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Recipients</p>
              <p className="text-3xl font-bold text-white mt-2">156</p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-white">Create Notification</h2>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Type <span className="text-red-400">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="maintenance">Maintenance</option>
                <option value="service">Service Update</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter notification title"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Enter notification message"
                required
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-400 font-medium">This notification will be sent to:</p>
                  <p className="text-gray-300 text-sm mt-1">All 156 registered users across all companies</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send to All Users
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ type: 'info', title: '', message: '' })}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium"
                disabled={isLoading}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Preview</h2>
          <div className={`rounded-lg p-4 border ${
            formData.type === 'info' ? 'bg-blue-500/10 border-blue-500/30' :
            formData.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
            formData.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
            formData.type === 'maintenance' ? 'bg-orange-500/10 border-orange-500/30' :
            'bg-purple-500/10 border-purple-500/30'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                formData.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
                formData.type === 'success' ? 'bg-green-500/20 text-green-400' :
                formData.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                formData.type === 'maintenance' ? 'bg-orange-500/20 text-orange-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                {getTypeIcon(formData.type)}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">
                  {formData.title || 'Notification Title'}
                </h3>
                <p className="text-gray-300 text-sm mt-1">
                  {formData.message || 'Your notification message will appear here...'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-white font-medium">Notification Types</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Info - General information</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Success - Positive updates</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Warning - Important notices</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300">Maintenance - System updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Service - New features</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Notification History</h2>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${getTypeBadgeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                    {notification.type}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{notification.title}</h3>
                    <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Sent: {notification.sentDate}</span>
                      <span>By: {notification.sentBy}</span>
                      <span>Recipients: {notification.recipientsCount}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteNotification(notification)}
                  disabled={isLoading}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
