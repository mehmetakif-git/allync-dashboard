import { useState } from 'react';
import { Search, Filter, Clock, AlertCircle, CheckCircle, MessageSquare, User, Calendar, X, Save, Building2 } from 'lucide-react';
import { tickets as initialTickets } from '../../data/mockData';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SupportTicketsManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState(initialTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'In Progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'Resolved': return 'bg-green-500/10 text-green-500 border-green-500/30';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'Low': return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority);
    setHasChanges(false);
    setShowTicketModal(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedTicket) return;

    setIsSaving(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: editStatus,
          priority: editPriority,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    setSelectedTicket({ ...selectedTicket, status: editStatus, priority: editPriority });
    setHasChanges(false);
    setIsSaving(false);
    setShowSuccessMessage(true);

    setTimeout(() => {
      setShowSuccessMessage(false);
      setShowTicketModal(false);
    }, 2000);

    console.log('Ticket Updated:', {
      ticketId: selectedTicket.id,
      newStatus: editStatus,
      newPriority: editPriority,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const message = {
      id: String(selectedTicket.messages.length + 1),
      sender: 'Support Team',
      message: newMessage,
      timestamp: new Date().toISOString(),
      isSupport: true,
    };

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          messages: [...t.messages, message],
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    setSelectedTicket({ ...selectedTicket, messages: [...selectedTicket.messages, message] });
    setNewMessage('');
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Support Tickets Management</h1>
          <p className="text-gray-400">View and manage all support tickets from companies</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
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
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Ticket #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Created By</th>
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
                      <span className="text-white font-mono text-sm">{ticket.number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{ticket.subject}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-300">{ticket.company_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-white text-sm">{ticket.createdBy}</p>
                          <p className="text-gray-500 text-xs">{ticket.createdByEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{ticket.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
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
        </div>

        {showTicketModal && selectedTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full p-6 my-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedTicket.subject}</h2>
                  <p className="text-gray-400 text-sm">{selectedTicket.number}</p>
                </div>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => {
                      setEditStatus(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => {
                      setEditPriority(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {hasChanges && (
                <div className="mb-6">
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving Changes...' : 'Save Changes (Visible to All Users)'}
                  </button>
                </div>
              )}

              {showSuccessMessage && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-green-500 font-medium">Ticket Updated Successfully!</p>
                    <p className="text-green-400/70 text-sm">Changes are now visible to all users</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-900/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Company</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <p className="text-white font-medium">{selectedTicket.company_name}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Created By</p>
                  <p className="text-white font-medium">{selectedTicket.createdBy}</p>
                  <p className="text-gray-500 text-xs">{selectedTicket.createdByEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Category</p>
                  <p className="text-white font-medium">{selectedTicket.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Created At</p>
                  <p className="text-white">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Conversation</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedTicket.messages.map((message: any) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.isSupport
                          ? 'bg-blue-500/10 border border-blue-500/30 ml-8'
                          : 'bg-gray-900/50 border border-gray-700 mr-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-medium ${message.isSupport ? 'text-blue-500' : 'text-white'}`}>
                          {message.sender}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{message.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reply to Ticket</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                  rows={4}
                />
                <button
                  onClick={handleSendMessage}
                  className="mt-3 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all"
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
