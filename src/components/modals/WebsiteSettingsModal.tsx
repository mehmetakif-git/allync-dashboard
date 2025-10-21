import React, { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { WebsiteMilestone, projectTypeLabels, statusLabels } from '../../data/mockWebsiteData';

interface WebsiteSettingsModalProps {
  companyName: string;
  onClose: () => void;
  onSave: (settings: any) => void;
  initialSettings?: {
    projectType: 'e-commerce' | 'corporate' | 'personal';
    domain: string;
    email: string;
    estimatedCompletion: string;
    milestones: WebsiteMilestone[];
  };
}

const WebsiteSettingsModal: React.FC<WebsiteSettingsModalProps> = ({
  companyName,
  onClose,
  onSave,
  initialSettings
}) => {
  const [projectType, setProjectType] = useState<'e-commerce' | 'corporate' | 'personal'>(
    initialSettings?.projectType || 'corporate'
  );
  const [domain, setDomain] = useState(initialSettings?.domain || '');
  const [email, setEmail] = useState(initialSettings?.email || '');
  const [estimatedCompletion, setEstimatedCompletion] = useState(
    initialSettings?.estimatedCompletion || ''
  );
  const [milestones, setMilestones] = useState<WebsiteMilestone[]>(
    initialSettings?.milestones || []
  );

  const handleAddMilestone = () => {
    const newMilestone: WebsiteMilestone = {
      id: `m${Date.now()}`,
      title: '',
      status: 'pending',
      progress: 0,
      notes: ''
    };
    setMilestones([...milestones, newMilestone]);
  };

  const handleUpdateMilestone = (id: string, field: keyof WebsiteMilestone, value: any) => {
    setMilestones(milestones.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleSave = () => {
    const settings = {
      projectType,
      domain,
      email,
      estimatedCompletion,
      milestones,
      overallProgress: Math.round(
        milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length
      )
    };
    onSave(settings);
    console.log('Website settings saved:', settings);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Website Development Settings</h2>
            <p className="text-gray-400 mt-1">Configure project for {companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as any)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(projectTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="www.example.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estimated Completion Date
              </label>
              <input
                type="date"
                value={estimatedCompletion}
                onChange={(e) => setEstimatedCompletion(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-300">
                  Project Milestones
                </label>
                <button
                  onClick={handleAddMilestone}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Milestone
                </button>
              </div>

              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-gray-400">Milestone {index + 1}</span>
                      <button
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => handleUpdateMilestone(milestone.id, 'title', e.target.value)}
                        placeholder="Milestone title"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={milestone.status}
                          onChange={(e) => handleUpdateMilestone(milestone.id, 'status', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>

                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={milestone.progress}
                            onChange={(e) => handleUpdateMilestone(milestone.id, 'progress', parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium text-white w-12 text-right">
                            {milestone.progress}%
                          </span>
                        </div>
                      </div>

                      <textarea
                        value={milestone.notes || ''}
                        onChange={(e) => handleUpdateMilestone(milestone.id, 'notes', e.target.value)}
                        placeholder="Notes (optional)"
                        rows={2}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {milestones.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No milestones added yet. Click "Add Milestone" to get started.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebsiteSettingsModal;
