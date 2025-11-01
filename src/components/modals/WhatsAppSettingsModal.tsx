import { useState, useEffect } from 'react';
import { X, Plus, Settings, Trash2, Power, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { WhatsAppInstance } from '../../types/whatsapp';
import { getWhatsappInstancesByCompany, deleteWhatsappInstance } from '../../lib/api/whatsappInstances';
import WhatsAppInstanceModal from './WhatsAppInstanceModal';
import { formatPhoneNumber } from '../../lib/utils/whatsappFormatters';

interface WhatsAppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  companyName: string;
  companyId: string;
  initialSettings?: any;
}

export default function WhatsAppSettingsModal({
  isOpen,
  onClose,
  companyName,
  companyId,
}: WhatsAppSettingsModalProps) {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInstanceModal, setShowInstanceModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && companyId) {
      loadInstances();
    }
  }, [isOpen, companyId]);

  const loadInstances = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading instances for company:', companyId);

      if (!companyId) {
        console.error('❌ No companyId provided');
        setInstances([]);
        setLoading(false);
        return;
      }

      const data = await getWhatsappInstancesByCompany(companyId);
      console.log('✅ Loaded instances:', data);
      setInstances(data);
    } catch (error) {
      console.error('❌ Failed to load instances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInstance = () => {
    setSelectedInstance(null);
    setShowInstanceModal(true);
  };

  const handleEditInstance = (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
    setShowInstanceModal(true);
  };

  const handleDeleteInstance = async (instanceId: string) => {
    try {
      setDeleting(true);
      await deleteWhatsappInstance(instanceId);
      await loadInstances();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete instance:', error);
      alert('Failed to delete instance');
    } finally {
      setDeleting(false);
    }
  };

  const handleInstanceModalClose = () => {
    setShowInstanceModal(false);
    // Delay clearing selectedInstance to prevent race condition
    setTimeout(() => {
      setSelectedInstance(null);
    }, 100);
  };

  const handleInstanceModalSuccess = async () => {
    // Close modal first
    setShowInstanceModal(false);

    // Reload instances after modal is closed
    setTimeout(async () => {
      await loadInstances();
      setSelectedInstance(null);
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-secondary/95 via-primary/95 to-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">WhatsApp Instances</h2>
                <p className="text-sm text-muted mt-1">{companyName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
              </div>
            ) : instances.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No WhatsApp Instances</h3>
                <p className="text-muted text-sm mb-6">
                  This company doesn't have any WhatsApp instances configured yet.
                  <br />
                  Create one to get started with WhatsApp automation.
                </p>
                <button
                  onClick={handleCreateInstance}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create First Instance
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Create New Button */}
                <button
                  onClick={handleCreateInstance}
                  className="w-full p-4 bg-green-500/10 hover:bg-green-500/20 border-2 border-dashed border-green-500/30 rounded-lg transition-colors flex items-center justify-center gap-2 text-green-400 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add New Instance
                </button>

                {/* Instance List */}
                {instances.map((instance) => (
                  <div
                    key={instance.id}
                    className="bg-secondary/50 backdrop-blur-sm rounded-xl border border-white/10 p-5 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {instance.instance_name || 'Unnamed Instance'}
                          </h3>
                          {instance.is_connected ? (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 text-green-400 rounded-md text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Connected
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 text-red-400 rounded-md text-xs font-medium">
                              <XCircle className="w-3 h-3" />
                              Disconnected
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted">
                            <span className="font-medium">Instance ID:</span> {instance.instance_id}
                          </p>
                          {instance.phone_number && (
                            <p className="text-sm text-muted">
                              <span className="font-medium">Phone:</span> {formatPhoneNumber(instance.phone_number)}
                            </p>
                          )}
                          <p className="text-sm text-muted">
                            <span className="font-medium">Type:</span>{' '}
                            <span className="capitalize">{instance.instance_type || 'N/A'}</span>
                          </p>
                          {instance.last_connected_at && (
                            <p className="text-sm text-muted">
                              <span className="font-medium">Last Connected:</span>{' '}
                              {new Date(instance.last_connected_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditInstance(instance)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                          title="Edit Instance"
                        >
                          <Settings className="w-5 h-5" />
                        </button>

                        {/* Delete Button */}
                        {deleteConfirm === instance.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteInstance(instance.id)}
                              disabled={deleting}
                              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {deleting ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              disabled={deleting}
                              className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(instance.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                            title="Delete Instance"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                      <div className="text-center">
                        <p className="text-xs text-muted mb-1">Status</p>
                        <p className="text-sm font-medium text-white capitalize">
                          {instance.status || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted mb-1">Auto Reply</p>
                        <p className="text-sm font-medium text-white">
                          {instance.settings?.auto_reply_enabled ? (
                            <span className="text-green-400">Enabled</span>
                          ) : (
                            <span className="text-gray-400">Disabled</span>
                          )}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted mb-1">Business Hours</p>
                        <p className="text-sm font-medium text-white">
                          {instance.settings?.business_hours_only ? (
                            <span className="text-blue-400">Only</span>
                          ) : (
                            <span className="text-gray-400">24/7</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-secondary/30 flex items-center justify-between">
            <p className="text-sm text-muted">
              {instances.length} {instances.length === 1 ? 'instance' : 'instances'} configured
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Instance Create/Edit Modal */}
      <WhatsAppInstanceModal
        isOpen={showInstanceModal}
        onClose={handleInstanceModalClose}
        instance={selectedInstance}
        companyId={companyId}
        onSuccess={handleInstanceModalSuccess}
      />
    </>
  );
}
