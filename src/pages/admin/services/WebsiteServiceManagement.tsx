import { useState } from 'react';
import { Globe, Building2, TrendingUp, BarChart3, ArrowLeft, Settings, Clock, CheckCircle2 } from 'lucide-react';
import WebsiteSettingsModal from "../../../components/modals/WebsiteSettingsModal";
import { mockWebsiteProjects } from '../../../data/mockWebsiteData';

export default function WebsiteServiceManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'analytics'>('overview');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // TODO: Replace with API call
  // const { data: companies } = await supabase
  //   .from('companies')
  //   .select(`
  //     *,
  //     website_projects (
  //       id,
  //       project_name,
  //       project_type,
  //       domain,
  //       overall_progress,
  //       estimated_completion,
  //       status,
  //       milestones:website_milestones(count)
  //     )
  //   `)
  //   .eq('website_projects.status', 'active');

  const companiesUsingService = [
    {
      id: '1',
      name: 'Tech Corp',
      activeSince: '2025-10-01',
      package: 'Professional',
      projects: mockWebsiteProjects.filter(p => p.companyId === '1'),
    },
  ];

  const allProjects = companiesUsingService.flatMap(c => c.projects);
  const activeProjectsCount = allProjects.filter(p => p.status === 'active').length;
  const completedProjectsCount = allProjects.filter(p => p.status === 'completed').length;

  const globalStats = {
    totalCompanies: companiesUsingService.length,
    activeProjects: activeProjectsCount,
    completedProjects: completedProjectsCount,
    totalRevenue: companiesUsingService.reduce((sum, c) => {
      const price = c.package === 'Basic' ? 299 : c.package === 'Professional' ? 599 : 1299;
      return sum + price;
    }, 0),
    avgCompletionTime: '6-8 weeks',
    avgProgress: allProjects.length > 0
      ? Math.round(
          allProjects.reduce((sum, p) => sum + p.overallProgress, 0) / allProjects.length
        )
      : 0,
  };

  const handleConfigureSettings = (company: any) => {
    setSelectedCompany(company);
    setShowSettingsModal(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'companies', label: 'Companies', icon: Building2, badge: companiesUsingService.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

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

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-purple-400 font-medium mb-1">Website Development Service</p>
              <p className="text-purple-300/70 text-sm">
                Manage website development projects, track milestones, and monitor company progress.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Website Development - Service Management</h1>
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
                    ? 'text-purple-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
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
                  <Building2 className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-white">{globalStats.activeProjects}</p>
                <p className="text-xs text-gray-500 mt-1">In progress</p>
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
                  <span className="text-sm text-gray-400">Avg Completion</span>
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-white">{globalStats.avgCompletionTime}</p>
                <p className="text-xs text-gray-500 mt-1">Timeline</p>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Tech Corp - Domain Setup Completed</p>
                    <p className="text-sm text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Tech Corp - Email Configuration Completed</p>
                    <p className="text-sm text-gray-400">1 day ago</p>
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

              <div className="grid grid-cols-1 gap-6">
                {companiesUsingService.map((company) => (
                  <div key={company.id} className="space-y-4">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
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
                        {company.projects.map((project) => {
                          const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
                          return (
                            <div key={project.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="text-white font-semibold">{project.projectName}</h4>
                                  <p className="text-sm text-gray-400">{project.projectType === 'e-commerce' ? 'E-commerce' : project.projectType === 'corporate' ? 'Corporate' : 'Personal'} - {project.domain}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  project.status === 'active'
                                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                                    : project.status === 'completed'
                                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                                    : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'
                                }`}>
                                  {project.status === 'active' ? 'Active' : project.status === 'completed' ? 'Completed' : 'On Hold'}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-4 mb-3">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Progress</p>
                                  <p className="text-white font-medium">{project.overallProgress}%</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Milestones</p>
                                  <p className="text-white font-medium">{completedMilestones}/{project.milestones.length}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Est. Completion</p>
                                  <p className="text-white font-medium">{new Date(project.estimatedCompletion).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                </div>
                              </div>

                              <div className="mb-3">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${project.overallProgress}%` }}
                                  />
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedCompany({ ...company, selectedProject: project });
                                  handleConfigureSettings({ ...company, selectedProject: project });
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all"
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
                    <span className="text-sm text-gray-400">In Progress</span>
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

        {showSettingsModal && selectedCompany && (() => {
          const websiteProject = selectedCompany.selectedProject || mockWebsiteProjects.find(p => p.companyId === selectedCompany.id);
          return (
            <WebsiteSettingsModal
              companyName={selectedCompany.name}
              onClose={() => {
                setShowSettingsModal(false);
                setSelectedCompany(null);
              }}
              onSave={(settings) => {
                console.log('Website settings saved:', settings);
                setShowSettingsModal(false);
                setSelectedCompany(null);
              }}
              initialSettings={websiteProject ? {
                projectName: websiteProject.projectName,
                projectType: websiteProject.projectType,
                domain: websiteProject.domain,
                email: websiteProject.email,
                estimatedCompletion: websiteProject.estimatedCompletion.split('T')[0],
                milestones: websiteProject.milestones
              } : undefined}
            />
          );
        })()}
      </div>
    </div>
  );
}
