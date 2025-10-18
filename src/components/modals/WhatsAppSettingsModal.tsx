import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

interface WhatsAppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  companyName: string;
  companyId: string;
  initialSettings?: any;
}

export default function WhatsAppSettingsModal({
  isOpen,
  onClose,
  onSave,
  companyName,
  companyId,
  initialSettings = {},
}: WhatsAppSettingsModalProps) {
  const [settings, setSettings] = useState({
    bot_name: initialSettings.bot_name || 'Tech Support Bot',
    greeting_message: initialSettings.greeting_message || 'Hello! Welcome to our support. How can I help you today?',
    phone_number: initialSettings.phone_number || '+974 5555 0000',
    instance_id: initialSettings.instance_id || `wa_instance_${companyId}`,
    connection_status: initialSettings.connection_status || 'connected',
    is_active: initialSettings.is_active ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings({
        bot_name: initialSettings.bot_name || 'Tech Support Bot',
        greeting_message: initialSettings.greeting_message || 'Hello! Welcome to our support. How can I help you today?',
        phone_number: initialSettings.phone_number || '+974 5555 0000',
        instance_id: initialSettings.instance_id || `wa_instance_${companyId}`,
        connection_status: initialSettings.connection_status || 'connected',
        is_active: initialSettings.is_active ?? true,
      });
    }
  }, [initialSettings, companyId]);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">WhatsApp Bot Configuration</h2>
            <p className="text-sm text-gray-400 mt-1">Settings for {companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-500 font-semibold">Super Admin Access</h4>
              <p className="text-sm text-gray-300 mt-1">
                You are editing WhatsApp settings for this company. Changes will affect their service immediately.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bot Name</label>
            <input
              type="text"
              value={settings.bot_name}
              onChange={(e) => setSettings({ ...settings, bot_name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Greeting Message</label>
            <textarea
              value={settings.greeting_message}
              onChange={(e) => setSettings({ ...settings, greeting_message: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Connected Phone Number</label>
            <input
              type="text"
              value={settings.phone_number}
              onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Instance ID</label>
            <input
              type="text"
              value={settings.instance_id}
              onChange={(e) => setSettings({ ...settings, instance_id: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Connection Status</label>
            <select
              value={settings.connection_status}
              onChange={(e) => setSettings({ ...settings, connection_status: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="connected">Connected</option>
              <option value="disconnected">Disconnected</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Service Active</h4>
              <p className="text-sm text-gray-400 mt-1">Enable or disable WhatsApp service for this company</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.is_active}
                onChange={(e) => setSettings({ ...settings, is_active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex gap-3 justify-end bg-gray-800 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
