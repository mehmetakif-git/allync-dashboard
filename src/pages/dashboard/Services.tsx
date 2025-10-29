import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  AlertCircle, CheckCircle, Clock, Wrench,
  MessageCircle, Instagram, Calendar, Sheet, Mail,
  FileText, FolderOpen, Image, Mic, Heart,
  Globe, Smartphone
} from 'lucide-react';
import RequestServiceModal from '../../components/RequestServiceModal';
import { getActiveServices } from '../../lib/api/serviceTypes';
import { getCompanyServiceRequests, createServiceRequest } from '../../lib/api/serviceRequests';
import { getCompanyServices } from '../../lib/api/companyServices';

export default function Services() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'digital'>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

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
    return serviceRequests.some(
      req => req.service_type_id === serviceId && req.status === 'approved'
    );
  };

  const getServiceStatus = (serviceId: string) => {
    return serviceRequests.find(req => req.service_type_id === serviceId);
  };

  // Get company_services status for a service (for maintenance check)
  const getCompanyServiceStatus = (serviceId: string) => {
    return companyServices.find(cs => cs.service_type_id === serviceId);
  };

  const handleRequestService = (service: any) => {
    setSelectedService(service);
    setShowRequestModal(true);
  };

  const handleViewDetails = (serviceSlug: string) => {
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
      'mobile-app-development': 'mobile-app'
    };

    const path = slugMap[serviceSlug] || serviceSlug;
    window.location.href = `/dashboard/services/${path}`;
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

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-secondary text-muted hover:bg-hover'
            }`}
          >
            All Services ({services.length})
          </button>
          <button
            onClick={() => setSelectedCategory('ai')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === 'ai'
                ? 'bg-blue-600 text-white'
                : 'bg-secondary text-muted hover:bg-hover'
            }`}
          >
            AI Services ({services.filter(s => s.category === 'ai').length})
          </button>
          <button
            onClick={() => setSelectedCategory('digital')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === 'digital'
                ? 'bg-blue-600 text-white'
                : 'bg-secondary text-muted hover:bg-hover'
            }`}
          >
            Digital Services ({services.filter(s => s.category === 'digital').length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6 hover:border-secondary transition-all"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color || 'from-blue-500 to-cyan-500'} flex items-center justify-center mb-4`}>
                  <FinalIcon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{service.name_en}</h3>
                <p className="text-muted text-sm mb-4">{service.description_en || service.short_description_en}</p>

                <div className="mb-4">
                  <p className="text-xs text-muted mb-2">Key Features:</p>
                  <ul className="space-y-1">
                    {(service.features?.en || service.features || []).slice(0, 3).map((feature: any, index: number) => (
                      <li key={index} className="text-xs text-muted flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {typeof feature === 'string' ? feature : feature.name || feature.title || 'Feature'}
                      </li>
                    ))}
                  </ul>
                </div>

                {isInMaintenance ? (
                  <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-sm text-orange-500 font-medium text-center">🔧 Service Under Maintenance</p>
                    <p className="text-xs text-orange-400/70 text-center mt-1">Temporarily unavailable - Please check back later</p>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm font-semibold text-blue-400 text-center">💬 Contact for pricing</p>
                    <p className="text-xs text-blue-300/70 text-center mt-1">Custom pricing tailored for your business</p>
                  </div>
                )}

                {isActive && (
                  <div className="mb-4 flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">Active - {status?.package?.toUpperCase()} Plan</span>
                  </div>
                )}

                {status && status.status === 'pending' && (
                  <div className="mb-4 flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-500 font-medium">Request Pending Approval</span>
                  </div>
                )}

                {isInMaintenance && (
                  <div className="mb-4 flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <Wrench className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-500 font-medium">Under Maintenance</span>
                  </div>
                )}

                <div className="mt-4">
                  {isActive && !isInMaintenance ? (
                    <button
                      onClick={() => handleViewDetails(service.slug)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all"
                    >
                      View Dashboard
                    </button>
                  ) : isActive && isInMaintenance ? (
                    <div>
                      <button
                        onClick={() => handleViewDetails(service.slug)}
                        className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all mb-2"
                      >
                        View Service (Maintenance Mode)
                      </button>
                      <p className="text-xs text-center text-orange-400">⚠️ Service temporarily unavailable</p>
                    </div>
                  ) : isInMaintenance ? (
                    <div>
                      <button
                        disabled
                        className="w-full px-4 py-3 bg-gray-700 text-muted rounded-lg font-medium cursor-not-allowed mb-2"
                      >
                        Service Under Maintenance
                      </button>
                      <p className="text-xs text-center text-muted">This service is temporarily unavailable</p>
                    </div>
                  ) : (
                    <>
                      {isCompanyAdmin && !status && !isInMaintenance && (
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
                          className="w-full px-4 py-3 bg-gray-700 text-muted rounded-lg font-medium cursor-not-allowed"
                        >
                          Request Pending
                        </button>
                      )}

                      {isRegularUser && (
                        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-orange-500">Contact Company Admin to request this service</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <p className="text-xs text-muted mt-3 text-center">
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
      </div>
    </div>
  );
}