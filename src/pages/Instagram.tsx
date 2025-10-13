import { useState } from 'react';
import { Instagram as InstagramIcon, Settings, TrendingUp, Users, MessageCircle, Calendar, BarChart3, Heart, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  { id: 6, time: '18 min ago', type: 'Comment', user: '@creative_mind', message: 'Auto-liked comment', status: 'success' },
  { id: 7, time: '22 min ago', type: 'DM', user: '@startup_life', message: 'Auto-replied with demo link', status: 'success' },
  { id: 8, time: '25 min ago', type: 'Comment', user: '@design_studio', message: 'Auto-replied to mention', status: 'success' },
  { id: 9, time: '28 min ago', type: 'DM', user: '@marketing_expert', message: 'Failed to send response', status: 'failed' },
  { id: 10, time: '32 min ago', type: 'Comment', user: '@photo_daily', message: 'Auto-replied with link', status: 'success' },
];

export default function Instagram() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'settings'>('overview');

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
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

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
        <h2 className="text-xl font-bold text-white mb-4">Active Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            { name: 'Otomatik DM yanıtları', icon: Send },
            { name: 'Yorum yönetimi', icon: MessageCircle },
            { name: 'Hashtag analizi', icon: BarChart3 },
            { name: 'Etkileşim raporları', icon: TrendingUp },
            { name: 'Lead generation', icon: Users },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all group">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium text-sm">{feature.name}</span>
              </div>
            );
          })}
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
                    {activity.status === 'failed' && (
                      <div className="flex items-center gap-1 text-red-400 text-sm">
                        <XCircle className="w-4 h-4" />
                        <span>Failed</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30">
          <Calendar className="w-5 h-5" />
          Schedule Post
        </button>
        <button className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
          <BarChart3 className="w-5 h-5" />
          View Analytics
        </button>
        <button className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Manage Responses
        </button>
      </div>
    </div>
  );
}
