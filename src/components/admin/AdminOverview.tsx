import { Building2, Users, DollarSign, Zap, TrendingUp, AlertCircle } from 'lucide-react';

export default function AdminOverview() {
  const stats = [
    { label: 'Total Companies', value: '12', change: '+2 this month', icon: Building2, color: 'blue' },
    { label: 'Total Users', value: '234', change: '+45 this month', icon: Users, color: 'green' },
    { label: 'Monthly Revenue', value: '$8,247', change: '+12% from last month', icon: DollarSign, color: 'purple' },
    { label: 'Active Services', value: '47', change: '+8 this month', icon: Zap, color: 'yellow' },
  ];

  const recentCompanies = [
    { name: 'Tech Corp', country: '🇺🇸 US', services: 3, status: 'Active', revenue: '$599', created: '2 days ago' },
    { name: 'Beauty Salon TR', country: '🇹🇷 TR', services: 2, status: 'Active', revenue: '$299', created: '5 days ago' },
    { name: 'Law Firm Qatar', country: '🇶🇦 QA', services: 1, status: 'Active', revenue: '$599', created: '1 week ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6"
          >
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

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recently Added Companies</h3>
        <div className="space-y-3">
          {recentCompanies.map((company, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
                  {company.name.substring(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-white">{company.name}</p>
                  <p className="text-sm text-gray-400">{company.country} • {company.services} services • {company.created}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">{company.revenue}/mo</p>
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                  {company.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Pending Service Requests</h3>
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
            3 pending
          </span>
        </div>
        <div className="space-y-3">
          {[
            { company: 'Tech Corp', service: 'WhatsApp Automation', user: 'John Doe', time: '2 hours ago', id: 'REQ-001' },
            { company: 'Digital Agency', service: 'Voice Cloning', user: 'Sarah Smith', time: '5 hours ago', id: 'REQ-003' },
            { company: 'Law Firm Qatar', service: 'Document AI', user: 'Ali Hassan', time: '1 day ago', id: 'REQ-004' },
          ].map((request, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{request.company}</p>
                  <p className="text-sm text-gray-400">{request.service} • by {request.user}</p>
                  <p className="text-xs text-gray-500">{request.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Approve
                </button>
                <button className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Database</span>
              <span className="text-green-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Storage</span>
              <span className="text-white">45% used (2.5GB / 5GB)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">API Status</span>
              <span className="text-green-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Operational
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-left font-medium transition-colors">
              + Add New Company
            </button>
            <button className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-left font-medium transition-colors">
              + Invite User
            </button>
            <button className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-left font-medium transition-colors flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Enable Maintenance Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
