import { useState } from 'react';
import { Search, Filter, Grid, List, Settings, CheckCircle, XCircle, Building2, TrendingUp } from 'lucide-react';

export default function ServicesCatalog() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const services = [
    {
      id: 'whatsapp',
      name_en: 'WhatsApp Automation',
      name_tr: 'WhatsApp Otomasyonu',
      description_en: 'Automate your WhatsApp business communications with AI-powered chatbot.',
      icon: '💬',
      color: 'from-green-500 to-emerald-600',
      status: 'active',
      price: 299,
      companies_count: 4,
      total_revenue: 1196,
      managementPage: 'whatsapp-service-management'
    },
    {
      id: 'instagram',
      name_en: 'Instagram Automation',
      name_tr: 'Instagram Otomasyonu',
      description_en: 'AI-powered Instagram comment responses and DM automation.',
      icon: '📸',
      color: 'from-pink-500 to-purple-600',
      status: 'active',
      price: 299,
      companies_count: 2,
      total_revenue: 598,
      managementPage: 'instagram-service-management'
    },
    {
      id: 'facebook',
      name_en: 'Facebook Automation',
      name_tr: 'Facebook Otomasyonu',
      description_en: 'Automate Facebook page messages and comments with AI.',
      icon: '📘',
      color: 'from-blue-500 to-blue-600',
      status: 'pending',
      price: 299,
      companies_count: 0,
      total_revenue: 0,
      managementPage: null
    },
    {
      id: 'twitter',
      name_en: 'Twitter/X Automation',
      name_tr: 'Twitter/X Otomasyonu',
      description_en: 'Automate Twitter engagement and DM responses.',
      icon: '🐦',
      color: 'from-sky-400 to-blue-500',
      status: 'inactive',
      price: 299,
      companies_count: 0,
      total_revenue: 0,
      managementPage: null
    },
    {
      id: 'linkedin',
      name_en: 'LinkedIn Automation',
      name_tr: 'LinkedIn Otomasyonu',
      description_en: 'Automate LinkedIn messaging and engagement.',
      icon: '💼',
      color: 'from-blue-600 to-blue-700',
      status: 'pending',
      price: 399,
      companies_count: 0,
      total_revenue: 0,
      managementPage: null
    },
    {
      id: 'telegram',
      name_en: 'Telegram Automation',
      name_tr: 'Telegram Otomasyonu',
      description_en: 'Automate Telegram bot and channel management.',
      icon: '✈️',
      color: 'from-cyan-400 to-blue-500',
      status: 'inactive',
      price: 249,
      companies_count: 0,
      total_revenue: 0,
      managementPage: null
    },
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name_en.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || service.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: services.length,
    active: services.filter(s => s.status === 'active').length,
    pending: services.filter(s => s.status === 'pending').length,
    inactive: services.filter(s => s.status === 'inactive').length,
    totalRevenue: services.reduce((sum, s) => sum + s.total_revenue, 0),
  };

  const handleApprove = (serviceId: string) => {
    console.log('Approved service:', serviceId);
    alert(`Service ${serviceId} approved!`);
  };

  const handleReject = (serviceId: string) => {
    console.log('Rejected service:', serviceId);
    alert(`Service ${serviceId} rejected!`);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Services Catalog</h1>
          <p className="text-gray-400">Overview and management of all automation services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Services</span>
              <Grid className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Active</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.active}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Pending</span>
              <Filter className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Inactive</span>
              <XCircle className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.inactive}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Revenue</span>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-white">${stats.totalRevenue}</p>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2">
              {(['all', 'active', 'pending', 'inactive'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex gap-2 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-3xl`}>
                    {service.icon}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    service.status === 'active'
                      ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                      : service.status === 'pending'
                      ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500'
                      : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'
                  }`}>
                    {service.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{service.name_en}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{service.description_en}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Price</p>
                    <p className="text-lg font-bold text-white">${service.price}</p>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Companies</p>
                    <p className="text-lg font-bold text-white">{service.companies_count}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {service.status === 'active' && service.managementPage && (
                    <button
                      onClick={() => window.location.hash = service.managementPage!}
                      className={`flex-1 px-4 py-2 bg-gradient-to-r ${service.color} hover:opacity-90 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2`}
                    >
                      <Settings className="w-4 h-4" />
                      Manage Service
                    </button>
                  )}

                  {service.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(service.id)}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(service.id)}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}

                  {service.status === 'inactive' && (
                    <button
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Service</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Companies</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Revenue</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center text-xl`}>
                          {service.icon}
                        </div>
                        <div>
                          <p className="text-white font-medium">{service.name_en}</p>
                          <p className="text-sm text-gray-400">{service.name_tr}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.status === 'active'
                          ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                          : service.status === 'pending'
                          ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500'
                          : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'
                      }`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">${service.price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{service.companies_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">${service.total_revenue}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {service.status === 'active' && service.managementPage && (
                          <button
                            onClick={() => window.location.hash = service.managementPage!}
                            className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Manage Service"
                          >
                            <Settings className="w-5 h-5 text-blue-500" />
                          </button>
                        )}
                        {service.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(service.id)}
                              className="p-2 hover:bg-green-500/10 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </button>
                            <button
                              onClick={() => handleReject(service.id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5 text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
