import { Video, Play, Clock, Download, TrendingUp, Zap, Plus, Settings as SettingsIcon, Save } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { getCurrentMockUser } from '../../utils/mockAuth';

export default function TextToVideoAI() {
  const mockUser = getCurrentMockUser();
  const isSuperAdmin = mockUser.role === 'super_admin';
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  const [settings, setSettings] = useState({
    serviceName: 'Text-to-Video AI',
    description: 'Generate videos from text descriptions using AI',
    status: 'active',
    pricing: {
      basic: { name: 'Basic', price: 299, features: ['Up to 20 videos/month', '720p quality', 'Email support'] },
      pro: { name: 'Pro', price: 699, features: ['Up to 100 videos/month', '4K quality', 'Priority support'] },
      enterprise: { name: 'Enterprise', price: 1499, features: ['Unlimited videos', 'Dedicated manager', 'Custom models'] },
    },
  });

  const stats = [
    { label: 'Videos Generated', value: '234', change: '+12%', icon: Video, color: 'purple' },
    { label: 'Total Duration', value: '47min', change: '+8%', icon: Clock, color: 'blue' },
    { label: 'Avg Quality', value: '4K', change: 'Stable', icon: Zap, color: 'green' },
    { label: 'Downloads', value: '189', change: '+15%', icon: Download, color: 'orange' },
  ];

  const usageData = [
    { day: 'Mon', videos: 28 },
    { day: 'Tue', videos: 35 },
    { day: 'Wed', videos: 42 },
    { day: 'Thu', videos: 38 },
    { day: 'Fri', videos: 45 },
    { day: 'Sat', videos: 32 },
    { day: 'Sun', videos: 14 },
  ];

  const recentVideos = [
    { id: '1', prompt: 'A cat playing piano in a jazz club', duration: '15s', quality: '4K', status: 'Completed', thumbnail: '🎹' },
    { id: '2', prompt: 'Sunset over mountains with birds flying', duration: '20s', quality: '1080p', status: 'Completed', thumbnail: '🌄' },
    { id: '3', prompt: 'Futuristic city with flying cars', duration: '30s', quality: '4K', status: 'Processing', thumbnail: '🏙️' },
    { id: '4', prompt: 'Underwater coral reef exploration', duration: '25s', quality: '4K', status: 'Completed', thumbnail: '🐠' },
  ];

  const handleSaveSettings = () => {
    console.log('Saving Text-to-Video AI settings:', settings);
    alert('✅ Text-to-Video AI settings saved successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Text-to-Video AI</h1>
          <p className="text-gray-400 mt-1">Generate videos from text descriptions using AI</p>
        </div>
        {activeTab === 'overview' && (
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Video
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
            <h3 className="text-xl font-bold text-white mb-4">Video Generation This Week</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="videos" stroke="#A855F7" fillOpacity={1} fill="url(#colorVideos)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Videos</h3>
            <div className="space-y-3">
              {recentVideos.map((video) => (
                <div key={video.id} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center text-3xl">
                    {video.thumbnail}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{video.prompt}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{video.duration}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{video.quality}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className={`text-xs ${video.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {video.status}
                      </span>
                    </div>
                  </div>
                  {video.status === 'Completed' && (
                    <button className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                      <Play className="w-5 h-5 text-white" />
                    </button>
                  )}
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
