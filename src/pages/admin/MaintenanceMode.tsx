import { useState } from 'react';
import { AlertTriangle, Calendar, Clock, Users, Save } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MaintenanceMode() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMaintenanceEnabled, setIsMaintenanceEnabled] = useState(false);
  const [settings, setSettings] = useState({
    message: 'We are currently performing scheduled maintenance. We will be back shortly.',
    startTime: '',
    endTime: '',
    estimatedDuration: '30',
    notifyUsers: true,
    allowAdminAccess: true,
  });

  const handleToggleMaintenance = async () => {
    const action = isMaintenanceEnabled ? 'disable' : 'enable';
    const confirmation = isMaintenanceEnabled
      ? 'Disable maintenance mode and restore normal access?'
      : 'Enable maintenance mode? This will prevent all users from accessing the platform.';

    if (confirm(confirmation)) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsMaintenanceEnabled(!isMaintenanceEnabled);
      setIsLoading(false);
      alert(`Maintenance mode ${action}d successfully`);
    }
  };

  const handleScheduleMaintenance = async () => {
    if (!settings.startTime || !settings.endTime) {
      alert('Please select start and end times');
      return;
    }

    if (confirm('Schedule maintenance for the selected time period?')) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      alert('Maintenance scheduled successfully. Users will be notified.');
    }
  };

  const handleSaveSettings = async () => {
    if (confirm('Save maintenance mode settings?')) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
      alert('Settings saved successfully');
    }
  };

  const totalUsers = 156;
  const affectedUsers = settings.allowAdminAccess ? totalUsers - 8 : totalUsers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Maintenance Mode</h1>
        <p className="text-muted mt-1">Control system maintenance and scheduled downtime</p>
      </div>

      <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/50 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-12 h-12 text-orange-400 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">Maintenance Mode Status</h2>
            <p className={`text-lg font-medium mb-4 ${isMaintenanceEnabled ? 'text-red-400' : 'text-green-400'}`}>
              {isMaintenanceEnabled ? 'ACTIVE - System is in maintenance mode' : 'INACTIVE - System is operating normally'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleToggleMaintenance}
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isMaintenanceEnabled
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    {isMaintenanceEnabled ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-secondary rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white mt-2">{totalUsers}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-secondary rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Affected Users</p>
              <p className="text-3xl font-bold text-white mt-2">{affectedUsers}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-orange-500" />
          </div>
        </div>

        <div className="bg-secondary rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Status</p>
              <p className={`text-2xl font-bold mt-2 ${isMaintenanceEnabled ? 'text-red-400' : 'text-green-400'}`}>
                {isMaintenanceEnabled ? 'Active' : 'Normal'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full ${isMaintenanceEnabled ? 'bg-red-500/20' : 'bg-green-500/20'} flex items-center justify-center`}>
              <div className={`w-6 h-6 rounded-full ${isMaintenanceEnabled ? 'bg-red-500' : 'bg-green-500'}`}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-secondary rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-white">Maintenance Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-muted text-sm mb-2">Maintenance Message</label>
              <textarea
                value={settings.message}
                onChange={(e) => setSettings({ ...settings, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-secondary rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Enter message to display to users"
              />
            </div>

            <div>
              <label className="block text-muted text-sm mb-2">Estimated Duration (minutes)</label>
              <input
                type="number"
                value={settings.estimatedDuration}
                onChange={(e) => setSettings({ ...settings, estimatedDuration: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="30"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <p className="text-white font-medium">Notify Users</p>
                <p className="text-muted text-sm">Send email notification to all users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyUsers}
                  onChange={(e) => setSettings({ ...settings, notifyUsers: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <p className="text-white font-medium">Allow Admin Access</p>
                <p className="text-muted text-sm">Super admins can still access the system</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowAdminAccess}
                  onChange={(e) => setSettings({ ...settings, allowAdminAccess: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-secondary rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-white">Schedule Maintenance</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-muted text-sm mb-2">Start Time</label>
              <input
                type="datetime-local"
                value={settings.startTime}
                onChange={(e) => setSettings({ ...settings, startTime: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-muted text-sm mb-2">End Time</label>
              <input
                type="datetime-local"
                value={settings.endTime}
                onChange={(e) => setSettings({ ...settings, endTime: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {settings.startTime && settings.endTime && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-400 font-medium">Scheduled Maintenance Window</p>
                    <p className="text-secondary text-sm mt-1">
                      From: {new Date(settings.startTime).toLocaleString()}
                    </p>
                    <p className="text-secondary text-sm">
                      To: {new Date(settings.endTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleScheduleMaintenance}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
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

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
                <div>
                  <p className="text-orange-400 font-medium">Important</p>
                  <p className="text-secondary text-sm mt-1">
                    Users will receive an email notification 24 hours before the scheduled maintenance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Maintenance Preview</h2>
        <div className="bg-primary rounded-lg p-8 border-2 border-orange-500/50">
          <div className="max-w-2xl mx-auto text-center">
            <AlertTriangle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">System Under Maintenance</h3>
            <p className="text-secondary mb-6">{settings.message}</p>
            {settings.estimatedDuration && (
              <p className="text-muted">
                Estimated time: {settings.estimatedDuration} minutes
              </p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
