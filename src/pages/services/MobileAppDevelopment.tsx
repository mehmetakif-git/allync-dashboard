import React, { useState } from 'react';
import { Smartphone, Calendar, CheckCircle2, Circle, Clock, XCircle, ExternalLink, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockMobileAppProjects, platformLabels, platformColors, storeStatusLabels, storeStatusColors, milestoneStatusLabels, milestoneStatusColors, milestoneStatusBgColors } from '../../data/mockMobileAppData';

const MobileAppDevelopment: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'details' | 'support'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // TODO: Replace with API call
  // const { data: projects, loading } = await supabase
  //   .from('mobile_app_projects')
  //   .select('*, milestones:mobile_app_milestones(*)')
  //   .eq('company_id', user?.companyId)
  //   .eq('status', 'active')
  //   .order('created_at', { ascending: false });
  const projects = mockMobileAppProjects.filter(p => p.companyId === user?.companyId && p.status === 'active');

  const project = selectedProjectId
    ? projects.find(p => p.id === selectedProjectId)
    : projects[0];

  if (!project || projects.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 text-center">
          <Smartphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Active Project</h3>
          <p className="text-gray-400">No mobile app development project found for your company.</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="p-8">
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

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 bg-gradient-to-br ${platformColors[project.platform]} rounded-xl flex items-center justify-center`}>
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{project.projectName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${platformColors[project.platform]} text-white`}>
                  {platformLabels[project.platform]}
                </span>
                <span className="text-gray-400 text-sm">{project.appName}</span>
              </div>
            </div>
          </div>

          {projects.length > 1 && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Select Project</label>
              <select
                value={project.id}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'dashboard'
              ? 'text-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
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
            activeTab === 'details'
              ? 'text-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          App Details
          {activeTab === 'details' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'support'
              ? 'text-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
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
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-400 text-sm">Platform</span>
              </div>
              <p className="text-xl font-semibold text-white">
                {platformLabels[project.platform]}
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">Estimated Completion</span>
              </div>
              <p className="text-xl font-semibold text-white">
                {formatDate(project.estimatedCompletion)}
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Last Update</span>
              </div>
              <p className="text-xl font-semibold text-white">
                {getTimeAgo(project.lastUpdate)}
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
              <span className="text-2xl font-bold text-cyan-400">{project.overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${project.overallProgress}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">App Store Publishing Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(project.platform === 'android' || project.platform === 'both') && (
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Google Play Store</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${storeStatusColors[project.playStoreStatus]}`}>
                      {storeStatusLabels[project.playStoreStatus]}
                    </span>
                  </div>
                  {project.playStoreUrl && (
                    <a
                      href={project.playStoreUrl}
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
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Apple App Store</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${storeStatusColors[project.appStoreStatus]}`}>
                      {storeStatusLabels[project.appStoreStatus]}
                    </span>
                  </div>
                  {project.appStoreUrl && (
                    <a
                      href={project.appStoreUrl}
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

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Development Milestones</h3>
            <div className="space-y-4">
              {project.milestones.map((milestone) => {
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
                      <span className="text-lg font-semibold text-white">{milestone.progress}%</span>
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
                      <p className="text-sm text-gray-400 mt-2">{milestone.notes}</p>
                    )}

                    {milestone.completedDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Completed: {formatDate(milestone.completedDate)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">App Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Project Name</label>
                <input
                  type="text"
                  value={project.projectName}
                  readOnly
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">App Name</label>
                <input
                  type="text"
                  value={project.appName}
                  readOnly
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Platform</label>
                <input
                  type="text"
                  value={platformLabels[project.platform]}
                  readOnly
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>

              {(project.platform === 'android' || project.platform === 'both') && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Package Name (Android)</label>
                  <input
                    type="text"
                    value={project.packageName}
                    readOnly
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white cursor-not-allowed"
                  />
                </div>
              )}

              {(project.platform === 'ios' || project.platform === 'both') && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bundle ID (iOS)</label>
                  <input
                    type="text"
                    value={project.bundleId}
                    readOnly
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
          <p className="text-gray-400 mb-4">
            For questions about your mobile app development project, please contact our support team.
          </p>
          <button className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-all">
            Contact Support
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileAppDevelopment;
