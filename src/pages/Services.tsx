import { useState } from 'react';
import { Search, Filter, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { serviceTypes, mockCompanyRequests } from '../data/services';
import { getCurrentMockUser } from '../utils/mockAuth';
import { useAuth } from '../context/AuthContext';

export default function Services() {
  console.log('🔵 RENDERING SERVICES - COMPANY/USER');

  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  if (isSuperAdmin) {
    window.location.hash = '#services-catalog';
    return null;
  }

  const mockUser = getCurrentMockUser();
  const isCompanyAdmin = mockUser.role === 'company_admin';
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const filteredServices = serviceTypes.filter(service => {
    const matchesSearch = service.name_en.toLowerCase().includes(search.toLowerCase()) ||
                         service.description_en.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getServiceStatus = (serviceId: string) => {
    const request = mockCompanyRequests[serviceId];
    if (!request) return 'not-requested';
    return request.status;
  };

  const handleRequestService = (service: any) => {
    setSelectedService(service);
    setShowRequestModal(true);
  };

  const handleSendRequest = (plan: string, message: string) => {
    console.log('Request sent:', { service: selectedService.id, plan, message });
    alert(
      `✅ Service Request Sent!\n\n` +
      `Service: ${selectedService.name_en}\n` +
      `Plan: ${plan}\n` +
      `Message: ${message}\n\n` +
      `Your request has been sent to Super Admin for approval.`
    );
    setShowRequestModal(false);
    setSelectedService(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'ai', name: 'AI Services' },
    { id: 'digital', name: 'Digital Services' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Services Catalog</h1>
          <p className="text-gray-400 mt-1">
            {isCompanyAdmin ? 'Browse and request services for your company' : 'All available services'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const Icon = service.icon;
          const status = getServiceStatus(service.id);
          const isApproved = status === 'approved';
          const isPending = status === 'pending';
          const isRejected = status === 'rejected';
          const canRequest = isCompanyAdmin && status === 'not-requested';

          return (
            <div
              key={service.id}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-800/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {getStatusBadge(status)}
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{service.name_en}</h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{service.description_en}</p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">Starting from</p>
                  <p className="text-xl font-bold text-white">${service.pricing.basic}</p>
                  <p className="text-xs text-gray-400">/month</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Delivery</p>
                  <p className="text-sm font-medium text-white">{service.delivery}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedService(service)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  View Details
                </button>

                {canRequest && (
                  <button
                    onClick={() => handleRequestService(service)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Request
                  </button>
                )}

                {isPending && (
                  <button
                    disabled
                    className="flex-1 px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm font-medium cursor-not-allowed"
                  >
                    Pending...
                  </button>
                )}

                {isRejected && (
                  <button
                    onClick={() => handleRequestService(service)}
                    className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Re-Request
                  </button>
                )}

                {isApproved && (
                  <button
                    className="flex-1 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm font-medium cursor-default"
                  >
                    Active
                  </button>
                )}
              </div>

              {!isCompanyAdmin && status === 'not-requested' && (
                <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <p className="text-xs text-orange-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Contact Company Admin to request this service
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedService && !showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${selectedService.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <selectedService.icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedService.name_en}</h2>
                <p className="text-gray-400">{selectedService.description_en}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Pricing Plans</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(selectedService.pricing).map(([plan, price]) => (
                    <div key={plan} className="border border-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1 capitalize">{plan}</p>
                      <p className="text-2xl font-bold text-white">${price}</p>
                      <p className="text-xs text-gray-500">/month</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">Features</h3>
                <ul className="space-y-2">
                  {selectedService.features?.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={() => setSelectedService(null)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              {isCompanyAdmin && getServiceStatus(selectedService.id) === 'not-requested' && (
                <button
                  onClick={() => {
                    setShowRequestModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Request This Service
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showRequestModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Request Service</h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-400 mb-2">Service</p>
                <p className="text-white font-medium">{selectedService.name_en}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Select Plan
                </label>
                <select
                  id="plan"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
                >
                  <option value="basic">Basic - ${selectedService.pricing.basic}/mo</option>
                  <option value="pro">Pro - ${selectedService.pricing.pro}/mo</option>
                  <option value="enterprise">Enterprise - ${selectedService.pricing.enterprise}/mo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Additional Message (Optional)
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Any specific requirements or questions..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedService(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const plan = (document.getElementById('plan') as HTMLSelectElement).value;
                  const message = (document.getElementById('message') as HTMLTextAreaElement).value;
                  handleSendRequest(plan, message);
                }}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
