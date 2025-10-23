import { useState, useEffect } from 'react';
import { MessageSquare, Send, Plus, Clock, CheckCircle, XCircle, AlertCircle, Search, Building2, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  getTicketsByCompany,
  getTicketMessages,
  createTicket,
  createTicketMessage,
  getTicketCategories,
} from '../../lib/api/supportTickets';

interface Message {
  id: string;
  sender_id: string;
  message: string;
  is_from_support: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  company: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    full_name: string;
    email: string;
  };
  messages?: Message[];
}

export default function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);

  useEffect(() => {
    loadTickets();
    loadCategories();
  }, [user?.company_id]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    if (!user?.company_id) return;
    
    try {
      setLoading(true);
      const data = await getTicketsByCompany(user.company_id);
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getTicketCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadMessages = async (ticketId: string) => {
    try {
      setLoadingMessages(true);
      const data = await getTicketMessages(ticketId, true);
      console.log('Loaded messages:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !user) return;

    try {
      setSendingMessage(true);
      
      await createTicketMessage({
        ticket_id: selectedTicket.id,
        sender_id: user.id,
        message: newMessage.trim(),
        is_from_support: false,
      });

      await loadMessages(selectedTicket.id);
      setNewMessage('');
      await loadTickets();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as string;

    try {
      setCreatingTicket(true);

      await createTicket({
        company_id: user.company_id!,
        created_by: user.id,
        subject,
        description,
        category,
        priority: priority as any,
      });

      await loadTickets();
      setShowNewTicketModal(false);
      alert('✅ Ticket created successfully!');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setCreatingTicket(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      case 'waiting_customer': return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      case 'resolved': return 'bg-green-500/10 text-green-400 border border-green-500/30';
      case 'closed': return 'bg-gray-500/10 text-gray-400 border border-gray-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-[#1B2432] rounded-xl overflow-hidden border border-gray-800">
      {/* Tickets List */}
      <div className="w-96 border-r border-gray-800 flex flex-col bg-gray-900/30">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Support Tickets</h2>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-9 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['all', 'open', 'in_progress', 'waiting_customer', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredTickets.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No tickets found</p>
              <p className="text-gray-500 text-sm mt-1">Create a new ticket to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full p-4 text-left hover:bg-gray-800/30 transition-all ${
                    selectedTicket?.id === ticket.id ? 'bg-gray-800/50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-xs text-gray-400">{ticket.ticket_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-1 line-clamp-1">{ticket.subject}</h3>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">{formatDate(ticket.created_at)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedTicket ? (
          <>
            {/* Ticket Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900/50">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm text-gray-400">{selectedTicket.ticket_number}</span>
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusIcon(selectedTicket.status)}
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-400">{selectedTicket.category}</span>
                    <span className={`text-sm font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#1B2432] custom-scrollbar">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No messages yet</p>
                    <p className="text-gray-500 text-sm">Start the conversation below</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${!message.is_from_support ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${!message.is_from_support ? 'order-2' : 'order-1'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {message.is_from_support ? (
                          <span className="text-sm font-medium text-blue-400">Support Team</span>
                        ) : (
                          <span className="text-sm font-medium text-gray-400">You</span>
                        )}
                        <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                      </div>
                      <div
                        className={`p-4 rounded-lg ${
                          !message.is_from_support
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                            : 'bg-gray-800/50 border border-gray-700 text-gray-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' ? (
              <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <div className="flex items-end gap-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={3}
                    disabled={sendingMessage}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                  >
                    {sendingMessage ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
              </div>
            ) : (
              <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-400">
                    {selectedTicket.status === 'resolved' ? 'This ticket has been resolved.' : 'This ticket is closed.'}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">Create a new ticket if you need further assistance.</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#1B2432]">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Select a Ticket</h3>
              <p className="text-gray-400">Choose a ticket from the list to view the conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1B2432] border border-gray-800 rounded-xl p-6 max-w-2xl w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category *</label>
                  <select
                    name="category"
                    required
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="general">General</option>
                        <option value="feature_request">Feature Request</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Priority *</label>
                  <select
                    name="priority"
                    required
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
                <textarea
                  name="description"
                  required
                  rows={6}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  disabled={creatingTicket}
                  className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {creatingTicket && <LoadingSpinner size="sm" />}
                  {creatingTicket ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}