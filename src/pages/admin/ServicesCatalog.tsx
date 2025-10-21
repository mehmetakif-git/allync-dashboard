import { useState } from 'react';
import { Search, MessageCircle, Instagram, TrendingUp, Building2, DollarSign, Settings, Calendar, Sheet, Mail, FileText, FolderOpen, Image, X, AlertTriangle, Globe, Smartphone } from 'lucide-react';

export default function ServicesCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'maintenance' | 'inactive'>('active');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const activeServices = [
    {
      id: 'whatsapp-automation',
      name: 'WhatsApp Automation',
      status: 'active',
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
      status: 'active',
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
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      status: 'active',
      since: '2024-06-10',
      package: 'Professional',
      nextBilling: '2025-02-10',
      price: 399,
      description: 'WhatsApp appointment booking with Google Calendar sync. Customers book appointments via WhatsApp, automatically synced to your calendar.',
      icon: Calendar,
      color: 'from-blue-500 to-blue-700',
      companies_using: 2,
      total_revenue: 598,
      managementPage: 'google-calendar-management'
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      status: 'active',
      since: '2024-07-15',
      package: 'Professional',
      nextBilling: '2025-02-15',
      price: 299,
      description: 'WhatsApp data queries from Google Sheets. Query inventory, check stock, get pricing directly through WhatsApp conversations.',
      icon: Sheet,
      color: 'from-green-600 to-green-800',
      companies_using: 2,
      total_revenue: 448,
      managementPage: 'google-sheets-management'
    },
    {
      id: 'gmail-integration',
      name: 'Gmail Integration',
      status: 'active',
      since: '2024-08-01',
      package: 'Professional',
      nextBilling: '2025-02-01',
      price: 349,
      description: 'Send and receive emails via WhatsApp with Gmail integration. Manage inbox, send responses, get AI-powered email summaries.',
      icon: Mail,
      color: 'from-red-500 to-red-700',
      companies_using: 2,
      total_revenue: 528,
      managementPage: 'gmail-integration-management'
    },
    {
      id: 'google-docs',
      name: 'Google Docs',
      status: 'active',
      since: '2024-09-05',
      package: 'Professional',
      nextBilling: '2025-02-05',
      price: 399,
      description: 'AI document generation via WhatsApp saved to Google Docs. Generate contracts, reports, proposals through WhatsApp.',
      icon: FileText,
      color: 'from-blue-600 to-cyan-600',
      companies_using: 2,
      total_revenue: 598,
      managementPage: 'google-docs-management'
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      status: 'active',
      since: '2024-10-15',
      package: 'Professional',
      nextBilling: '2025-02-15',
      price: 299,
      description: 'File management via WhatsApp with Google Drive. Upload, organize, share files directly through WhatsApp conversations.',
      icon: FolderOpen,
      color: 'from-yellow-500 to-yellow-700',
      companies_using: 2,
      total_revenue: 448,
      managementPage: 'google-drive-management'
    },
    {
      id: 'google-photos',
      name: 'Google Photos',
      status: 'active',
      since: '2024-11-25',
      package: 'Professional',
      nextBilling: '2025-02-25',
      price: 259,
      description: 'Photo management via WhatsApp with Google Photos. Upload, organize, search photos with AI-powered tagging.',
      icon: Image,
      color: 'from-purple-500 to-pink-600',
      companies_using: 2,
      total_revenue: 388,
      managementPage: 'google-photos-management'
    },
    {
      id: 'website-development',
      name: 'Website Development',
      status: 'active',
      since: '2024-12-01',
      package: 'Professional',
      nextBilling: '2025-02-01',
      price: 299,
      description: 'Professional website development - E-commerce, Corporate, Personal websites with milestone tracking',
      icon: Globe,
      color: 'from-purple-500 to-blue-500',
      companies_using: 1,
      total_revenue: 299,
      managementPage: 'website-service-management'
    },
    {
      id: 'mobile-app-development',
      name: 'Mobile App Development',
      status: 'active',
      since: '2024-12-01',
      package: 'Professional',
      nextBilling: '2025-02-01',
      price: 399,
      description: 'Professional mobile app development for Android and iOS with app store publishing support',
      icon: Smartphone,
      color: 'from-cyan-500 to-blue-600',
      companies_using: 1,
      total_revenue: 399,
      managementPage: 'mobile-app-service-management'
    },
  ];

  const filteredServices = activeServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = activeServices.reduce((sum, s) => sum + s.total_revenue, 0);
  const totalCompanies = activeServices.reduce((sum, s) => sum + s.companies_using, 0);

  const handleStatusChange = (service: any, status: 'active' | 'maintenance' | 'inactive') => {
    setSelectedService(service);
    setSelectedStatus(status);
    setShowStatusModal(true);
  };

  const confirmStatusChange = () => {
    console.log('Updating service status:', {
      serviceId: selectedService.id,
      newStatus: selectedStatus
    });

    const statusMessages = {
      active: 'Service activated successfully!',
      maintenance: 'Service set to maintenance mode. Users can see it but cannot request it.',
      inactive: 'Service deactivated. Only Super Admins can see it now.'
    };

    setSuccessMessage(statusMessages[selectedStatus]);
    setShowSuccessMessage(true);
    setShowStatusModal(false);

    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 4000);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          text: 'Active',
          color: 'bg-green-500',
          textColor: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          icon: '✓'
        };
      case 'maintenance':
        return {
          text: 'Maintenance',
          color: 'bg-orange-500',
          textColor: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
          icon: '🔧'
        };
      case 'inactive':
        return {
          text: 'Inactive',
          color: 'bg-red-500',
          textColor: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          icon: '✕'
        };
      default:
        return {
          text: 'Unknown',
          color: 'bg-gray-500',
          textColor: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
          icon: '?'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Services Catalog</h1>
          <p className="text-gray-400">Manage automation services and view usage across all companies</p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <p className="text-green-500 font-semibold">Status Updated!</p>
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
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
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <p className="text-xs text-gray-400">Professional tier</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
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

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((service) => {
            const Icon = service.icon;
            const statusInfo = getStatusInfo(service.status);

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
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 ${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-full`}>
                        <span className="text-sm">{statusInfo.icon}</span>
                        <span className={`text-xs font-medium ${statusInfo.textColor}`}>{statusInfo.text}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  {service.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Package</p>
                    <p className="text-sm font-semibold text-white">{service.package}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Price</p>
                    <p className="text-sm font-semibold text-white">${service.price}/month</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Companies Using</p>
                    <p className="text-sm font-semibold text-white">{service.companies_using}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-sm font-semibold text-white">${service.total_revenue}</p>
                  </div>
                </div>

                <button
                  onClick={() => window.location.hash = service.managementPage}
                  className={`w-full px-6 py-3 bg-gradient-to-r ${service.color} hover:opacity-90 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 mb-4`}
                >
                  <Settings className="w-5 h-5" />
                  Manage Service
                </button>

                {/* Status Control Buttons - IMPROVED */}
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">Change Service Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStatusChange(service, 'active')}
                      className={`px-4 py-3 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${
                        service.status === 'active'
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/50 ring-2 ring-green-400'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      ✓ Active
                    </button>
                    <button
                      onClick={() => handleStatusChange(service, 'maintenance')}
                      className={`px-4 py-3 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${
                        service.status === 'maintenance'
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50 ring-2 ring-orange-400'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      🔧 Maintenance
                    </button>
                    <button
                      onClick={() => handleStatusChange(service, 'inactive')}
                      className={`px-4 py-3 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${
                        service.status === 'inactive'
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 ring-2 ring-red-400'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      ✕ Inactive
                    </button>
                  </div>
                </div>
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

      {/* Confirmation Modal */}
      {showStatusModal && selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirm Status Change</h3>
              <p className="text-gray-400 text-sm">
                You are about to change <span className="text-white font-semibold">{selectedService.name}</span> status to:
              </p>
            </div>

            <div className="p-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 ${getStatusInfo(selectedStatus).bgColor} border ${getStatusInfo(selectedStatus).borderColor} rounded-lg mb-4`}>
                <span className="text-xl">{getStatusInfo(selectedStatus).icon}</span>
                <span className={`font-bold ${getStatusInfo(selectedStatus).textColor}`}>{getStatusInfo(selectedStatus).text}</span>
              </div>
              <p className="text-gray-400 text-sm">
                {selectedStatus === 'active' && 'Service will be fully visible and requestable by all users.'}
                {selectedStatus === 'maintenance' && 'Service will be visible but users cannot request it. Pricing will be hidden.'}
                {selectedStatus === 'inactive' && 'Service will be hidden from all users except Super Admins.'}
              </p>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className={`flex-1 px-6 py-3 ${getStatusInfo(selectedStatus).color} hover:opacity-90 text-white rounded-lg font-medium transition-all`}
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
