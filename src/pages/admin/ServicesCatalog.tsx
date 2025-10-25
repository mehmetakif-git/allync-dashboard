import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle, Instagram, TrendingUp, Building2, DollarSign, Settings, Calendar, Sheet, Mail, FileText, FolderOpen, Image, X, AlertTriangle, Globe, Smartphone, Loader2 } from 'lucide-react';
import serviceTypesAPI from '../../lib/api/serviceTypes';

// Icon mapping for services
const iconMap: Record<string, any> = {
  'message-circle': MessageCircle,
  'instagram': Instagram,
  'calendar': Calendar,
  'sheet': Sheet,
  'mail': Mail,
  'file-text': FileText,
  'folder-open': FolderOpen,
  'image': Image,
  'globe': Globe,
  'smartphone': Smartphone,
  'settings': Settings,
};

interface ServiceWithStats {
  id: string;
  name_en: string;
  name_tr: string;
  description_en: string | null;
  description_tr: string | null;
  short_description_en: string | null;
  short_description_tr: string | null;
  slug: string;
  category: string;
  icon: string | null;
  color: string | null;
  status: 'active' | 'maintenance' | 'inactive';
  pricing_standard: {
    price: number;
    currency: string;
    period: string;
  } | null;
  companies_using: number;
  active_subscriptions: number;
  total_revenue: number;
  created_at: string;
  updated_at: string | null;
}

export default function ServicesCatalog() {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceWithStats | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'maintenance' | 'inactive'>('active');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await serviceTypesAPI.getAllServicesWithStats();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.name_tr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description_en && service.description_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (service.description_tr && service.description_tr.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalRevenue = services.reduce((sum, s) => sum + (s.total_revenue || 0), 0);
  const totalCompanies = services.reduce((sum, s) => sum + (s.companies_using || 0), 0);
  const activeServicesCount = services.filter(s => s.status === 'active').length;
  const avgPrice = totalCompanies > 0 ? Math.round(totalRevenue / totalCompanies) : 0;

  const handleStatusChange = (service: ServiceWithStats, status: 'active' | 'maintenance' | 'inactive') => {
    setSelectedService(service);
    setSelectedStatus(status);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedService) return;

    try {
      setUpdating(true);
      
      await serviceTypesAPI.updateServiceStatus(
        selectedService.id,
        selectedStatus
      );

      // Update local state
      setServices(prev => prev.map(s => 
        s.id === selectedService.id 
          ? { ...s, status: selectedStatus }
          : s
      ));

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
      }, 3000);
      
    } catch (error) {
      console.error('Error updating status:', error);
      setSuccessMessage('Failed to update service status. Please try again.');
      setShowSuccessMessage(true);
      
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } finally {
      setUpdating(false);
    }
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
          textColor: 'text-muted',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-secondary/30',
          icon: '?'
        };
    }
  };

  const getServiceIcon = (iconName: string | null) => {
    if (!iconName) return Settings;
    return iconMap[iconName] || Settings;
  };

  const getServiceColor = (color: string | null) => {
    return color || 'from-blue-500 to-blue-700';
  };

  const navigateToManagement = (slug: string) => {
    // Navigate to service management page
    navigate(`/admin/services/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-white text-xl">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Services Catalog</h1>
          <p className="text-muted">Manage automation services and view usage across all companies</p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className={`mb-6 ${successMessage.includes('Failed') ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'} border rounded-xl p-4 flex items-center gap-3 animate-fade-in`}>
            <div className={`w-10 h-10 ${successMessage.includes('Failed') ? 'bg-red-500' : 'bg-green-500'} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
              {successMessage.includes('Failed') ? '✕' : '✓'}
            </div>
            <div>
              <p className={`${successMessage.includes('Failed') ? 'text-red-500' : 'text-green-500'} font-semibold`}>
                {successMessage.includes('Failed') ? 'Update Failed' : 'Status Updated!'}
              </p>
              <p className={`${successMessage.includes('Failed') ? 'text-red-400' : 'text-green-400'} text-sm`}>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted mb-1">Active Services</p>
                <p className="text-3xl font-bold text-white">{activeServicesCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-green-500">All services operational</p>
          </div>

          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted mb-1">Total Companies</p>
                <p className="text-3xl font-bold text-white">{totalCompanies}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-muted">Using services</p>
          </div>

          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold text-white">${totalRevenue.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-green-500">From active subscriptions</p>
          </div>

          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted mb-1">Avg. Package Price</p>
                <p className="text-3xl font-bold text-white">${avgPrice}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <p className="text-xs text-muted">Per company</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-secondary border border-secondary rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">All Services ({filteredServices.length})</h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((service) => {
            const Icon = getServiceIcon(service.icon);
            const statusInfo = getStatusInfo(service.status);
            const colorGradient = getServiceColor(service.color);

            return (
              <div
                key={service.id}
                className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{service.name_en}</h3>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 ${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-full`}>
                        <span className="text-sm">{statusInfo.icon}</span>
                        <span className={`text-xs font-medium ${statusInfo.textColor}`}>{statusInfo.text}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-muted text-sm mb-6 leading-relaxed line-clamp-3">
                  {service.description_en || service.short_description_en || 'No description available'}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-muted mb-1">Price</p>
                    <p className="text-sm font-semibold text-white">
                      ${service.pricing_standard?.price || 0}/month
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Companies Using</p>
                    <p className="text-sm font-semibold text-white">{service.companies_using}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Active Subscriptions</p>
                    <p className="text-sm font-semibold text-white">{service.active_subscriptions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Total Revenue</p>
                    <p className="text-sm font-semibold text-white">${service.total_revenue.toFixed(0)}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigateToManagement(service.slug)}
                  className={`w-full px-6 py-3 bg-gradient-to-r ${colorGradient} hover:opacity-90 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 mb-4`}
                >
                  <Settings className="w-5 h-5" />
                  Manage Service
                </button>

                {/* Status Control Buttons */}
                <div className="border-t border-secondary pt-4">
                  <p className="text-xs text-muted mb-3 font-semibold uppercase tracking-wider">Change Service Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStatusChange(service, 'active')}
                      disabled={updating}
                      className={`px-4 py-3 rounded-lg text-sm font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                        service.status === 'active'
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/50 ring-2 ring-green-400'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      ✓ Active
                    </button>
                    <button
                      onClick={() => handleStatusChange(service, 'maintenance')}
                      disabled={updating}
                      className={`px-4 py-3 rounded-lg text-sm font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                        service.status === 'maintenance'
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50 ring-2 ring-orange-400'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      🔧 Maintenance
                    </button>
                    <button
                      onClick={() => handleStatusChange(service, 'inactive')}
                      disabled={updating}
                      className={`px-4 py-3 rounded-lg text-sm font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
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
            <p className="text-muted text-lg">No services found matching your search.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showStatusModal && selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-2xl max-w-md w-full border border-secondary shadow-2xl">
            <div className="p-6 border-b border-secondary">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <button 
                  onClick={() => setShowStatusModal(false)} 
                  className="text-muted hover:text-white"
                  disabled={updating}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirm Status Change</h3>
              <p className="text-muted text-sm">
                You are about to change <span className="text-white font-semibold">{selectedService.name_en}</span> status to:
              </p>
            </div>

            <div className="p-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 ${getStatusInfo(selectedStatus).bgColor} border ${getStatusInfo(selectedStatus).borderColor} rounded-lg mb-4`}>
                <span className="text-xl">{getStatusInfo(selectedStatus).icon}</span>
                <span className={`font-bold ${getStatusInfo(selectedStatus).textColor}`}>{getStatusInfo(selectedStatus).text}</span>
              </div>
              <p className="text-muted text-sm">
                {selectedStatus === 'active' && 'Service will be fully visible and requestable by all users.'}
                {selectedStatus === 'maintenance' && 'Service will be visible but users cannot request it. Pricing will be hidden.'}
                {selectedStatus === 'inactive' && 'Service will be hidden from all users except Super Admins.'}
              </p>
            </div>

            <div className="p-6 border-t border-secondary flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                disabled={updating}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={updating}
                className={`flex-1 px-6 py-3 ${getStatusInfo(selectedStatus).color} hover:opacity-90 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Confirm Change'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}