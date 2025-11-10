import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AlertCircle, CheckCircle, Clock, Wrench, XCircle,
  MessageCircle, Instagram, Calendar, Sheet, Mail,
  FileText, FolderOpen, Image, Mic, Heart,
  Globe, Smartphone, Plus
} from 'lucide-react';
import RequestServiceModal from '../../components/RequestServiceModal';
import { getActiveServices } from '../../lib/api/serviceTypes';
import { getCompanyServiceRequests, createServiceRequest } from '../../lib/api/serviceRequests';
import { getCompanyServices } from '../../lib/api/companyServices';

export default function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'digital'>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRejectedRequest, setSelectedRejectedRequest] = useState<any>(null);

  const [services, setServices] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [companyServices, setCompanyServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isCompanyAdmin = user?.role === 'company_admin';
  const isRegularUser = user?.role === 'user';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const servicesData = await getActiveServices();
        setServices(servicesData || []);

        if (user?.company_id && isCompanyAdmin) {
          const [requestsData, companyServicesData] = await Promise.all([
            getCompanyServiceRequests(user.company_id),
            getCompanyServices(user.company_id)
          ]);
          setServiceRequests(requestsData || []);
          setCompanyServices(companyServicesData || []);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services');
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.company_id, isCompanyAdmin]);

  const filteredServices = services.filter(service => {
    // Filter out globally inactive services
    if (service.status === 'inactive') return false;

    // Filter out company-specific inactive services
    const companyServiceStatus = companyServices.find(cs => cs.service_type_id === service.id);
    if (companyServiceStatus?.status === 'inactive') return false;

    // Category filter
    if (selectedCategory === 'all') return true;
    return service.category === selectedCategory;
  });

  const isServiceActive = (serviceId: string) => {
    // FIX: Only check company_services (not service_requests)
    // Because service_requests is just the request history, not the actual active status
    // company_services is the source of truth for active services
    const hasActiveService = companyServices.some(
      cs => cs.service_type_id === serviceId && cs.status === 'active'
    );

    return hasActiveService;
  };

  const getServiceStatus = (serviceId: string) => {
    // Check company_services first (source of truth for active status)
    const companyService = companyServices.find(cs => cs.service_type_id === serviceId);
    if (companyService && companyService.status === 'active') {
      // Service is active - don't show pending/rejected badges
      return {
        service_type_id: companyService.service_type_id,
        package: companyService.package,
        status: 'approved', // Active = approved
        company_id: companyService.company_id
      };
    }

    // If not in company_services, check service_requests for pending/rejected
    const request = serviceRequests.find(req => req.service_type_id === serviceId);
    if (request) {
      // Only show pending/rejected status if NOT in company_services
      // This prevents showing "pending" when service is actually deleted
      return request;
    }

    return null;
  };

  // Get company_services status for a service (for maintenance check)
  const getCompanyServiceStatus = (serviceId: string) => {
    return companyServices.find(cs => cs.service_type_id === serviceId);
  };

  const handleRequestService = (service: any) => {
    setSelectedService(service);
    setShowRequestModal(true);
  };

  const handleViewRejectionReason = (request: any) => {
    setSelectedRejectedRequest(request);
    setShowRejectionModal(true);
  };

  const handleReRequest = (service: any) => {
    setShowRejectionModal(false);
    setSelectedRejectedRequest(null);
    handleRequestService(service);
  };

  const handleViewDetails = (serviceSlug: string, serviceTypeId: string) => {
    // Find the company_service ID for this service type
    const companyService = companyServices.find(cs => cs.service_type_id === serviceTypeId && cs.status === 'active');

    if (!companyService) {
      alert('Service not found. Please refresh the page and try again.');
      return;
    }

    // Map service slugs to dashboard routes
    const slugMap: Record<string, string> = {
      'whatsapp-automation': 'whatsapp',
      'instagram-automation': 'instagram',
      'google-calendar-integration': 'calendar',
      'google-calendar': 'calendar',
      'google-sheets-integration': 'sheets',
      'google-sheets': 'sheets',
      'gmail-integration': 'gmail',
      'gmail': 'gmail',
      'google-docs-integration': 'docs',
      'google-docs': 'docs',
      'google-drive-integration': 'drive',
      'google-drive': 'drive',
      'google-photos-integration': 'photos',
      'google-photos': 'photos',
      'website-development': 'website',
      'mobile-app-development': 'mobile-app',
    };

    const path = slugMap[serviceSlug] || serviceSlug;
    navigate(`/dashboard/services/${path}/${companyService.id}`);
  };

  const handleSubmitRequest = async (packageType: 'basic' | 'standard' | 'premium', notes: string) => {
    if (!selectedService || !user?.company_id || !user?.id) {
      alert('Missing required information');
      return;
    }

    try {
      await createServiceRequest({
        company_id: user.company_id,
        service_type_id: selectedService.id,
        package: packageType,
        requested_by: user.id,
        notes: notes || undefined,
      });

      alert('Service request submitted successfully! Waiting for Super Admin approval.');

      const requestsData = await getCompanyServiceRequests(user.company_id);
      setServiceRequests(requestsData || []);

      setShowRequestModal(false);
      setSelectedService(null);
    } catch (err) {
      console.error('Error submitting request:', err);
      alert('Failed to submit request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Services Catalog</h1>
          <p className="text-muted">
            {isCompanyAdmin ? 'Request new services or manage your active services' : 'Explore available services'}
          </p>
        </div>

        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
            }`}
          >
            All Services ({services.length})
          </button>
          <button
            onClick={() => setSelectedCategory('ai')}
            className={`px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all ${
              selectedCategory === 'ai'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
            }`}
          >
            AI Services ({services.filter(s => s.category === 'ai').length})
          </button>
          <button
            onClick={() => setSelectedCategory('digital')}
            className={`px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all ${
              selectedCategory === 'digital'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
            }`}
          >
            Digital Services ({services.filter(s => s.category === 'digital').length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const isActive = isServiceActive(service.id);
            const status = getServiceStatus(service.id);
            const companyServiceStatus = getCompanyServiceStatus(service.id);

            // Check if service is in maintenance mode (either globally or for this company)
            const isInMaintenance = service.status === 'maintenance' || companyServiceStatus?.status === 'maintenance';

            const iconMap: Record<string, any> = {
              'whatsapp-automation': MessageCircle,
              'instagram-automation': Instagram,
              'google-calendar-integration': Calendar,
              'google-calendar': Calendar,
              'google-sheets-integration': Sheet,
              'google-sheets': Sheet,
              'gmail-integration': Mail,
              'gmail': Mail,
              'google-docs-integration': FileText,
              'google-docs': FileText,
              'google-drive-integration': FolderOpen,
              'google-drive': FolderOpen,
              'google-photos-integration': Image,
              'google-photos': Image,
              'voice-cloning': Mic,
              'sentiment-analysis': Heart,
              'website-development': Globe,
              'mobile-app-development': Smartphone
            };

            // Get icon - use Package as fallback instead of AlertCircle
            const ServiceIcon = iconMap[service.slug];
            if (!ServiceIcon) {
              console.log('Missing icon mapping for slug:', service.slug);
            }
            const FinalIcon = ServiceIcon || AlertCircle;

            const startingPrice = service.pricing_basic?.price ||
                                 service.pricing_standard?.price ||
                                 service.pricing_premium?.price || 0;

            return (
              <div
                key={service.id}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-5 hover:scale-[1.02] hover:bg-white/15 transition-all"
              >
                <div className={`w-[60px] h-[60px] rounded-xl bg-gradient-to-br ${service.color || 'from-blue-500 to-cyan-500'} flex items-center justify-center mb-4 shadow-lg`}>
                  <FinalIcon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{service.name_en}</h3>
                <p className="text-muted text-sm mb-4 line-clamp-2">{service.short_description_en || service.description_en}</p>

                {service.features && (service.features.en || service.features.tr || service.features.length > 0) && (
                  <div className="mb-4">
                    <p className="text-xs text-muted mb-2 font-semibold">Key Features:</p>
                    <ul className="space-y-1">
                      {(service.features?.en || service.features?.tr || service.features || []).slice(0, 3).map((feature: any, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-secondary">
                          <span className="text-blue-400 mt-0.5">✓</span>
                          <span className="line-clamp-1">{typeof feature === 'string' ? feature : feature.name || feature.title || 'Feature'}</span>
                        </li>
                      ))}
                      {((service.features?.en || service.features?.tr || service.features || []).length) > 3 && (
                        <li className="text-xs text-muted italic">+{((service.features?.en || service.features?.tr || service.features || []).length) - 3} more features</li>
                      )}
                    </ul>
                  </div>
                )}

                {isInMaintenance ? (
                  <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-xl">
                    <p className="text-sm text-orange-400 font-semibold text-center">🔧 Service Under Maintenance</p>
                    <p className="text-xs text-orange-300/70 text-center mt-1">Temporarily unavailable - Please check back later</p>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                    <p className="text-sm font-semibold text-blue-400 text-center">💬 Contact for pricing</p>
                    <p className="text-xs text-blue-300/70 text-center mt-1">Custom pricing tailored for your business</p>
                  </div>
                )}

                {isActive && (
                  <div className="mb-4 flex items-center gap-2 p-2.5 bg-green-500/20 border border-green-500/30 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-semibold">Active - {status?.package?.toUpperCase()} Plan</span>
                  </div>
                )}

                {status && status.status === 'pending' && (
                  <div className="mb-4 flex items-center gap-2 p-2.5 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400 font-semibold">Request Pending Approval</span>
                  </div>
                )}

                {status && status.status === 'rejected' && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 p-2.5 bg-red-500/20 border border-red-500/30 rounded-xl">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-400 font-semibold">Request Rejected</span>
                    </div>
                    <button
                      onClick={() => handleViewRejectionReason(status)}
                      className="w-full mt-2 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 rounded-xl text-sm font-semibold transition-colors"
                    >
                      View Rejection Reason
                    </button>
                  </div>
                )}

                {isInMaintenance && (
                  <div className="mb-4 flex items-center gap-2 p-2.5 bg-orange-500/20 border border-orange-500/30 rounded-xl">
                    <Wrench className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-orange-400 font-semibold">Under Maintenance</span>
                  </div>
                )}

                  <div className="mt-4 space-y-2">
                    {isActive && !isInMaintenance ? (
                      <>
                        <button
                          onClick={() => handleViewDetails(service.slug, service.id)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/50"
                        >
                          View Dashboard
                        </button>
                        {isCompanyAdmin && (
                          <button
                            onClick={() => handleRequestService(service)}
                            className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Request Another Instance
                          </button>
                        )}
                      </>
                    ) : isActive && isInMaintenance ? (
                      <div>
                        <button
                          onClick={() => handleViewDetails(service.slug, service.id)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-semibold transition-all mb-2"
                        >
                          View Service (Maintenance Mode)
                        </button>
                        <p className="text-xs text-center text-orange-400">⚠️ Service temporarily unavailable</p>
                      </div>
                    ) : isInMaintenance ? (
                      <div>
                        <button
                          disabled
                          className="w-full px-4 py-3 bg-gray-700/50 text-gray-500 rounded-xl font-semibold cursor-not-allowed mb-2"
                        >
                          Service Under Maintenance
                        </button>
                        <p className="text-xs text-center text-gray-500">This service is temporarily unavailable</p>
                      </div>
                    ) : (
                      <>
                        {isCompanyAdmin && !status && !isInMaintenance && (
                          <button
                            onClick={() => handleRequestService(service)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-500/50"
                          >
                            Request Service
                          </button>
                        )}

                        {isCompanyAdmin && status && status.status === 'pending' && (
                          <button
                            disabled
                            className="w-full px-4 py-3 bg-gray-700/50 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                          >
                            Request Pending
                          </button>
                        )}

                        {isCompanyAdmin && status && status.status === 'rejected' && (
                          <button
                            onClick={() => handleReRequest(service)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/50"
                          >
                            Request Again
                          </button>
                        )}

                        {isRegularUser && (
                          <div className="p-3 bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-orange-400 font-medium">Contact Company Admin to request this service</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                <p className="text-xs text-gray-400 mt-3 text-center">
                  Delivery: {service.metadata?.delivery_time || '1-2 weeks'}
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
            onSubmit={handleSubmitRequest}
          />
        )}

        {/* Rejection Reason Modal */}
        {showRejectionModal && selectedRejectedRequest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-secondary rounded-2xl max-w-lg w-full border border-secondary shadow-2xl">
              <div className="p-6 border-b border-secondary">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <XCircle className="w-6 h-6 text-red-500" />
                      Service Request Rejected
                    </h3>
                    <p className="text-sm text-muted mt-1">
                      {services.find(s => s.id === selectedRejectedRequest.service_type_id)?.name_en || 'Service'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRejectionModal(false)}
                    className="text-muted hover:text-white"
                  >
                    <AlertCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-400 mb-2">
                    ⚠️ Your service request has been rejected by the Super Admin.
                  </p>
                  <p className="text-xs text-red-300/70">
                    Please review the reason below and make necessary adjustments before requesting again.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="text-sm text-muted block mb-2">Rejection Reason:</label>
                  <div className="bg-primary border border-secondary rounded-lg p-4">
                    <p className="text-white whitespace-pre-wrap">
                      {selectedRejectedRequest.admin_notes || 'No reason provided'}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-400">
                    💡 You can request this service again after addressing the concerns mentioned above.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-secondary flex gap-3">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleReRequest(services.find(s => s.id === selectedRejectedRequest.service_type_id))}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all"
                >
                  Request Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}