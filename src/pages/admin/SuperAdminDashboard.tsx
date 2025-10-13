import { Building2, Users, Zap, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SuperAdminDashboard() {
  const stats = [
    { label: 'Total Companies', value: '12', change: '+2 this month', icon: Building2, color: 'blue' },
    { label: 'Total Users', value: '234', change: '+45 this month', icon: Users, color: 'green' },
    { label: 'Active Services', value: '47', change: '+8 this month', icon: Zap, color: 'purple' },
    { label: 'Monthly Revenue', value: '$8,247', change: '+12%', icon: DollarSign, color: 'yellow' },
  ];

  const revenueData = [
    { month: 'Jul', revenue: 5420 },
    { month: 'Aug', revenue: 6180 },
    { month: 'Sep', revenue: 7240 },
    { month: 'Oct', revenue: 6890 },
    { month: 'Nov', revenue: 7890 },
    { month: 'Dec', revenue: 8247 },
  ];

  const serviceUsage = [
    { service: 'WhatsApp', companies: 8 },
    { service: 'Instagram', companies: 5 },
    { service: 'Text-to-Video', companies: 4 },
    { service: 'E-Commerce', companies: 6 },
    { service: 'Mobile App', companies: 3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Complete system overview and analytics</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Service Usage by Companies</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={serviceUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="service" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="companies" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Pending Service Requests</h3>
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
            3 pending
          </span>
        </div>
        <div className="space-y-3">
          {[
            { company: 'Tech Corp', service: 'WhatsApp Automation', time: '2 hours ago' },
            { company: 'Digital Agency', service: 'Voice Cloning', time: '5 hours ago' },
            { company: 'Law Firm Qatar', service: 'Document AI', time: '1 day ago' },
          ].map((request, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{request.company}</p>
                  <p className="text-sm text-gray-400">{request.service} • {request.time}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                  Approve
                </button>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
