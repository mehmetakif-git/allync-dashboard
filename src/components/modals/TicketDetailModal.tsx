import { useState, useEffect } from 'react';
import { X, Save, CheckCircle, Building2, User, Calendar, Star, AlertCircle, MessageSquare, Clock } from 'lucide-react';
import { getTicketMessages, createTicketMessage } from '../../lib/api/supportTickets';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

// =====================================================
// INTERFACES
// =====================================================

interface Message {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isSupport: boolean;
}

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'waiting_customer';
  company: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    full_name: string;
    email: string;
  };
  assignee: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  service_type: {
    id: string;
    name: string;
  } | null;
  resolution_notes: string | null;
  satisfaction_rating: number | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  first_response_at: string | null;
  messages?: Message[];
}

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onUpdate: (ticketId: string, updates: TicketUpdates) => Promise<void>;
  onSendReply: (ticketId: string, message: string) => Promise<void>;
  availableAssignees?: Array<{ id: string; full_name: string; email: string }>;
  isLoading?: boolean;
}

export interface TicketUpdates {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'waiting_customer';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string | null;
  resolution_notes?: string;
  satisfaction_rating?: number;
}

// =====================================================
// COMPONENT
// =====================================================

export default function TicketDetailModal({
  isOpen,
  onClose,
  ticket,
  onUpdate,
  onSendReply,
  availableAssignees = [],
  isLoading = false,
}: TicketDetailModalProps) {
  const { user } = useAuth();
  
  // ===== STATES =====
  const [editStatus, setEditStatus] = useState<string>('');
  const [editPriority, setEditPriority] = useState<string>('');
  const [editAssignedTo, setEditAssignedTo] = useState<string>('');
  const [editResolutionNotes, setEditResolutionNotes] = useState<string>('');
  const [editSatisfactionRating, setEditSatisfactionRating] = useState<number>(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // ===== EFFECTS =====
  useEffect(() => {
    if (ticket) {
      console.log('🎯 Modal opened for ticket:', ticket.id);
      setEditStatus(ticket.status);
      setEditPriority(ticket.priority);
      setEditAssignedTo(ticket.assignee?.id || '');
      setEditResolutionNotes(ticket.resolution_notes || '');
      setEditSatisfactionRating(ticket.satisfaction_rating || 0);
      setHasChanges(false);
      
      // Load messages
      loadMessages(ticket.id);
    }
  }, [ticket]);

  const loadMessages = async (ticketId: string) => {
    console.log('📞 Loading messages for ticket:', ticketId);
    try {
      setLoadingMessages(true);
      const data = await getTicketMessages(ticketId, true);
      console.log('✅ Messages loaded:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  if (!isOpen || !ticket) return null;

  // ===== UTILITY FUNCTIONS =====
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'waiting_customer': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'resolved': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'closed': return 'bg-gray-500/10 text-muted border-secondary/30';
      default: return 'bg-gray-500/10 text-muted border-secondary/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'low': return 'bg-gray-500/10 text-muted border-secondary/30';
      default: return 'bg-gray-500/10 text-muted border-secondary/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const showSuccess = (message: string) => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  // ===== HANDLERS =====
  const handleFieldChange = () => {
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updates: TicketUpdates = {
        status: editStatus as any,
        priority: editPriority as any,
        assigned_to: editAssignedTo || null,
        resolution_notes: editResolutionNotes || undefined,
        satisfaction_rating: editSatisfactionRating > 0 ? editSatisfactionRating : undefined,
      };

      await onUpdate(ticket.id, updates);
      setHasChanges(false);
      showSuccess('Ticket updated successfully!');
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendReply = async () => {
    if (!newMessage.trim() || !user) return;

    console.log('📤 Sending reply from modal...');
    setIsSendingReply(true);
    try {
      await createTicketMessage({
        ticket_id: ticket.id,
        sender_id: user.id,
        message: newMessage.trim(),
        is_from_support: true, // Super admin replies are from support
      });
      
      console.log('✅ Reply sent, reloading messages...');
      setNewMessage('');
      await loadMessages(ticket.id);
      showSuccess('Reply sent successfully!');
    } catch (error) {
      console.error('❌ Error sending reply:', error);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleClose = () => {
    setNewMessage('');
    setHasChanges(false);
    onClose();
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => {
              setEditSatisfactionRating(star);
              handleFieldChange();
            }}
            className="transition-transform hover:scale-110"
            disabled={isSaving}
          >
            <Star
              className={`w-6 h-6 ${
                star <= editSatisfactionRating
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'text-gray-600'
              }`}
            />
          </button>
        ))}
        {editSatisfactionRating > 0 && (
          <span className="text-sm text-muted ml-2">
            {editSatisfactionRating}/5
          </span>
        )}
      </div>
    );
  };

  // ===== RENDER =====
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-secondary border border-secondary rounded-xl max-w-5xl w-full my-8 flex flex-col max-h-[calc(100vh-4rem)]">
        {/* ===== HEADER (STICKY) ===== */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-secondary bg-secondary sticky top-0 z-10 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{ticket.subject}</h2>
            <div className="flex items-center gap-3">
              <span className="text-muted text-sm font-mono">{ticket.ticket_number}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading || isSaving}
            className="p-2 hover:bg-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6 text-muted" />
          </button>
        </div>

        {/* ===== SCROLLABLE CONTENT ===== */}
        <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
          {/* ===== SUCCESS MESSAGE ===== */}
          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-green-500 font-medium">Success!</p>
                <p className="text-green-400/70 text-sm">Changes saved successfully</p>
              </div>
            </div>
          )}

        {/* ===== TICKET INFO GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-primary/50 border border-secondary rounded-lg">
          <div>
            <p className="text-sm text-muted mb-1 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company
            </p>
            <p className="text-white font-medium">{ticket.company.name}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted mb-1 flex items-center gap-2">
              <User className="w-4 h-4" />
              Created By
            </p>
            <p className="text-white font-medium">{ticket.creator.full_name}</p>
            <p className="text-muted text-xs">{ticket.creator.email}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Category
            </p>
            <p className="text-white font-medium">{ticket.category}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Created At
            </p>
            <p className="text-white text-sm">{formatDate(ticket.created_at)}</p>
          </div>
        </div>

        {/* ===== DESCRIPTION ===== */}
        {ticket.description && (
          <div className="mb-6 p-4 bg-primary/50 border border-secondary rounded-lg">
            <h3 className="text-sm font-semibold text-secondary mb-2">Description</h3>
            <p className="text-secondary whitespace-pre-wrap">{ticket.description}</p>
          </div>
        )}

        {/* ===== EDIT FIELDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-primary/50 border border-secondary rounded-lg">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Status
            </label>
            <select
              value={editStatus}
              onChange={(e) => {
                setEditStatus(e.target.value);
                handleFieldChange();
              }}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-secondary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_customer">Waiting Customer</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Priority
            </label>
            <select
              value={editPriority}
              onChange={(e) => {
                setEditPriority(e.target.value);
                handleFieldChange();
              }}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-secondary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Assign To
            </label>
            <select
              value={editAssignedTo}
              onChange={(e) => {
                setEditAssignedTo(e.target.value);
                handleFieldChange();
              }}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-secondary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Unassigned</option>
              {availableAssignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Satisfaction Rating
            </label>
            {renderStarRating()}
          </div>
        </div>

        {/* ===== RESOLUTION NOTES ===== */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary mb-2">
            Resolution Notes
          </label>
          <textarea
            value={editResolutionNotes}
            onChange={(e) => {
              setEditResolutionNotes(e.target.value);
              handleFieldChange();
            }}
            disabled={isSaving}
            placeholder="Add resolution notes (visible to customer)..."
            className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={3}
          />
        </div>

        {/* ===== SAVE CHANGES BUTTON ===== */}
        {hasChanges && (
          <div className="mb-6">
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* ===== CONVERSATION ===== */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversation
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto mb-4 p-4 bg-primary/50 border border-secondary rounded-lg custom-scrollbar">
            {loadingMessages ? (
              <div className="text-center py-8">
                <LoadingSpinner />
                <p className="text-muted mt-2">Loading messages...</p>
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.is_from_support
                      ? 'bg-blue-500/10 border border-blue-500/30 ml-8'
                      : 'bg-secondary border border-secondary mr-8'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-medium ${message.is_from_support ? 'text-blue-400' : 'text-white'}`}>
                      {message.is_from_support ? 'Support Team' : 'Customer'}
                    </span>
                    <span className="text-xs text-muted">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                  <p className="text-secondary whitespace-pre-wrap">{message.message}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== REPLY ===== */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Reply to Ticket
          </label>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSendingReply}
            placeholder="Type your response..."
            className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={4}
          />
          <button
            onClick={handleSendReply}
            disabled={isSendingReply || !newMessage.trim()}
            className="mt-3 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
          >
            {isSendingReply ? 'Sending Reply...' : 'Send Reply'}
          </button>
        </div>

        {/* ===== TIMESTAMPS INFO ===== */}
        {(ticket.resolved_at || ticket.closed_at || ticket.first_response_at) && (
          <div className="mt-6 p-4 bg-primary/30 border border-secondary rounded-lg">
            <h4 className="text-sm font-semibold text-muted mb-2">Timeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {ticket.first_response_at && (
                <div>
                  <span className="text-muted">First Response:</span>
                  <p className="text-secondary">{formatDate(ticket.first_response_at)}</p>
                </div>
              )}
              {ticket.resolved_at && (
                <div>
                  <span className="text-muted">Resolved:</span>
                  <p className="text-secondary">{formatDate(ticket.resolved_at)}</p>
                </div>
              )}
              {ticket.closed_at && (
                <div>
                  <span className="text-muted">Closed:</span>
                  <p className="text-secondary">{formatDate(ticket.closed_at)}</p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
        {/* End of scrollable content */}
      </div>
    </div>
  );
}