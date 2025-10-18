import { useState } from 'react';
import { Search, MessageCircle, Instagram, TrendingUp, Building2, DollarSign, Settings } from 'lucide-react';

export default function ServicesCatalog() {
  const [searchTerm, setSearchTerm] = useState('');

  const activeServices = [
    {
      id: 'whatsapp-automation',
      name: 'WhatsApp Automation',
      status: 'Active',
      since: '2024-03-15',
      package: 'Professional',
      nextBilling: '2025-02-15',
      price: 299,
      description: 'Automate your WhatsApp business communications with AI-powered chatbot. Handle customer inquiries 24/7, track conversations, and improve response times.',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-600',
      companies_using: 4,
      total_revenue: 1196,
      managementPage: 'whatsapp-service-management'
    },
    {
      id: 'instagram-automation',
      name: 'Instagram Automation',
      status: 'Active',
      since: '2024-04-20',
      package: 'Professional',
      nextBilling: '2025-02-20',
      price: 299,
      description: 'AI-powered Instagram comment responses and DM automation. Engage with your audience 24/7, track conversations, and analyze sentiment.',
      icon: Instagram,
      color: 'from-pink-500 to-purple-600',
      companies_using: 2,
      total_revenue: 598,
      managementPage: 'instagram-service-management'
    },
  ];

  const filteredServices = activeServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = activeServices.reduce((sum, s) => sum + s.total_revenue, 0);
  const totalCompanies = activeServices.reduce((sum, s) => sum + s.companies_using, 0);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Services Catalog</h1>
          <p className="text-gray-400">Manage automation services and view usage across all companies</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Active Services</p>
                <p className="text-3xl font-bold text-white">{activeServices.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-green-500">All services operational</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Companies</p>
                <p className="text-3xl font-bold text-white">{totalCompanies}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-gray-400">Using services</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold text-white">${totalRevenue}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-green-500">↑ 12% from last month</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Avg. Package Price</p>
                <p className="text-3xl font-bold text-white">${activeServices[0]?.price || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Settings className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-gray-400">Professional tier</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">Active Services</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{service.name}</h3>
                      <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-500 rounded-full text-xs font-medium">
                        {service.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  {service.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Package</p>
                    <p className="text-sm font-semibold text-white">{service.package}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Price</p>
                    <p className="text-sm font-semibold text-white">${service.price}/month</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Companies Using</p>
                    <p className="text-sm font-semibold text-white">{service.companies_using}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Total Revenue</p>
                    <p className="text-sm font-semibold text-white">${service.total_revenue}</p>
                  </div>
                </div>

                <button
                  onClick={() => window.location.hash = service.managementPage}
                  className={`w-full px-6 py-3 bg-gradient-to-r ${service.color} hover:opacity-90 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2`}
                >
                  <Settings className="w-5 h-5" />
                  Manage Service
                </button>
              </div>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No services found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
