import React, { useState } from 'react';
import { Globe, Calendar, Mail, Clock, CheckCircle2, Circle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockWebsiteProjects, projectTypeLabels, statusLabels, statusColors, statusBgColors, statusIcons } from '../../data/mockWebsiteData';

const WebsiteDevelopment: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'details' | 'support'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // TODO: Replace with API call
  // const { data: projects, loading } = await supabase
  //   .from('website_projects')
  //   .select('*')
  //   .eq('company_id', user?.companyId)
  //   .eq('status', 'active')
  //   .order('created_at', { ascending: false });
  const projects = mockWebsiteProjects.filter(p => p.companyId === user?.companyId && p.status === 'active');

  const project = selectedProjectId
    ? projects.find(p => p.id === selectedProjectId)
    : projects[0];

  if (!project || projects.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 text-center">
          <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Active Project</h3>
          <p className="text-gray-400">No website development project found for your company.</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{project.projectName}</h1>
              <p className="text-gray-400">{projectTypeLabels[project.projectType]} - Track your website development progress</p>
            </div>
          </div>

          {projects.length > 1 && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Select Project</label>
              <select
                value={project.id}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              ? 'text-blue-400'
              : 'text-gray-400 hover:text-gray-300'
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
            activeTab === 'details'
              ? 'text-blue-400'
              : 'text-gray-400 hover:text-gray-300'
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
            activeTab === 'support'
              ? 'text-blue-400'
              : 'text-gray-400 hover:text-gray-300'
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
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-sm">Project Type</span>
              </div>
              <p className="text-xl font-semibold text-white">
                {projectTypeLabels[project.projectType]}
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
              <span className="text-2xl font-bold text-blue-400">{project.overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${project.overallProgress}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Project Milestones</h3>
            <div className="space-y-4">
              {project.milestones.map((milestone) => {
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
                      <span className="text-lg font-semibold text-white">{milestone.progress}%</span>
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
            <h3 className="text-lg font-semibold text-white mb-6">Project Information</h3>

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
                <label className="block text-sm text-gray-400 mb-2">Project Type</label>
                <input
                  type="text"
                  value={projectTypeLabels[project.projectType]}
                  readOnly
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Domain
                  </div>
                </label>
                <input
                  type="text"
                  value={project.domain}
                  readOnly
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </div>
                </label>
                <input
                  type="text"
                  value={project.email}
                  readOnly
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Estimated Completion
                  </div>
                </label>
                <input
                  type="text"
                  value={formatDate(project.estimatedCompletion)}
                  readOnly
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400">
                <strong>Note:</strong> Project settings are managed by Allync team. Contact support for any changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
          <p className="text-gray-400 mb-6">
            Have questions about your website development project? Our team is here to help!
          </p>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all">
            Contact Support
          </button>
        </div>
      )}
    </div>
  );
};

export default WebsiteDevelopment;
