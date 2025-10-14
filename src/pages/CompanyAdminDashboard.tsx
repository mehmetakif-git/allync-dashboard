import { Zap, MessageCircle, FileText, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CompanyAdminDashboard() {
  const stats = [
    { label: 'Active Services', value: '2', icon: Zap, color: 'blue' },
    { label: 'Messages Today', value: '247', icon: MessageCircle, color: 'green' },
    { label: 'Open Tickets', value: '1', icon: AlertCircle, color: 'orange' },
    { label: 'Next Billing', value: 'Feb 15', icon: Calendar, color: 'purple' },
  ];

  const usageData = [
    { day: 'Mon', messages: 180 },
    { day: 'Tue', messages: 220 },
    { day: 'Wed', messages: 195 },
    { day: 'Thu', messages: 247 },
    { day: 'Fri', messages: 210 },
    { day: 'Sat', messages: 165 },
    { day: 'Sun', messages: 140 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back! Here's your company overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
            </div>
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Your Active Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white">WhatsApp Automation</h4>
                <p className="text-sm text-gray-400">Pro Plan</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Messages Today:</span>
              <span className="font-bold text-white">247</span>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-white">Instagram Automation</h4>
                <p className="text-sm text-gray-400">Basic Plan</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Engagement Rate:</span>
              <span className="font-bold text-white">8.5%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Service Usage This Week</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={usageData}>
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
            <Line type="monotone" dataKey="messages" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { icon: MessageCircle, text: 'WhatsApp: 247 messages handled today', time: '2 hours ago', color: 'text-green-500' },
            { icon: FileText, text: 'New invoice generated: $599', time: '5 hours ago', color: 'text-blue-500' },
            { icon: AlertCircle, text: 'Support ticket opened', time: '1 day ago', color: 'text-orange-500' },
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
              <div className={`w-10 h-10 ${activity.color} bg-opacity-20 rounded-lg flex items-center justify-center`}>
                <activity.icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{activity.text}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
