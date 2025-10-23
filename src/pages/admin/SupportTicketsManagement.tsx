import { useState, useEffect } from 'react';
import { Search, Filter, Clock, AlertCircle, CheckCircle, MessageSquare, User, Calendar, Building2, UserPlus } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import TicketDetailModal, { TicketUpdates } from '../../components/modals/TicketDetailModal';
import {
  getAllTickets,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  addResolutionNote,
  updateSatisfactionRating,
} from '../../lib/api/supportTickets';
import { getAllUsers } from '../../lib/api/users';

// =====================================================
// INTERFACES
// =====================================================

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
  messages?: any[];
}

// =====================================================
// COMPONENT
// =====================================================

export default function SupportTicketsManagement() {
  // ===== STATES =====
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [availableAssignees, setAvailableAssignees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ===== LIFECYCLE =====
  useEffect(() => {
    fetchInitialData();
  }, []);

  // ===== UTILITY FUNCTIONS =====
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // ===== DATA FETCHING =====
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [ticketsData, usersData] = await Promise.all([
        getAllTickets(),
        getAllUsers(),
      ]);

      setTickets(ticketsData || []);
      
      // Filter super_admins for assignee list
      const superAdmins = (usersData || []).filter(
        (user: any) => user.role === 'super_admin'
      );
      setAvailableAssignees(superAdmins);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      showError(error.message || 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTickets = async () => {
    try {
      const ticketsData = await getAllTickets();
      setTickets(ticketsData || []);
    } catch (error: any) {
      console.error('Error refreshing tickets:', error);
      showError(error.message || 'Failed to refresh tickets');
    }
  };

  // ===== DATA CALCULATIONS =====
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.creator.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length,
  };

  // ===== HANDLERS =====
  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleUpdateTicket = async (ticketId: string, updates: TicketUpdates) => {
    try {
      await updateTicket(ticketId, updates);
      
      // Refresh tickets and update selectedTicket
      await refreshTickets();
      
      // Update selected ticket
      const updatedTickets = await getAllTickets();
      const updatedTicket = updatedTickets.find((t: any) => t.id === ticketId);
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
      
      showSuccess('Ticket updated successfully!');
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      showError(error.message || 'Failed to update ticket');
      throw error;
    }
  };

  const handleSendReply = async (ticketId: string, message: string) => {
    try {
      // TODO: Implement message/reply API when available
      // For now, just show success
      console.log('Send reply:', { ticketId, message });
      showSuccess('Reply sent successfully!');
      
      // In real implementation:
      // await createTicketMessage(ticketId, { message });
      // await refreshTickets();
    } catch (error: any) {
      console.error('Error sending reply:', error);
      showError(error.message || 'Failed to send reply');
      throw error;
    }
  };

  // ===== HELPER FUNCTIONS =====
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'waiting_customer': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'resolved': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'closed': return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'low': return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  const formatStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  // ===== LOADING STATE =====
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ===== HEADER ===== */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Support Tickets Management</h1>
          <p className="text-gray-400">View and manage all support tickets from companies</p>
        </div>

        {/* ===== SUCCESS MESSAGE ===== */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-500 font-medium">{successMessage}</p>
          </div>
        )}

        {/* ===== ERROR MESSAGE ===== */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-500 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* ===== STATS CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Tickets</span>
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Open</span>
              <AlertCircle className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.open}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">In Progress</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.inProgress}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Resolved</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.resolved}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Urgent</span>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.urgent}</p>
          </div>
        </div>

        {/* ===== FILTERS ===== */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets, company, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_customer">Waiting Customer</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </div>
        </div>

        {/* ===== TICKETS TABLE ===== */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
          {filteredTickets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Ticket #</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Subject</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Created By</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Assigned To</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Priority</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-white font-mono text-sm">{ticket.ticket_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{ticket.subject}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-300">{ticket.company.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-white text-sm">{ticket.creator.full_name}</p>
                            <p className="text-gray-500 text-xs">{ticket.creator.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {ticket.assignee ? (
                          <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-white text-sm">{ticket.assignee.full_name}</p>
                              <p className="text-gray-500 text-xs">{ticket.assignee.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">{ticket.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                          {formatPriorityLabel(ticket.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                          {formatStatusLabel(ticket.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-400 text-sm">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewTicket(ticket)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          View & Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No tickets found</p>
              <p className="text-gray-500 text-sm">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Tickets will appear here when created'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== TICKET DETAIL MODAL ===== */}
      <TicketDetailModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        ticket={selectedTicket}
        onUpdate={handleUpdateTicket}
        onSendReply={handleSendReply}
        availableAssignees={availableAssignees}
      />
    </div>
  );
}