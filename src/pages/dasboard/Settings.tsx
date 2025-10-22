import { useState } from 'react';
import { User, Building2, Shield, Globe, Calendar, MapPin, Mail, Phone, CheckCircle, Clock, Monitor } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Settings() {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'preferences'>('account');

  const loginHistory = [
    {
      id: '1',
      date: '2025-01-18 14:32',
      ip: '192.168.1.105',
      device: 'Chrome on Windows',
      location: 'Doha, Qatar',
      status: 'success',
    },
    {
      id: '2',
      date: '2025-01-17 09:15',
      ip: '192.168.1.105',
      device: 'Chrome on Windows',
      location: 'Doha, Qatar',
      status: 'success',
    },
    {
      id: '3',
      date: '2025-01-16 16:45',
      ip: '192.168.1.105',
      device: 'Safari on iPhone',
      location: 'Doha, Qatar',
      status: 'success',
    },
    {
      id: '4',
      date: '2025-01-15 11:20',
      ip: '192.168.1.105',
      device: 'Chrome on Windows',
      location: 'Doha, Qatar',
      status: 'success',
    },
  ];

  const tabs = [
    { id: 'account', label: 'Account Overview', icon: User },
    { id: 'security', label: 'Security & Login History', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">View your account information and preferences</p>
        </div>

        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-blue-400 text-sm">
            <strong>Note:</strong> Contact your Super Admin to update company information, change password, or modify account settings.
          </p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Profile Information</h2>
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-medium text-blue-500">
                  Read-Only
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-700">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{user?.name}</h3>
                    <p className="text-gray-400">{user?.role === 'company_admin' ? 'Company Admin' : 'User'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Email</span>
                    </div>
                    <p className="text-white font-medium">{user?.email}</p>
                  </div>

                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Phone</span>
                    </div>
                    <p className="text-white font-medium">{user?.phone || 'Not set'}</p>
                  </div>

                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Company</span>
                    </div>
                    <p className="text-white font-medium">{user?.companyName}</p>
                  </div>

                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-400">Account Status</span>
                    </div>
                    <p className="text-green-500 font-medium">Active</p>
                  </div>

                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Member Since</span>
                    </div>
                    <p className="text-white font-medium">March 15, 2024</p>
                  </div>

                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Language</span>
                    </div>
                    <p className="text-white font-medium">{language === 'en' ? 'English' : 'Türkçe'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Company Information</h2>
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-medium text-blue-500">
                  Read-Only
                </span>
              </div>

              <div className="p-6 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{user?.companyName}</h3>
                    <p className="text-gray-400">Company ID: {user?.companyId}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-4">
                  Company details are managed by the Super Admin. Contact support if you need to update company information.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Security Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Password</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-white font-medium">Protected</p>
                  <p className="text-xs text-gray-500 mt-1">Contact Super Admin to change password</p>
                </div>

                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Last Login</span>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-white font-medium">{loginHistory[0].date}</p>
                  <p className="text-xs text-gray-500 mt-1">{loginHistory[0].location}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Login History</h2>
              <div className="space-y-3">
                {loginHistory.map((login) => (
                  <div
                    key={login.id}
                    className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <Monitor className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{login.device}</p>
                          <p className="text-sm text-gray-400">{login.date}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-500">
                        Success
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 pl-13">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {login.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {login.ip}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Language Preference</h2>
              <p className="text-gray-400 text-sm mb-6">
                Select your preferred language for the interface
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    language === 'en'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-white">English</span>
                    {language === 'en' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                  </div>
                  <p className="text-sm text-gray-400">Default language</p>
                </button>

                <button
                  onClick={() => setLanguage('tr')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    language === 'tr'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-white">Türkçe</span>
                    {language === 'tr' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                  </div>
                  <p className="text-sm text-gray-400">Turkish language</p>
                </button>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-blue-400 text-sm">
                <strong>Note:</strong> More preferences (timezone, date format, etc.) will be added in future updates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
