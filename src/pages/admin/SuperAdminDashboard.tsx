import { Users, Building2, Zap, DollarSign, TrendingUp, Activity, AlertCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const statsData = {
  totalCompanies: 24,
  totalUsers: 156,
  activeServices: 48,
  monthlyRevenue: 108900,
  growth: 12.5,
};

const revenueData = [
  { month: 'Jan', revenue: 45800 },
  { month: 'Feb', revenue: 52400 },
  { month: 'Mar', revenue: 61200 },
  { month: 'Apr', revenue: 58900 },
  { month: 'May', revenue: 67500 },
  { month: 'Jun', revenue: 71200 },
  { month: 'Jul', revenue: 78900 },
  { month: 'Aug', revenue: 82300 },
  { month: 'Sep', revenue: 89400 },
  { month: 'Oct', revenue: 95700 },
  { month: 'Nov', revenue: 102400 },
  { month: 'Dec', revenue: 108900 },
];

const recentActivity = [
  { id: '1', type: 'company', message: 'New company registered: Tech Innovations Inc', time: '5 minutes ago' },
  { id: '2', type: 'service', message: 'Service request approved: WhatsApp Automation for Digital Corp', time: '23 minutes ago' },
  { id: '3', type: 'payment', message: 'Payment received: $2,147 from Tech Corp', time: '1 hour ago' },
  { id: '4', type: 'ticket', message: 'Support ticket resolved: TKT-2024-1589', time: '2 hours ago' },
  { id: '5', type: 'user', message: 'New user invited to Innovation Labs', time: '3 hours ago' },
];

export default function SuperAdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">System overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-200" />
          </div>
          <p className="text-blue-200 text-sm mb-1">Total Companies</p>
          <p className="text-3xl font-bold">{statsData.totalCompanies}</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-200" />
          </div>
          <p className="text-green-200 text-sm mb-1">Total Users</p>
          <p className="text-3xl font-bold">{statsData.totalUsers}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <Activity className="w-5 h-5 text-purple-200" />
          </div>
          <p className="text-purple-200 text-sm mb-1">Active Services</p>
          <p className="text-3xl font-bold">{statsData.activeServices}</p>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-sm text-red-200">+{statsData.growth}%</span>
          </div>
          <p className="text-red-200 text-sm mb-1">Monthly Revenue</p>
          <p className="text-3xl font-bold">${(statsData.monthlyRevenue / 1000).toFixed(1)}K</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Revenue Trend (2024)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => window.location.hash = 'companies-management'}
          className="p-6 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-all hover:scale-105 text-left"
        >
          <Building2 className="w-8 h-8 mb-3" />
          <p className="font-bold text-lg mb-1">Manage Companies</p>
          <p className="text-sm text-blue-200">View and edit company details</p>
        </button>

        <button
          onClick={() => window.location.hash = 'users-management'}
          className="p-6 bg-green-600 hover:bg-green-700 rounded-xl text-white transition-all hover:scale-105 text-left"
        >
          <Users className="w-8 h-8 mb-3" />
          <p className="font-bold text-lg mb-1">Manage Users</p>
          <p className="text-sm text-green-200">View and manage all users</p>
        </button>

        <button
          onClick={() => window.location.hash = 'services-catalog'}
          className="p-6 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-all hover:scale-105 text-left"
        >
          <Zap className="w-8 h-8 mb-3" />
          <p className="font-bold text-lg mb-1">Services Catalog</p>
          <p className="text-sm text-purple-200">Manage service offerings</p>
        </button>
      </div>
    </div>
  );
}
