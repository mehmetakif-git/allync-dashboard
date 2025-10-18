import { useState } from 'react';
import { Edit3, Save, X, Building2, FileText, TrendingUp, FileCheck, BarChart3, Eye, ArrowLeft, File } from 'lucide-react';

export default function DocsServiceManagement() {
  const [activeTab, setActiveTab] = useState('content');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [serviceContent, setServiceContent] = useState({
    name_en: 'Google Docs',
    name_tr: 'Google Docs',
    description_en: 'AI document generation via WhatsApp saved to Google Docs. Generate contracts, reports, proposals and more through WhatsApp conversations.',
    description_tr: 'WhatsApp üzerinden yapay zeka ile döküman oluşturma ve Google Docs\'a kaydetme. WhatsApp konuşmaları üzerinden sözleşmeler, raporlar, teklifler ve daha fazlasını oluşturun.',
    features_en: [
      'WhatsApp document requests',
      'AI content generation',
      'Auto-save to Drive',
      'Multiple templates',
      'Document sharing',
      'PDF export',
      'Version control',
      'Collaborative editing',
    ],
    features_tr: [
      'WhatsApp döküman istekleri',
      'Yapay zeka içerik oluşturma',
      'Drive\'a otomatik kaydetme',
      'Çoklu şablonlar',
      'Döküman paylaşımı',
      'PDF dışa aktarma',
      'Versiyon kontrolü',
      'İşbirlikçi düzenleme',
    ],
    pricing: {
      starter: { price: 199, features: ['Up to 50 documents/month', 'Basic templates', 'PDF export'] },
      professional: { price: 399, features: ['Up to 500 documents/month', 'Advanced AI', 'Custom templates', 'Priority support'] },
      enterprise: { price: 799, features: ['Unlimited documents', 'Custom integrations', 'Dedicated support', 'Advanced analytics'] },
    },
    delivery_time_en: '3-5 business days',
    delivery_time_tr: '3-5 iş günü',
  });

  const companiesUsingService = [
    {
      id: '1',
      name: 'Legal Associates',
      activeSince: '2024-09-05',
      package: 'Professional',
      totalAppointments: 234,
      completedAppointments: 198,
      avgResponseTime: '45 sec',
      status: 'active',
    },
    {
      id: '2',
      name: 'Business Consultants',
      activeSince: '2024-11-01',
      package: 'Starter',
      totalAppointments: 67,
      completedAppointments: 58,
      avgResponseTime: '52 sec',
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
    console.log('Docs Service Content Updated:', serviceContent);
  };

  const tabs = [
    { id: 'content', label: 'Service Content', icon: Edit3 },
    { id: 'companies', label: 'Companies Overview', icon: Building2, badge: companiesUsingService.length },
    { id: 'analytics', label: 'Global Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <button
          onClick={() => window.location.hash = 'services-catalog'}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Services Catalog
        </button>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <FileText className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Google Docs Service</h1>
              <p className="text-cyan-100 text-lg">
                Manage Google Docs integration service. Edit content, view company usage, and monitor analytics.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-white">Google Docs - Service Management</h2>
                <p className="text-sm text-gray-400">Manage service content, view company usage, and analytics</p>
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
              <p className="text-gray-400 text-sm">Service content updated successfully.</p>
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
                  activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Service Names</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">English Name</label>
                  <input
                    type="text"
                    value={serviceContent.name_en}
                    onChange={(e) => setServiceContent({ ...serviceContent, name_en: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Turkish Name</label>
                  <input
                    type="text"
                    value={serviceContent.name_tr}
                    onChange={(e) => setServiceContent({ ...serviceContent, name_tr: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Service Descriptions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">English Description</label>
                  <textarea
                    value={serviceContent.description_en}
                    onChange={(e) => setServiceContent({ ...serviceContent, description_en: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Turkish Description</label>
                  <textarea
                    value={serviceContent.description_tr}
                    onChange={(e) => setServiceContent({ ...serviceContent, description_tr: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Service Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">English Features</label>
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
                        className={`w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Turkish Features</label>
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
                        className={`w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Pricing Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(serviceContent.pricing).map(([plan, details]) => (
                  <div key={plan} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 capitalize">{plan}</h4>
                    <div className="mb-3">
                      <label className="block text-xs text-gray-400 mb-1">Price (USD)</label>
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
                        className={`w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Features</label>
                      <ul className="text-sm text-gray-300 space-y-1">
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
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-400">Companies</span>
                </div>
                <p className="text-2xl font-bold text-white">{globalStats.totalCompanies}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CalendarIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-400">Total Appointments</span>
                </div>
                <p className="text-2xl font-bold text-white">{globalStats.totalAppointments}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-400">Completed</span>
                </div>
                <p className="text-2xl font-bold text-white">{globalStats.completedAppointments}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-400">Revenue</span>
                </div>
                <p className="text-2xl font-bold text-white">${globalStats.monthlyRevenue}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Package</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Appointments</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Completed</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg Response</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                  {companiesUsingService.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-700/50 transition-colors">
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
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{company.totalAppointments}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{company.completedAppointments}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{company.avgResponseTime}</td>
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
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-1">Total Companies</p>
                <p className="text-3xl font-bold text-white">{globalStats.totalCompanies}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-1">Total Appointments</p>
                <p className="text-3xl font-bold text-white">{globalStats.totalAppointments}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-1">Completed</p>
                <p className="text-3xl font-bold text-white">{globalStats.completedAppointments}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold text-white">${globalStats.monthlyRevenue}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Package Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Professional</span>
                    <span className="text-gray-400 text-sm">1 company (50%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Starter</span>
                    <span className="text-gray-400 text-sm">1 company (50%)</span>
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
