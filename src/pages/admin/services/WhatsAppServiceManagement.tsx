import { useState, useEffect } from 'react';
import { MessageCircle, ArrowLeft, Loader2, Plus, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OverallTab, CompaniesTab, ServiceContentTab } from '../../../components/admin/ServiceManagementTabs';
import serviceTypesAPI from '../../../lib/api/serviceTypes';
import { getAllCompaniesWithServicePricing, setCompanyServicePricing } from '../../../lib/api/companyServicePricing';
import serviceRequestsAPI from '../../../lib/api/serviceRequests';
import { getAllWhatsappInstancesWithStats } from '../../../lib/api/whatsappInstances';
import { useAuth } from '../../../contexts/AuthContext';
import WhatsAppInstanceModal from '../../../components/modals/WhatsAppInstanceModal';
import { WhatsAppInstance } from '../../../types/whatsapp';

export default function WhatsAppServiceManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overall' | 'companies' | 'content'>('overall');
  const [loading, setLoading] = useState(true);
  const [serviceData, setServiceData] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [showInstanceModal, setShowInstanceModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  const SERVICE_GRADIENT = 'from-green-500 to-emerald-600';

  useEffect(() => {
    loadServiceData();
  }, []);

  const loadServiceData = async () => {
    try {
      setLoading(true);

      // Get service data
      const allServices = await serviceTypesAPI.getAllServicesWithStats();
      const whatsappService = allServices.find((s: any) => s.slug === 'whatsapp-automation');

      if (!whatsappService) {
        console.error('WhatsApp service not found in service types');
        // You may need to create it in the database
      }

      setServiceData(whatsappService);

      if (whatsappService) {
        // Fetch companies using this service with their custom pricing
        const companiesData = await getAllCompaniesWithServicePricing(whatsappService.id);
        setCompanies(companiesData);

        // Fetch pending service requests for this service
        const requestsData = await serviceRequestsAPI.getServiceRequestsByServiceType(whatsappService.id, 'pending');
        setPendingRequests(requestsData);
      }

      // Fetch all WhatsApp instances with stats
      const instancesData = await getAllWhatsappInstancesWithStats();
      setInstances(instancesData);

      console.log('📊 Loaded companies:', companiesData);
      console.log('📋 Loaded pending requests:', requestsData);
      console.log('📱 Loaded instances:', instancesData);
    } catch (error) {
      console.error('Error loading service data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPricing = async (companyId: string, pricing: any) => {
    if (!serviceData) return;

    try {
      console.log('💾 Setting pricing for company:', companyId, pricing);

      await setCompanyServicePricing(companyId, serviceData.id, pricing);

      console.log('✅ Pricing set successfully');

      // Refresh data
      await loadServiceData();
    } catch (error) {
      console.error('❌ Error setting pricing:', error);
      throw error;
    }
  };

  const handleViewDetails = (companyId: string) => {
    navigate(`/admin/companies/${companyId}`);
  };

  const handleManageInstances = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedInstance(null);
    setShowInstanceModal(true);
  };

  const handleEditInstance = (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
    setSelectedCompanyId(instance.company_id);
    setShowInstanceModal(true);
  };

  const handleCreateInstance = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedInstance(null);
    setShowInstanceModal(true);
  };

  const handleModalClose = () => {
    setShowInstanceModal(false);
    setSelectedInstance(null);
    setSelectedCompanyId('');
  };

  const handleModalSuccess = async () => {
    await loadServiceData();
    handleModalClose();
  };

  const handleEditContent = async (updatedData: any) => {
    if (!serviceData) return;

    try {
      console.log('💾 Updating service content:', updatedData);

      await serviceTypesAPI.updateServiceContent(serviceData.id, updatedData);

      console.log('✅ Service content updated successfully');

      // Refresh data to show updated content
      await loadServiceData();
    } catch (error) {
      console.error('❌ Error updating content:', error);
      throw error;
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }

    try {
      console.log('✅ Approving service request:', requestId);
      await serviceRequestsAPI.approveServiceRequest(requestId, user.id);
      console.log('✅ Request approved successfully');

      // Refresh data
      await loadServiceData();
    } catch (error) {
      console.error('❌ Error approving request:', error);
      throw error;
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }

    try {
      console.log('❌ Rejecting service request:', requestId, 'Reason:', reason);
      await serviceRequestsAPI.rejectServiceRequest(requestId, reason, user.id);
      console.log('✅ Request rejected successfully');

      // Refresh data
      await loadServiceData();
    } catch (error) {
      console.error('❌ Error rejecting request:', error);
      throw error;
    }
  };

  // Calculate stats
  const totalCompanies = companies.length;
  const activeSubscriptions = companies.filter(c => c.status === 'active').length;
  const totalInstances = instances.length;
  const connectedInstances = instances.filter(i => i.is_connected).length;
  const totalMessages = instances.reduce((sum, i) => sum + (i.stats?.today_messages || 0), 0);
  const activeSessions = instances.reduce((sum, i) => sum + (i.stats?.active_sessions || 0), 0);
  const totalRevenue = companies.reduce((sum, c) => {
    if (c.customPricing) {
      return sum + Object.values(c.customPricing).reduce((psum: number, p: any) => psum + (p.price || 0), 0);
    }
    return sum;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
          <p className="text-white text-xl">Loading WhatsApp service data...</p>
        </div>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-8 text-center">
            <MessageCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-orange-400 mb-2">WhatsApp Service Not Found</h2>
            <p className="text-orange-300 mb-4">
              The WhatsApp service type hasn't been created in the database yet.
            </p>
            <p className="text-sm text-muted">
              You need to create a service type with slug 'whatsapp-service' in the service_types table.
            </p>
            <button
              onClick={() => navigate('/admin/services-catalog')}
              className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Go to Services Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/services-catalog')}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${SERVICE_GRADIENT} rounded-xl flex items-center justify-center`}>
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">WhatsApp Service Management</h1>
                <p className="text-muted">Manage WhatsApp bot instances and integrations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Active Companies</p>
                <p className="text-3xl font-bold text-white mt-2">{activeSubscriptions}</p>
              </div>
              <MessageCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Total Instances</p>
                <p className="text-3xl font-bold text-white mt-2">{totalInstances}</p>
                <p className="text-xs text-muted mt-1">{connectedInstances} connected</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${connectedInstances > 0 ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                <div className={`w-6 h-6 rounded-full ${connectedInstances > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            </div>
          </div>

          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Messages Today</p>
                <p className="text-3xl font-bold text-white mt-2">{totalMessages}</p>
              </div>
              <div className="text-4xl">💬</div>
            </div>
          </div>

          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Active Sessions</p>
                <p className="text-3xl font-bold text-white mt-2">{activeSessions}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-secondary">
          <button
            onClick={() => setActiveTab('overall')}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === 'overall' ? 'text-green-400' : 'text-muted hover:text-secondary'
            }`}
          >
            Overall
            {activeTab === 'overall' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === 'companies' ? 'text-green-400' : 'text-muted hover:text-secondary'
            }`}
          >
            Companies ({totalCompanies})
            {activeTab === 'companies' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === 'content' ? 'text-green-400' : 'text-muted hover:text-secondary'
            }`}
          >
            Service Content
            {activeTab === 'content' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overall' && (
          <OverallTab
            serviceData={serviceData}
            totalCompanies={totalCompanies}
            activeSubscriptions={activeSubscriptions}
            totalRevenue={totalRevenue}
            pendingRequests={pendingRequests}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            serviceGradient={SERVICE_GRADIENT}
            additionalStats={{
              'Total Instances': totalInstances,
              'Connected Instances': connectedInstances,
              'Messages Today': totalMessages,
              'Active Sessions': activeSessions,
            }}
          />
        )}

        {activeTab === 'companies' && (
          <CompaniesTab
            companies={companies.map(c => ({
              ...c,
              instances: instances.filter(i => i.company_id === c.id),
            }))}
            onSetPricing={handleSetPricing}
            onViewDetails={handleViewDetails}
            onManageInstances={handleManageInstances}
            serviceGradient={SERVICE_GRADIENT}
          />
        )}

        {activeTab === 'content' && (
          <ServiceContentTab
            serviceData={serviceData}
            onEditContent={handleEditContent}
            serviceGradient={SERVICE_GRADIENT}
          />
        )}
      </div>

      {/* WhatsApp Instance Modal */}
      <WhatsAppInstanceModal
        isOpen={showInstanceModal}
        onClose={handleModalClose}
        instance={selectedInstance}
        companyId={selectedCompanyId}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
