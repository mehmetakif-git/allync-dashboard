import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Globe, Calendar, Mail, Clock, CheckCircle2, Circle, XCircle, Info, Wrench, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getWebsiteProjectByCompanyService } from '../../../lib/api/websiteProjects';
import { getCompanyServices } from '../../../lib/api/companyServices';

const WebsiteDevelopment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>(); // Get company_service_id from URL
  const [activeTab, setActiveTab] = useState<'dashboard' | 'details' | 'support'>('dashboard');
  const [project, setProject] = useState<any>(null);
  const [companyServices, setCompanyServices] = useState<any[]>([]);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]); // All website projects for this company
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  // Fetch project by company_service_id
  useEffect(() => {
    const fetchData = async () => {
      console.log('🔍 WebsiteDevelopment - Service ID:', serviceId);
      console.log('🔍 WebsiteDevelopment - User:', user);

      if (!serviceId) {
        console.log('❌ No service ID found in URL!');
        setError('Service ID not found');
        setLoading(false);
        return;
      }

      if (!user?.company_id) {
        console.log('❌ No company ID found!');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📡 Fetching website project for service:', serviceId);
        const [projectData, servicesData] = await Promise.all([
          getWebsiteProjectByCompanyService(serviceId),
          getCompanyServices(user.company_id)
        ]);
        console.log('✅ Project fetched:', projectData);
        console.log('✅ Services fetched:', servicesData);
        setProject(projectData);
        setCompanyServices(servicesData || []);

        // Fetch all website projects for this company (for dropdown)
        const websiteServices = (servicesData || []).filter(
          (s: any) => s.service_type?.slug === 'website-development'
        );
        console.log('🔍 Website Services:', websiteServices);

        if (websiteServices.length > 0) {
          // Fetch projects for all website services
          const projectsPromises = websiteServices.map((service: any) =>
            getWebsiteProjectByCompanyService(service.id)
          );
          const projectsData = await Promise.all(projectsPromises);

          // Filter out null projects and add service info
          const validProjects = projectsData
            .map((proj, idx) => proj ? { ...proj, companyService: websiteServices[idx] } : null)
            .filter(Boolean);

          console.log('✅ Available Projects:', validProjects);
          setAvailableProjects(validProjects);

          // AUTO-REDIRECT: If current service has no project but other projects exist, redirect to first available
          if (!projectData && validProjects.length > 0) {
            console.log('🔄 No project for current service, redirecting to first available project...');
            const firstAvailableProject = validProjects[0];
            navigate(`/dashboard/services/website/${firstAvailableProject.company_service_id}`, { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId, user?.company_id, navigate]);

  // Helper objects
  const projectTypeLabels: any = {
    'e-commerce': 'E-commerce Website',
    'corporate': 'Corporate Website',
    'personal': 'Personal Website'
  };

  const statusLabels: any = {
    'completed': 'Completed',
    'in-progress': 'In Progress',
    'pending': 'Pending',
    'blocked': 'Blocked'
  };

  const statusColors: any = {
    'completed': 'text-green-400',
    'in-progress': 'text-blue-400',
    'pending': 'text-muted',
    'blocked': 'text-red-400'
  };

  const statusBgColors: any = {
    'completed': 'bg-green-500/10 border-green-500/20',
    'in-progress': 'bg-blue-500/10 border-blue-500/20',
    'pending': 'bg-gray-500/10 border-secondary/20',
    'blocked': 'bg-red-500/10 border-red-500/20'
  };

  const statusIcons: any = {
    'completed': 'CheckCircle2',
    'in-progress': 'Clock',
    'pending': 'Circle',
    'blocked': 'XCircle'
  };

  const getStatusIcon = (status: string) => {
    const iconName = statusIcons[status as keyof typeof statusIcons];
    switch (iconName) {
      case 'CheckCircle2': return CheckCircle2;
      case 'Clock': return Clock;
      case 'XCircle': return XCircle;
      default: return Circle;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  // Check if THIS SPECIFIC service instance is in maintenance mode
  // IMPORTANT: Check BOTH global service type AND individual instance
  const currentServiceInstance = companyServices.find(
    (cs: any) => cs.id === serviceId
  );

  // Debug logs
  console.log('🔍 [WebsiteDevelopment] Company Services:', companyServices);
  console.log('🔍 [WebsiteDevelopment] Current Service Instance:', currentServiceInstance);
  console.log('🔍 [WebsiteDevelopment] Service Type Status:', currentServiceInstance?.service_type?.status);
  console.log('🔍 [WebsiteDevelopment] Instance Status:', currentServiceInstance?.status);

  // CHECK 1: Global service type status (affects ALL companies)
  const isGloballyInactive = currentServiceInstance?.service_type?.status === 'inactive';
  const isGloballyInMaintenance = currentServiceInstance?.service_type?.status === 'maintenance';

  // CHECK 2: Individual instance status (affects only this company's instance)
  const isInstanceInMaintenance = currentServiceInstance?.status === 'maintenance';

  // Final maintenance state: TRUE if either global OR instance is in maintenance
  const isInMaintenance = isGloballyInMaintenance || isInstanceInMaintenance;
  const maintenanceReason = currentServiceInstance?.metadata?.maintenance_reason ||
    (isGloballyInMaintenance ? 'This service is temporarily unavailable for all users.' : undefined);

  console.log('🔍 [WebsiteDevelopment] Is Globally Inactive:', isGloballyInactive);
  console.log('🔍 [WebsiteDevelopment] Is Globally In Maintenance:', isGloballyInMaintenance);
  console.log('🔍 [WebsiteDevelopment] Is Instance In Maintenance:', isInstanceInMaintenance);
  console.log('🔍 [WebsiteDevelopment] Final Is In Maintenance:', isInMaintenance);
  console.log('🔍 [WebsiteDevelopment] Maintenance Reason:', maintenanceReason);

  // Loading state
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading project...</p>
        </div>
      </div>
    );
  }

  // ✅ GLOBALLY INACTIVE - Service type disabled by Super Admin for ALL companies
  if (isGloballyInactive) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-8 text-center max-w-2xl mx-auto mt-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-red-400 mb-3">Service Unavailable</h2>
              <p className="text-red-300/80 text-lg mb-4">
                Website Development service is currently unavailable
              </p>
              <p className="text-red-200/60 text-sm">
                This service has been temporarily disabled by the system administrator.
                Please check back later or contact support for more information.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No project state
  if (!project) {
    return (
      <div className="p-8">
        <div className="bg-card backdrop-blur-sm border border-secondary rounded-lg p-8 text-center max-w-2xl mx-auto">
          <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary mb-2">No Active Project</h3>
          <p className="text-muted mb-4">
            This website service instance hasn't been configured yet.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-left">
            <p className="text-sm text-blue-300 mb-2">
              <strong>For Company Admins:</strong>
            </p>
            <p className="text-sm text-muted">
              Please contact your Allync administrator to configure this service with your project details, milestones, and website information.
            </p>
          </div>
          {availableProjects.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-muted mb-3">You have other website projects available:</p>
              <div className="space-y-2">
                {availableProjects.map((proj: any) => (
                  <button
                    key={proj.id}
                    onClick={() => navigate(`/dashboard/services/website/${proj.company_service_id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors border border-secondary"
                  >
                    <Globe className="w-5 h-5 text-purple-400" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">{proj.project_name}</p>
                      <p className="text-xs text-muted">{projectTypeLabels[proj.project_type]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ✅ MAINTENANCE MODE - Show ONLY maintenance panel, hide all content
  if (isInMaintenance) {
    return (
      <div className="p-8">
        <div className="bg-orange-500/10 border-2 border-orange-500/50 rounded-xl p-8 text-center max-w-2xl mx-auto mt-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Wrench className="w-12 h-12 text-orange-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-orange-400 mb-3">🔧 Service Under Maintenance</h2>
              <p className="text-orange-300/80 text-lg mb-4">
                Website Development service is temporarily unavailable
              </p>
              {maintenanceReason && (
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4 mb-4">
                  <p className="text-orange-200/90 text-sm font-medium mb-1">Maintenance Reason:</p>
                  <p className="text-orange-300/70 text-sm">{maintenanceReason}</p>
                </div>
              )}
              <p className="text-orange-200/60 text-sm">
                We're working on improvements. Please check back shortly.
              </p>
              <p className="text-orange-200/50 text-xs mt-3">
                Your project data is safe and will be available once maintenance is complete.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ NORMAL MODE - Show all content
  return (
    <div className="p-8">
      {/* Normal Info Panel */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-blue-400 font-medium mb-1">Website Settings Managed by Allync</p>
            <p className="text-blue-300/70 text-sm">
              All website configuration and deployment is handled by the Allync team. View-only access provided for tracking progress.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{project.project_name}</h1>
              <p className="text-muted">{projectTypeLabels[project.project_type]} - Track your website development progress</p>
            </div>
          </div>

          {/* Project Switcher Dropdown */}
          {availableProjects.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary/80 hover:bg-secondary border border-secondary rounded-lg transition-colors text-white"
              >
                <span className="text-sm font-medium">Switch Project</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showProjectDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-card border border-secondary rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                  {availableProjects.map((proj: any) => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        navigate(`/dashboard/services/website/${proj.company_service_id}`);
                        setShowProjectDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-secondary/50 last:border-b-0 ${
                        proj.id === project.id ? 'bg-blue-500/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Globe className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {proj.project_name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted">{projectTypeLabels[proj.project_type]}</span>
                            {proj.companyService?.instance_name && (
                              <>
                                <span className="text-xs text-muted">•</span>
                                <span className="text-xs text-blue-400">{proj.companyService.instance_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {proj.id === project.id && (
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-blue-400" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-secondary">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'dashboard' ? 'text-blue-400' : 'text-muted hover:text-secondary'
          }`}
        >
          Dashboard
          {activeTab === 'dashboard' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'details' ? 'text-blue-400' : 'text-muted hover:text-secondary'
          }`}
        >
          Project Details
          {activeTab === 'details' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'support' ? 'text-blue-400' : 'text-muted hover:text-secondary'
          }`}
        >
          Support
          {activeTab === 'support' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
          )}
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card backdrop-blur-sm border border-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-purple-400" />
                <span className="text-muted text-sm">Project Type</span>
              </div>
              <p className="text-xl font-semibold text-white">
                {projectTypeLabels[project.project_type]}
              </p>
            </div>

            <div className="bg-card backdrop-blur-sm border border-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-muted text-sm">Estimated Completion</span>
              </div>
              <p className="text-xl font-semibold text-white">
                {project.estimated_completion ? formatDate(project.estimated_completion) : 'TBD'}
              </p>
            </div>

            <div className="bg-card backdrop-blur-sm border border-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-green-400" />
                <span className="text-muted text-sm">Last Update</span>
              </div>
              <p className="text-xl font-semibold text-white">
                {project.last_update ? getTimeAgo(project.last_update) : 'No updates'}
              </p>
            </div>
          </div>

          <div className="bg-card backdrop-blur-sm border border-secondary rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
              <span className="text-2xl font-bold text-blue-400">{project.overall_progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${project.overall_progress || 0}%` }}
              />
            </div>
          </div>

          {project.milestones && project.milestones.length > 0 && (
            <div className="bg-card backdrop-blur-sm border border-secondary rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Milestones</h3>
              <div className="space-y-4">
                {project.milestones.map((milestone: any) => {
                  const StatusIcon = getStatusIcon(milestone.status);
                  return (
                    <div
                      key={milestone.id}
                      className={`border rounded-lg p-4 ${statusBgColors[milestone.status]}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`w-5 h-5 ${statusColors[milestone.status]}`} />
                          <div>
                            <h4 className="font-medium text-white">{milestone.title}</h4>
                            <span className={`text-sm ${statusColors[milestone.status]}`}>
                              {statusLabels[milestone.status]}
                            </span>
                          </div>
                        </div>
                        <span className="text-lg font-semibold text-white">{milestone.progress || 0}%</span>
                      </div>

                      {milestone.status === 'in-progress' && milestone.progress > 0 && (
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                      )}

                      {milestone.notes && (
                        <p className="text-sm text-muted mt-2">{milestone.notes}</p>
                      )}

                      {milestone.completed_date && (
                        <p className="text-xs text-muted mt-2">
                          Completed: {formatDate(milestone.completed_date)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          <div className="bg-card backdrop-blur-sm border border-secondary rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Project Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-2">Project Name</label>
                <input
                  type="text"
                  value={project.project_name || 'N/A'}
                  readOnly
                  className="w-full bg-secondary/50 border border-secondary rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">Project Type</label>
                <input
                  type="text"
                  value={projectTypeLabels[project.project_type] || 'N/A'}
                  readOnly
                  className="w-full bg-secondary/50 border border-secondary rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Domain
                  </div>
                </label>
                <input
                  type="text"
                  value={project.domain || 'N/A'}
                  readOnly
                  className="w-full bg-secondary/50 border border-secondary rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </div>
                </label>
                <input
                  type="text"
                  value={project.email || 'N/A'}
                  readOnly
                  className="w-full bg-secondary/50 border border-secondary rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Estimated Completion
                  </div>
                </label>
                <input
                  type="text"
                  value={project.estimated_completion ? formatDate(project.estimated_completion) : 'TBD'}
                  readOnly
                  className="w-full bg-secondary/50 border border-secondary rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="bg-card backdrop-blur-sm border border-secondary rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
          <p className="text-muted mb-6">
            For questions about your website development project, please contact our support team.
          </p>
          <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all">
            Contact Support
          </button>
        </div>
      )}
    </div>
  );
};

export default WebsiteDevelopment;