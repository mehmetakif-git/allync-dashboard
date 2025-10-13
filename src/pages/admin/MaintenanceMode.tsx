import { AlertTriangle, Clock, CheckCircle, Calendar, Power } from 'lucide-react';
import { useState } from 'react';

export default function MaintenanceMode() {
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [maintenanceMessage, setMaintenanceMessage] = useState('System maintenance in progress. We\'ll be back soon!');

  const handleActivateMaintenance = () => {
    if (confirm('Activate maintenance mode now? This will block all users from accessing the system.')) {
      setIsMaintenanceActive(true);
      alert('Maintenance mode activated! All users are now blocked.');
    }
  };

  const handleDeactivateMaintenance = () => {
    if (confirm('Deactivate maintenance mode? Users will be able to access the system again.')) {
      setIsMaintenanceActive(false);
      alert('Maintenance mode deactivated! System is now accessible.');
    }
  };

  const handleScheduleMaintenance = () => {
    if (!scheduledStart || !scheduledEnd) {
      alert('Please select both start and end times.');
      return;
    }
    alert(`Maintenance scheduled!\n\nStart: ${scheduledStart}\nEnd: ${scheduledEnd}\n\nUsers will be notified 24 hours before the maintenance window.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Maintenance Mode</h1>
        <p className="text-gray-400 mt-1">Control system maintenance and scheduled downtime</p>
      </div>

      <div className={`border rounded-xl p-6 ${
        isMaintenanceActive
          ? 'bg-red-900/20 border-red-500/50'
          : 'bg-gray-900/50 border-gray-800'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
              isMaintenanceActive
                ? 'bg-red-500/20'
                : 'bg-gray-800'
            }`}>
              <AlertTriangle className={`w-8 h-8 ${
                isMaintenanceActive
                  ? 'text-red-400'
                  : 'text-gray-400'
              }`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isMaintenanceActive ? 'Maintenance Mode Active' : 'System Operating Normally'}
              </h2>
              <p className={`text-sm mt-1 ${
                isMaintenanceActive
                  ? 'text-red-400'
                  : 'text-gray-400'
              }`}>
                {isMaintenanceActive
                  ? 'All users are currently blocked from accessing the system'
                  : 'All services are running normally'}
              </p>
            </div>
          </div>
          <div className={`px-6 py-3 rounded-full text-sm font-bold ${
            isMaintenanceActive
              ? 'bg-red-500/20 text-red-400'
              : 'bg-green-500/20 text-green-400'
          }`}>
            {isMaintenanceActive ? 'MAINTENANCE' : 'OPERATIONAL'}
          </div>
        </div>

        {isMaintenanceActive ? (
          <button
            onClick={handleDeactivateMaintenance}
            className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Deactivate Maintenance Mode
          </button>
        ) : (
          <button
            onClick={handleActivateMaintenance}
            className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <Power className="w-5 h-5" />
            Activate Maintenance Mode Now
          </button>
        )}
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Schedule Maintenance</h3>
            <p className="text-sm text-gray-400">Plan future maintenance windows</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              value={scheduledEnd}
              onChange={(e) => setScheduledEnd(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Maintenance Message
            </label>
            <textarea
              rows={3}
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
              placeholder="Message to display during maintenance"
            />
          </div>

          <button
            onClick={handleScheduleMaintenance}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5" />
            Schedule Maintenance Window
          </button>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Scheduled Maintenance Windows</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">System Upgrade</p>
                <p className="text-sm text-gray-400">Dec 25, 2024 02:00 AM - 06:00 AM</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
              Cancel
            </button>
          </div>
          <div className="text-center py-8 text-gray-500">
            No other scheduled maintenance windows
          </div>
        </div>
      </div>
    </div>
  );
}
