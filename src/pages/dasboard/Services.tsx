import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, CheckCircle, Clock, Wrench } from 'lucide-react';
import RequestServiceModal from '../../components/RequestServiceModal';
import { getActiveServices } from '../../lib/api/serviceTypes';
import { getCompanyServiceRequests, createServiceRequest } from '../../lib/api/serviceRequests';

export default function Services() {
  const { user, profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'digital'>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  // Real DB states
  const [services, setServices] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isCompanyAdmin = user?.role === 'company_admin';
  const isRegularUser = user?.role === 'user';

  // Fetch services and requests from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all active services
        const servicesData = await getActiveServices();
        setServices(servicesData || []);

        // Fetch company's service requests (if company admin)
        if (user?.company_id && isCompanyAdmin) {
          const requestsData = await getCompanyServiceRequests(user.company_id);
          setServiceRequests(requestsData || []);
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
    // Hide inactive services from Company Admin and Users
    if (service.status === 'inactive') return false;

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

  const handleRequestService = (service: any) => {
    setSelectedService(service);
    setShowRequestModal(true);
  };

  const handleViewDetails = (serviceSlug: string) => {
    // Map slug to route
    const slugMap: Record<string, string> = {
      'whatsapp-automation': 'whatsapp',
      'instagram-automation': 'instagram',
      'google-calendar-integration': 'calendar',
      'google-sheets-integration': 'sheets',
      'gmail-integration': 'gmail',
      'google-docs-integration': 'docs',
      'google-drive-integration': 'drive',
      'google-photos-integration': 'photos',
      'website-development': 'website',
      'mobile-app-development': 'mobile-app'
    };

    const path = slugMap[serviceSlug] || serviceSlug;
    window.location.href = `/dashboard/services/${path}`;
  };

  // Submit request to DB
  const handleSubmitRequest = async (packageType: 'basic' | 'standard' | 'premium', notes: string) => {
    if (!selectedService || !user?.company_id || !profile?.id) {
      alert('Missing required information');
      return;
    }

    try {
      await createServiceRequest({
        company_id: user.company_id,
        service_type_id: selectedService.id,
        package: packageType,
        requested_by: profile.id,
        notes: notes || undefined,
      });

      alert('Service request submitted successfully! Waiting for Super Admin approval.');

      // Refresh requests
      const requestsData = await getCompanyServiceRequests(user.company_id);
      setServiceRequests(requestsData || []);

      setShowRequestModal(false);
      setSelectedService(null);
    } catch (err) {
      console.error('Error submitting request:', err);
      alert('Failed to submit request. Please try again.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading services...</div>
      </div>
    );
  }

  // Show error state
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

            // Get icon - from emoji string or default
            const serviceIcon = service.icon || '📦';

            // Get starting price
            const startingPrice = service.pricing_basic?.price ||
                                 service.pricing_standard?.price ||
                                 service.pricing_premium?.price || 0;
            const currency = service.pricing_basic?.currency || 'USD';
            const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₺';

            return (
              <div
                key={service.id}
                className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6 hover:border-secondary transition-all"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color || 'from-blue-500 to-cyan-500'} flex items-center justify-center mb-4`}>
                  <span className="text-3xl">{serviceIcon}</span>
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
                  <div className="mb-4 p-3 bg-primary/50 rounded-lg">
                    <p className="text-xs text-muted mb-1">Starting from</p>
                    <p className="text-2xl font-bold text-white">{currencySymbol}{startingPrice}<span className="text-sm text-muted">/month</span></p>
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
                      View Dashboard
                    </button>
                  ) : service.status === 'maintenance' ? (
                    <div>
                      <button
                        disabled
                        className="w-full px-4 py-3 bg-gray-700 text-muted rounded-lg font-medium cursor-not-allowed mb-2"
                      >
                        Service Under Maintenance
                      </button>
                      <p className="text-xs text-center text-muted">
                        This service is temporarily unavailable
                      </p>
                    </div>
                  ) : (
                    <>
                      {isCompanyAdmin && !status && service.status !== 'maintenance' && (
                        <button
                          onClick={() => handleRequestService(service)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all"
                        >
                          Request Service
                        </button>
                      )}

                      {isCompanyAdmin && !status && service.status === 'maintenance' && (
                        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                          <p className="text-orange-500 font-medium text-sm mb-1">Service Under Maintenance</p>
                          <p className="text-orange-400 text-xs">This service is temporarily unavailable</p>
                        </div>
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
                          <p className="text-sm text-orange-500">
                            Contact Company Admin to request this service
                          </p>
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
