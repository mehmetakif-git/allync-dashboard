import { useState, useEffect } from 'react';
import { Bell, Send, Trash2, Info, CheckCircle2, AlertTriangle, Clock, Wrench, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  createNotification,
  getAllNotifications,
  deleteNotification,
  getNotificationStats,
  getTotalRecipientsCount,
  type SystemNotification,
} from '../../lib/api/notifications';
import LoadingSpinner from '../../components/LoadingSpinner';
import activityLogger from '../../lib/services/activityLogger';
import errorHandler from '../../lib/utils/errorHandler';
import inputValidator from '../../lib/utils/inputValidator';

export default function NotificationsManagement() {
  const { user } = useAuth();

  // Type emoji mapping
  const typeEmoji: Record<string, string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    maintenance: '🔧',
    service: '⚡'
  };

  // Data states
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    this_week: 0,
    recipients: 0,
  });

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'info' as SystemNotification['type'],
    title: '',
    message: '',
    target_audience: 'all' as SystemNotification['target_audience'],
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [notifs, statsData, recipientsCount] = await Promise.all([
        getAllNotifications({ include_deleted: false }),
        getNotificationStats(),
        getTotalRecipientsCount(),
      ]);

      setNotifications(notifs);
      setStats({
        total: statsData.total,
        active: statsData.active,
        this_week: statsData.this_week,
        recipients: recipientsCount,
      });
    } catch (err: any) {
      const errorInfo = errorHandler.handle(err, 'fetchData');
      setError(errorInfo.userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Show success message
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Show error message
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  // Handle send notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Check required fields
    if (!formData.title.trim() || !formData.message.trim()) {
      showError('Please fill in all required fields.');
      return;
    }

    // Validation: Title validation
    const titleValidation = inputValidator.validateNotificationTitle(formData.title);
    if (!titleValidation.isValid) {
      showError(titleValidation.errors.join(' '));
      return;
    }

    // Validation: Message validation
    const messageValidation = inputValidator.validateNotificationMessage(formData.message);
    if (!messageValidation.isValid) {
      showError(messageValidation.errors.join(' '));
      return;
    }

    // Validation: XSS check
    if (inputValidator.containsDangerousContent(formData.title) ||
      inputValidator.containsDangerousContent(formData.message)) {
      showError('Your input contains potentially dangerous content. Please remove any HTML or script tags.');
      return;
    }

    // Auth check
    if (!user?.id) {
      showError('Your session has expired. Please log in again.');
      return;
    }

    // Sanitize inputs (extra security layer)
    const cleanTitle = inputValidator.sanitize(formData.title);
    const cleanMessage = inputValidator.sanitize(formData.message);

    const targetText =
      formData.target_audience === 'all' ? 'all users' :
        formData.target_audience === 'super_admins' ? 'all Super Admins' :
          formData.target_audience === 'company_admins' ? 'all Company Admins' :
            formData.target_audience === 'users' ? 'all regular users' :
              'specific companies';

    if (!confirm(`Send this notification to ${targetText}?\n\nTitle: ${cleanTitle}\nMessage: ${cleanMessage}`)) {
      return;
    }

    setIsSending(true);
    try {
      const newNotification = await createNotification({
        type: formData.type,
        title: cleanTitle,        // ← Sanitized
        message: cleanMessage,    // ← Sanitized
        target_audience: formData.target_audience,
        created_by: user.id,
      });

      // Track notification creation
      await activityLogger.log({
        action: 'Notification Sent',
        action_category: 'create',
        description: `Sent ${formData.type} notification to ${targetText}: "${cleanTitle}"`,
        entity_type: 'Notification',
        entity_id: newNotification.id,
      });

      showSuccess('Notification sent successfully!');

      // Reset form
      setFormData({
        type: 'info',
        title: '',
        message: '',
        target_audience: 'all',
      });

      // Refresh data
      await fetchData();
    } catch (err: any) {
      const errorInfo = errorHandler.handle(err, 'sendNotification');
      showError(errorInfo.userMessage);
    } finally {
      setIsSending(false);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notification: SystemNotification) => {
    if (!confirm(`Delete notification: "${notification.title}"?\n\nThis will remove it from all users.`)) {
      return;
    }

    try {
      await deleteNotification(notification.id);
      // Track notification deletion
      await activityLogger.log({
        action: 'Notification Deleted',
        action_category: 'delete',
        description: `Deleted notification: "${notification.title}"`,
        entity_type: 'Notification',
        entity_id: notification.id,
      });
      showSuccess('Notification deleted successfully');

      // Update local state
      setNotifications(notifications.filter(n => n.id !== notification.id));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err: any) {
      const errorInfo = errorHandler.handle(err, 'deleteNotification');
      showError(errorInfo.userMessage);
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5" />;
      case 'service':
        return <Zap className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-500/20 border border-blue-500/30 text-blue-400';
      case 'success':
        return 'bg-green-500/20 border border-green-500/30 text-green-400';
      case 'warning':
        return 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400';
      case 'maintenance':
        return 'bg-orange-500/20 border border-orange-500/30 text-orange-400';
      case 'service':
        return 'bg-purple-500/20 border border-purple-500/30 text-purple-400';
      default:
        return 'bg-gray-500/20 border border-gray-500/30 text-muted';
    }
  };

  // Get preview colors
  const getPreviewColors = (type: string) => {
    switch (type) {
      case 'info':
        return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'bg-blue-500/20 text-blue-400' };
      case 'success':
        return { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'bg-green-500/20 text-green-400' };
      case 'warning':
        return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: 'bg-yellow-500/20 text-yellow-400' };
      case 'maintenance':
        return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'bg-orange-500/20 text-orange-400' };
      case 'service':
        return { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'bg-purple-500/20 text-purple-400' };
      default:
        return { bg: 'bg-gray-500/10', border: 'border-gray-500/30', icon: 'bg-gray-500/20 text-gray-400' };
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications Management</h1>
            <p className="text-muted mt-1">Send global notifications to all users</p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-500">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Total Sent</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <Send className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Active</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.active}</p>
              </div>
              <Bell className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">This Week</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.this_week}</p>
              </div>
              <Clock className="w-12 h-12 text-purple-500" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Recipients</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.recipients}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Create & Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Form */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-white">Create Notification</h2>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted text-sm mb-2">
                    Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="info" className="bg-slate-800 text-white">Info</option>
                    <option value="success" className="bg-slate-800 text-white">Success</option>
                    <option value="warning" className="bg-slate-800 text-white">Warning</option>
                    <option value="maintenance" className="bg-slate-800 text-white">Maintenance</option>
                    <option value="service" className="bg-slate-800 text-white">Service Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted text-sm mb-2">
                    Target Audience <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="target_audience"
                    value={formData.target_audience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="all" className="bg-slate-800 text-white">All Users</option>
                    <option value="super_admins" className="bg-slate-800 text-white">Super Admins Only</option>
                    <option value="company_admins" className="bg-slate-800 text-white">Company Admins Only</option>
                    <option value="users" className="bg-slate-800 text-white">Regular Users Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-muted text-sm mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Enter notification title"
                  required
                  maxLength={255}
                />
              </div>

              <div>
                <label className="block text-muted text-sm mb-2">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Enter notification message"
                  required
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-400 font-medium">This notification will be sent to:</p>
                    <p className="text-secondary text-sm mt-1">
                      {formData.target_audience === 'all' && `All ${stats.recipients} registered users`}
                      {formData.target_audience === 'super_admins' && 'All Super Admins'}
                      {formData.target_audience === 'company_admins' && 'All Company Admins'}
                      {formData.target_audience === 'users' && 'All Regular Users'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Notification
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ type: 'info', title: '', message: '', target_audience: 'all' })}
                  className="px-6 py-3 bg-secondary hover:bg-hover text-white rounded-lg font-medium transition-colors"
                  disabled={isSending}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <h2 className="text-xl font-bold text-white mb-4">Preview</h2>

            {(() => {
              const colors = getPreviewColors(formData.type);
              return (
                <div className={`rounded-lg p-4 border ${colors.bg} ${colors.border}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colors.icon} text-2xl`}>
                      {typeEmoji[formData.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium">
                        {formData.title || 'Notification Title'}
                      </h3>
                      <p className="text-secondary text-sm mt-1">
                        {formData.message || 'Your notification message will appear here...'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="mt-6 space-y-3">
              <h3 className="text-white font-medium">Notification Types</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">ℹ️</span>
                  <span className="text-secondary">Info - General information</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span className="text-secondary">Success - Positive updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span className="text-secondary">Warning - Important notices</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔧</span>
                  <span className="text-secondary">Maintenance - System updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <span className="text-secondary">Service - New features</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification History */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
          <h2 className="text-xl font-bold text-white mb-4">Notification History</h2>

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-muted">No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-primary/70 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${getTypeBadgeColor(notification.type)} flex-shrink-0`}>
                        <span>{typeEmoji[notification.type]}</span>
                        {notification.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium">{notification.title}</h3>
                        <p className="text-secondary text-sm mt-1 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                          <span>Created: {new Date(notification.created_at).toLocaleDateString()}</span>
                          <span>Target: {notification.target_audience.replace('_', ' ')}</span>
                          <span className={notification.is_active ? 'text-green-400' : 'text-red-400'}>
                            {notification.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNotification(notification)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                      title="Delete notification"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}