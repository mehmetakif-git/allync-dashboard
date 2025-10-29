import { useState, useEffect } from 'react';
import { Smartphone, Calendar, CheckCircle2, Circle, Clock, XCircle, ExternalLink, Info, Wrench } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getMobileAppProjectsByCompany } from '../../../lib/api/mobileAppProjects';
import { getCompanyServices } from '../../../lib/api/companyServices';

const MobileAppDevelopment: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'details' | 'support'>('dashboard');
  const [projects, setProjects] = useState<any[]>([]);
  const [companyServices, setCompanyServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    const fetchData = async () => {
      console.log('🔍 MobileAppDevelopment - User:', user);
      console.log('🔍 MobileAppDevelopment - Company ID:', user?.company_id);

      if (!user?.company_id) {
        console.log('❌ No company ID found!');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📡 Fetching mobile app projects and services...');
        const [projectsData, servicesData] = await Promise.all([
          getMobileAppProjectsByCompany(user.company_id),
          getCompanyServices(user.company_id)
        ]);
        console.log('✅ Projects fetched:', projectsData);
        console.log('✅ Services fetched:', servicesData);
        setProjects(projectsData || []);
        setCompanyServices(servicesData || []);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.company_id]);

  const project = projects[0];

  // Platform labels
  const platformLabels: any = {
    'android': 'Android',
    'ios': 'iOS',
    'both': 'Android & iOS'
  };

  const platformColors: any = {
    'android': 'from-green-500 to-green-600',
    'ios': 'from-blue-500 to-blue-600',
    'both': 'from-cyan-500 to-blue-600'
  };

  // Store status labels
  const storeStatusLabels: any = {
    'pending': 'Pending',
    'submitted': 'Submitted',
    'in-review': 'In Review',
    'approved': 'Approved',
    'published': 'Published',
    'rejected': 'Rejected'
  };

  const storeStatusColors: any = {
    'pending': 'bg-gray-500/10 border-secondary/30 text-muted',
    'submitted': 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    'in-review': 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    'approved': 'bg-green-500/10 border-green-500/30 text-green-400',
    'published': 'bg-green-500/10 border-green-500/30 text-green-400',
    'rejected': 'bg-red-500/10 border-red-500/30 text-red-400'
  };

  // Milestone status
  const milestoneStatusLabels: any = {
    'completed': 'Completed',
    'in-progress': 'In Progress',
    'pending': 'Pending',
    'blocked': 'Blocked'
  };

  const milestoneStatusColors: any = {
    'completed': 'text-green-400',
    'in-progress': 'text-blue-400',
    'pending': 'text-muted',
    'blocked': 'text-red-400'
  };

  const milestoneStatusBgColors: any = {
    'completed': 'bg-green-500/10 border-green-500/20',
    'in-progress': 'bg-blue-500/10 border-blue-500/20',
    'pending': 'bg-gray-500/10 border-secondary/20',
    'blocked': 'bg-red-500/10 border-red-500/20'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle2;
      case 'in-progress': return Clock;
      case 'blocked': return XCircle;
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

  // Check if this service is in maintenance mode
  const mobileAppService = companyServices.find(
    (cs: any) => cs.service_type?.slug === 'mobile-app-development'
  );

  // Debug logs
  console.log('🔍 [MobileAppDevelopment] Company Services:', companyServices);
  console.log('🔍 [MobileAppDevelopment] Mobile App Service:', mobileAppService);
  console.log('🔍 [MobileAppDevelopment] Status:', mobileAppService?.status);

  const isInMaintenance = mobileAppService?.status === 'maintenance';
  console.log('🔍 [MobileAppDevelopment] Is In Maintenance:', isInMaintenance);

  // Loading state
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading project...</p>
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
  if (!project || projects.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-card backdrop-blur-sm border border-secondary rounded-lg p-8 text-center">
          <Smartphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary mb-2">No Active Project</h3>
          <p className="text-muted">No mobile app development project found for your company.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Maintenance Mode Panel */}
      {isInMaintenance && (
        <div className="bg-orange-500/10 border-2 border-orange-500/50 rounded-xl p-8 mb-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Wrench className="w-10 h-10 text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-orange-400 mb-2">🔧 Service Under Maintenance</h2>
              <p className="text-orange-300/80 text-lg mb-4">
                Mobile App Development service is temporarily unavailable
              </p>
              <p className="text-orange-200/60 text-sm">
                We're working on improvements. Please check back shortly. Your project data is safe.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Normal Info Panel */}
      {!isInMaintenance && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-blue-400 font-medium mb-1">App Settings Managed by Allync</p>
              <p className="text-blue-300/70 text-sm">
                All app configuration and publishing is handled by the Allync team. View-only access provided for tracking progress.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 bg-gradient-to-br ${platformColors[project.platform]} rounded-xl flex items-center justify-center`}>
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{project.project_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${platformColors[project.platform]} text-white`}>
                  {platformLabels[project.platform]}
                </span>
                <span className="text-muted text-sm">{project.app_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-secondary">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'dashboard' ? 'text-cyan-400' : 'text-muted hover:text-secondary'
          }`}
        >
          Dashboard
          {activeTab === 'dashboard' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'details' ? 'text-cyan-400' : 'text-muted hover:text-secondary'
          }`}
        >
          Project Details
          {activeTab === 'details' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'support' ? 'text-cyan-400' : 'text-muted hover:text-secondary'
          }`}
        >
          Support
          {activeTab === 'support' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
          )}
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card backdrop-blur-sm border border-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <span className="text-muted text-sm">Platform</span>
              </div>
              <p className="text-xl font-semibold text-white">
                {platformLabels[project.platform]}
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
              <span className="text-2xl font-bold text-cyan-400">{project.overall_progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${project.overall_progress || 0}%` }}
              />
            </div>
          </div>

          <div className="bg-card backdrop-blur-sm border border-secondary rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">App Store Publishing Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(project.platform === 'android' || project.platform === 'both') && (
                <div className="bg-primary/50 border border-secondary rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Google Play Store</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${storeStatusColors[project.play_store_status || 'pending']}`}>
                      {storeStatusLabels[project.play_store_status || 'pending']}
                    </span>
                  </div>
                  {project.play_store_url && (
                    <a
                      href={project.play_store_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      View on Play Store
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

              {(project.platform === 'ios' || project.platform === 'both') && (
                <div className="bg-primary/50 border border-secondary rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Apple App Store</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${storeStatusColors[project.app_store_status || 'pending']}`}>
                      {storeStatusLabels[project.app_store_status || 'pending']}
                    </span>
                  </div>
                  {project.app_store_url && (
                    <a
                      href={project.app_store_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      View on App Store
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {project.milestones && project.milestones.length > 0 && (
            <div className="bg-card backdrop-blur-sm border border-secondary rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Development Milestones</h3>
              <div className="space-y-4">
                {project.milestones.map((milestone: any) => {
                  const StatusIcon = getStatusIcon(milestone.status);
                  return (
                    <div
                      key={milestone.id}
                      className={`border rounded-lg p-4 ${milestoneStatusBgColors[milestone.status]}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`w-5 h-5 ${milestoneStatusColors[milestone.status]}`} />
                          <div>
                            <h4 className="font-medium text-white">{milestone.title}</h4>
                            <span className={`text-sm ${milestoneStatusColors[milestone.status]}`}>
                              {milestoneStatusLabels[milestone.status]}
                            </span>
                          </div>
                        </div>
                        <span className="text-lg font-semibold text-white">{milestone.progress || 0}%</span>
                      </div>

                      {milestone.status === 'in-progress' && milestone.progress > 0 && (
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
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
                <label className="block text-sm text-muted mb-2">App Name</label>
                <input
                  type="text"
                  value={project.app_name || 'N/A'}
                  readOnly
                  className="w-full bg-secondary/50 border border-secondary rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">Platform</label>
                <input
                  type="text"
                  value={platformLabels[project.platform] || 'N/A'}
                  readOnly
                  className="w-full bg-secondary/50 border border-secondary rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>

              {(project.platform === 'android' || project.platform === 'both') && project.package_name && (
                <div>
                  <label className="block text-sm text-muted mb-2">Package Name (Android)</label>
                  <input
                    type="text"
                    value={project.package_name}
                    readOnly
                    className="w-full bg-secondary/50 border border-secondary rounded-lg px-4 py-2 text-white cursor-not-allowed"
                  />
                </div>
              )}

              {(project.platform === 'ios' || project.platform === 'both') && project.bundle_id && (
                <div>
                  <label className="block text-sm text-muted mb-2">Bundle ID (iOS)</label>
                  <input
                    type="text"
                    value={project.bundle_id}
                    readOnly
                    className="w-full bg-secondary/50 border border-secondary rounded-lg px-4 py-2 text-white cursor-not-allowed"
                  />
                </div>
              )}

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
            For questions about your mobile app development project, please contact our support team.
          </p>
          <button className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg transition-all">
            Contact Support
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileAppDevelopment;