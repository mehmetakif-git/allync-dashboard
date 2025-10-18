import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

interface GoogleServiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  serviceType: 'calendar' | 'sheets' | 'gmail' | 'docs' | 'drive' | 'photos';
  companyName: string;
  companyId: string;
  initialSettings?: any;
}

const serviceLabels = {
  calendar: 'Google Calendar',
  sheets: 'Google Sheets',
  gmail: 'Gmail Integration',
  docs: 'Google Docs',
  drive: 'Google Drive',
  photos: 'Google Photos',
};

export default function GoogleServiceSettingsModal({
  isOpen,
  onClose,
  onSave,
  serviceType,
  companyName,
  companyId,
  initialSettings = {},
}: GoogleServiceSettingsModalProps) {
  const [settings, setSettings] = useState({
    google_account_email: initialSettings.google_account_email || '',
    google_account_name: initialSettings.google_account_name || '',
    calendar_id: initialSettings.calendar_id || '',
    sheet_id: initialSettings.sheet_id || '',
    drive_folder_id: initialSettings.drive_folder_id || '',
    auto_sync_enabled: initialSettings.auto_sync_enabled ?? true,
    sync_interval_minutes: initialSettings.sync_interval_minutes || 15,
    ai_model: initialSettings.ai_model || 'gpt-4',
    auto_organize_enabled: initialSettings.auto_organize_enabled ?? true,
    connection_status: initialSettings.connection_status || 'connected',
    is_active: initialSettings.is_active ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings({
        google_account_email: initialSettings.google_account_email || '',
        google_account_name: initialSettings.google_account_name || '',
        calendar_id: initialSettings.calendar_id || '',
        sheet_id: initialSettings.sheet_id || '',
        drive_folder_id: initialSettings.drive_folder_id || '',
        auto_sync_enabled: initialSettings.auto_sync_enabled ?? true,
        sync_interval_minutes: initialSettings.sync_interval_minutes || 15,
        ai_model: initialSettings.ai_model || 'gpt-4',
        auto_organize_enabled: initialSettings.auto_organize_enabled ?? true,
        connection_status: initialSettings.connection_status || 'connected',
        is_active: initialSettings.is_active ?? true,
      });
    }
  }, [initialSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(settings);
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Configure {serviceLabels[serviceType]}
              </h2>
              <p className="text-gray-400">
                Settings for {companyName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-500 font-medium mb-1">Super Admin Access</p>
                <p className="text-blue-400 text-sm">
                  You are editing service settings for this company. Changes will affect their service immediately.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Account Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Google Account Email
              </label>
              <input
                type="email"
                value={settings.google_account_email}
                onChange={(e) => setSettings({ ...settings, google_account_email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="account@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Account Name
              </label>
              <input
                type="text"
                value={settings.google_account_name}
                onChange={(e) => setSettings({ ...settings, google_account_name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Company Name"
              />
            </div>
          </div>

          {serviceType === 'calendar' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Calendar ID
              </label>
              <input
                type="text"
                value={settings.calendar_id}
                onChange={(e) => setSettings({ ...settings, calendar_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="primary"
              />
            </div>
          )}

          {serviceType === 'sheets' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Sheet ID
              </label>
              <input
                type="text"
                value={settings.sheet_id}
                onChange={(e) => setSettings({ ...settings, sheet_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              />
            </div>
          )}

          {(serviceType === 'drive' || serviceType === 'docs' || serviceType === 'photos') && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Drive Folder ID
              </label>
              <input
                type="text"
                value={settings.drive_folder_id}
                onChange={(e) => setSettings({ ...settings, drive_folder_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="folder_abc123"
              />
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Sync Settings</h3>

            <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
              <div>
                <p className="text-white font-medium">Auto-sync enabled</p>
                <p className="text-sm text-gray-400">Automatically sync data at set intervals</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.auto_sync_enabled}
                  onChange={(e) => setSettings({ ...settings, auto_sync_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Sync Interval (minutes)
              </label>
              <select
                value={settings.sync_interval_minutes}
                onChange={(e) => setSettings({ ...settings, sync_interval_minutes: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value={5}>Every 5 minutes</option>
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every 1 hour</option>
              </select>
            </div>
          </div>

          {(serviceType === 'docs' || serviceType === 'gmail') && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                AI Model
              </label>
              <select
                value={settings.ai_model}
                onChange={(e) => setSettings({ ...settings, ai_model: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5">GPT-3.5</option>
                <option value="claude-3">Claude-3</option>
              </select>
            </div>
          )}

          {(serviceType === 'drive' || serviceType === 'photos') && (
            <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
              <div>
                <p className="text-white font-medium">Auto-organize files</p>
                <p className="text-sm text-gray-400">Automatically organize uploaded files by type</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.auto_organize_enabled}
                  onChange={(e) => setSettings({ ...settings, auto_organize_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Status</h3>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Connection Status
              </label>
              <select
                value={settings.connection_status}
                onChange={(e) => setSettings({ ...settings, connection_status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="connected">Connected</option>
                <option value="disconnected">Disconnected</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
              <div>
                <p className="text-white font-medium">Service Active</p>
                <p className="text-sm text-gray-400">Enable or disable this service for the company</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.is_active}
                  onChange={(e) => setSettings({ ...settings, is_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
