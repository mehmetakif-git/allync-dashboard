import { useState } from 'react';
import { Edit3, Save, X, Building2, Mail, TrendingUp, Send, BarChart3, Eye, ArrowLeft, Inbox } from 'lucide-react';

export default function GmailServiceManagement() {
  const [activeTab, setActiveTab] = useState('content');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [serviceContent, setServiceContent] = useState({
    name_en: 'Gmail Integration',
    name_tr: 'Gmail Entegrasyonu',
    description_en: 'Send and receive emails via WhatsApp with Gmail integration. Forward emails, send responses, and manage your inbox through WhatsApp with AI-powered email summaries.',
    description_tr: 'WhatsApp üzerinden Gmail ile email gönder ve al. E-postaları ilet, yanıt gönderin ve WhatsApp üzerinden gelen kutunuzu yapay zeka destekli özetlerle yönetin.',
    features_en: [
      'WhatsApp to Email',
      'Email notifications',
      'Auto-reply templates',
      'Email search',
      'Attachment support',
      'AI email summaries',
      'Priority inbox',
      'Email forwarding',
    ],
    features_tr: [
      'WhatsApp\'tan Email',
      'Email bildirimleri',
      'Otomatik yanıt şablonları',
      'Email arama',
      'Ek dosya desteği',
      'Yapay zeka email özetleri',
      'Öncelikli gelen kutusu',
      'Email iletme',
    ],
    pricing: {
      starter: { price: 179, features: ['Up to 500 emails/month', 'Basic email sync', 'Email notifications'] },
      professional: { price: 349, features: ['Up to 5,000 emails/month', 'AI summaries', 'Auto-reply', 'Priority support'] },
      enterprise: { price: 699, features: ['Unlimited emails', 'Custom integrations', 'Dedicated support', 'Advanced analytics'] },
    },
    delivery_time_en: '3-5 business days',
    delivery_time_tr: '3-5 iş günü',
  });

  const companiesUsingService = [
    {
      id: '1',
      name: 'Corporate Services Inc',
      activeSince: '2024-08-01',
      package: 'Professional',
      totalEmails: 2134,
      emailsSent: 1245,
      avgResponseTime: '5 min',
      status: 'active',
    },
    {
      id: '2',
      name: 'Marketing Pro',
      activeSince: '2024-10-10',
      package: 'Starter',
      totalEmails: 387,
      emailsSent: 212,
      avgResponseTime: '8 min',
      status: 'active',
    },
  ];

  const globalStats = {
    totalCompanies: companiesUsingService.length,
    totalEmails: companiesUsingService.reduce((sum, c) => sum + c.totalEmails, 0),
    emailsSent: companiesUsingService.reduce((sum, c) => sum + c.emailsSent, 0),
    avgResponseTime: '6.5 min',
    monthlyRevenue: companiesUsingService.reduce((sum, c) => {
      const price = c.package === 'Starter' ? 179 : c.package === 'Professional' ? 349 : 699;
      return sum + price;
    }, 0),
  };

  const handleSaveContent = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEditing(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    console.log('Gmail Service Content Updated:', serviceContent);
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

        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <Mail className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Gmail Integration Service</h1>
              <p className="text-red-100 text-lg">
                Manage Gmail integration service. Edit content, view company usage, and monitor analytics.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-red-500" />
              <div>
                <h2 className="text-xl font-bold text-white">Gmail Integration - Service Management</h2>
                <p className="text-sm text-muted">Manage service content, view company usage, and analytics</p>
              </div>
            </div>
            {activeTab === 'content' && (
            <button
              onClick={() => isEditing ? handleSaveContent() : setIsEditing(true)}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isEditing
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                  : 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white'
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
                  activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-secondary text-muted hover:bg-hover'
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
                    className={`w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-red-500 ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Turkish Name</label>
                  <input
                    type="text"
                    value={serviceContent.name_tr}
                    onChange={(e) => setServiceContent({ ...serviceContent, name_tr: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-red-500 ${!isEditing && 'cursor-not-allowed opacity-70'}`}
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
                    className={`w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-red-500 resize-none ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Turkish Description</label>
                  <textarea
                    value={serviceContent.description_tr}
                    onChange={(e) => setServiceContent({ ...serviceContent, description_tr: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-red-500 resize-none ${!isEditing && 'cursor-not-allowed opacity-70'}`}
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
                        className={`w-full px-4 py-2 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-red-500 ${!isEditing && 'cursor-not-allowed opacity-70'}`}
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
                        className={`w-full px-4 py-2 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-red-500 ${!isEditing && 'cursor-not-allowed opacity-70'}`}
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
                  <Building2 className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-muted">Companies</span>
                </div>
                <p className="text-2xl font-bold text-white">{globalStats.totalCompanies}</p>
              </div>
              <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Inbox className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-muted">Total Emails</span>
                </div>
                <p className="text-2xl font-bold text-white">{globalStats.totalEmails}</p>
              </div>
              <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Send className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-muted">Emails Sent</span>
                </div>
                <p className="text-2xl font-bold text-white">{globalStats.emailsSent}</p>
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
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Total Emails</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Sent</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Avg Response</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                  {companiesUsingService.map((company) => (
                    <tr key={company.id} className="hover:bg-hover/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-semibold">
                            {company.name.charAt(0)}
                          </div>
                          <span className="text-white font-medium">{company.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          company.package === 'Enterprise' ? 'bg-purple-500/10 border border-purple-500/30 text-purple-500' :
                          'bg-red-500/10 border border-red-500/30 text-red-500'
                        }`}>{company.package}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{company.totalEmails}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{company.emailsSent}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{company.avgResponseTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => window.location.hash = `company-detail/${company.id}`} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Eye className="w-5 h-5 text-red-500" />
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
                <p className="text-sm text-muted mb-1">Total Emails</p>
                <p className="text-3xl font-bold text-white">{globalStats.totalEmails}</p>
              </div>
              <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
                <p className="text-sm text-muted mb-1">Emails Sent</p>
                <p className="text-3xl font-bold text-white">{globalStats.emailsSent}</p>
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
                    <div className="bg-gradient-to-r from-red-500 to-red-700 h-3 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-secondary">Starter</span>
                    <span className="text-muted text-sm">1 company (50%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full" style={{ width: '50%' }}></div>
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
