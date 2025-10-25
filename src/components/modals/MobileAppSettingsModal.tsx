import { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, Clock, Circle, XCircle } from 'lucide-react';

interface MobileAppMilestone {
  id?: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  progress: number;
  notes?: string;
  displayOrder: number;
}

interface MobileAppSettingsModalProps {
  companyName: string;
  onClose: () => void;
  onSave: (settings: any) => void;
  initialSettings?: {
    projectName?: string;
    platform?: 'android' | 'ios' | 'both';
    appName?: string;
    packageName?: string;
    bundleId?: string;
    playStoreStatus?: 'pending' | 'submitted' | 'in-review' | 'approved' | 'published' | 'rejected';
    playStoreUrl?: string;
    appStoreStatus?: 'pending' | 'submitted' | 'in-review' | 'approved' | 'published' | 'rejected';
    appStoreUrl?: string;
    estimatedCompletion?: string;
    milestones?: MobileAppMilestone[];
  };
}

export default function MobileAppSettingsModal({
  companyName,
  onClose,
  onSave,
  initialSettings
}: MobileAppSettingsModalProps) {
  const [projectName, setProjectName] = useState(initialSettings?.projectName || '');
  const [platform, setPlatform] = useState<'android' | 'ios' | 'both'>(
    initialSettings?.platform || 'both'
  );
  const [appName, setAppName] = useState(initialSettings?.appName || '');
  const [packageName, setPackageName] = useState(initialSettings?.packageName || '');
  const [bundleId, setBundleId] = useState(initialSettings?.bundleId || '');
  const [playStoreStatus, setPlayStoreStatus] = useState<'pending' | 'submitted' | 'in-review' | 'approved' | 'published' | 'rejected'>(
    initialSettings?.playStoreStatus || 'pending'
  );
  const [playStoreUrl, setPlayStoreUrl] = useState(initialSettings?.playStoreUrl || '');
  const [appStoreStatus, setAppStoreStatus] = useState<'pending' | 'submitted' | 'in-review' | 'approved' | 'published' | 'rejected'>(
    initialSettings?.appStoreStatus || 'pending'
  );
  const [appStoreUrl, setAppStoreUrl] = useState(initialSettings?.appStoreUrl || '');
  const [estimatedCompletion, setEstimatedCompletion] = useState(
    initialSettings?.estimatedCompletion || ''
  );
  const [milestones, setMilestones] = useState<MobileAppMilestone[]>(
    initialSettings?.milestones || [
      { title: 'Requirements & Planning', status: 'pending', progress: 0, displayOrder: 1 },
      { title: 'UI/UX Design', status: 'pending', progress: 0, displayOrder: 2 },
      { title: 'Backend Development', status: 'pending', progress: 0, displayOrder: 3 },
      { title: 'Frontend Development', status: 'pending', progress: 0, displayOrder: 4 },
      { title: 'Testing & QA', status: 'pending', progress: 0, displayOrder: 5 },
      { title: 'App Store Submission', status: 'pending', progress: 0, displayOrder: 6 },
    ]
  );

  const calculateProgress = () => {
    if (milestones.length === 0) return 0;
    const totalProgress = milestones.reduce((sum, m) => sum + m.progress, 0);
    return Math.round(totalProgress / milestones.length);
  };

  const handleAddMilestone = () => {
    const newMilestone: MobileAppMilestone = {
      title: 'New Milestone',
      status: 'pending',
      progress: 0,
      displayOrder: milestones.length + 1,
    };
    setMilestones([...milestones, newMilestone]);
  };

  const handleRemoveMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index);
    const reordered = updated.map((m, i) => ({ ...m, displayOrder: i + 1 }));
    setMilestones(reordered);
  };

  const handleMilestoneChange = (index: number, field: keyof MobileAppMilestone, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleSave = () => {
    // TODO: API Call - POST /api/mobile-app-projects or PUT /api/mobile-app-projects/{projectId}
    const payload = {
      projectName: projectName,
      platform: platform,
      appName: appName,
      packageName: packageName,
      bundleId: bundleId,
      playStoreStatus: playStoreStatus,
      playStoreUrl: playStoreUrl,
      appStoreStatus: appStoreStatus,
      appStoreUrl: appStoreUrl,
      estimatedCompletion: estimatedCompletion,
      overallProgress: calculateProgress(),
      milestones: milestones.map(m => ({
        title: m.title,
        status: m.status,
        progress: m.progress,
        notes: m.notes,
        displayOrder: m.displayOrder
      }))
    };

    console.log('TODO: API Call - POST /api/mobile-app-projects', payload);
    // Example Supabase call:
    // const { data, error } = await supabase
    //   .from('mobile_app_projects')
    //   .upsert({
    //     company_id: companyId,
    //     project_name: payload.projectName,
    //     platform: payload.platform,
    //     app_name: payload.appName,
    //     package_name: payload.packageName,
    //     bundle_id: payload.bundleId,
    //     play_store_status: payload.playStoreStatus,
    //     play_store_url: payload.playStoreUrl,
    //     app_store_status: payload.appStoreStatus,
    //     app_store_url: payload.appStoreUrl,
    //     estimated_completion: payload.estimatedCompletion,
    //     overall_progress: payload.overallProgress,
    //     status: 'active'
    //   })
    //   .select()
    //   .single();
    //
    // if (data) {
    //   await supabase.from('mobile_app_milestones').upsert(
    //     payload.milestones.map(m => ({
    //       project_id: data.id,
    //       ...m
    //     }))
    //   );
    // }

    onSave(payload);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle2;
      case 'in-progress': return Clock;
      case 'blocked': return XCircle;
      default: return Circle;
    }
  };

  const statusColors = {
    'completed': 'text-green-400 bg-green-500/10 border-green-500/30',
    'in-progress': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    'pending': 'text-muted bg-gray-500/10 border-secondary/30',
    'blocked': 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-primary border border-secondary rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-primary border-b border-secondary p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Mobile App Settings</h2>
            <p className="text-sm text-muted mt-1">{companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., E-commerce Mobile App, Customer Portal"
              className="w-full bg-secondary border border-secondary rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Platform <span className="text-red-400">*</span>
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="w-full bg-secondary border border-secondary rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="android">Android</option>
              <option value="ios">iOS</option>
              <option value="both">Android & iOS</option>
            </select>
          </div>

          {/* App Name */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              App Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Display name of your app"
              className="w-full bg-secondary border border-secondary rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {(platform === 'android' || platform === 'both') && (
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Package Name (Android)
              </label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="com.company.appname"
                className="w-full bg-secondary border border-secondary rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          )}

          {(platform === 'ios' || platform === 'both') && (
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Bundle ID (iOS)
              </label>
              <input
                type="text"
                value={bundleId}
                onChange={(e) => setBundleId(e.target.value)}
                placeholder="com.company.appname"
                className="w-full bg-secondary border border-secondary rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          )}

          {/* Estimated Completion */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Estimated Completion Date
            </label>
            <input
              type="date"
              value={estimatedCompletion}
              onChange={(e) => setEstimatedCompletion(e.target.value)}
              className="w-full bg-secondary border border-secondary rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Publishing Status */}
          <div className="border-t border-secondary pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">App Store Publishing</h3>

            {(platform === 'android' || platform === 'both') && (
              <div className="mb-4 p-4 bg-card rounded-lg">
                <h4 className="font-medium text-white mb-3">Google Play Store</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-muted mb-2">Status</label>
                    <select
                      value={playStoreStatus}
                      onChange={(e) => setPlayStoreStatus(e.target.value as any)}
                      className="w-full bg-gray-700 border border-secondary rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="submitted">Submitted</option>
                      <option value="in-review">In Review</option>
                      <option value="approved">Approved</option>
                      <option value="published">Published</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  {playStoreStatus === 'published' && (
                    <div>
                      <label className="block text-sm text-muted mb-2">Play Store URL</label>
                      <input
                        type="url"
                        value={playStoreUrl}
                        onChange={(e) => setPlayStoreUrl(e.target.value)}
                        placeholder="https://play.google.com/store/apps/details?id=..."
                        className="w-full bg-gray-700 border border-secondary rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {(platform === 'ios' || platform === 'both') && (
              <div className="p-4 bg-card rounded-lg">
                <h4 className="font-medium text-white mb-3">Apple App Store</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-muted mb-2">Status</label>
                    <select
                      value={appStoreStatus}
                      onChange={(e) => setAppStoreStatus(e.target.value as any)}
                      className="w-full bg-gray-700 border border-secondary rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="submitted">Submitted</option>
                      <option value="in-review">In Review</option>
                      <option value="approved">Approved</option>
                      <option value="published">Published</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  {appStoreStatus === 'published' && (
                    <div>
                      <label className="block text-sm text-muted mb-2">App Store URL</label>
                      <input
                        type="url"
                        value={appStoreUrl}
                        onChange={(e) => setAppStoreUrl(e.target.value)}
                        placeholder="https://apps.apple.com/app/..."
                        className="w-full bg-gray-700 border border-secondary rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Milestones */}
          <div className="border-t border-secondary pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-secondary">
                Development Milestones
              </label>
              <button
                onClick={handleAddMilestone}
                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Milestone
              </button>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => {
                const StatusIcon = getStatusIcon(milestone.status);
                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${statusColors[milestone.status]}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <StatusIcon className="w-5 h-5 mt-1 flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                          placeholder="Milestone title"
                          className="w-full bg-card border border-secondary rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={milestone.status}
                            onChange={(e) => handleMilestoneChange(index, 'status', e.target.value)}
                            className="bg-card border border-secondary rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="blocked">Blocked</option>
                          </select>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={milestone.progress}
                              onChange={(e) => handleMilestoneChange(index, 'progress', parseInt(e.target.value) || 0)}
                              className="w-full bg-card border border-secondary rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            <span className="text-muted text-sm">%</span>
                          </div>
                        </div>

                        <textarea
                          value={milestone.notes || ''}
                          onChange={(e) => handleMilestoneChange(index, 'notes', e.target.value)}
                          placeholder="Notes (optional)"
                          rows={2}
                          className="w-full bg-card border border-secondary rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveMilestone(index)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>

                    {milestone.progress > 0 && (
                      <div className="w-full bg-gray-700 rounded-full h-2 ml-8">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${milestone.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall Progress */}
          <div className="bg-card border border-secondary rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">Overall Progress</span>
              <span className="text-lg font-bold text-cyan-400">{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-primary border-t border-secondary p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-secondary hover:bg-hover text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!projectName || !appName}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
