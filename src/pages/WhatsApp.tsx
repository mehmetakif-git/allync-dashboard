import { MessageCircle, Send, Users, Clock, TrendingUp, Plus, Settings as SettingsIcon, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { getCurrentMockUser } from '../utils/mockAuth';

export default function WhatsApp() {
  const mockUser = getCurrentMockUser();
  const isSuperAdmin = mockUser.role === 'super_admin';
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  const [settings, setSettings] = useState({
    serviceName: 'WhatsApp Automation',
    description: 'Automate your WhatsApp Business communications with AI-powered responses',
    status: 'active',
    pricing: {
      basic: { name: 'Basic', price: 199, features: ['Up to 1,000 messages/month', 'Basic automation', 'Email support'] },
      pro: { name: 'Pro', price: 499, features: ['Up to 10,000 messages/month', 'Advanced AI responses', 'Priority support', 'Custom templates'] },
      enterprise: { name: 'Enterprise', price: 1299, features: ['Unlimited messages', 'Dedicated account manager', '24/7 phone support', 'Custom integrations'] },
    },
  });

  const stats = [
    { label: 'Messages Sent', value: '2,847', change: '+12%', icon: Send, color: 'green' },
    { label: 'Active Contacts', value: '1,234', change: '+8%', icon: Users, color: 'blue' },
    { label: 'Avg Response Time', value: '< 1min', change: '-15%', icon: Clock, color: 'purple' },
    { label: 'Automation Rate', value: '87%', change: '+5%', icon: TrendingUp, color: 'yellow' },
  ];

  const usageData = [
    { day: 'Mon', messages: 420 },
    { day: 'Tue', messages: 380 },
    { day: 'Wed', messages: 450 },
    { day: 'Thu', messages: 510 },
    { day: 'Fri', messages: 490 },
    { day: 'Sat', messages: 320 },
    { day: 'Sun', messages: 277 },
  ];

  const recentMessages = [
    { id: '1', contact: 'John Smith', message: 'Thank you for your order!', time: '2 min ago', status: 'delivered' },
    { id: '2', contact: 'Sarah Johnson', message: 'Your appointment is confirmed', time: '15 min ago', status: 'read' },
    { id: '3', contact: 'Mike Chen', message: 'Product information sent', time: '1 hour ago', status: 'delivered' },
    { id: '4', contact: 'Emma Wilson', message: 'Support ticket created', time: '2 hours ago', status: 'read' },
  ];

  const handleSaveSettings = () => {
    console.log('Saving WhatsApp settings:', settings);
    alert('✅ WhatsApp Automation settings saved successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">WhatsApp Automation</h1>
          <p className="text-gray-400 mt-1">Automate customer communication on WhatsApp</p>
        </div>
        {activeTab === 'overview' && (
          <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Campaign
          </button>
        )}
      </div>

      <div className="border-b border-gray-800">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'text-white border-green-500'
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
                  ? 'text-white border-green-500'
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
            <h3 className="text-xl font-bold text-white mb-4">Message Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="messages" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Messages</h3>
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      {msg.contact.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{msg.contact}</p>
                      <p className="text-sm text-gray-400">{msg.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{msg.time}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      msg.status === 'read' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {msg.status}
                    </span>
                  </div>
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
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={settings.status}
                  onChange={(e) => setSettings({ ...settings, status: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500"
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
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
