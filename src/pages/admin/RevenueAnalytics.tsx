import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const monthlyRevenueData = [
  { month: 'Jan', revenue: 45000, expenses: 22000, profit: 23000 },
  { month: 'Feb', revenue: 52000, expenses: 24000, profit: 28000 },
  { month: 'Mar', revenue: 48000, expenses: 23000, profit: 25000 },
  { month: 'Apr', revenue: 61000, expenses: 26000, profit: 35000 },
  { month: 'May', revenue: 55000, expenses: 25000, profit: 30000 },
  { month: 'Jun', revenue: 67000, expenses: 28000, profit: 39000 },
  { month: 'Jul', revenue: 72000, expenses: 30000, profit: 42000 },
  { month: 'Aug', revenue: 68000, expenses: 29000, profit: 39000 },
  { month: 'Sep', revenue: 75000, expenses: 31000, profit: 44000 },
  { month: 'Oct', revenue: 82000, expenses: 33000, profit: 49000 },
  { month: 'Nov', revenue: 78000, expenses: 32000, profit: 46000 },
  { month: 'Dec', revenue: 85000, expenses: 34000, profit: 51000 },
];

const serviceRevenueData = [
  { service: 'WhatsApp AI', revenue: 125000 },
  { service: 'Instagram DM', revenue: 98000 },
  { service: 'Text to Video', revenue: 87000 },
  { service: 'AI Support', revenue: 76000 },
  { service: 'Email Auto', revenue: 65000 },
  { service: 'Analytics', revenue: 54000 },
  { service: 'Voice AI', revenue: 48000 },
  { service: 'Chatbot', revenue: 42000 },
];

interface TopCompany {
  id: string;
  name: string;
  monthlySpend: number;
  services: number;
  growth: number;
}

const topCompanies: TopCompany[] = [
  { id: '1', name: 'Tech Innovators Inc', monthlySpend: 2450, services: 5, growth: 15.3 },
  { id: '2', name: 'Global Solutions Ltd', monthlySpend: 1850, services: 4, growth: 12.7 },
  { id: '3', name: 'Digital Marketing Pro', monthlySpend: 1620, services: 3, growth: -5.2 },
  { id: '4', name: 'E-Commerce Plus', monthlySpend: 1540, services: 4, growth: 23.8 },
  { id: '5', name: 'Creative Studios', monthlySpend: 1320, services: 3, growth: 8.9 },
  { id: '6', name: 'Data Analytics Corp', monthlySpend: 1180, services: 2, growth: 18.4 },
  { id: '7', name: 'Smart Business AI', monthlySpend: 980, services: 2, growth: 6.2 },
  { id: '8', name: 'NextGen Tech', monthlySpend: 875, services: 3, growth: 11.5 },
];

export default function RevenueAnalytics() {
  const [timeRange, setTimeRange] = useState('year');

  const totalRevenue = monthlyRevenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = monthlyRevenueData.reduce((sum, item) => sum + item.profit, 0);
  const avgMonthlyRevenue = totalRevenue / monthlyRevenueData.length;
  const growthRate = ((monthlyRevenueData[11].revenue - monthlyRevenueData[0].revenue) / monthlyRevenueData[0].revenue * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold text-white">Revenue Analytics</h1>
          <p className="text-gray-400 mt-1">Comprehensive financial performance overview</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-2">${(totalRevenue / 1000).toFixed(0)}K</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">{growthRate}%</span>
              </div>
            </div>
            <DollarSign className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Profit</p>
              <p className="text-3xl font-bold text-white mt-2">${(totalProfit / 1000).toFixed(0)}K</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">14.2%</span>
              </div>
            </div>
            <DollarSign className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Monthly</p>
              <p className="text-3xl font-bold text-white mt-2">${(avgMonthlyRevenue / 1000).toFixed(1)}K</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">8.7%</span>
              </div>
            </div>
            <DollarSign className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Companies</p>
              <p className="text-3xl font-bold text-white mt-2">24</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">12.5%</span>
              </div>
            </div>
            <Building2 className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Revenue Trend</h2>
          <p className="text-gray-400 text-sm mt-1">Monthly revenue, expenses, and profit over time</p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                color: '#fff',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue" />
            <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
            <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Revenue by Service</h2>
            <p className="text-gray-400 text-sm mt-1">Top performing services</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={serviceRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="service" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Bar dataKey="revenue" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Top Performing Companies</h2>
            <p className="text-gray-400 text-sm mt-1">Highest revenue contributors</p>
          </div>
          <div className="space-y-3">
            {topCompanies.map((company, index) => (
              <div key={company.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{company.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                        <span>{company.services} services</span>
                        <span>•</span>
                        <span>${company.monthlySpend}/mo</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {company.growth > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`font-medium ${company.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {company.growth > 0 ? '+' : ''}{company.growth}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-white font-medium mb-4">Revenue Sources</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Subscriptions</span>
                <span className="text-white font-medium">72%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">One-time Services</span>
                <span className="text-white font-medium">18%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Add-ons</span>
                <span className="text-white font-medium">10%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-white font-medium mb-4">Customer Retention</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Retention Rate</span>
              <span className="text-white font-medium">94%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Churn Rate</span>
              <span className="text-white font-medium">6%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Avg Lifetime Value</span>
              <span className="text-white font-medium">$18,450</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Customer Acquisition Cost</span>
              <span className="text-white font-medium">$2,340</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-white font-medium mb-4">Growth Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">MoM Growth</span>
              <span className="text-green-400 font-medium">+12.3%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">YoY Growth</span>
              <span className="text-green-400 font-medium">+88.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">New Customers</span>
              <span className="text-white font-medium">8 this month</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Upgrade Rate</span>
              <span className="text-green-400 font-medium">+15.7%</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
