import { useState, useEffect } from 'react';
import { Smartphone, Building2, TrendingUp, BarChart3, ArrowLeft, Settings, Clock, CheckCircle2 } from 'lucide-react';
import MobileAppSettingsModal from '../../../components/modals/MobileAppSettingsModal';
import { getAllCompaniesWithProjects } from '../../../lib/api/companies';
import { updateMobileAppProjectWithMilestones } from '../../../lib/api/mobileAppProjects';

export default function MobileAppServiceManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'analytics'>('overview');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  // Fetch companies with projects
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        console.log('📡 Fetching companies with mobile app projects...');
        const data = await getAllCompaniesWithProjects();
        console.log('✅ Companies fetched:', data);
        
        // Filter companies that have mobile app projects
        const companiesWithMobile = data.filter((c: any) => c.mobile_app_projects && c.mobile_app_projects.length > 0);
        setCompanies(companiesWithMobile);
      } catch (err) {
        console.error('❌ Error fetching companies:', err);
        setError('Failed to load companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const companiesUsingService = companies.map((company: any) => ({
    id: company.id,
    name: company.name,
    activeSince: company.created_at,
    package: 'Professional',
    projects: company.mobile_app_projects || []
  }));

  const allProjects = companiesUsingService.flatMap(c => c.projects);
  const activeProjectsCount = allProjects.filter((p: any) => p.status === 'active').length;
  const completedProjectsCount = allProjects.filter((p: any) => p.status === 'completed').length;
  const androidProjects = allProjects.filter((p: any) => p.platform === 'android' || p.platform === 'both').length;
  const iosProjects = allProjects.filter((p: any) => p.platform === 'ios' || p.platform === 'both').length;

  const globalStats = {
    totalCompanies: companiesUsingService.length,
    activeProjects: activeProjectsCount,
    completedProjects: completedProjectsCount,
    totalRevenue: companiesUsingService.reduce((sum, c) => {
      const price = c.package === 'Basic' ? 199 : c.package === 'Professional' ? 399 : 899;
      return sum + price;
    }, 0),
    avgCompletionTime: '8-12 weeks',
    avgProgress: allProjects.length > 0
      ? Math.round(
          allProjects.reduce((sum: number, p: any) => sum + (p.overall_progress || 0), 0) / allProjects.length
        )
      : 0,
    androidProjects,
    iosProjects,
  };

  const handleConfigureSettings = (company: any) => {
    setSelectedCompany(company);
    setShowSettingsModal(true);
  };

  const handleSaveSettings = async (settings: any) => {
    if (!selectedCompany?.selectedProject) return;

    try {
      setSaving(true);
      console.log('💾 Saving mobile app settings:', settings);

      const projectId = selectedCompany.selectedProject.id;
      
      // Update project
      await updateMobileAppProjectWithMilestones(
        projectId,
        {
          project_name: settings.projectName,
          platform: settings.platform,
          app_name: settings.appName,
          package_name: settings.packageName,
          bundle_id: settings.bundleId,
          play_store_status: settings.playStoreStatus,
          play_store_url: settings.playStoreUrl,
          app_store_status: settings.appStoreStatus,
          app_store_url: settings.appStoreUrl,
          estimated_completion: settings.estimatedCompletion,
        },
        settings.milestones
      );

      console.log('✅ Mobile app project updated successfully');
      
      // Refresh data
      const data = await getAllCompaniesWithProjects();
      const companiesWithMobile = data.filter((c: any) => c.mobile_app_projects && c.mobile_app_projects.length > 0);
      setCompanies(companiesWithMobile);
      
      setShowSettingsModal(false);
      setSelectedCompany(null);
    } catch (err) {
      console.error('❌ Error saving settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'companies', label: 'Companies', icon: Building2, badge: companiesUsingService.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading companies...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => window.location.hash = 'services-catalog'}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Services Catalog
        </button>

        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-cyan-400 font-medium mb-1">Mobile App Development Service</p>
              <p className="text-cyan-300/70 text-sm">
                Manage mobile app projects, track development progress, and monitor app store publishing status.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Mobile App Development - Service Management</h1>
              <p className="text-gray-400">Manage projects, configure settings, and view analytics</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all relative ${
                  activeTab === tab.id
                    ? 'text-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Active Projects</span>
                  <Building2 className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-white">{globalStats.activeProjects}</p>
                <p className="text-xs text-gray-500 mt-1">In development</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Total Revenue</span>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white">${globalStats.totalRevenue}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Avg Progress</span>
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white">{globalStats.avgProgress}%</p>
                <p className="text-xs text-gray-500 mt-1">Across all projects</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Avg Timeline</span>
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-white">{globalStats.avgCompletionTime}</p>
                <p className="text-xs text-gray-500 mt-1">Completion time</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Platform Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Android Apps</span>
                      <span className="text-sm text-green-400 font-medium">{globalStats.androidProjects} projects</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${allProjects.length > 0 ? (globalStats.androidProjects / allProjects.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">iOS Apps</span>
                      <span className="text-sm text-blue-400 font-medium">{globalStats.iosProjects} projects</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${allProjects.length > 0 ? (globalStats.iosProjects / allProjects.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">Tech Corp - Backend API Completed</p>
                      <p className="text-sm text-gray-400">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">Tech Corp - UI/UX Design Approved</p>
                      <p className="text-sm text-gray-400">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Companies Using This Service</h2>
                <span className="text-sm text-gray-400">{companiesUsingService.length} active</span>
              </div>

              {companiesUsingService.length === 0 ? (
                <div className="text-center py-12">
                  <Smartphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-white font-medium">No companies using this service yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {companiesUsingService.map((company) => (
                    <div key={company.id} className="space-y-4">
                      <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">{company.name}</h3>
                              <p className="text-sm text-gray-400">{company.package} Package - {company.projects.length} project{company.projects.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              window.location.hash = `company-detail/${company.id}`;
                            }}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                          >
                            View Company
                          </button>
                        </div>

                        <div className="space-y-4">
                          {company.projects.map((project: any) => {
                            const completedMilestones = project.milestones?.filter((m: any) => m.status === 'completed').length || 0;
                            const totalMilestones = project.milestones?.length || 0;
                            
                            return (
                              <div key={project.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="text-white font-semibold">{project.project_name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${platformColors[project.platform]} text-white`}>
                                        {platformLabels[project.platform]}
                                      </span>
                                      <span className="text-sm text-gray-400">{project.app_name}</span>
                                    </div>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    project.status === 'active'
                                      ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                                      : project.status === 'completed'
                                      ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                                      : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'
                                  }`}>
                                    {project.status === 'active' ? 'Active' : project.status === 'completed' ? 'Completed' : 'Paused'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-3">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Progress</p>
                                    <p className="text-white font-medium">{project.overall_progress || 0}%</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Milestones</p>
                                    <p className="text-white font-medium">{completedMilestones}/{totalMilestones}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Est. Completion</p>
                                    <p className="text-white font-medium">
                                      {project.estimated_completion 
                                        ? new Date(project.estimated_completion).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                        : 'TBD'
                                      }
                                    </p>
                                  </div>
                                </div>

                                <div className="mb-3">
                                  <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                                      style={{ width: `${project.overall_progress || 0}%` }}
                                    />
                                  </div>
                                </div>

                                <button
                                  onClick={() => {
                                    setSelectedCompany({ ...company, selectedProject: project });
                                    handleConfigureSettings({ ...company, selectedProject: project });
                                  }}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-all"
                                >
                                  <Settings className="w-4 h-4" />
                                  Configure Project
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Service Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Total Companies</p>
                  <p className="text-3xl font-bold text-white">{globalStats.totalCompanies}</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Active Projects</p>
                  <p className="text-3xl font-bold text-white">{globalStats.activeProjects}</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-white">${globalStats.totalRevenue}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Project Status Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Active</span>
                    <span className="text-sm text-blue-400 font-medium">{globalStats.activeProjects} projects</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Completed</span>
                    <span className="text-sm text-green-400 font-medium">{globalStats.completedProjects} projects</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSettingsModal && selectedCompany && selectedCompany.selectedProject && (
          <MobileAppSettingsModal
            companyName={selectedCompany.name}
            onClose={() => {
              setShowSettingsModal(false);
              setSelectedCompany(null);
            }}
            onSave={handleSaveSettings}
            initialSettings={{
              projectName: selectedCompany.selectedProject.project_name,
              platform: selectedCompany.selectedProject.platform,
              appName: selectedCompany.selectedProject.app_name,
              packageName: selectedCompany.selectedProject.package_name,
              bundleId: selectedCompany.selectedProject.bundle_id,
              playStoreStatus: selectedCompany.selectedProject.play_store_status,
              playStoreUrl: selectedCompany.selectedProject.play_store_url,
              appStoreStatus: selectedCompany.selectedProject.app_store_status,
              appStoreUrl: selectedCompany.selectedProject.app_store_url,
              estimatedCompletion: selectedCompany.selectedProject.estimated_completion?.split('T')[0] || '',
              milestones: selectedCompany.selectedProject.milestones || []
            }}
            isSaving={saving}
          />
        )}
      </div>
    </div>
  );
}