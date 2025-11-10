import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  CreditCard,
  Bell,
  Database,
  Key,
  Save,
  Globe,
  Shield,
  Wrench,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  getAllSettings,
  updateCategorySettings,
  type CategorySettings,
} from '../../lib/api/systemSettings';
import { useAuth } from '../../contexts/AuthContext';

type TabType = 'general' | 'email' | 'payment' | 'notifications' | 'security' | 'database' | 'api' | 'maintenance';

export default function SystemSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Settings states
  const [generalSettings, setGeneralSettings] = useState<CategorySettings>({});
  const [emailSettings, setEmailSettings] = useState<CategorySettings>({});
  const [paymentSettings, setPaymentSettings] = useState<CategorySettings>({});
  const [notificationSettings, setNotificationSettings] = useState<CategorySettings>({});
  const [securitySettings, setSecuritySettings] = useState<CategorySettings>({});
  const [databaseSettings, setDatabaseSettings] = useState<CategorySettings>({});
  const [apiSettings, setApiSettings] = useState<CategorySettings>({});
  const [maintenanceSettings, setMaintenanceSettings] = useState<CategorySettings>({});

  // Load all settings
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📥 Loading all system settings...');

      const allSettings = await getAllSettings();

      setGeneralSettings(allSettings.general || {});
      setEmailSettings(allSettings.email || {});
      setPaymentSettings(allSettings.payment || {});
      setNotificationSettings(allSettings.notifications || {});
      setSecuritySettings(allSettings.security || {});
      setDatabaseSettings(allSettings.database || {});
      setApiSettings(allSettings.api || {});
      setMaintenanceSettings(allSettings.maintenance || {});

      console.log('✅ Settings loaded successfully');
    } catch (err: any) {
      console.error('❌ Failed to load settings:', err);
      setError('Failed to load system settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings
  const handleSaveSettings = async () => {
    if (!hasChanges) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      console.log('💾 Saving settings...');

      const categoryToSave = activeTab;
      let settingsToSave: CategorySettings = {};

      switch (activeTab) {
        case 'general':
          settingsToSave = generalSettings;
          break;
        case 'email':
          settingsToSave = emailSettings;
          break;
        case 'payment':
          settingsToSave = paymentSettings;
          break;
        case 'notifications':
          settingsToSave = notificationSettings;
          break;
        case 'security':
          settingsToSave = securitySettings;
          break;
        case 'database':
          settingsToSave = databaseSettings;
          break;
        case 'api':
          settingsToSave = apiSettings;
          break;
        case 'maintenance':
          settingsToSave = maintenanceSettings;
          break;
      }

      await updateCategorySettings(categoryToSave, settingsToSave, user?.id);

      setHasChanges(false);
      setSuccessMessage('Settings saved successfully!');
      
      setTimeout(() => setSuccessMessage(null), 3000);

      console.log('✅ Settings saved successfully');
    } catch (err: any) {
      console.error('❌ Failed to save settings:', err);
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-muted mt-4">Loading system settings...</p>
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
            <h1 className="text-3xl font-bold text-white">System Settings</h1>
            <p className="text-muted mt-1">Configure system-wide settings and integrations</p>
          </div>
          <button
            onClick={loadSettings}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-muted" />
          </button>
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

        {/* Tabs and Content */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px]">
          {/* Tab Navigation */}
          <div className="border-b border-secondary overflow-x-auto">
            <div className="flex">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'general'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                <Globe className="w-5 h-5" />
                General
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'email'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                <Mail className="w-5 h-5" />
                Email
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'payment'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Payment
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                <Shield className="w-5 h-5" />
                Security
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                <Bell className="w-5 h-5" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'database'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                <Database className="w-5 h-5" />
                Database
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'api'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                <Key className="w-5 h-5" />
                API
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'maintenance'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                <Wrench className="w-5 h-5" />
                Maintenance
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">General Settings</h2>
                  <p className="text-muted text-sm">Configure basic system settings</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted text-sm mb-2">Site Name</label>
                    <input
                      type="text"
                      value={generalSettings.site_name || ''}
                      onChange={(e) => {
                        setGeneralSettings({ ...generalSettings, site_name: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      placeholder="Allync AI"
                    />
                  </div>
                  <div>
                    <label className="block text-muted text-sm mb-2">Site URL</label>
                    <input
                      type="url"
                      value={generalSettings.site_url || ''}
                      onChange={(e) => {
                        setGeneralSettings({ ...generalSettings, site_url: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      placeholder="https://allyncai.com"
                    />
                  </div>
                  <div>
                    <label className="block text-muted text-sm mb-2">Support Email</label>
                    <input
                      type="email"
                      value={generalSettings.support_email || ''}
                      onChange={(e) => {
                        setGeneralSettings({ ...generalSettings, support_email: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      placeholder="support@allyncai.com"
                    />
                  </div>
                  <div>
                    <label className="block text-muted text-sm mb-2">Timezone</label>
                    <select
                      value={generalSettings.timezone || 'Europe/Istanbul'}
                      onChange={(e) => {
                        setGeneralSettings({ ...generalSettings, timezone: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Europe/Istanbul" className="bg-slate-800 text-white">Europe/Istanbul</option>
                      <option value="America/New_York" className="bg-slate-800 text-white">America/New_York</option>
                      <option value="Europe/London" className="bg-slate-800 text-white">Europe/London</option>
                      <option value="Asia/Dubai" className="bg-slate-800 text-white">Asia/Dubai</option>
                      <option value="Asia/Tokyo" className="bg-slate-800 text-white">Asia/Tokyo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted text-sm mb-2">Currency</label>
                    <select
                      value={generalSettings.currency || 'USD'}
                      onChange={(e) => {
                        setGeneralSettings({ ...generalSettings, currency: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="USD" className="bg-slate-800 text-white">USD - US Dollar</option>
                      <option value="EUR" className="bg-slate-800 text-white">EUR - Euro</option>
                      <option value="TRY" className="bg-slate-800 text-white">TRY - Turkish Lira</option>
                      <option value="GBP" className="bg-slate-800 text-white">GBP - British Pound</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted text-sm mb-2">Date Format</label>
                    <select
                      value={generalSettings.date_format || 'DD/MM/YYYY'}
                      onChange={(e) => {
                        setGeneralSettings({ ...generalSettings, date_format: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="DD/MM/YYYY" className="bg-slate-800 text-white">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY" className="bg-slate-800 text-white">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD" className="bg-slate-800 text-white">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* EMAIL TAB */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Email Configuration</h2>
                  <p className="text-muted text-sm">Configure email service provider</p>
                </div>

                <div>
                  <label className="block text-muted text-sm mb-2">Email Provider</label>
                  <select
                    value={emailSettings.provider || 'resend'}
                    onChange={(e) => {
                      setEmailSettings({ ...emailSettings, provider: e.target.value });
                      setHasChanges(true);
                    }}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="resend" className="bg-slate-800 text-white">Resend.com</option>
                    <option value="smtp" className="bg-slate-800 text-white">SMTP</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted text-sm mb-2">From Email</label>
                    <input
                      type="email"
                      value={emailSettings.from_email || ''}
                      onChange={(e) => {
                        setEmailSettings({ ...emailSettings, from_email: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      placeholder="info@allyncai.com"
                    />
                  </div>
                  <div>
                    <label className="block text-muted text-sm mb-2">From Name</label>
                    <input
                      type="text"
                      value={emailSettings.from_name || ''}
                      onChange={(e) => {
                        setEmailSettings({ ...emailSettings, from_name: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      placeholder="Allync"
                    />
                  </div>
                </div>

                {emailSettings.provider === 'resend' && (
                  <div>
                    <label className="block text-muted text-sm mb-2">Resend API Key</label>
                    <input
                      type="password"
                      value={emailSettings.resend_api_key || ''}
                      onChange={(e) => {
                        setEmailSettings({ ...emailSettings, resend_api_key: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      placeholder="re_••••••••••••••••"
                    />
                  </div>
                )}

                {emailSettings.provider === 'smtp' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted text-sm mb-2">SMTP Host</label>
                      <input
                        type="text"
                        value={emailSettings.smtp_host || ''}
                        onChange={(e) => {
                          setEmailSettings({ ...emailSettings, smtp_host: e.target.value });
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-muted text-sm mb-2">SMTP Port</label>
                      <input
                        type="text"
                        value={emailSettings.smtp_port || '587'}
                        onChange={(e) => {
                          setEmailSettings({ ...emailSettings, smtp_port: e.target.value });
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-muted text-sm mb-2">SMTP Username</label>
                      <input
                        type="text"
                        value={emailSettings.smtp_user || ''}
                        onChange={(e) => {
                          setEmailSettings({ ...emailSettings, smtp_user: e.target.value });
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-muted text-sm mb-2">SMTP Password</label>
                      <input
                        type="password"
                        value={emailSettings.smtp_password || ''}
                        onChange={(e) => {
                          setEmailSettings({ ...emailSettings, smtp_password: e.target.value });
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PAYMENT TAB */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Payment Gateways</h2>
                  <p className="text-muted text-sm">Configure payment processors</p>
                </div>

                {/* Stripe */}
                <div className="bg-primary/50 border border-secondary rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-blue-400" />
                      <div>
                        <h3 className="text-white font-medium">Stripe</h3>
                        <p className="text-muted text-sm">Primary payment processor</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentSettings.stripe_enabled || false}
                        onChange={(e) => {
                          setPaymentSettings({ ...paymentSettings, stripe_enabled: e.target.checked });
                          setHasChanges(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {paymentSettings.stripe_enabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-muted text-sm mb-2">Public Key</label>
                        <input
                          type="text"
                          value={paymentSettings.stripe_public_key || ''}
                          onChange={(e) => {
                            setPaymentSettings({ ...paymentSettings, stripe_public_key: e.target.value });
                            setHasChanges(true);
                          }}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                          placeholder="pk_test_••••••••••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-muted text-sm mb-2">Secret Key</label>
                        <input
                          type="password"
                          value={paymentSettings.stripe_secret_key || ''}
                          onChange={(e) => {
                            setPaymentSettings({ ...paymentSettings, stripe_secret_key: e.target.value });
                            setHasChanges(true);
                          }}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                          placeholder="sk_test_••••••••••••••••"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* PayTR */}
                <div className="bg-primary/50 border border-secondary rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-green-400" />
                      <div>
                        <h3 className="text-white font-medium">PayTR</h3>
                        <p className="text-muted text-sm">Turkish payment processor</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentSettings.paytr_enabled || false}
                        onChange={(e) => {
                          setPaymentSettings({ ...paymentSettings, paytr_enabled: e.target.checked });
                          setHasChanges(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {paymentSettings.paytr_enabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-muted text-sm mb-2">Merchant ID</label>
                        <input
                          type="text"
                          value={paymentSettings.paytr_merchant_id || ''}
                          onChange={(e) => {
                            setPaymentSettings({ ...paymentSettings, paytr_merchant_id: e.target.value });
                            setHasChanges(true);
                          }}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-muted text-sm mb-2">Secret Key</label>
                        <input
                          type="password"
                          value={paymentSettings.paytr_secret_key || ''}
                          onChange={(e) => {
                            setPaymentSettings({ ...paymentSettings, paytr_secret_key: e.target.value });
                            setHasChanges(true);
                          }}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted text-sm mb-2">Default Currency</label>
                    <select
                      value={paymentSettings.default_currency || 'USD'}
                      onChange={(e) => {
                        setPaymentSettings({ ...paymentSettings, default_currency: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="USD" className="bg-slate-800 text-white">USD</option>
                      <option value="EUR" className="bg-slate-800 text-white">EUR</option>
                      <option value="TRY" className="bg-slate-800 text-white">TRY</option>
                      <option value="GBP" className="bg-slate-800 text-white">GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted text-sm mb-2">Tax Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={paymentSettings.tax_rate || 20}
                      onChange={(e) => {
                        setPaymentSettings({ ...paymentSettings, tax_rate: parseFloat(e.target.value) });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Security Settings</h2>
                  <p className="text-muted text-sm">Configure security and authentication</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-muted text-sm mb-2">Minimum Password Length</label>
                    <input
                      type="number"
                      min="6"
                      max="32"
                      value={securitySettings.password_min_length || 8}
                      onChange={(e) => {
                        setSecuritySettings({ ...securitySettings, password_min_length: parseInt(e.target.value) });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-primary/50 border border-secondary rounded-lg">
                      <div>
                        <p className="text-white font-medium">Require Uppercase</p>
                        <p className="text-muted text-sm">At least one uppercase letter</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.password_require_uppercase || false}
                          onChange={(e) => {
                            setSecuritySettings({ ...securitySettings, password_require_uppercase: e.target.checked });
                            setHasChanges(true);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-primary/50 border border-secondary rounded-lg">
                      <div>
                        <p className="text-white font-medium">Require Number</p>
                        <p className="text-muted text-sm">At least one number</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.password_require_number || false}
                          onChange={(e) => {
                            setSecuritySettings({ ...securitySettings, password_require_number: e.target.checked });
                            setHasChanges(true);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted text-sm mb-2">Session Timeout (hours)</label>
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={securitySettings.session_timeout || 24}
                        onChange={(e) => {
                          setSecuritySettings({ ...securitySettings, session_timeout: parseInt(e.target.value) });
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-muted text-sm mb-2">Max Login Attempts</label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={securitySettings.max_login_attempts || 5}
                        onChange={(e) => {
                          setSecuritySettings({ ...securitySettings, max_login_attempts: parseInt(e.target.value) });
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Notification Preferences</h2>
                  <p className="text-muted text-sm">Configure system notification settings</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'email_enabled', label: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'sms_enabled', label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                    { key: 'push_enabled', label: 'Push Notifications', desc: 'Browser push notifications' },
                    { key: 'maintenance_alerts', label: 'Maintenance Alerts', desc: 'System maintenance notifications' },
                    { key: 'billing_alerts', label: 'Billing Alerts', desc: 'Payment and billing notifications' },
                    { key: 'security_alerts', label: 'Security Alerts', desc: 'Security-related notifications' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-primary/50 border border-secondary rounded-lg">
                      <div>
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-muted text-sm">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[item.key] || false}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked });
                            setHasChanges(true);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DATABASE TAB */}
            {activeTab === 'database' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Database & Backup</h2>
                  <p className="text-muted text-sm">Configure database backup settings</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-primary/50 border border-secondary rounded-lg">
                  <div>
                    <p className="text-white font-medium">Automatic Backups</p>
                    <p className="text-muted text-sm">Enable scheduled database backups</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={databaseSettings.auto_backup || false}
                      onChange={(e) => {
                        setDatabaseSettings({ ...databaseSettings, auto_backup: e.target.checked });
                        setHasChanges(true);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {databaseSettings.auto_backup && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted text-sm mb-2">Backup Frequency</label>
                      <select
                        value={databaseSettings.backup_frequency || 'daily'}
                        onChange={(e) => {
                          setDatabaseSettings({ ...databaseSettings, backup_frequency: e.target.value });
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="hourly" className="bg-slate-800 text-white">Hourly</option>
                        <option value="daily" className="bg-slate-800 text-white">Daily</option>
                        <option value="weekly" className="bg-slate-800 text-white">Weekly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-muted text-sm mb-2">Retention Period (days)</label>
                      <input
                        type="number"
                        min="7"
                        max="365"
                        value={databaseSettings.backup_retention_days || 30}
                        onChange={(e) => {
                          setDatabaseSettings({ ...databaseSettings, backup_retention_days: parseInt(e.target.value) });
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* API TAB */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">API Configuration</h2>
                  <p className="text-muted text-sm">Manage API keys and settings</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-primary/50 border border-secondary rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">Master API Key</p>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                    </div>
                    <p className="text-muted text-sm mb-3">Full access to all system APIs</p>
                    <input
                      type="password"
                      value={apiSettings.master_api_key || ''}
                      onChange={(e) => {
                        setApiSettings({ ...apiSettings, master_api_key: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
                      placeholder="sk_live_••••••••••••••••••••••••"
                    />
                  </div>

                  <div className="bg-primary/50 border border-secondary rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">Public API Key</p>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                    </div>
                    <p className="text-muted text-sm mb-3">Limited access for public endpoints</p>
                    <input
                      type="text"
                      value={apiSettings.public_api_key || ''}
                      onChange={(e) => {
                        setApiSettings({ ...apiSettings, public_api_key: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
                      placeholder="pk_live_••••••••••••••••••••••••"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted text-sm mb-2">Rate Limit (requests/min)</label>
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        value={apiSettings.rate_limit_requests || 100}
                        onChange={(e) => {
                          setApiSettings({ ...apiSettings, rate_limit_requests: parseInt(e.target.value) });
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-primary/50 border border-secondary rounded-lg">
                      <div>
                        <p className="text-white font-medium">Rate Limiting</p>
                        <p className="text-muted text-sm">Enable API rate limiting</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={apiSettings.rate_limit_enabled || false}
                          onChange={(e) => {
                            setApiSettings({ ...apiSettings, rate_limit_enabled: e.target.checked });
                            setHasChanges(true);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MAINTENANCE TAB */}
            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Maintenance Settings</h2>
                  <p className="text-muted text-sm">Basic maintenance mode configuration</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-primary/50 border border-secondary rounded-lg">
                  <div>
                    <p className="text-white font-medium">Maintenance Mode</p>
                    <p className="text-muted text-sm">Enable maintenance mode for all users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintenanceSettings.mode_enabled || false}
                      onChange={(e) => {
                        setMaintenanceSettings({ ...maintenanceSettings, mode_enabled: e.target.checked });
                        setHasChanges(true);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {maintenanceSettings.mode_enabled && (
                  <div>
                    <label className="block text-muted text-sm mb-2">Maintenance Message</label>
                    <textarea
                      rows={4}
                      value={maintenanceSettings.mode_message || ''}
                      onChange={(e) => {
                        setMaintenanceSettings({ ...maintenanceSettings, mode_message: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      placeholder="We are currently performing maintenance. Please check back soon."
                    />
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Wrench className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-blue-400 font-medium mb-2">Advanced Maintenance Management</p>
                      <p className="text-muted text-sm mb-3">
                        For advanced features like scheduling, history, and multi-language messages, use the dedicated Maintenance Mode page.
                      </p>
                      <button
                        onClick={() => navigate('/admin/maintenance')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                      >
                        Open Maintenance Mode
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          {hasChanges && (
            <button
              onClick={() => {
                setHasChanges(false);
                loadSettings();
              }}
              className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-hover font-medium transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={!hasChanges || isSaving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
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
    </div>
  );
}