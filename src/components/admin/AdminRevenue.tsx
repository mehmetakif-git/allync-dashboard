import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminRevenue() {
  const stats = [
    { label: 'Total Revenue', value: '$98,745', change: '+23%', trend: 'up', icon: DollarSign },
    { label: 'This Month', value: '$8,247', change: '+12%', trend: 'up', icon: TrendingUp },
    { label: 'Active Subscriptions', value: '42', change: '+8', trend: 'up', icon: CreditCard },
    { label: 'Churn Rate', value: '2.3%', change: '-0.5%', trend: 'down', icon: TrendingDown },
  ];

  const monthlyData = [
    { month: 'Jul', revenue: 5420, subscriptions: 32 },
    { month: 'Aug', revenue: 6180, subscriptions: 35 },
    { month: 'Sep', revenue: 7240, subscriptions: 38 },
    { month: 'Oct', revenue: 6890, subscriptions: 36 },
    { month: 'Nov', revenue: 7890, subscriptions: 40 },
    { month: 'Dec', revenue: 8247, subscriptions: 42 },
  ];

  const companyRevenue = [
    { company: 'Tech Corp', revenue: 599, plan: 'Premium', trend: '+12%' },
    { company: 'Law Firm Qatar', revenue: 599, plan: 'Premium', trend: '+8%' },
    { company: 'Beauty Salon TR', revenue: 299, plan: 'Standard', trend: '+15%' },
    { company: 'Startup Inc', revenue: 99, plan: 'Basic', trend: '-5%' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Revenue Analytics</h2>
        <p className="text-gray-400 text-sm mt-1">Financial overview and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-green-400" />
              </div>
              <span className={`text-xs font-medium flex items-center gap-1 ${
                stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white">Revenue Trend</h3>
          <p className="text-sm text-gray-400 mt-1">Last 6 months performance</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
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
            <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue ($)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Subscription Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="subscriptions" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Subscriptions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Top Revenue Companies</h3>
          <div className="space-y-3">
            {companyRevenue.map((company, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded-lg"
              >
                <div>
                  <p className="font-medium text-white">{company.company}</p>
                  <p className="text-sm text-gray-400">{company.plan}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">${company.revenue}</p>
                  <p className={`text-xs ${company.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {company.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
