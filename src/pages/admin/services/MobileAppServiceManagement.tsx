import { useState, useEffect } from 'react';
import { Smartphone, ArrowLeft, Loader2, Upload, Image as ImageIcon, Trash2, X, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OverallTab, CompaniesTab, ServiceContentTab } from '../../../components/admin/ServiceManagementTabs';
import serviceTypesAPI from '../../../lib/api/serviceTypes';
import { getAllCompaniesWithServicePricing, setCompanyServicePricing } from '../../../lib/api/companyServicePricing';
import serviceRequestsAPI from '../../../lib/api/serviceRequests';
import { useAuth } from '../../../contexts/AuthContext';
import { getAllMobileAppProjects } from '../../../lib/api/mobileAppProjects';
import { getProjectMedia, getMediaPublicUrl, deleteMedia } from '../../../lib/api/projectMedia';
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
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState<any>(null);

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

      // Generate signed URLs for each media item
      const mediaWithUrls = await Promise.all(
        media.map(async (item) => ({
          ...item,
          signedUrl: await getMediaPublicUrl(item.file_path)
        }))
      );

      setProjectMedia(prev => ({ ...prev, [projectId]: mediaWithUrls }));
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

  const handleDeleteMedia = async (media: any) => {
    setDeletingMedia(media);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingMedia || !selectedProject) return;

    try {
      console.log('🗑️ Deleting media:', deletingMedia.file_name);
      await deleteMedia(deletingMedia.id, deletingMedia.file_path);

      // Reload media for this project
      await loadProjectMedia(selectedProject.id);

      setShowDeleteConfirm(false);
      setDeletingMedia(null);
      setSelectedMedia(null);

      console.log('✅ Media deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting media:', error);
      alert('Failed to delete media. Please try again.');
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
      <div className="p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-white text-xl">Loading service data...</p>
        </div>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="p-6">
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
    <div className="p-6">
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
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-12 text-center">
                <ImageIcon className="w-16 h-16 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
                <p className="text-muted">Mobile app projects will appear here once created.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6 hover:border-blue-500/50 transition-all"
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
                        <div className="grid grid-cols-3 gap-3">
                          {projectMedia[project.id].map((media: any) => (
                            <div
                              key={media.id}
                              className="bg-secondary/50 border border-secondary rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all group cursor-pointer"
                              onClick={() => setSelectedMedia(media)}
                            >
                              {/* Media Preview */}
                              <div className="aspect-video bg-primary relative overflow-hidden">
                                {media.file_type === 'image' ? (
                                  <img
                                    src={media.signedUrl}
                                    alt={media.title || media.file_name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      console.error('Failed to load image:', media.file_path);
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-cyan-500/10">
                                    <ImageIcon className="w-6 h-6 text-cyan-400" />
                                  </div>
                                )}

                                {/* Delete Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMedia(media);
                                    setSelectedProject(project);
                                  }}
                                  className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Delete media"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Media Info */}
                              <div className="p-3">
                                <p className="text-sm font-medium text-white truncate mb-1">
                                  {media.title || media.file_name}
                                </p>
                                {media.milestone_name && (
                                  <div className="flex items-center gap-1 text-xs text-cyan-400 mb-1">
                                    <FileText className="w-3 h-3" />
                                    <span className="truncate">{media.milestone_name}</span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between text-xs text-muted">
                                  <span>{(media.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                  <span>{new Date(media.uploaded_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
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

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-card rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
              {/* Media Display */}
              <div className="flex-1 bg-black flex items-center justify-center p-4">
                {selectedMedia.file_type === 'image' ? (
                  <img
                    src={selectedMedia.signedUrl}
                    alt={selectedMedia.title || selectedMedia.file_name}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                ) : (
                  <video
                    src={selectedMedia.signedUrl}
                    controls
                    className="max-w-full max-h-[70vh]"
                  />
                )}
              </div>

              {/* Media Info Sidebar */}
              <div className="w-full md:w-80 bg-secondary/50 p-6 overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-4">
                  {selectedMedia.title || 'Media Details'}
                </h3>

                {selectedMedia.description && (
                  <div className="mb-4">
                    <p className="text-xs text-muted mb-1">Description</p>
                    <p className="text-sm text-white">{selectedMedia.description}</p>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  {selectedMedia.milestone_name && (
                    <div>
                      <p className="text-xs text-muted mb-1">Milestone</p>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <p className="text-sm text-white">{selectedMedia.milestone_name}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted mb-1">File Name</p>
                    <p className="text-sm text-white break-all">{selectedMedia.file_name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted mb-1">File Type</p>
                    <p className="text-sm text-white uppercase">{selectedMedia.file_type}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted mb-1">File Size</p>
                    <p className="text-sm text-white">
                      {(selectedMedia.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted mb-1">Uploaded</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted" />
                      <p className="text-sm text-white">
                        {new Date(selectedMedia.uploaded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    handleDeleteMedia(selectedMedia);
                  }}
                  className="w-full px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Media
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingMedia && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowDeleteConfirm(false);
            setDeletingMedia(null);
          }}
        >
          <div
            className="bg-card rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Media?</h3>
                <p className="text-sm text-muted">
                  Are you sure you want to delete "{deletingMedia.title || deletingMedia.file_name}"?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingMedia(null);
                }}
                className="flex-1 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-white rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
