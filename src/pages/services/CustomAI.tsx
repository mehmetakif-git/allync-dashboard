import { Sparkles, Brain, Zap, Users, TrendingUp, Plus, Settings as SettingsIcon, Save, Code } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { getCurrentMockUser } from '../../utils/mockAuth';

export default function CustomAI() {
  const mockUser = getCurrentMockUser();
  const isSuperAdmin = mockUser.role === 'super_admin';
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  const [settings, setSettings] = useState({
    serviceName: 'Custom AI Solutions',
    description: 'Build tailored AI solutions for your specific business needs',
    status: 'active',
    pricing: {
      basic: { name: 'Consultation', price: 499, features: ['Initial consultation', 'Feasibility analysis', 'Project proposal', '2 weeks delivery'] },
      pro: { name: 'Development', price: 2999, features: ['Full AI development', 'Custom model training', 'Integration support', '1 month delivery'] },
      enterprise: { name: 'Enterprise', price: 9999, features: ['Dedicated AI team', 'Ongoing optimization', '24/7 support', 'Unlimited revisions'] },
    },
  });

  const stats = [
    { label: 'Active Projects', value: '12', change: '+3 this month', icon: Sparkles, color: 'purple' },
    { label: 'Models Deployed', value: '34', change: '+8 this month', icon: Brain, color: 'blue' },
    { label: 'Avg Accuracy', value: '94%', change: '+2%', icon: Zap, color: 'yellow' },
    { label: 'Total Clients', value: '28', change: '+5 this month', icon: Users, color: 'green' },
  ];

  const projectTypes = [
    { type: 'Chatbots', count: 12 },
    { type: 'Predictive Analytics', count: 8 },
    { type: 'Computer Vision', count: 6 },
    { type: 'NLP Systems', count: 5 },
    { type: 'Recommendation', count: 3 },
  ];

  const activeProjects = [
    { id: '1', name: 'Customer Support AI', client: 'Tech Corp', type: 'Chatbot', progress: 75, status: 'In Progress' },
    { id: '2', name: 'Sales Forecasting', client: 'Retail Co', type: 'Analytics', progress: 60, status: 'In Progress' },
    { id: '3', name: 'Quality Control AI', client: 'Manufacturing Ltd', type: 'Vision', progress: 90, status: 'Testing' },
    { id: '4', name: 'Sentiment Analysis', client: 'Media Group', type: 'NLP', progress: 100, status: 'Completed' },
  ];

  const handleSaveSettings = () => {
    console.log('Saving Custom AI settings:', settings);
    alert('✅ Custom AI Solutions settings saved successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Custom AI Solutions</h1>
          <p className="text-gray-400 mt-1">Build tailored AI for your business</p>
        </div>
        {activeTab === 'overview' && (
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      <div className="border-b border-gray-800">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'text-white border-purple-500'
                : 'text-gray-400 border-transparent hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'text-white border-purple-500'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              Settings
            </button>
          )}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                  <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Projects by Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={projectTypes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="type" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#A855F7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Active Projects</h3>
            <div className="space-y-4">
              {activeProjects.map((project) => (
                <div key={project.id} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{project.name}</p>
                        <p className="text-sm text-gray-400">{project.client} • {project.type}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      project.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'Testing' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{project.progress}% complete</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'settings' && isSuperAdmin && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Service Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Service Name</label>
                <input
                  type="text"
                  value={settings.serviceName}
                  onChange={(e) => setSettings({ ...settings, serviceName: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={settings.status}
                  onChange={(e) => setSettings({ ...settings, status: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Pricing Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(settings.pricing).map(([key, plan]) => (
                <div key={key} className="border border-gray-700 rounded-lg p-4">
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => setSettings({
                      ...settings,
                      pricing: { ...settings.pricing, [key]: { ...plan, name: e.target.value } }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white font-bold mb-3"
                  />
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={plan.price}
                      onChange={(e) => setSettings({
                        ...settings,
                        pricing: { ...settings.pricing, [key]: { ...plan, price: parseInt(e.target.value) } }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-2xl font-bold"
                    />
                    <span className="text-gray-400">/mo</span>
                  </div>
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...plan.features];
                          newFeatures[idx] = e.target.value;
                          setSettings({
                            ...settings,
                            pricing: { ...settings.pricing, [key]: { ...plan, features: newFeatures } }
                          });
                        }}
                        className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
