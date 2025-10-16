import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { serviceTypes } from '../data/services';
import { mockCompanyRequests } from '../data/services';
import { AlertCircle, CheckCircle, Clock, Wrench } from 'lucide-react';
import RequestServiceModal from '../components/RequestServiceModal';

export default function Services() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'digital'>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const isCompanyAdmin = user?.role === 'COMPANY_ADMIN';
  const isRegularUser = user?.role === 'USER';

  const filteredServices = serviceTypes.filter(service => {
    if (service.status === 'inactive') return false;

    if (selectedCategory === 'all') return true;
    return service.category === selectedCategory;
  });

  const isServiceActive = (serviceSlug: string) => {
    const request = mockCompanyRequests[serviceSlug];
    return request && request.status === 'approved';
  };

  const getServiceStatus = (serviceSlug: string) => {
    const request = mockCompanyRequests[serviceSlug];
    if (!request) return null;
    return request;
  };

  const handleRequestService = (service: any) => {
    setSelectedService(service);
    setShowRequestModal(true);
  };

  const handleViewDetails = (serviceSlug: string) => {
    window.location.hash = `service/${serviceSlug}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Services Catalog</h1>
          <p className="text-gray-400">
            {isCompanyAdmin ? 'Request new services or manage your active services' : 'Explore available services'}
          </p>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All Services ({serviceTypes.length})
          </button>
          <button
            onClick={() => setSelectedCategory('ai')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === 'ai'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            AI Services ({serviceTypes.filter(s => s.category === 'ai').length})
          </button>
          <button
            onClick={() => setSelectedCategory('digital')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === 'digital'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Digital Services ({serviceTypes.filter(s => s.category === 'digital').length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const Icon = service.icon;
            const isActive = isServiceActive(service.slug);
            const status = getServiceStatus(service.slug);

            return (
              <div
                key={service.id}
                className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{service.name_en}</h3>
                <p className="text-gray-400 text-sm mb-4">{service.description_en}</p>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Key Features:</p>
                  <ul className="space-y-1">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-xs text-gray-400 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {service.status === 'maintenance' ? (
                  <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-sm text-orange-500 font-medium text-center">
                      🔧 Service Under Maintenance
                    </p>
                    <p className="text-xs text-orange-400/70 text-center mt-1">
                      Pricing temporarily unavailable
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Starting from</p>
                    <p className="text-2xl font-bold text-white">${service.pricing.basic}<span className="text-sm text-gray-400">/month</span></p>
                  </div>
                )}

                {isActive && (
                  <div className="mb-4 flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">Active - {status?.plan.toUpperCase()} Plan</span>
                  </div>
                )}

                {status && status.status === 'pending' && (
                  <div className="mb-4 flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-500 font-medium">Request Pending Approval</span>
                  </div>
                )}

                {service.status === 'maintenance' && (
                  <div className="mb-4 flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <Wrench className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-500 font-medium">Under Maintenance</span>
                  </div>
                )}

                <div className="mt-4">
                  {isActive ? (
                    <button
                      onClick={() => handleViewDetails(service.slug)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all"
                    >
                      View Details & Dashboard
                    </button>
                  ) : service.status === 'maintenance' ? (
                    <div>
                      <button
                        disabled
                        className="w-full px-4 py-3 bg-gray-700 text-gray-400 rounded-lg font-medium cursor-not-allowed mb-2"
                      >
                        Service Under Maintenance
                      </button>
                      <p className="text-xs text-center text-gray-500">
                        This service is temporarily unavailable
                      </p>
                    </div>
                  ) : (
                    <>
                      {isCompanyAdmin && !status && (
                        <button
                          onClick={() => handleRequestService(service)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all"
                        >
                          Request Service
                        </button>
                      )}

                      {isCompanyAdmin && status && status.status === 'pending' && (
                        <button
                          disabled
                          className="w-full px-4 py-3 bg-gray-700 text-gray-400 rounded-lg font-medium cursor-not-allowed"
                        >
                          Request Pending
                        </button>
                      )}

                      {isRegularUser && (
                        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-orange-500">
                            Contact Company Admin to request this service
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  Delivery: {service.delivery}
                </p>
              </div>
            );
          })}
        </div>

        {showRequestModal && selectedService && (
          <RequestServiceModal
            service={selectedService}
            onClose={() => {
              setShowRequestModal(false);
              setSelectedService(null);
            }}
            onSubmit={(packageType, notes) => {
              console.log('Service Request Submitted:', {
                service: selectedService.slug,
                package: packageType,
                notes: notes,
                companyId: user?.companyId,
                companyName: user?.companyName,
                requestedBy: user?.name,
              });
              alert(`Request submitted for ${selectedService.name_en} (${packageType} package)`);
            }}
          />
        )}
      </div>
    </div>
  );
}
