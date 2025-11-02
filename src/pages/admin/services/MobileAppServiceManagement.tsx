import { useState, useEffect } from 'react';
import { Smartphone, ArrowLeft, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OverallTab, CompaniesTab, ServiceContentTab } from '../../../components/admin/ServiceManagementTabs';
import serviceTypesAPI from '../../../lib/api/serviceTypes';
import { getAllCompaniesWithServicePricing, setCompanyServicePricing } from '../../../lib/api/companyServicePricing';
import serviceRequestsAPI from '../../../lib/api/serviceRequests';
import { useAuth } from '../../../contexts/AuthContext';
import { getAllMobileAppProjects } from '../../../lib/api/mobileAppProjects';
import { getProjectMedia } from '../../../lib/api/projectMedia';
import ProjectMediaUploadModal from '../../../components/modals/ProjectMediaUploadModal';

export default function MobileAppServiceManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overall' | 'companies' | 'content' | 'projects'>('overall');
  const [loading, setLoading] = useState(true);
  const [serviceData, setServiceData] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  // Projects tab state
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [projectMedia, setProjectMedia] = useState<Record<string, any[]>>({});

  const SERVICE_GRADIENT = 'from-blue-500 to-cyan-500';

  useEffect(() => {
    loadServiceData();
  }, []);

  const loadServiceData = async () => {
    try {
      setLoading(true);
      // Get service data
      const allServices = await serviceTypesAPI.getAllServicesWithStats();
      const mobileService = allServices.find((s: any) => s.slug === 'mobile-app-development');
      setServiceData(mobileService);

      if (!mobileService) {
        console.error('Mobile app service not found');
        return;
      }

      // Fetch companies using this service with their custom pricing
      const companiesData = await getAllCompaniesWithServicePricing(mobileService.id);
      setCompanies(companiesData);

      // Fetch pending service requests for this service
      const requestsData = await serviceRequestsAPI.getServiceRequestsByServiceType(mobileService.id, 'pending');
      setPendingRequests(requestsData);

      // Fetch all mobile app projects
      const projectsData = await getAllMobileAppProjects();
      setProjects(projectsData);

      console.log('📊 Loaded companies:', companiesData);
      console.log('📋 Loaded pending requests:', requestsData);
      console.log('📱 Loaded projects:', projectsData);
    } catch (error) {
      console.error('Error loading service data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectMedia = async (projectId: string) => {
    try {
      const media = await getProjectMedia(projectId, 'mobile-app');
      setProjectMedia(prev => ({ ...prev, [projectId]: media }));
    } catch (error) {
      console.error('Error loading project media:', error);
    }
  };

  const handleOpenUploadModal = (project: any) => {
    setSelectedProject(project);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = async () => {
    if (selectedProject) {
      await loadProjectMedia(selectedProject.id);
      await loadServiceData(); // Reload to get fresh data
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
      throw error; // Re-throw so modal can show error
    }
  };

  const handleViewDetails = (companyId: string) => {
    navigate(`/admin/companies/${companyId}`);
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
      throw error; // Re-throw so modal can show error
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
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
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
    { id: 'projects', label: 'Projects', badge: projects.length },
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
              <Smartphone className="w-8 h-8 text-white" />
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
                  ? 'text-blue-400'
                  : 'text-muted hover:text-secondary'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
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
              standard: 0,
              premium: totalRevenue
            }}
          />
        )}

        {activeTab === 'companies' && (
          <CompaniesTab
            companies={companies}
            pendingRequests={pendingRequests}
            serviceGradient={SERVICE_GRADIENT}
            onViewDetails={handleViewDetails}
            onSetPricing={handleSetPricing}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
          />
        )}

        {activeTab === 'content' && (
          <ServiceContentTab
            serviceData={serviceData}
            onEdit={handleEditContent}
            serviceGradient={SERVICE_GRADIENT}
            showPricing={false} // Mobile app development is one-time, hide pricing
          />
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            {projects.length === 0 ? (
              <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-12 text-center">
                <ImageIcon className="w-16 h-16 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
                <p className="text-muted">Mobile app projects will appear here once created.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {project.project_name || 'Unnamed Project'}
                          </h3>
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            project.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : project.status === 'completed'
                              ? 'bg-blue-500/20 text-blue-400'
                              : project.status === 'paused'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {project.status?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted">
                          <span>🏢 {project.company?.name || 'Unknown Company'}</span>
                          <span>📊 {project.overall_progress || 0}% Complete</span>
                          {project.platforms && <span>📱 {project.platforms.join(', ')}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenUploadModal(project)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Media
                      </button>
                    </div>

                    {/* Milestones */}
                    {project.milestones && project.milestones.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-muted mb-2">Milestones:</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.milestones.map((milestone: any) => (
                            <div
                              key={milestone.id}
                              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                milestone.status === 'completed'
                                  ? 'bg-green-500/20 text-green-400'
                                  : milestone.status === 'in-progress'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : milestone.status === 'blocked'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {milestone.title} ({milestone.progress || 0}%)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Media Gallery Preview */}
                    {projectMedia[project.id] && projectMedia[project.id].length > 0 ? (
                      <div>
                        <h4 className="text-sm font-semibold text-muted mb-2">
                          Media Gallery ({projectMedia[project.id].length} items)
                        </h4>
                        <div className="grid grid-cols-6 gap-2">
                          {projectMedia[project.id].slice(0, 6).map((media: any) => (
                            <div
                              key={media.id}
                              className="aspect-square rounded-lg overflow-hidden bg-secondary border border-secondary hover:border-blue-500/50 transition-all"
                            >
                              {media.file_type === 'image' ? (
                                <img
                                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/project-media/${media.file_path}`}
                                  alt={media.title || media.file_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-purple-500/10">
                                  <ImageIcon className="w-6 h-6 text-purple-400" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {projectMedia[project.id].length > 6 && (
                          <p className="text-xs text-muted mt-2">
                            +{projectMedia[project.id].length - 6} more items
                          </p>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => loadProjectMedia(project.id)}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Load media gallery
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {selectedProject && (
        <ProjectMediaUploadModal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedProject(null);
          }}
          projectId={selectedProject.id}
          projectType="mobile-app"
          companyId={selectedProject.company_id}
          companyName={selectedProject.company?.name || 'Unknown Company'}
          milestones={selectedProject.milestones || []}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
