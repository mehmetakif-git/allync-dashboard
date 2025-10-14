import { useState } from 'react';
import { Instagram as InstagramIcon, Settings as SettingsIcon, TrendingUp, Users, MessageCircle, Calendar, BarChart3, Heart, Send, Clock, CheckCircle, XCircle, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCurrentMockUser } from '../utils/mockAuth';

const engagementData = [
  { day: 'Mon', comments: 145, dms: 89 },
  { day: 'Tue', comments: 178, dms: 102 },
  { day: 'Wed', comments: 156, dms: 95 },
  { day: 'Thu', comments: 198, dms: 118 },
  { day: 'Fri', comments: 212, dms: 134 },
  { day: 'Sat', comments: 189, dms: 121 },
  { day: 'Sun', comments: 167, dms: 108 },
];

const recentActivity = [
  { id: 1, time: '2 min ago', type: 'DM', user: '@sarah_designs', message: 'Auto-replied to product inquiry', status: 'success' },
  { id: 2, time: '5 min ago', type: 'Comment', user: '@mike_photo', message: 'Auto-liked and replied', status: 'success' },
  { id: 3, time: '8 min ago', type: 'DM', user: '@tech_guru_99', message: 'Auto-replied with pricing info', status: 'success' },
  { id: 4, time: '12 min ago', type: 'Comment', user: '@fashion_lover', message: 'Auto-replied to question', status: 'success' },
  { id: 5, time: '15 min ago', type: 'DM', user: '@business_pro', message: 'Forwarded to human agent', status: 'pending' },
];

export default function Instagram() {
  const mockUser = getCurrentMockUser();
  const isSuperAdmin = mockUser.role === 'super_admin';
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  const [settings, setSettings] = useState({
    serviceName: 'Instagram Automation',
    description: 'Automate your Instagram engagement and content scheduling with AI',
    status: 'active',
    pricing: {
      basic: { name: 'Basic', price: 149, features: ['Up to 30 posts/month', 'Basic scheduling', 'Email support'] },
      pro: { name: 'Pro', price: 399, features: ['Up to 120 posts/month', 'AI captions', 'Priority support', 'Analytics'] },
      enterprise: { name: 'Enterprise', price: 999, features: ['Unlimited posts', 'Dedicated manager', '24/7 support', 'Custom integrations'] },
    },
  });

  const handleSaveSettings = () => {
    console.log('Saving Instagram settings:', settings);
    alert('✅ Instagram Automation settings saved successfully!');
  };

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
            <InstagramIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Instagram Automation</h1>
            <p className="text-gray-400 mt-1">DM automation, comment management and engagement boost</p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-800">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'text-white border-pink-500'
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
                  ? 'text-white border-pink-500'
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
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-pink-500/10 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Total Messages</p>
                <MessageCircle className="w-5 h-5 text-pink-500" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">8,732</p>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+12% vs last month</span>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Followers</p>
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">15,420</p>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+8% vs last month</span>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-pink-500/10 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Engagement Rate</p>
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">8.5%</p>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+0.3% vs last month</span>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Posts Scheduled</p>
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">145</p>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+15 this week</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Engagement Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="comments"
                  stroke="#EC4899"
                  strokeWidth={2}
                  name="Comments"
                  dot={{ fill: '#EC4899', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="dms"
                  stroke="#A855F7"
                  strokeWidth={2}
                  name="DMs"
                  dot={{ fill: '#A855F7', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity) => (
                    <tr key={activity.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {activity.time}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.type === 'DM'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-pink-500/20 text-pink-400'
                        }`}>
                          {activity.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-white font-medium">{activity.user}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">{activity.message}</td>
                      <td className="py-3 px-4">
                        {activity.status === 'success' && (
                          <div className="flex items-center gap-1 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>Success</span>
                          </div>
                        )}
                        {activity.status === 'pending' && (
                          <div className="flex items-center gap-1 text-yellow-400 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Pending</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={settings.status}
                  onChange={(e) => setSettings({ ...settings, status: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-pink-500"
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
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
