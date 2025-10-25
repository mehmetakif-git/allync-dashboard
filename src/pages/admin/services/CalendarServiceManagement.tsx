import { useState } from 'react';
import { Edit3, Save, X, Building2, Calendar as CalendarIcon, TrendingUp, Users, BarChart3, Eye, ArrowLeft, Clock } from 'lucide-react';

export default function CalendarServiceManagement() {
  const [activeTab, setActiveTab] = useState('content');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [serviceContent, setServiceContent] = useState({
    name_en: 'Google Calendar',
    name_tr: 'Google Takvim',
    description_en: 'WhatsApp appointment booking with Google Calendar sync. Customers can book appointments via WhatsApp, and they are automatically synced to your Google Calendar.',
    description_tr: 'WhatsApp üzerinden randevu alma ve Google Takvim senkronizasyonu. Müşteriler WhatsApp üzerinden randevu alabilir ve otomatik olarak Google Takviminize senkronize edilir.',
    features_en: [
      'WhatsApp appointment booking',
      'Google Calendar sync',
      'Automatic scheduling',
      'Staff management',
      'Appointment reminders',
      'AI-powered date/time extraction',
      'Multi-timezone support',
      'Recurring appointments',
    ],
    features_tr: [
      'WhatsApp randevu alma',
      'Google Takvim senkronizasyonu',
      'Otomatik zamanlama',
      'Personel yönetimi',
      'Randevu hatırlatıcıları',
      'Yapay zeka destekli tarih/saat çıkarımı',
      'Çoklu saat dilimi desteği',
      'Tekrarlayan randevular',
    ],
    pricing: {
      starter: { price: 199, features: ['Up to 50 appointments/month', 'Basic calendar sync', 'Email notifications'] },
      professional: { price: 399, features: ['Up to 500 appointments/month', 'Advanced scheduling', 'SMS reminders', 'Priority support'] },
      enterprise: { price: 799, features: ['Unlimited appointments', 'Custom integrations', 'Dedicated support', 'Multi-calendar sync'] },
    },
    delivery_time_en: '3-5 business days',
    delivery_time_tr: '3-5 iş günü',
  });

  const companiesUsingService = [
    {
      id: '1',
      name: 'Tech Corp',
      activeSince: '2024-06-10',
      package: 'Professional',
      totalAppointments: 142,
      completedAppointments: 128,
      avgResponseTime: '2.5 min',
      status: 'active',
    },
    {
      id: '2',
      name: 'Digital Solutions Ltd',
      activeSince: '2024-08-15',
      package: 'Starter',
      totalAppointments: 48,
      completedAppointments: 42,
      avgResponseTime: '3.2 min',
      status: 'active',
    },
  ];

  const globalStats = {
    totalCompanies: companiesUsingService.length,
    totalAppointments: companiesUsingService.reduce((sum, c) => sum + c.totalAppointments, 0),
    completedAppointments: companiesUsingService.reduce((sum, c) => sum + c.completedAppointments, 0),
    avgResponseTime: '2.8 min',
    monthlyRevenue: companiesUsingService.reduce((sum, c) => {
      const price = c.package === 'Starter' ? 199 : c.package === 'Professional' ? 399 : 799;
      return sum + price;
    }, 0),
  };

  const handleSaveContent = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEditing(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    console.log('Calendar Service Content Updated:', serviceContent);
  };

  const tabs = [
    { id: 'content', label: 'Service Content', icon: Edit3 },
    { id: 'companies', label: 'Companies Overview', icon: Building2, badge: companiesUsingService.length },
    { id: 'analytics', label: 'Global Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <button
          onClick={() => window.location.hash = 'services-catalog'}
          className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Services Catalog
        </button>

        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <CalendarIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Google Calendar Service</h1>
              <p className="text-blue-100 text-lg">
                Manage Google Calendar integration service. Edit content, view company usage, and monitor analytics.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-blue-500" />
              <div>
                <h2 className="text-xl font-bold text-white">Google Calendar - Service Management</h2>
                <p className="text-sm text-muted">Manage service content, view company usage, and analytics</p>
              </div>
            </div>
            {activeTab === 'content' && (
              <button
                onClick={() => isEditing ? handleSaveContent() : setIsEditing(true)}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isEditing
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                }`}
              >
                {isEditing ? <><Save className="w-5 h-5" />Save Changes</> : <><Edit3 className="w-5 h-5" />Edit Content</>}
              </button>
            )}
          </div>
        </div>

        {showSuccessMessage && (
          <div className="bg-green-500/10 border border-green-500 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-green-400 font-semibold">Success!</p>
              <p className="text-muted text-sm">Service content updated successfully.</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setIsEditing(false); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap relative ${
                  activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-secondary text-muted hover:bg-hover'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.badge !== undefined && <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">{tab.badge}</span>}
              </button>
            );
          })}
        </div>

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Service Names</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">English Name</label>
                  <input
                    type="text"
                    value={serviceContent.name_en}
                    onChange={(e) => setServiceContent({ ...serviceContent, name_en: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500 ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Turkish Name</label>
                  <input
                    type="text"
                    value={serviceContent.name_tr}
                    onChange={(e) => setServiceContent({ ...serviceContent, name_tr: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500 ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Service Descriptions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">English Description</label>
                  <textarea
                    value={serviceContent.description_en}
                    onChange={(e) => setServiceContent({ ...serviceContent, description_en: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Turkish Description</label>
                  <textarea
                    value={serviceContent.description_tr}
                    onChange={(e) => setServiceContent({ ...serviceContent, description_tr: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Service Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">English Features</label>
                  <div className="space-y-2">
                    {serviceContent.features_en.map((feature, index) => (
                      <input
                        key={index}
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...serviceContent.features_en];
                          newFeatures[index] = e.target.value;
                          setServiceContent({ ...serviceContent, features_en: newFeatures });
                        }}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500 ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Turkish Features</label>
                  <div className="space-y-2">
                    {serviceContent.features_tr.map((feature, index) => (
                      <input
                        key={index}
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...serviceContent.features_tr];
                          newFeatures[index] = e.target.value;
                          setServiceContent({ ...serviceContent, features_tr: newFeatures });
                        }}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500 ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Pricing Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(serviceContent.pricing).map(([plan, details]) => (
                  <div key={plan} className="bg-primary border border-secondary rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 capitalize">{plan}</h4>
                    <div className="mb-3">
                      <label className="block text-xs text-muted mb-1">Price (USD)</label>
                      <input
                        type="number"
                        value={details.price}
                        onChange={(e) => setServiceContent({
                          ...serviceContent,
                          pricing: {
                            ...serviceContent.pricing,
                            [plan]: { ...details, price: parseInt(e.target.value) }
                          }
                        })}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 bg-primary border border-secondary rounded text-white ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">Features</label>
                      <ul className="text-sm text-secondary space-y-1">
                        {details.features.map((feature, idx) => (
                          <li key={idx}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-hover text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button onClick={handleSaveContent} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-muted">Companies</span>
                </div>
                <p className="text-2xl font-bold text-white">{globalStats.totalCompanies}</p>
              </div>
              <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CalendarIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-muted">Total Appointments</span>
                </div>
                <p className="text-2xl font-bold text-white">{globalStats.totalAppointments}</p>
              </div>
              <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-muted">Completed</span>
                </div>
                <p className="text-2xl font-bold text-white">{globalStats.completedAppointments}</p>
              </div>
              <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-muted">Revenue</span>
                </div>
                <p className="text-2xl font-bold text-white">${globalStats.monthlyRevenue}</p>
              </div>
            </div>

            <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Company</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Package</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Appointments</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Completed</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Avg Response</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                  {companiesUsingService.map((company) => (
                    <tr key={company.id} className="hover:bg-hover/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold">
                            {company.name.charAt(0)}
                          </div>
                          <span className="text-white font-medium">{company.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          company.package === 'Enterprise' ? 'bg-purple-500/10 border border-purple-500/30 text-purple-500' :
                          'bg-blue-500/10 border border-blue-500/30 text-blue-500'
                        }`}>{company.package}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{company.totalAppointments}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{company.completedAppointments}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{company.avgResponseTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => window.location.hash = `company-detail/${company.id}`} className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors">
                          <Eye className="w-5 h-5 text-blue-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
                <p className="text-sm text-muted mb-1">Total Companies</p>
                <p className="text-3xl font-bold text-white">{globalStats.totalCompanies}</p>
              </div>
              <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
                <p className="text-sm text-muted mb-1">Total Appointments</p>
                <p className="text-3xl font-bold text-white">{globalStats.totalAppointments}</p>
              </div>
              <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
                <p className="text-sm text-muted mb-1">Completed</p>
                <p className="text-3xl font-bold text-white">{globalStats.completedAppointments}</p>
              </div>
              <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
                <p className="text-sm text-muted mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold text-white">${globalStats.monthlyRevenue}</p>
              </div>
            </div>

            <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Package Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-secondary">Professional</span>
                    <span className="text-muted text-sm">1 company (50%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-secondary">Starter</span>
                    <span className="text-muted text-sm">1 company (50%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-green-700 h-3 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
