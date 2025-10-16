import { useState } from 'react';
import { Settings, Mail, CreditCard, Bell, Database, Key, Save } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<'email' | 'payment' | 'notifications' | 'database' | 'api'>('email');
  const [isLoading, setIsLoading] = useState(false);

  const [emailSettings, setEmailSettings] = useState({
    provider: 'resend',
    fromEmail: 'info@allyncai.com',
    fromName: 'Allync',
    resendApiKey: '••••••••••••••••',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '••••••••',
  });

  const [paymentSettings, setPaymentSettings] = useState({
    stripeEnabled: true,
    stripePublicKey: 'pk_test_••••••••••••••••',
    stripeSecretKey: 'sk_test_••••••••••••••••',
    paytrEnabled: false,
    paytrMerchantId: '',
    paytrSecretKey: '',
    qpayEnabled: false,
    qpayApiKey: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    maintenanceAlerts: true,
    billingAlerts: true,
    securityAlerts: true,
  });

  const [databaseSettings, setDatabaseSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: '30',
    lastBackup: '2024-03-20 02:00',
  });

  const handleSaveSettings = async () => {
    if (confirm('Save all system settings?')) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      alert('Settings saved successfully');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">System Settings</h1>
        <p className="text-gray-400 mt-1">Configure system-wide settings and integrations</p>
      </div>

      <div className="bg-gray-800 rounded-lg">
        <div className="border-b border-gray-700">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'email'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Mail className="w-5 h-5" />
              Email
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'payment'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              Payment
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Bell className="w-5 h-5" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'database'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Database className="w-5 h-5" />
              Database
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'api'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Key className="w-5 h-5" />
              API Keys
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Email Configuration</h2>
                <p className="text-gray-400 text-sm">Configure email service provider for system emails</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Email Provider</label>
                <select
                  value={emailSettings.provider}
                  onChange={(e) => setEmailSettings({ ...emailSettings, provider: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="resend">Resend.com</option>
                  <option value="smtp">SMTP</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">From Email</label>
                  <input
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">From Name</label>
                  <input
                    type="text"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {emailSettings.provider === 'resend' && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Resend API Key</label>
                  <input
                    type="password"
                    value={emailSettings.resendApiKey}
                    onChange={(e) => setEmailSettings({ ...emailSettings, resendApiKey: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {emailSettings.provider === 'smtp' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">SMTP Host</label>
                    <input
                      type="text"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="smtp.example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">SMTP Port</label>
                    <input
                      type="text"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">SMTP Username</label>
                    <input
                      type="text"
                      value={emailSettings.smtpUser}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">SMTP Password</label>
                    <input
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Payment Gateway Configuration</h2>
                <p className="text-gray-400 text-sm">Configure payment processors for billing</p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-blue-400" />
                    <div>
                      <h3 className="text-white font-medium">Stripe</h3>
                      <p className="text-gray-400 text-sm">Primary payment processor</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.stripeEnabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {paymentSettings.stripeEnabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Public Key</label>
                      <input
                        type="text"
                        value={paymentSettings.stripePublicKey}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, stripePublicKey: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Secret Key</label>
                      <input
                        type="password"
                        value={paymentSettings.stripeSecretKey}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeSecretKey: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-green-400" />
                    <div>
                      <h3 className="text-white font-medium">PayTR</h3>
                      <p className="text-gray-400 text-sm">Alternative payment processor</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.paytrEnabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, paytrEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {paymentSettings.paytrEnabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Merchant ID</label>
                      <input
                        type="text"
                        value={paymentSettings.paytrMerchantId}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, paytrMerchantId: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Secret Key</label>
                      <input
                        type="password"
                        value={paymentSettings.paytrSecretKey}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, paytrSecretKey: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Notification Preferences</h2>
                <p className="text-gray-400 text-sm">Configure system notification settings</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-gray-400 text-sm">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">SMS Notifications</p>
                    <p className="text-gray-400 text-sm">Receive notifications via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-gray-400 text-sm">Receive browser push notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Maintenance Alerts</p>
                    <p className="text-gray-400 text-sm">Get notified about system maintenance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.maintenanceAlerts}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, maintenanceAlerts: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Billing Alerts</p>
                    <p className="text-gray-400 text-sm">Receive payment and billing notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.billingAlerts}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, billingAlerts: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Security Alerts</p>
                    <p className="text-gray-400 text-sm">Important security notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.securityAlerts}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, securityAlerts: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Database & Backup</h2>
                <p className="text-gray-400 text-sm">Configure database backup settings</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">Automatic Backups</p>
                  <p className="text-gray-400 text-sm">Enable scheduled database backups</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={databaseSettings.autoBackup}
                    onChange={(e) => setDatabaseSettings({ ...databaseSettings, autoBackup: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {databaseSettings.autoBackup && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Backup Frequency</label>
                    <select
                      value={databaseSettings.backupFrequency}
                      onChange={(e) => setDatabaseSettings({ ...databaseSettings, backupFrequency: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Retention Period (days)</label>
                    <input
                      type="number"
                      value={databaseSettings.retentionDays}
                      onChange={(e) => setDatabaseSettings({ ...databaseSettings, retentionDays: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-blue-400 font-medium">Last Backup</p>
                    <p className="text-gray-300 text-sm mt-1">{databaseSettings.lastBackup}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm('Run manual backup now? This may take a few minutes.')) {
                    alert('Backup started successfully');
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Run Manual Backup
              </button>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">API Keys Management</h2>
                <p className="text-gray-400 text-sm">Manage API keys for external integrations</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">Master API Key</p>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Full access to all system APIs</p>
                  <code className="block bg-gray-800 p-3 rounded text-green-400 text-sm font-mono">
                    sk_live_••••••••••••••••••••••••
                  </code>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">Public API Key</p>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Limited access for public endpoints</p>
                  <code className="block bg-gray-800 p-3 rounded text-blue-400 text-sm font-mono">
                    pk_live_••••••••••••••••••••••••
                  </code>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">Webhook Secret</p>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">For verifying webhook signatures</p>
                  <code className="block bg-gray-800 p-3 rounded text-purple-400 text-sm font-mono">
                    whsec_••••••••••••••••••••••••
                  </code>
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm('Generate new API key? This will invalidate the old key.')) {
                    alert('New API key generated successfully');
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Generate New Key
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save All Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
