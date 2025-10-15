import { useState } from 'react';
import { AlertTriangle, Save, Power, Clock, Users, MessageSquare, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function MaintenanceMode() {
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [maintenanceTitle, setMaintenanceTitle] = useState('System Maintenance');
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'We are currently performing scheduled maintenance to improve our services. We apologize for any inconvenience. Please check back shortly.'
  );
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [allowSuperAdmin, setAllowSuperAdmin] = useState(true);
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSave = () => {
    console.log('Maintenance Mode Settings:', {
      isActive: isMaintenanceActive,
      title: maintenanceTitle,
      message: maintenanceMessage,
      scheduledStart,
      scheduledEnd,
      allowSuperAdmin,
      notifyUsers,
    });

    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    if (isMaintenanceActive) {
      alert(
        `✅ Maintenance Mode ${isMaintenanceActive ? 'ACTIVATED' : 'DEACTIVATED'}!\n\n` +
        `Status: ${isMaintenanceActive ? '🔴 ACTIVE' : '🟢 INACTIVE'}\n` +
        `${scheduledStart ? `Start: ${scheduledStart}\n` : ''}` +
        `${scheduledEnd ? `End: ${scheduledEnd}\n` : ''}` +
        `Super Admin Access: ${allowSuperAdmin ? 'Allowed' : 'Blocked'}\n` +
        `User Notifications: ${notifyUsers ? 'Enabled' : 'Disabled'}\n\n` +
        `${isMaintenanceActive ? '⚠️ All users (except Super Admin) will be blocked from accessing the system!' : ''}`
      );
    }
  };

  const handleTestMode = () => {
    if (isMaintenanceActive) {
      alert(
        '🔧 MAINTENANCE MODE TEST\n\n' +
        'This is what users will see:\n\n' +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `${maintenanceTitle}\n\n` +
        `${maintenanceMessage}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `${scheduledEnd ? `Expected to be back: ${scheduledEnd}` : 'Please check back later'}`
      );
    } else {
      alert('⚠️ Maintenance mode is not active. Enable it first to test.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Maintenance Mode</h1>
          <p className="text-gray-400 mt-1">Control system-wide maintenance and user access</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTestMode}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Test Mode
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save & Apply
          </button>
        </div>
      </div>

      {showSuccessMessage && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-400 font-medium">
            Maintenance mode settings saved successfully!
          </p>
        </div>
      )}

      <div className={`border-2 rounded-xl p-6 ${
        isMaintenanceActive
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-green-500/10 border-green-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
              isMaintenanceActive
                ? 'bg-red-500/20'
                : 'bg-green-500/20'
            }`}>
              {isMaintenanceActive ? (
                <AlertTriangle className="w-8 h-8 text-red-400" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-400" />
              )}
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${
                isMaintenanceActive ? 'text-red-400' : 'text-green-400'
              }`}>
                {isMaintenanceActive ? 'Maintenance Mode ACTIVE' : 'System Operational'}
              </h2>
              <p className="text-gray-400 mt-1">
                {isMaintenanceActive
                  ? 'Users cannot access the system (Super Admin can)'
                  : 'All users can access the system normally'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isMaintenanceActive}
              onChange={(e) => {
                const newValue = e.target.checked;

                if (newValue) {
                  if (!confirm(
                    `🔴🔴🔴 ENABLE MAINTENANCE MODE? 🔴🔴🔴\n\n` +
                    `THIS WILL:\n` +
                    `- BLOCK ALL USER ACCESS immediately\n` +
                    `- LOG OUT all active users\n` +
                    `- Show maintenance message to everyone\n` +
                    `- Only Super Admin can access the system\n\n` +
                    `CRITICAL: This affects ALL USERS!\n\n` +
                    `Are you ABSOLUTELY CERTAIN?`
                  )) {
                    return;
                  }

                  const confirmation = prompt('Type "MAINTENANCE" to confirm:');
                  if (confirmation !== 'MAINTENANCE') {
                    alert('❌ Maintenance mode NOT enabled. Operation cancelled.');
                    return;
                  }

                  alert('🔴 Maintenance Mode ENABLED\n\nAll users have been logged out.\nSystem is now in maintenance mode.');
                  setIsMaintenanceActive(true);
                } else {
                  if (!confirm(
                    `✅ Disable Maintenance Mode?\n\n` +
                    `This will restore normal system access for all users.\n\n` +
                    `Continue?`
                  )) {
                    return;
                  }

                  alert('✅ Maintenance Mode DISABLED\n\nSystem is now accessible to all users.');
                  setIsMaintenanceActive(false);
                }
              }}
              className="sr-only peer"
            />
            <div className="w-20 h-10 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Maintenance Message</h3>
              <p className="text-sm text-gray-400">What users will see during maintenance</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Title
            </label>
            <input
              type="text"
              value={maintenanceTitle}
              onChange={(e) => setMaintenanceTitle(e.target.value)}
              placeholder="System Maintenance"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Message
            </label>
            <textarea
              rows={6}
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Describe what's happening..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
            />
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">PREVIEW</p>
            <h4 className="font-bold text-white mb-2">{maintenanceTitle}</h4>
            <p className="text-sm text-gray-300">{maintenanceMessage}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Schedule Maintenance</h3>
                <p className="text-sm text-gray-400">Optional: Set start and end times</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Start Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                End Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduledEnd}
                onChange={(e) => setScheduledEnd(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
              />
            </div>

            {scheduledStart && scheduledEnd && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-300">
                  Duration: {Math.round((new Date(scheduledEnd).getTime() - new Date(scheduledStart).getTime()) / (1000 * 60))} minutes
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Access Control</h3>
                <p className="text-sm text-gray-400">Who can access during maintenance</p>
              </div>
            </div>

            <label className="flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:bg-gray-800/50 cursor-pointer">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="font-medium text-white">Allow Super Admin Access</p>
                  <p className="text-sm text-gray-400">Super Admin can bypass maintenance mode</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowSuperAdmin}
                onChange={(e) => setAllowSuperAdmin(e.target.checked)}
                className="w-5 h-5 text-blue-400"
              />
            </label>

            <label className="flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:bg-gray-800/50 cursor-pointer">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium text-white">Notify All Users</p>
                  <p className="text-sm text-gray-400">Send email notification about maintenance</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyUsers}
                onChange={(e) => setNotifyUsers(e.target.checked)}
                className="w-5 h-5 text-blue-400"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-red-400 mb-2">Important Warning</h3>
            <p className="text-red-300 text-sm">
              When maintenance mode is <strong>ACTIVE</strong>:
            </p>
            <ul className="list-disc list-inside text-red-300 text-sm mt-2 space-y-1">
              <li>All regular users and company admins will be blocked from accessing the system</li>
              <li>They will see the maintenance message on the login page</li>
              <li>Only Super Admin can access the system (if enabled)</li>
              <li>All scheduled tasks and automated services will continue running</li>
              <li>This affects ALL companies in the system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
