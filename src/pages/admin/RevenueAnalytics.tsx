import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CheckCircle, Clock, Building2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthlyRevenue = [
  { month: 'Jan', revenue: 45800, paid: 42300, pending: 3500 },
  { month: 'Feb', revenue: 52400, paid: 48900, pending: 3500 },
  { month: 'Mar', revenue: 61200, paid: 55700, pending: 5500 },
  { month: 'Apr', revenue: 58900, paid: 56400, pending: 2500 },
  { month: 'May', revenue: 67500, paid: 63200, pending: 4300 },
  { month: 'Jun', revenue: 71200, paid: 68700, pending: 2500 },
  { month: 'Jul', revenue: 78900, paid: 75400, pending: 3500 },
  { month: 'Aug', revenue: 82300, paid: 79800, pending: 2500 },
  { month: 'Sep', revenue: 89400, paid: 84900, pending: 4500 },
  { month: 'Oct', revenue: 95700, paid: 91200, pending: 4500 },
  { month: 'Nov', revenue: 102400, paid: 97900, pending: 4500 },
  { month: 'Dec', revenue: 108900, paid: 103400, pending: 5500 },
];

const topCompanies = [
  { name: 'Tech Corp', revenue: 38640, growth: 15.3 },
  { name: 'Digital Solutions Inc', revenue: 28450, growth: 8.7 },
  { name: 'Innovation Labs', revenue: 24890, growth: 12.1 },
  { name: 'Global Systems', revenue: 19340, growth: -3.2 },
  { name: 'Future Dynamics', revenue: 16780, growth: 22.5 },
];

const serviceRevenue = [
  { name: 'WhatsApp Automation', value: 89400, color: '#3b82f6' },
  { name: 'Text-to-Video AI', value: 67800, color: '#8b5cf6' },
  { name: 'Instagram Automation', value: 45600, color: '#ec4899' },
  { name: 'Voice Cloning', value: 34200, color: '#f59e0b' },
  { name: 'Other Services', value: 28900, color: '#10b981' },
];

export default function RevenueAnalytics() {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const totalPaid = monthlyRevenue.reduce((sum, m) => sum + m.paid, 0);
  const totalPending = monthlyRevenue.reduce((sum, m) => sum + m.pending, 0);
  const currentMonth = monthlyRevenue[monthlyRevenue.length - 1];
  const previousMonth = monthlyRevenue[monthlyRevenue.length - 2];
  const growth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Revenue Analytics</h1>
          <p className="text-gray-400 mt-1">Financial overview and performance metrics</p>
        </div>
        <div className="flex gap-2">
          {['month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                timeRange === range
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${parseFloat(growth) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {parseFloat(growth) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(parseFloat(growth))}%
            </div>
          </div>
          <p className="text-blue-200 text-sm mb-1">Total Revenue (YTD)</p>
          <p className="text-3xl font-bold">${(totalRevenue / 1000).toFixed(1)}K</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-green-200 text-sm mb-1">Paid Invoices</p>
          <p className="text-3xl font-bold">${(totalPaid / 1000).toFixed(1)}K</p>
          <p className="text-sm text-green-200 mt-1">{((totalPaid / totalRevenue) * 100).toFixed(1)}% collection rate</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-yellow-200 text-sm mb-1">Pending Payments</p>
          <p className="text-3xl font-bold">${(totalPending / 1000).toFixed(1)}K</p>
          <p className="text-sm text-yellow-200 mt-1">{((totalPending / totalRevenue) * 100).toFixed(1)}% pending</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-purple-200 text-sm mb-1">Average MRR</p>
          <p className="text-3xl font-bold">${(totalRevenue / 12 / 1000).toFixed(1)}K</p>
          <p className="text-sm text-purple-200 mt-1">Monthly Recurring Revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Total Revenue" />
              <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} name="Paid" />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Revenue by Service</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceRevenue}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {serviceRevenue.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                formatter={(value: any) => `$${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Top Revenue Companies</h3>
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View All →
          </button>
        </div>
        <div className="space-y-4">
          {topCompanies.map((company, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">{company.name}</p>
                  <p className="text-sm text-gray-400">#{idx + 1} Revenue Generator</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-white text-lg">${company.revenue.toLocaleString()}</p>
                <div className={`flex items-center gap-1 text-sm ${company.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {company.growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(company.growth)}% this month
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Monthly Performance Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="paid" fill="#10b981" name="Paid" radius={[8, 8, 0, 0]} />
            <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
