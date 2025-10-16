import { useState } from 'react';
import { serviceTypes } from '../../data/services';
import { mockServiceRequests } from '../../data/serviceRequests';
import { CreditCard as Edit3, Users, Clock, CheckCircle, Building2, Wrench, Power } from 'lucide-react';
import EditServiceModal from '../../components/admin/EditServiceModal';

export default function ServicesCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'digital'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [services, setServices] = useState(serviceTypes);

  const filteredServices = services.filter(service => {
    if (selectedCategory === 'all') return true;
    return service.category === selectedCategory;
  });

  const getCompaniesUsingService = (serviceId: string) => {
    return mockServiceRequests.filter(
      req => req.service_type_id === serviceId && req.status === 'approved'
    );
  };

  const getPendingRequests = (serviceId: string) => {
    return mockServiceRequests.filter(
      req => req.service_type_id === serviceId && req.status === 'pending'
    );
  };

  const handleEditService = (service: any) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Services Catalog Management</h1>
          <p className="text-gray-400">
            Edit service details, view companies using services, and manage requests
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Services</span>
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-white">{serviceTypes.length}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">AI Services</span>
              <CheckCircle className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-white">
              {serviceTypes.filter(s => s.category === 'ai').length}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Digital Services</span>
              <CheckCircle className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-3xl font-bold text-white">
              {serviceTypes.filter(s => s.category === 'digital').length}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Pending Requests</span>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-white">
              {mockServiceRequests.filter(r => r.status === 'pending').length}
            </p>
          </div>
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
            const companiesUsing = getCompaniesUsingService(service.id);
            const pendingRequests = getPendingRequests(service.id);

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

                <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Starting from</p>
                  <p className="text-2xl font-bold text-white">
                    ${service.pricing.basic}
                    <span className="text-sm text-gray-400">/month</span>
                  </p>
                </div>

                <div className="mb-4">
                  {service.status === 'active' && (
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500 font-medium">Active</span>
                    </div>
                  )}
                  {service.status === 'maintenance' && (
                    <div className="flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <Wrench className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-orange-500 font-medium">Under Maintenance</span>
                    </div>
                  )}
                  {service.status === 'inactive' && (
                    <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <Power className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-500 font-medium">Inactive (Hidden)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-blue-500 font-medium">Companies Using</span>
                    </div>
                    <span className="text-lg font-bold text-blue-500">{companiesUsing.length}</span>
                  </div>

                  {pendingRequests.length > 0 && (
                    <div className="flex items-center justify-between p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-orange-500 font-medium">Pending Requests</span>
                      </div>
                      <span className="text-lg font-bold text-orange-500">{pendingRequests.length}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleEditService(service)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Service Details
                  </button>

                  {companiesUsing.length > 0 && (
                    <button
                      className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      View Companies ({companiesUsing.length})
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  Delivery: {service.delivery}
                </p>
              </div>
            );
          })}
        </div>

        {showEditModal && selectedService && (
          <EditServiceModal
            service={selectedService}
            onClose={() => {
              setShowEditModal(false);
              setSelectedService(null);
            }}
            onSave={(updatedService) => {
              const updatedServices = services.map(s =>
                s.id === updatedService.id ? updatedService : s
              );
              setServices(updatedServices);

              console.log('Service Updated:', updatedService);
            }}
          />
        )}
      </div>
    </div>
  );
}
