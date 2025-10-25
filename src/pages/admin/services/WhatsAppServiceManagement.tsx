import { useState } from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { serviceTypes } from '../../../data/services';
import ServiceContentModal from '../../../components/modals/ServiceContentModal';
import WhatsAppSettingsModal from '../../../components/modals/WhatsAppSettingsModal';
import { ServiceContentTab, CompaniesTab, AnalyticsTab } from '../../../components/admin/ServiceManagementTabs';
import { mockWhatsAppInstances } from '../../../data/mockWhatsAppData';

export default function WhatsAppServiceManagement() {
  const [activeTab, setActiveTab] = useState<'content' | 'companies' | 'analytics'>('content');
  const [showContentModal, setShowContentModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const serviceData = serviceTypes.find(s => s.slug === 'whatsapp-automation');
  const SERVICE_GRADIENT = 'from-green-500 to-emerald-600';

  // Mock companies using this service
  const companiesUsingService = [
    {
      id: '1',
      name: 'Tech Corp',
      instanceCount: mockWhatsAppInstances.filter(i => i.companyId === '1').length,
      status: 'active',
      plan: 'Professional'
    }
  ];

  const totalInstances = mockWhatsAppInstances.length;
  const totalRevenue = companiesUsingService.length * 299;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-muted hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services Catalog
          </button>

          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${SERVICE_GRADIENT} flex items-center justify-center shadow-lg`}>
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{serviceData?.name_en}</h1>
              <p className="text-muted">Service Management</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-secondary">
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === 'content' ? 'text-white' : 'text-muted hover:text-secondary'
            }`}
          >
            Service Content
            {activeTab === 'content' && (
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${SERVICE_GRADIENT}`} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === 'companies' ? 'text-white' : 'text-muted hover:text-secondary'
            }`}
          >
            Companies
            {activeTab === 'companies' && (
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${SERVICE_GRADIENT}`} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === 'analytics' ? 'text-white' : 'text-muted hover:text-secondary'
            }`}
          >
            Analytics
            {activeTab === 'analytics' && (
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${SERVICE_GRADIENT}`} />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'content' && (
          <ServiceContentTab
            serviceData={serviceData}
            onEdit={() => setShowContentModal(true)}
            serviceGradient={SERVICE_GRADIENT}
          />
        )}

        {activeTab === 'companies' && (
          <CompaniesTab
            companies={companiesUsingService}
            onViewDetails={(companyId) => {
              window.location.hash = 'companies-management';
            }}
            onConfigure={(company) => {
              setSelectedCompany(company);
              setShowSettingsModal(true);
            }}
            serviceGradient={SERVICE_GRADIENT}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            totalCompanies={companiesUsingService.length}
            totalInstances={totalInstances}
            totalRevenue={totalRevenue}
            monthlyGrowth={15}
            serviceGradient={SERVICE_GRADIENT}
          />
        )}

        {/* Modals */}
        {showContentModal && serviceData && (
          <ServiceContentModal
            serviceData={serviceData}
            onClose={() => setShowContentModal(false)}
            onSave={(data) => {
              console.log('Service content updated:', data);
              setShowContentModal(false);
            }}
          />
        )}

        {showSettingsModal && selectedCompany && (
          <WhatsAppSettingsModal
            companyName={selectedCompany.name}
            onClose={() => {
              setShowSettingsModal(false);
              setSelectedCompany(null);
            }}
            onSave={(settings) => {
              console.log('Settings saved:', settings);
              setShowSettingsModal(false);
              setSelectedCompany(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
