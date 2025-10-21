import { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, Clock, Circle, XCircle } from 'lucide-react';

interface WebsiteMilestone {
  id?: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  progress: number;
  notes?: string;
  displayOrder: number;
}

interface WebsiteSettingsModalProps {
  companyName: string;
  onClose: () => void;
  onSave: (settings: any) => void;
  initialSettings?: {
    projectName?: string;
    projectType?: 'e-commerce' | 'corporate' | 'personal';
    domain?: string;
    email?: string;
    estimatedCompletion?: string;
    milestones?: WebsiteMilestone[];
  };
}

export default function WebsiteSettingsModal({
  companyName,
  onClose,
  onSave,
  initialSettings
}: WebsiteSettingsModalProps) {
  const [projectName, setProjectName] = useState(initialSettings?.projectName || '');
  const [projectType, setProjectType] = useState<'e-commerce' | 'corporate' | 'personal'>(
    initialSettings?.projectType || 'corporate'
  );
  const [domain, setDomain] = useState(initialSettings?.domain || '');
  const [email, setEmail] = useState(initialSettings?.email || '');
  const [estimatedCompletion, setEstimatedCompletion] = useState(
    initialSettings?.estimatedCompletion || ''
  );
  const [milestones, setMilestones] = useState<WebsiteMilestone[]>(
    initialSettings?.milestones || [
      { title: 'Domain Setup', status: 'pending', progress: 0, displayOrder: 1 },
      { title: 'Design & Development', status: 'pending', progress: 0, displayOrder: 2 },
      { title: 'Content Creation', status: 'pending', progress: 0, displayOrder: 3 },
      { title: 'Testing & QA', status: 'pending', progress: 0, displayOrder: 4 },
      { title: 'Launch & Deployment', status: 'pending', progress: 0, displayOrder: 5 },
    ]
  );

  const calculateProgress = () => {
    if (milestones.length === 0) return 0;
    const totalProgress = milestones.reduce((sum, m) => sum + m.progress, 0);
    return Math.round(totalProgress / milestones.length);
  };

  const handleAddMilestone = () => {
    const newMilestone: WebsiteMilestone = {
      title: 'New Milestone',
      status: 'pending',
      progress: 0,
      displayOrder: milestones.length + 1,
    };
    setMilestones([...milestones, newMilestone]);
  };

  const handleRemoveMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index);
    // Update display order
    const reordered = updated.map((m, i) => ({ ...m, displayOrder: i + 1 }));
    setMilestones(reordered);
  };

  const handleMilestoneChange = (index: number, field: keyof WebsiteMilestone, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleSave = () => {
    // TODO: API Call - POST /api/website-projects or PUT /api/website-projects/{projectId}
    const payload = {
      projectName: projectName,
      projectType: projectType,
      domain: domain,
      email: email,
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

    console.log('TODO: API Call - POST /api/website-projects', payload);
    // Example Supabase call:
    // const { data, error } = await supabase
    //   .from('website_projects')
    //   .upsert({
    //     company_id: companyId,
    //     project_name: payload.projectName,
    //     project_type: payload.projectType,
    //     domain: payload.domain,
    //     email: payload.email,
    //     estimated_completion: payload.estimatedCompletion,
    //     overall_progress: payload.overallProgress,
    //     status: 'active'
    //   })
    //   .select()
    //   .single();
    //
    // if (data) {
    //   // Save milestones
    //   await supabase.from('website_milestones').upsert(
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
    'pending': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
    'blocked': 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Website Settings</h2>
            <p className="text-sm text-gray-400 mt-1">{companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Main E-commerce Store, Corporate Website"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">A descriptive name to identify this project</p>
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Type <span className="text-red-400">*</span>
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="e-commerce">E-commerce Website</option>
              <option value="corporate">Corporate Website</option>
              <option value="personal">Personal Website</option>
            </select>
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Domain <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="www.example.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Estimated Completion */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estimated Completion Date
            </label>
            <input
              type="date"
              value={estimatedCompletion}
              onChange={(e) => setEstimatedCompletion(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">
                Project Milestones
              </label>
              <button
                onClick={handleAddMilestone}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
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
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={milestone.status}
                            onChange={(e) => handleMilestoneChange(index, 'status', e.target.value)}
                            className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="text-gray-400 text-sm">%</span>
                          </div>
                        </div>

                        <textarea
                          value={milestone.notes || ''}
                          onChange={(e) => handleMilestoneChange(index, 'notes', e.target.value)}
                          placeholder="Notes (optional)"
                          rows={2}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
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
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Overall Progress</span>
              <span className="text-lg font-bold text-purple-400">{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!projectName || !domain || !email}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
