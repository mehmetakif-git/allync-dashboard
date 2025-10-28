import { useState, useEffect } from 'react';
import { Globe, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OverallTab, CompaniesTab, ServiceContentTab } from '../../../components/admin/ServiceManagementTabs';
import serviceTypesAPI from '../../../lib/api/serviceTypes';

export default function WebsiteServiceManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overall' | 'companies' | 'content'>('overall');
  const [loading, setLoading] = useState(true);
  const [serviceData, setServiceData] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  const SERVICE_GRADIENT = 'from-purple-500 to-blue-500';

  useEffect(() => {
    loadServiceData();
  }, []);

  const loadServiceData = async () => {
    try {
      setLoading(true);
      // Get service data
      const allServices = await serviceTypesAPI.getAllServicesWithStats();
      const websiteService = allServices.find((s: any) => s.slug === 'website-development');
      setServiceData(websiteService);

      // TODO: Fetch companies using this service with their custom pricing
      // For now using mock data
      setCompanies([
        {
          id: '1',
          name: 'Tech Corp',
          status: 'active',
          activePackage: 'Standard',
          customPricing: {
            standard: { price: 3500, period: 'one-time', currency: 'USD' }
          }
        }
      ]);
    } catch (error) {
      console.error('Error loading service data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPricing = async (companyId: string, pricing: any) => {
    // TODO: Implement API call to save custom pricing
    console.log('Setting pricing for company:', companyId, pricing);

    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Refresh data
    await loadServiceData();
  };

  const handleViewDetails = (companyId: string) => {
    navigate(`/admin/companies/${companyId}`);
  };

  const handleEditContent = () => {
    alert('Content editing modal will be implemented');
  };

  // Calculate stats
  const totalCompanies = companies.length;
  const activeSubscriptions = companies.filter(c => c.status === 'active').length;
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
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-white text-xl">Loading service data...</p>
        </div>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-400">Service not found</p>
            <button
              onClick={() => navigate('/admin/services-catalog')}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Back to Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overall', label: 'Overall' },
    { id: 'companies', label: 'Companies', badge: totalCompanies },
    { id: 'content', label: 'Service Content' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/admin/services-catalog')}
          className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Services Catalog
        </button>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${SERVICE_GRADIENT} flex items-center justify-center shadow-lg`}>
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{serviceData.name_en}</h1>
              <p className="text-muted">Service Management Dashboard</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`px-4 py-2 rounded-lg border ${
            serviceData.status === 'active'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <span className="font-semibold">{serviceData.status}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-secondary">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-all relative ${
                activeTab === tab.id
                  ? 'text-purple-400'
                  : 'text-muted hover:text-secondary'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.id && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${SERVICE_GRADIENT}`} />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overall' && (
          <OverallTab
            totalCompanies={totalCompanies}
            totalRevenue={totalRevenue}
            activeSubscriptions={activeSubscriptions}
            monthlyGrowth={0}
            serviceGradient={SERVICE_GRADIENT}
            revenueByPackage={{
              basic: 0,
              standard: totalRevenue,
              premium: 0
            }}
          />
        )}

        {activeTab === 'companies' && (
          <CompaniesTab
            companies={companies}
            serviceGradient={SERVICE_GRADIENT}
            onViewDetails={handleViewDetails}
            onSetPricing={handleSetPricing}
          />
        )}

        {activeTab === 'content' && (
          <ServiceContentTab
            serviceData={serviceData}
            onEdit={handleEditContent}
            serviceGradient={SERVICE_GRADIENT}
            showPricing={false} // Website development is one-time, hide pricing
          />
        )}
      </div>
    </div>
  );
}
