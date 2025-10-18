import { useState } from 'react';
import { serviceTypes } from '../../data/services';
import { mockServiceRequests } from '../../data/serviceRequests';
import { Edit3, Users, Clock, CheckCircle, Building2, Wrench, Power, Check, X, Settings } from 'lucide-react';
import EditServiceModal from '../../components/admin/EditServiceModal';
import ConfirmationDialog from '../../components/ConfirmationDialog';

export default function ServicesCatalog() {
  const [activeTab, setActiveTab] = useState<'services' | 'requests'>('services');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'digital'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [services, setServices] = useState(serviceTypes);
  const [requests, setRequests] = useState(mockServiceRequests);

  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const filteredServices = services.filter(service => {
    if (selectedCategory === 'all') return true;
    return service.category === selectedCategory;
  });

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const getCompaniesUsingService = (serviceId: string) => {
    return requests.filter(
      req => req.service_type_id === serviceId && req.status === 'approved'
    );
  };

  const getPendingRequests = (serviceId: string) => {
    return requests.filter(
      req => req.service_type_id === serviceId && req.status === 'pending'
    );
  };

  const handleEditService = (service: any) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  const handleApproveClick = (request: any) => {
    setSelectedRequest(request);
    setShowApproveConfirm(true);
  };

  const handleRejectClick = (request: any) => {
    setSelectedRequest(request);
    setShowRejectConfirm(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const updatedRequests = requests.map(r =>
      r.id === selectedRequest.id
        ? { ...r, status: 'approved' as const, reviewed_at: new Date().toISOString(), reviewed_by: 'Super Admin' }
        : r
    );

    setRequests(updatedRequests);
    setIsProcessing(false);
    setShowApproveConfirm(false);

    setSuccessMessage(`Service request approved! ${selectedRequest.company_name} can now use ${selectedRequest.service_name}.`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    console.log('Request Approved:', {
      requestId: selectedRequest.id,
      company: selectedRequest.company_name,
      service: selectedRequest.service_name,
      package: selectedRequest.package,
    });
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const updatedRequests = requests.map(r =>
      r.id === selectedRequest.id
        ? { ...r, status: 'rejected' as const, reviewed_at: new Date().toISOString(), reviewed_by: 'Super Admin' }
        : r
    );

    setRequests(updatedRequests);
    setIsProcessing(false);
    setShowRejectConfirm(false);

    setSuccessMessage(`Service request rejected for ${selectedRequest.company_name}.`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    console.log('Request Rejected:', {
      requestId: selectedRequest.id,
      company: selectedRequest.company_name,
      service: selectedRequest.service_name,
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Services Catalog Management</h1>
          <p className="text-gray-400">
            Edit service details, manage service requests, and view companies using services
          </p>
        </div>

        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-green-500 font-medium">Success!</p>
              <p className="text-green-400/70 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'services'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Services Catalog ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Pending Requests ({pendingRequests.length})
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-xs flex items-center justify-center text-white">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'services' && (
          <>
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
                  {pendingRequests.length}
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
                const pendingForService = getPendingRequests(service.id);

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

                      {pendingForService.length > 0 && (
                        <div className="flex items-center justify-between p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-orange-500 font-medium">Pending Requests</span>
                          </div>
                          <span className="text-lg font-bold text-orange-500">{pendingForService.length}</span>
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

                      {service.slug === 'whatsapp-automation' && (
                        <button
                          onClick={() => window.location.hash = 'whatsapp-service-management'}
                          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Manage Service
                        </button>
                      )}

                      {service.slug === 'instagram-automation' && (
                        <button
                          onClick={() => window.location.hash = 'instagram-service-management'}
                          className="w-full px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Manage Service
                        </button>
                      )}

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
          </>
        )}

        {activeTab === 'requests' && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
            {pendingRequests.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Pending Requests</h3>
                <p className="text-gray-400">All service requests have been processed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Company</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Service</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Package</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Requested By</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Notes</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {pendingRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-white font-medium">{request.company_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white">{request.service_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-medium text-blue-500 uppercase">
                            {request.package}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-300">{request.requested_by_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 text-sm">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 text-sm">{request.notes || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveClick(request)}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectClick(request)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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

        <ConfirmationDialog
          isOpen={showApproveConfirm}
          onClose={() => setShowApproveConfirm(false)}
          onConfirm={handleApproveConfirm}
          title="Approve Service Request"
          message={`Are you sure you want to approve ${selectedRequest?.service_name} (${selectedRequest?.package} package) for ${selectedRequest?.company_name}?`}
          confirmText="Approve Request"
          confirmColor="from-green-600 to-emerald-600"
          isLoading={isProcessing}
        />

        <ConfirmationDialog
          isOpen={showRejectConfirm}
          onClose={() => setShowRejectConfirm(false)}
          onConfirm={handleRejectConfirm}
          title="Reject Service Request"
          message={`Are you sure you want to reject this service request from ${selectedRequest?.company_name}? This action cannot be undone.`}
          confirmText="Reject Request"
          confirmColor="from-red-600 to-red-700"
          isLoading={isProcessing}
        />
      </div>
    </div>
  );
}
