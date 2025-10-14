import { useState } from 'react';
import { Send, Bell, Plus, Trash2, Clock, Eye } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'maintenance' | 'service';
  title: string;
  message: string;
  sentAt: string;
  recipients: string;
  status: 'active' | 'sent';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'maintenance',
    title: 'Scheduled Maintenance',
    message: 'System maintenance scheduled for Dec 20, 2024 at 02:00 AM UTC. Expected downtime: 2 hours.',
    sentAt: '2024-12-14 15:30',
    recipients: 'All Users',
    status: 'active',
  },
  {
    id: '2',
    type: 'service',
    title: 'WhatsApp Automation Updated',
    message: 'New features added: Bulk message templates, advanced analytics, and custom webhooks.',
    sentAt: '2024-12-14 10:20',
    recipients: 'All Users',
    status: 'sent',
  },
  {
    id: '3',
    type: 'success',
    title: 'Text-to-Video AI Now Available',
    message: 'The Text-to-Video AI service is now active and ready to use. Check the services catalog!',
    sentAt: '2024-12-13 14:45',
    recipients: 'All Users',
    status: 'sent',
  },
];

export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewNotification, setPreviewNotification] = useState<any>(null);

  const handleSendNotification = (data: any) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: data.type,
      title: data.title,
      message: data.message,
      sentAt: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      recipients: 'All Users',
      status: 'active',
    };

    setNotifications([newNotification, ...notifications]);
    setShowCreateModal(false);

    alert(
      `📢 Global Notification Sent!\n\n` +
      `Type: ${data.type.toUpperCase()}\n` +
      `Title: ${data.title}\n\n` +
      `All users (Company Admins and Regular Users) will see this notification immediately in their notification panel.`
    );
  };

  const handleDeleteNotification = (id: string) => {
    if (confirm('Delete this notification? Users who already saw it will still have it in their history.')) {
      setNotifications(notifications.filter(n => n.id !== id));
      alert('✅ Notification deleted from the system.');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/20 text-green-400';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400';
      case 'info': return 'bg-blue-500/20 text-blue-400';
      case 'maintenance': return 'bg-orange-500/20 text-orange-400';
      case 'service': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications Management</h1>
          <p className="text-gray-400 mt-1">Create and send system-wide announcements to all users</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Notification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-gray-400">Total Sent</p>
          </div>
          <p className="text-3xl font-bold text-white">{notifications.length}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-gray-400">Active Now</p>
          </div>
          <p className="text-3xl font-bold text-white">{notifications.filter(n => n.status === 'active').length}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-sm text-gray-400">This Week</p>
          </div>
          <p className="text-3xl font-bold text-white">5</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-400">All Time</p>
          </div>
          <p className="text-3xl font-bold text-white">127</p>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex gap-3">
          <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-300 mb-1">Global Notifications System</h3>
            <p className="text-sm text-blue-300">
              All notifications sent from here are <strong>GLOBAL</strong> and <strong>MANDATORY</strong>.
              Every user (Company Admins and Regular Users) will see them immediately in their notification panel.
              Users <strong>cannot disable</strong> or opt-out of system notifications.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-800/30">
          <h3 className="font-bold text-white">Notification History</h3>
        </div>

        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No notifications sent yet</p>
            <p className="text-gray-500 text-sm mt-1">Create your first notification to announce updates to all users</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white text-lg">{notification.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                        {notification.type.toUpperCase()}
                      </span>
                      {notification.status === 'active' && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 mb-3">{notification.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Sent: {notification.sentAt}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bell className="w-4 h-4" />
                        Recipients: {notification.recipients}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewNotification(notification)}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Create Global Notification</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSendNotification({
                  type: formData.get('type'),
                  title: formData.get('title'),
                  message: formData.get('message'),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Notification Type *</label>
                <select
                  name="type"
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500"
                >
                  <option value="info">ℹ️ Info - General information</option>
                  <option value="success">✅ Success - Positive updates</option>
                  <option value="warning">⚠️ Warning - Important alerts</option>
                  <option value="maintenance">🔧 Maintenance - System maintenance</option>
                  <option value="service">⚡ Service - Service updates</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g., System Maintenance Scheduled"
                  maxLength={80}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">Keep it short and clear (max 80 characters)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Message *</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Detailed notification message that all users will see..."
                  maxLength={500}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Provide all necessary details (max 500 characters)</p>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex gap-2">
                  <Bell className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-300 font-medium mb-1">Important:</p>
                    <ul className="text-sm text-red-300 space-y-1">
                      <li>• This notification will be sent to <strong>ALL USERS</strong> immediately</li>
                      <li>• Users <strong>CANNOT</strong> disable or opt-out of these notifications</li>
                      <li>• Make sure the information is accurate and necessary</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send to All Users
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Notification Preview</h2>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(previewNotification.type)}`}>
                  {previewNotification.type.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">{previewNotification.sentAt}</span>
              </div>
              <h3 className="font-bold text-white mb-2">{previewNotification.title}</h3>
              <p className="text-gray-400 text-sm">{previewNotification.message}</p>
            </div>

            <button
              onClick={() => setPreviewNotification(null)}
              className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
