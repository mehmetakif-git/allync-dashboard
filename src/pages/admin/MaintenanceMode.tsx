import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  Clock,
  Users,
  Save,
  Plus,
  X,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAllMaintenanceWindows,
  getActiveMaintenanceWindow,
  getUpcomingMaintenanceWindows,
  getMaintenanceHistory,
  createMaintenanceWindow,
  updateMaintenanceWindow,
  cancelMaintenanceWindow,
  deleteMaintenanceWindow,
  type MaintenanceWindow,
  type CreateMaintenanceWindow,
} from '../../lib/api/maintenanceWindows';

export default function MaintenanceMode() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data states
  const [activeWindow, setActiveWindow] = useState<MaintenanceWindow | null>(null);
  const [upcomingWindows, setUpcomingWindows] = useState<MaintenanceWindow[]>([]);
  const [historyWindows, setHistoryWindows] = useState<MaintenanceWindow[]>([]);

  // Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    messageTr: 'Sistem bakımı yapılmaktadır. Kısa süre içinde hizmete devam edeceğiz.',
    messageEn: 'System maintenance in progress. We will be back shortly.',
    affectedServices: [] as string[],
  });

  // Available services
  const availableServices = [
    'WhatsApp Automation',
    'Instagram Automation',
    'Google Calendar',
    'Google Sheets',
    'Google Gmail',
    'Google Docs',
    'Google Drive',
    'Google Photos',
  ];

  // Load all data
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📥 Loading maintenance data...');

      const [active, upcoming, history] = await Promise.all([
        getActiveMaintenanceWindow(),
        getUpcomingMaintenanceWindows(),
        getMaintenanceHistory(20),
      ]);

      setActiveWindow(active);
      setUpcomingWindows(upcoming);
      setHistoryWindows(history);

      console.log('✅ Data loaded successfully');
    } catch (err: any) {
      console.error('❌ Failed to load data:', err);
      setError('Failed to load maintenance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Create maintenance window
  const handleCreateMaintenance = async () => {
    if (!formData.startTime || !formData.endTime) {
      setError('Please select start and end times');
      return;
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      setError('End time must be after start time');
      return;
    }

    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const newWindow: CreateMaintenanceWindow = {
        scheduled_by: user.id,
        start_time: new Date(formData.startTime).toISOString(),
        end_time: new Date(formData.endTime).toISOString(),
        message_tr: formData.messageTr,
        message_en: formData.messageEn,
        affected_services: formData.affectedServices.length > 0 ? formData.affectedServices : null,
      };

      await createMaintenanceWindow(newWindow);

      setSuccessMessage('Maintenance window scheduled successfully!');
      setShowCreateForm(false);
      setFormData({
        startTime: '',
        endTime: '',
        messageTr: 'Sistem bakımı yapılmaktadır. Kısa süre içinde hizmete devam edeceğiz.',
        messageEn: 'System maintenance in progress. We will be back shortly.',
        affectedServices: [],
      });

      await loadData();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('❌ Failed to create maintenance:', err);
      setError('Failed to schedule maintenance');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel maintenance
  const handleCancelMaintenance = async (id: string) => {
    if (!confirm('Cancel this maintenance window?')) return;

    try {
      setIsSaving(true);
      await cancelMaintenanceWindow(id);
      setSuccessMessage('Maintenance canceled successfully!');
      await loadData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('❌ Failed to cancel:', err);
      setError('Failed to cancel maintenance');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete maintenance
  const handleDeleteMaintenance = async (id: string) => {
    if (!confirm('Delete this maintenance window? This cannot be undone.')) return;

    try {
      setIsSaving(true);
      await deleteMaintenanceWindow(id);
      setSuccessMessage('Maintenance deleted successfully!');
      await loadData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('❌ Failed to delete:', err);
      setError('Failed to delete maintenance');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle service selection
  const toggleService = (service: string) => {
    if (formData.affectedServices.includes(service)) {
      setFormData({
        ...formData,
        affectedServices: formData.affectedServices.filter(s => s !== service),
      });
    } else {
      setFormData({
        ...formData,
        affectedServices: [...formData.affectedServices, service],
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate duration
  const calculateDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-muted mt-4">Loading maintenance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Maintenance Mode</h1>
            <p className="text-muted mt-1">Schedule and manage system maintenance windows</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-muted" />
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Schedule Maintenance
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Active Maintenance */}
        {activeWindow && (
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-12 h-12 text-orange-400 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">⚠️ ACTIVE MAINTENANCE</h2>
                <p className="text-red-400 text-lg font-medium mb-4">System is currently in maintenance mode</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-primary/50 rounded-lg p-3">
                    <p className="text-muted text-sm">Start Time</p>
                    <p className="text-white font-medium">{formatDate(activeWindow.start_time)}</p>
                  </div>
                  <div className="bg-primary/50 rounded-lg p-3">
                    <p className="text-muted text-sm">End Time</p>
                    <p className="text-white font-medium">{formatDate(activeWindow.end_time)}</p>
                  </div>
                </div>

                <div className="bg-primary/50 rounded-lg p-3 mb-4">
                  <p className="text-muted text-sm mb-1">Message (TR)</p>
                  <p className="text-white">{activeWindow.message_tr}</p>
                </div>

                <button
                  onClick={() => handleCancelMaintenance(activeWindow.id)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <LoadingSpinner size="sm" /> : <XCircle className="w-5 h-5" />}
                  End Maintenance Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-secondary rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Schedule Maintenance</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-primary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted text-sm mb-2">Start Time</label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-muted text-sm mb-2">End Time</label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {formData.startTime && formData.endTime && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-400 text-sm">
                      Duration: {calculateDuration(formData.startTime, formData.endTime)}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-muted text-sm mb-2">Message (Turkish)</label>
                  <textarea
                    rows={3}
                    value={formData.messageTr}
                    onChange={(e) => setFormData({ ...formData, messageTr: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    placeholder="Sistem bakımı mesajı..."
                  />
                </div>

                <div>
                  <label className="block text-muted text-sm mb-2">Message (English)</label>
                  <textarea
                    rows={3}
                    value={formData.messageEn}
                    onChange={(e) => setFormData({ ...formData, messageEn: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    placeholder="Maintenance message..."
                  />
                </div>

                <div>
                  <label className="block text-muted text-sm mb-2">Affected Services (Optional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableServices.map(service => (
                      <button
                        key={service}
                        onClick={() => toggleService(service)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.affectedServices.includes(service)
                            ? 'bg-blue-600 text-white'
                            : 'bg-primary text-muted hover:text-white'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-hover font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateMaintenance}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        Schedule Maintenance
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Maintenance */}
        {upcomingWindows.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <h2 className="text-xl font-bold text-white mb-4">Upcoming Maintenance</h2>
            <div className="space-y-3">
              {upcomingWindows.map(window => (
                <div key={window.id} className="bg-primary/50 rounded-lg p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">
                        {formatDate(window.start_time)} - {formatDate(window.end_time)}
                      </span>
                      <span className="text-muted text-sm">
                        ({calculateDuration(window.start_time, window.end_time)})
                      </span>
                    </div>
                    <p className="text-muted text-sm">{window.message_en}</p>
                    {window.affected_services && window.affected_services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {window.affected_services.map(service => (
                          <span key={service} className="px-2 py-1 bg-secondary rounded text-xs text-muted">
                            {service}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCancelMaintenance(window.id)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <XCircle className="w-5 h-5 text-orange-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteMaintenance(window.id)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {historyWindows.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <h2 className="text-xl font-bold text-white mb-4">Maintenance History</h2>
            <div className="space-y-3">
              {historyWindows.map(window => (
                <div key={window.id} className="bg-primary/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-muted" />
                    <span className="text-white">
                      {formatDate(window.start_time)} - {formatDate(window.end_time)}
                    </span>
                    <span className="text-muted text-sm">
                      ({calculateDuration(window.start_time, window.end_time)})
                    </span>
                    {!window.is_active && (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">
                        Canceled
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-sm">{window.message_en}</p>
                  {window.scheduled_by_profile && (
                    <p className="text-muted text-xs mt-2">
                      Scheduled by: {window.scheduled_by_profile.full_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!activeWindow && upcomingWindows.length === 0 && historyWindows.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-12 text-center">
            <Calendar className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Maintenance Windows</h3>
            <p className="text-muted mb-6">Schedule your first maintenance window to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Schedule Maintenance
            </button>
          </div>
        )}
      </div>
    </div>
  );
}