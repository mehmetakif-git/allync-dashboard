import { useState } from 'react';
import { Edit3, Save, X, Building2, MessageCircle, TrendingUp, Users, BarChart3, Eye, ArrowLeft } from 'lucide-react';

export default function WhatsAppServiceManagement() {
  const [activeTab, setActiveTab] = useState<'content' | 'companies' | 'analytics'>('content');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [serviceContent, setServiceContent] = useState({
    name_en: 'WhatsApp Automation',
    name_tr: 'WhatsApp Otomasyonu',
    description_en: 'Automate your WhatsApp business communications with AI-powered chatbot. Handle customer inquiries 24/7, track conversations, and improve response times.',
    description_tr: 'WhatsApp iş iletişiminizi yapay zeka destekli chatbot ile otomatikleştirin. Müşteri sorularını 7/24 yanıtlayın, konuşmaları takip edin ve yanıt sürelerinizi iyileştirin.',
    features_en: [
      '24/7 automated customer support',
      'AI-powered conversation handling',
      'Real-time message monitoring',
      'Customer database management',
      'Analytics and reporting',
      'Multi-language support',
      'Sentiment analysis',
      'Auto-reply configuration',
    ],
    features_tr: [
      '7/24 otomatik müşteri desteği',
      'Yapay zeka destekli konuşma yönetimi',
      'Gerçek zamanlı mesaj izleme',
      'Müşteri veritabanı yönetimi',
      'Analitik ve raporlama',
      'Çoklu dil desteği',
      'Duygu analizi',
      'Otomatik yanıt yapılandırması',
    ],
    pricing: {
      starter: { price: 99, features: ['Up to 1,000 messages/month', '1 bot instance', 'Basic analytics'] },
      professional: { price: 299, features: ['Up to 10,000 messages/month', '3 bot instances', 'Advanced analytics', 'Priority support'] },
      enterprise: { price: 799, features: ['Unlimited messages', 'Unlimited bot instances', 'Custom integrations', 'Dedicated support', 'SLA guarantee'] },
    },
    delivery_time_en: '2-3 business days',
    delivery_time_tr: '2-3 iş günü',
  });

  const companiesUsingService = [
    {
      id: '1',
      name: 'Tech Corp',
      activeSince: '2024-03-15',
      package: 'Professional',
      totalSessions: 156,
      totalMessages: 2847,
      activeUsers: 89,
      avgResponseTime: '2.3 min',
      status: 'active',
    },
    {
      id: '2',
      name: 'Global Solutions Ltd',
      activeSince: '2024-05-20',
      package: 'Starter',
      totalSessions: 45,
      totalMessages: 823,
      activeUsers: 23,
      avgResponseTime: '3.1 min',
      status: 'active',
    },
    {
      id: '3',
      name: 'Innovation Hub',
      activeSince: '2024-07-10',
      package: 'Enterprise',
      totalSessions: 342,
      totalMessages: 6521,
      activeUsers: 156,
      avgResponseTime: '1.8 min',
      status: 'active',
    },
    {
      id: '4',
      name: 'Digital Agency Plus',
      activeSince: '2024-08-01',
      package: 'Professional',
      totalSessions: 98,
      totalMessages: 1654,
      activeUsers: 47,
      avgResponseTime: '2.7 min',
      status: 'active',
    },
  ];

  const globalStats = {
    totalCompanies: companiesUsingService.length,
    totalSessions: companiesUsingService.reduce((sum, c) => sum + c.totalSessions, 0),
    totalMessages: companiesUsingService.reduce((sum, c) => sum + c.totalMessages, 0),
    totalActiveUsers: companiesUsingService.reduce((sum, c) => sum + c.activeUsers, 0),
    avgResponseTime: '2.5 min',
    monthlyRevenue: companiesUsingService.reduce((sum, c) => {
      const price = c.package === 'Starter' ? 99 : c.package === 'Professional' ? 299 : 799;
      return sum + price;
    }, 0),
  };

  const handleSaveContent = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEditing(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    console.log('Service Content Updated:', serviceContent);
  };

  const tabs = [
    { id: 'content', label: 'Service Content', icon: Edit3 },
    { id: 'companies', label: 'Companies Overview', icon: Building2, badge: companiesUsingService.length },
    { id: 'analytics', label: 'Global Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => window.location.hash = 'services-catalog'}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Services Catalog
        </button>

        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-green-400 font-medium mb-1">WhatsApp Automation Service</p>
              <p className="text-green-300/70 text-sm">
                This is the central management hub for WhatsApp Automation. Edit service content, monitor company usage, and view global analytics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">WhatsApp Automation - Service Management</h1>
              <p className="text-gray-400">Manage service content, view company usage, and analytics</p>
            </div>
          </div>
          {activeTab === 'content' && (
            <button
              onClick={() => isEditing ? handleSaveContent() : setIsEditing(true)}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isEditing
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {isEditing ? (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit3 className="w-5 h-5" />
                  Edit Content
                </>
              )}
            </button>
          )}
        </div>

        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Save className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-green-500 font-medium">Success!</p>
              <p className="text-green-400/70 text-sm">Service content has been updated successfully.</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsEditing(false);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Service Names</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">English Name</label>
                  <input
                    type="text"
                    value={serviceContent.name_en}
                    onChange={(e) => setServiceContent({ ...serviceContent, name_en: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                      !isEditing && 'cursor-not-allowed opacity-70'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Turkish Name</label>
                  <input
                    type="text"
                    value={serviceContent.name_tr}
                    onChange={(e) => setServiceContent({ ...serviceContent, name_tr: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                      !isEditing && 'cursor-not-allowed opacity-70'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Service Descriptions</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">English Description</label>
                  <textarea
                    value={serviceContent.description_en}
                    onChange={(e) => setServiceContent({ ...serviceContent, description_en: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none ${
                      !isEditing && 'cursor-not-allowed opacity-70'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Turkish Description</label>
                  <textarea
                    value={serviceContent.description_tr}
                    onChange={(e) => setServiceContent({ ...serviceContent, description_tr: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none ${
                      !isEditing && 'cursor-not-allowed opacity-70'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Service Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">English Features</label>
                  <div className="space-y-2">
                    {serviceContent.features_en.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...serviceContent.features_en];
                            newFeatures[index] = e.target.value;
                            setServiceContent({ ...serviceContent, features_en: newFeatures });
                          }}
                          disabled={!isEditing}
                          className={`flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                            !isEditing && 'cursor-not-allowed opacity-70'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Turkish Features</label>
                  <div className="space-y-2">
                    {serviceContent.features_tr.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...serviceContent.features_tr];
                            newFeatures[index] = e.target.value;
                            setServiceContent({ ...serviceContent, features_tr: newFeatures });
                          }}
                          disabled={!isEditing}
                          className={`flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                            !isEditing && 'cursor-not-allowed opacity-70'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Pricing Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(serviceContent.pricing).map(([plan, details]) => (
                  <div key={plan} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-3 capitalize">{plan}</h3>
                    <div className="mb-3">
                      <label className="block text-sm text-gray-400 mb-1">Price (USD)</label>
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
                        className={`w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white ${
                          !isEditing && 'cursor-not-allowed opacity-70'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Features</label>
                      <div className="space-y-1">
                        {details.features.map((feature, idx) => (
                          <p key={idx} className="text-sm text-gray-300">• {feature}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Delivery Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">English</label>
                  <input
                    type="text"
                    value={serviceContent.delivery_time_en}
                    onChange={(e) => setServiceContent({ ...serviceContent, delivery_time_en: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                      !isEditing && 'cursor-not-allowed opacity-70'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Turkish</label>
                  <input
                    type="text"
                    value={serviceContent.delivery_time_tr}
                    onChange={(e) => setServiceContent({ ...serviceContent, delivery_time_tr: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                      !isEditing && 'cursor-not-allowed opacity-70'
                    }`}
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveContent}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
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
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Total Companies</span>
                  <Building2 className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-white">{globalStats.totalCompanies}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Total Sessions</span>
                  <MessageCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-white">{globalStats.totalSessions}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Total Messages</span>
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-white">{globalStats.totalMessages.toLocaleString()}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Monthly Revenue</span>
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-white">${globalStats.monthlyRevenue}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Company</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Package</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Active Since</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Sessions</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Messages</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Active Users</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Avg Response</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {companiesUsingService.map((company) => (
                      <tr key={company.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-white font-medium">{company.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            company.package === 'Enterprise'
                              ? 'bg-purple-500/10 border border-purple-500/30 text-purple-500'
                              : company.package === 'Professional'
                              ? 'bg-blue-500/10 border border-blue-500/30 text-blue-500'
                              : 'bg-green-500/10 border border-green-500/30 text-green-500'
                          }`}>
                            {company.package}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-300 text-sm">
                            {new Date(company.activeSince).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-medium">{company.totalSessions}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-medium">{company.totalMessages.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-medium">{company.activeUsers}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-300">{company.avgResponseTime}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => window.location.hash = `company-detail/${company.id}`}
                            className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="View Company Details"
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Total Companies</p>
                <p className="text-3xl font-bold text-white">{globalStats.totalCompanies}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-white">{globalStats.totalSessions}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Total Messages</p>
                <p className="text-3xl font-bold text-white">{globalStats.totalMessages.toLocaleString()}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Active Users</p>
                <p className="text-3xl font-bold text-white">{globalStats.totalActiveUsers}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold text-white">${globalStats.monthlyRevenue}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Package Distribution</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400">Enterprise</span>
                    <span className="text-white font-medium">1 company (25%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400">Professional</span>
                    <span className="text-white font-medium">2 companies (50%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400">Starter</span>
                    <span className="text-white font-medium">1 company (25%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Most Active Companies</h2>
                <div className="space-y-3">
                  {companiesUsingService
                    .sort((a, b) => b.totalMessages - a.totalMessages)
                    .slice(0, 3)
                    .map((company, index) => (
                      <div key={company.id} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          index === 1 ? 'bg-gray-400/20 text-gray-400' :
                          'bg-orange-500/20 text-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{company.name}</p>
                          <p className="text-sm text-gray-400">{company.totalMessages.toLocaleString()} messages</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Best Response Times</h2>
                <div className="space-y-3">
                  {companiesUsingService
                    .sort((a, b) => parseFloat(a.avgResponseTime) - parseFloat(b.avgResponseTime))
                    .slice(0, 3)
                    .map((company, index) => (
                      <div key={company.id} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          index === 1 ? 'bg-gray-400/20 text-gray-400' :
                          'bg-orange-500/20 text-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{company.name}</p>
                          <p className="text-sm text-gray-400">{company.avgResponseTime} avg</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
