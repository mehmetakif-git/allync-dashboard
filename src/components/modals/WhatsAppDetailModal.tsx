import { useState, useEffect } from 'react';
import { X, Building2, MessageCircle, Users, Mail, AlertTriangle, Loader2, ExternalLink, Clock, Phone } from 'lucide-react';

interface WhatsAppDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'user' | 'message' | 'error' | 'company' | null;
  data: any;
}

export default function WhatsAppDetailModal({
  isOpen,
  onClose,
  type,
  data
}: WhatsAppDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [relatedData, setRelatedData] = useState<any>({
    messages: [],
    users: [],
    errors: [],
    sessions: []
  });

  useEffect(() => {
    if (isOpen && data) {
      loadRelatedData();
    }
  }, [isOpen, data, type]);

  const loadRelatedData = async () => {
    setLoading(true);
    try {
      // TODO: Load related data based on type
      // For now, we'll just use the data we have
      console.log('Loading related data for:', type, data);
    } catch (error) {
      console.error('Error loading related data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-2xl max-w-5xl w-full border border-secondary shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-secondary flex items-center justify-between bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center gap-3">
            {type === 'user' && <Users className="w-6 h-6 text-blue-400" />}
            {type === 'message' && <Mail className="w-6 h-6 text-purple-400" />}
            {type === 'error' && <AlertTriangle className="w-6 h-6 text-red-400" />}
            {type === 'company' && <Building2 className="w-6 h-6 text-green-400" />}
            <div>
              <h3 className="text-xl font-bold text-white">
                {type === 'user' && 'User Profile Details'}
                {type === 'message' && 'Message Details'}
                {type === 'error' && 'Error Details'}
                {type === 'company' && 'Company WhatsApp Data'}
              </h3>
              <p className="text-sm text-muted">
                {data?.company?.name || 'Complete information and related data'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* USER DETAILS */}
              {type === 'user' && data && (
                <>
                  {/* Main User Info */}
                  <div className="bg-primary/50 border border-secondary rounded-xl p-6">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      User Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted mb-1">Company</p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-xs font-bold text-white">
                            {data.company?.name?.charAt(0) || 'C'}
                          </div>
                          <p className="text-sm text-white font-medium">{data.company?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Status</p>
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-md ${
                          data.customer_status === 'active' || data.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {data.customer_status || data.status || 'inactive'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Name</p>
                        <p className="text-sm text-white">{data.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Phone Number</p>
                        <p className="text-sm text-white font-mono">{data.phone_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Email</p>
                        <p className="text-sm text-white">{data.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Total Messages</p>
                        <p className="text-sm text-blue-400 font-bold">{data.total_messages || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Last Seen</p>
                        <p className="text-sm text-white">
                          {data.last_seen ? new Date(data.last_seen).toLocaleString() : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Created At</p>
                        <p className="text-sm text-white">
                          {data.created_at ? new Date(data.created_at).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {data.tags && data.tags.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-muted mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {data.tags.map((tag: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.notes && (
                      <div className="mt-4">
                        <p className="text-xs text-muted mb-2">Notes</p>
                        <p className="text-sm text-white bg-black/20 rounded-lg p-3">{data.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Preferences */}
                  {data.preferences && Object.keys(data.preferences).length > 0 && (
                    <div className="bg-primary/50 border border-secondary rounded-xl p-6">
                      <h4 className="text-white font-semibold mb-4">User Preferences</h4>
                      <pre className="text-xs text-muted bg-black/20 rounded-lg p-4 overflow-x-auto">
                        {JSON.stringify(data.preferences, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}

              {/* MESSAGE DETAILS */}
              {type === 'message' && data && (
                <>
                  {/* Main Message Info */}
                  <div className="bg-primary/50 border border-secondary rounded-xl p-6">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-purple-400" />
                      Message Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted mb-1">Company</p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-xs font-bold text-white">
                            {data.company?.name?.charAt(0) || 'C'}
                          </div>
                          <p className="text-sm text-white font-medium">{data.company?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Sender</p>
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-md ${
                          data.sender === 'customer' ? 'bg-blue-500/20 text-blue-400' :
                          data.sender === 'bot' ? 'bg-green-500/20 text-green-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {data.sender}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">User</p>
                        <p className="text-sm text-white">
                          {data.user_profile?.name || data.session?.customer_name || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Phone</p>
                        <p className="text-sm text-white font-mono">
                          {data.user_profile?.phone_number || data.session?.customer_phone || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Type</p>
                        <p className="text-sm text-white">{data.message_type || 'text'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Sentiment</p>
                        <p className="text-sm text-white">{data.sentiment || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted mb-1">Timestamp</p>
                        <p className="text-sm text-white">
                          {data.created_at ? new Date(data.created_at).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div>
                      <p className="text-xs text-muted mb-2">Message Content</p>
                      <div className="bg-black/20 rounded-lg p-4">
                        <p className="text-sm text-white whitespace-pre-wrap">
                          {data.message_body || data.body || 'No content'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Integrations Triggered */}
                  {data.triggered_integrations && data.triggered_integrations.length > 0 && (
                    <div className="bg-primary/50 border border-secondary rounded-xl p-6">
                      <h4 className="text-white font-semibold mb-4">Triggered Integrations</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.triggered_integrations.map((integration: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-md">
                            {integration}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Media Info */}
                  {data.media_url && (
                    <div className="bg-primary/50 border border-secondary rounded-xl p-6">
                      <h4 className="text-white font-semibold mb-4">Media</h4>
                      <a
                        href={data.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Media
                      </a>
                    </div>
                  )}
                </>
              )}

              {/* ERROR DETAILS */}
              {type === 'error' && data && (
                <>
                  {/* Main Error Info */}
                  <div className={`border rounded-xl p-6 ${
                    data.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    data.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                    data.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}>
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      Error Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted mb-1">Company</p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
                            {data.company?.name?.charAt(0) || 'C'}
                          </div>
                          <p className="text-sm text-white font-medium">{data.company?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Severity</p>
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-md ${
                          data.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          data.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          data.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {data.severity}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Error Type</p>
                        <p className="text-sm text-white">{data.error_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Status</p>
                        {data.is_resolved ? (
                          <span className="inline-block px-3 py-1 text-xs font-medium rounded-md bg-green-500/20 text-green-400">
                            Resolved
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 text-xs font-medium rounded-md bg-red-500/20 text-red-400">
                            Unresolved
                          </span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted mb-1">Error Message</p>
                        <p className="text-sm text-white bg-black/20 rounded-lg p-3">{data.error_message}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Created At</p>
                        <p className="text-sm text-white">
                          {data.created_at ? new Date(data.created_at).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      {data.resolved_at && (
                        <div>
                          <p className="text-xs text-muted mb-1">Resolved At</p>
                          <p className="text-sm text-white">
                            {new Date(data.resolved_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error Details */}
                  {data.error_details && (
                    <div className="bg-primary/50 border border-secondary rounded-xl p-6">
                      <h4 className="text-white font-semibold mb-4">Technical Details</h4>
                      <pre className="text-xs text-muted bg-black/20 rounded-lg p-4 overflow-x-auto max-h-96">
                        {JSON.stringify(data.error_details, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-secondary bg-primary/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
