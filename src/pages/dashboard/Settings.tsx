import React, { useState, useEffect } from 'react';
import {
  User, Building2, Shield, Globe, Calendar, MapPin, Mail, Phone,
  CheckCircle, Clock, Monitor, FileText, Hash, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCompanyById } from '../../lib/api/companies';
import { getActivityLogs } from '../../lib/api/activityLogs';

interface CompanyData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  address?: string;
  city?: string;
  postal_code?: string;
  tax_id?: string;
  registration_number?: string;
  billing_email?: string;
  website?: string;
  logo_url?: string;
  status: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  action: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export default function Settings() {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'account' | 'company' | 'security' | 'preferences'>('account');
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loginHistory, setLoginHistory] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.company_id) return;

      try {
        setLoading(true);

        // Fetch company data
        const company = await getCompanyById(user.company_id);
        setCompanyData(company);

        // Fetch activity logs (login history)
        if (user?.id) {
          const activities = await getActivityLogs({
            filters: {
              user_id: user.id,
              action: 'login'
            },
            limit: 10,
            sortBy: 'created_at',
            sortOrder: 'desc'
          });
          setLoginHistory(activities.data || []);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching settings data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.company_id, user?.id]);

  // Parse user agent to get device info
  const parseUserAgent = (userAgent?: string) => {
    if (!userAgent) return 'Unknown Device';

    if (userAgent.includes('iPhone')) return 'Safari on iPhone';
    if (userAgent.includes('iPad')) return 'Safari on iPad';
    if (userAgent.includes('Android')) return 'Chrome on Android';
    if (userAgent.includes('Windows')) return 'Chrome on Windows';
    if (userAgent.includes('Macintosh')) return 'Safari on Mac';
    if (userAgent.includes('Linux')) return 'Browser on Linux';

    return 'Unknown Device';
  };

  const tabs = [
    { id: 'account', label: 'Account Overview', icon: User },
    { id: 'company', label: 'Company Information', icon: Building2 },
    { id: 'security', label: 'Security & Login History', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-muted">View your account information and preferences</p>
        </div>

        {/* Read-Only Notice */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-blue-400 text-sm">
            <strong>Note:</strong> Company information is managed by Super Admin. Contact support to update account details, change password, or modify company information.
          </p>
        </div>

        {/* Tabs */}
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
                    : 'bg-secondary text-muted hover:bg-hover'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Account Overview Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Profile Information</h2>
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-medium text-blue-500">
                  Read-Only
                </span>
              </div>

              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-6 border-b border-secondary mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{user?.name}</h3>
                  <p className="text-muted">{user?.role === 'company_admin' ? 'Company Admin' : 'User'}</p>
                  <p className="text-sm text-muted mt-1">{companyData?.name}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-muted" />
                    <span className="text-sm text-muted">Email</span>
                  </div>
                  <p className="text-white font-medium">{user?.email}</p>
                </div>

                <div className="p-4 bg-primary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-muted" />
                    <span className="text-sm text-muted">Phone</span>
                  </div>
                  <p className="text-white font-medium">{'Not set'}</p>
                </div>

                <div className="p-4 bg-primary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-muted" />
                    <span className="text-sm text-muted">Company</span>
                  </div>
                  <p className="text-white font-medium">{companyData?.name || 'N/A'}</p>
                </div>

                <div className="p-4 bg-primary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted">Account Status</span>
                  </div>
                  <p className="text-green-500 font-medium capitalize">Active</p>
                </div>

                <div className="p-4 bg-primary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted" />
                    <span className="text-sm text-muted">Member Since</span>
                  </div>
                  <p className="text-white font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="p-4 bg-primary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-muted" />
                    <span className="text-sm text-muted">Language</span>
                  </div>
                  <p className="text-white font-medium">{language === 'en' ? 'English' : 'Türkçe'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Company Information Tab */}
        {activeTab === 'company' && (
          <div className="space-y-6">
            <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Company Details</h2>
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-medium text-blue-500">
                  Read-Only
                </span>
              </div>

              {/* Company Header */}
              <div className="p-6 bg-primary/50 rounded-lg mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    {companyData?.logo_url ? (
                      <img src={companyData.logo_url} alt={companyData.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Building2 className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{companyData?.name || 'Company Name'}</h3>
                    <p className="text-muted text-sm">Company ID: {companyData?.id}</p>
                  </div>
                </div>
              </div>

              {/* Company Contact Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-muted" />
                      <span className="text-sm text-muted">Email</span>
                    </div>
                    <p className="text-white font-medium">{companyData?.email || 'N/A'}</p>
                  </div>

                  <div className="p-4 bg-primary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-muted" />
                      <span className="text-sm text-muted">Billing Email</span>
                    </div>
                    <p className="text-white font-medium">{companyData?.billing_email || companyData?.email || 'N/A'}</p>
                  </div>

                  <div className="p-4 bg-primary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-muted" />
                      <span className="text-sm text-muted">Phone</span>
                    </div>
                    <p className="text-white font-medium">{companyData?.phone || 'N/A'}</p>
                  </div>

                  <div className="p-4 bg-primary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="w-4 h-4 text-muted" />
                      <span className="text-sm text-muted">Website</span>
                    </div>
                    {companyData?.website ? (
                      <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium">
                        {companyData.website}
                      </a>
                    ) : (
                      <p className="text-white font-medium">N/A</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Address */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-muted" />
                      <span className="text-sm text-muted">Address</span>
                    </div>
                    <p className="text-white font-medium">{companyData?.address || 'Not set'}</p>
                  </div>

                  <div className="p-4 bg-primary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-muted" />
                      <span className="text-sm text-muted">City</span>
                    </div>
                    <p className="text-white font-medium">{companyData?.city || 'Not set'}</p>
                  </div>

                  <div className="p-4 bg-primary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4 text-muted" />
                      <span className="text-sm text-muted">Postal Code</span>
                    </div>
                    <p className="text-white font-medium">{companyData?.postal_code || 'Not set'}</p>
                  </div>

                  <div className="p-4 bg-primary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-muted" />
                      <span className="text-sm text-muted">Country</span>
                    </div>
                    <p className="text-white font-medium">{companyData?.country || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Tax & Legal Information */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Tax & Legal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-muted" />
                      <span className="text-sm text-muted">Tax ID</span>
                    </div>
                    <p className="text-white font-medium">{companyData?.tax_id || 'Not set'}</p>
                  </div>

                  <div className="p-4 bg-primary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-muted" />
                      <span className="text-sm text-muted">Registration Number</span>
                    </div>
                    <p className="text-white font-medium">{companyData?.registration_number || 'Not set'}</p>
                  </div>

                  <div className="p-4 bg-primary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-muted">Company Status</span>
                    </div>
                    <p className="text-green-500 font-medium capitalize">{companyData?.status || 'Active'}</p>
                  </div>

                  <div className="p-4 bg-primary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted" />
                      <span className="text-sm text-muted">Registered Since</span>
                    </div>
                    <p className="text-white font-medium">
                      {companyData?.created_at ? new Date(companyData.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Security Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted">Password</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-white font-medium">Protected</p>
                  <p className="text-xs text-muted mt-1">Contact Super Admin to change password</p>
                </div>

                <div className="p-4 bg-primary/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted">Last Login</span>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-white font-medium">
                    {loginHistory[0] ? new Date(loginHistory[0].created_at).toLocaleString() : 'N/A'}
                  </p>
                  <p className="text-xs text-muted mt-1">{loginHistory[0]?.ip_address || 'Unknown location'}</p>
                </div>
              </div>
            </div>

            <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Login History</h2>
              {loginHistory.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No login history available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {loginHistory.map((login) => (
                    <div
                      key={login.id}
                      className="p-4 bg-primary/50 border border-secondary rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{parseUserAgent(login.user_agent)}</p>
                            <p className="text-sm text-muted">{new Date(login.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-500">
                          Success
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted pl-13">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {login.ip_address || 'Unknown IP'}
                        </div>
                        {login.description && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {login.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Language Preference</h2>
              <p className="text-muted text-sm mb-6">
                Select your preferred language for the interface
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    language === 'en'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-secondary bg-primary/50 hover:border-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-white">English</span>
                    {language === 'en' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                  </div>
                  <p className="text-sm text-muted">Default language</p>
                </button>

                <button
                  onClick={() => setLanguage('tr')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    language === 'tr'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-secondary bg-primary/50 hover:border-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-white">Türkçe</span>
                    {language === 'tr' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                  </div>
                  <p className="text-sm text-muted">Turkish language</p>
                </button>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-blue-400 text-sm">
                <strong>Note:</strong> More preferences (timezone, date format, notifications) will be added in future updates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}