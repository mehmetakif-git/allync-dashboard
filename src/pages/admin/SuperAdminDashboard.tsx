import { Building2, Users, Zap, DollarSign, Clock, AlertCircle, FileText, Activity, TrendingUp, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { companies } from '../../data/mockData';
import { mockServiceRequests } from '../../data/serviceRequests';
import { tickets } from '../../data/mockData';
import { invoices } from '../../data/mockData';
import { activityLogs } from '../../data/mockData';
import { serviceTypes } from '../../data/services';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  gradient: string;
  change?: string;
  onClick?: () => void;
}

function StatCard({ title, value, icon: Icon, gradient, change, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 ${onClick ? 'cursor-pointer hover:border-gray-600 transition-all' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">{change}</span>
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const activeServices = serviceTypes.filter(s => s.status === 'active').length;
  const pendingRequests = mockServiceRequests.filter(r => r.status === 'pending').length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const pendingInvoices = invoices.filter(i => i.status === 'Pending').length;
  const monthlyRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handleNavigate = (page: string) => {
    window.location.hash = page;
  };

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 61000 },
    { month: 'Apr', revenue: 58000 },
    { month: 'May', revenue: 68000 },
    { month: 'Jun', revenue: 73000 },
    { month: 'Jul', revenue: 79000 },
    { month: 'Aug', revenue: 85000 },
    { month: 'Sep', revenue: 89000 },
    { month: 'Oct', revenue: 95000 },
    { month: 'Nov', revenue: 102000 },
    { month: 'Dec', revenue: 108900 },
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Super Admin Dashboard</h1>
          <p className="text-gray-400">System overview and key metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Companies"
            value={companies.length}
            icon={Building2}
            gradient="from-blue-500 to-cyan-600"
            change="+12%"
            onClick={() => handleNavigate('companies-management')}
          />
          <StatCard
            title="Total Users"
            value={156}
            icon={Users}
            gradient="from-green-500 to-emerald-600"
            change="+8%"
            onClick={() => handleNavigate('users-management')}
          />
          <StatCard
            title="Active Services"
            value={activeServices}
            icon={Zap}
            gradient="from-purple-500 to-pink-600"
            onClick={() => handleNavigate('services-catalog')}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${(monthlyRevenue / 1000).toFixed(1)}K`}
            icon={DollarSign}
            gradient="from-red-500 to-orange-600"
            change="+12.5%"
            onClick={() => handleNavigate('revenue-analytics')}
          />
          <StatCard
            title="Pending Requests"
            value={pendingRequests}
            icon={Clock}
            gradient="from-yellow-500 to-orange-600"
            onClick={() => handleNavigate('services-catalog')}
          />
          <StatCard
            title="Open Tickets"
            value={openTickets}
            icon={AlertCircle}
            gradient="from-blue-500 to-purple-600"
            onClick={() => handleNavigate('support-tickets')}
          />
          <StatCard
            title="Pending Invoices"
            value={pendingInvoices}
            icon={FileText}
            gradient="from-cyan-500 to-blue-600"
            onClick={() => handleNavigate('invoices-management')}
          />
          <StatCard
            title="System Uptime"
            value="99.9%"
            icon={Activity}
            gradient="from-green-500 to-teal-600"
            onClick={() => handleNavigate('system-settings')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Revenue Trend (2024)</h2>
            <div className="relative h-64">
              <svg className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="rgb(239, 68, 68)"
                  strokeWidth="2"
                  points={revenueData.map((d, i) => {
                    const x = (i / (revenueData.length - 1)) * 100;
                    const y = 100 - (d.revenue / maxRevenue) * 100;
                    return `${x}%,${y}%`;
                  }).join(' ')}
                />
                {revenueData.map((d, i) => {
                  const x = (i / (revenueData.length - 1)) * 100;
                  const y = 100 - (d.revenue / maxRevenue) * 100;
                  return (
                    <circle
                      key={i}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="4"
                      fill="rgb(239, 68, 68)"
                    />
                  );
                })}
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
                {revenueData.map((d, i) => (
                  <span key={i}>{d.month}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Service Requests Status</h2>
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="transparent"
                    stroke="rgb(251, 146, 60)"
                    strokeWidth="40"
                    strokeDasharray={`${(pendingRequests / mockServiceRequests.length) * 502} 502`}
                    transform="rotate(-90 100 100)"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="transparent"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="40"
                    strokeDasharray={`${(mockServiceRequests.filter(r => r.status === 'approved').length / mockServiceRequests.length) * 502} 502`}
                    strokeDashoffset={`-${(pendingRequests / mockServiceRequests.length) * 502}`}
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{mockServiceRequests.length}</p>
                    <p className="text-sm text-gray-400">Total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm text-gray-400">Pending ({pendingRequests})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-400">Approved ({mockServiceRequests.filter(r => r.status === 'approved').length})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Pending Service Requests</h2>
              <button
                onClick={() => handleNavigate('services-catalog')}
                className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {mockServiceRequests.filter(r => r.status === 'pending').slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  onClick={() => handleNavigate('services-catalog')}
                  className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{request.service_name}</span>
                    <span className="px-2 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-xs text-orange-500">
                      Pending
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{request.company_name}</span>
                    <span className="text-gray-500 text-xs">{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Latest Support Tickets</h2>
              <button
                onClick={() => handleNavigate('support-tickets')}
                className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {tickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleNavigate('support-tickets')}
                  className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white text-sm">{ticket.subject}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      ticket.priority === 'Urgent' ? 'bg-red-500/10 border border-red-500/30 text-red-500' :
                      ticket.priority === 'High' ? 'bg-orange-500/10 border border-orange-500/30 text-orange-500' :
                      'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{ticket.createdBy}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      ticket.status === 'Open' ? 'bg-blue-500/10 text-blue-500' :
                      ticket.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Companies</h2>
            <button
              onClick={() => handleNavigate('companies-management')}
              className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {companies.slice(0, 3).map((company) => (
              <div
                key={company.id}
                onClick={() => handleNavigate('companies-management')}
                className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    company.status === 'Active' ? 'bg-green-500/10 border border-green-500/30 text-green-500' :
                    'bg-red-500/10 border border-red-500/30 text-red-500'
                  }`}>
                    {company.status}
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-1">{company.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{company.country}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{company.activeServicesCount} Services</span>
                  <span>{new Date(company.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <button
              onClick={() => handleNavigate('activity-logs')}
              className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {activityLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                onClick={() => handleNavigate('activity-logs')}
                className="flex items-start gap-4 p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{log.action}</span>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-400">{log.details}</p>
                  <p className="text-xs text-gray-500 mt-1">{log.user} • {log.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
