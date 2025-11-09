import { useState, useEffect } from 'react';
import { MessageSquare, Send, Plus, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter } from 'lucide-react';
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
      const data = await getTicketMessages(ticketId, false);
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
    if (!user) {
      console.error('❌ No user found');
      alert('User not authenticated');
      return;
    }

    if (!user.company_id) {
      console.error('❌ No company_id found for user');
      alert('User has no company assigned');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as string;

    console.log('📝 RAW Form Data:', {
      subject,
      description,
      category,
      priority,
    });

    console.log('📝 Categories from API:', categories);

    console.log('📝 Creating ticket with data:', {
      company_id: user.company_id,
      created_by: user.id,
      subject,
      description,
      category,
      priority,
    });

    try {
      setCreatingTicket(true);

      const result = await createTicket({
        company_id: user.company_id!,
        created_by: user.id,
        subject,
        description,
        category,
        priority: priority as any,
      });

      console.log('✅ Ticket created successfully:', result);

      await loadTickets();
      setShowNewTicketModal(false);
      alert('✅ Ticket created successfully!');
    } catch (error: any) {
      console.error('❌ Error creating ticket:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error stringified:', JSON.stringify(error, null, 2));
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        status: error.status,
        statusCode: error.statusCode,
      });
      console.error('❌ Full error object keys:', Object.keys(error));

      let errorMessage = 'Unknown error';
      if (error.message) errorMessage = error.message;
      else if (error.details) errorMessage = error.details;
      else if (error.hint) errorMessage = error.hint;

      alert(`Failed to create ticket: ${errorMessage}. Check browser console for full details.`);
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
      case 'closed': return 'bg-gray-500/10 text-muted border border-secondary/30';
      default: return 'bg-gray-500/10 text-muted border border-secondary/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-muted';
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
    <div className="h-[calc(100vh-8rem)] flex bg-[#1B2432] rounded-xl overflow-hidden border border-primary">
      {/* Tickets List */}
      <div className="w-96 border-r border-primary flex flex-col bg-primary/30">
        <div className="p-4 border-b border-primary bg-primary/50">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {['all', 'open', 'in_progress', 'waiting_customer', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
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
              <p className="text-muted">No tickets found</p>
              <p className="text-muted text-sm mt-1">Create a new ticket to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full p-4 text-left hover:bg-secondary/30 transition-all ${
                    selectedTicket?.id === ticket.id 
                      ? 'bg-gradient-to-r from-blue-900/40 to-blue-800/30 border-l-4 border-blue-500 shadow-lg' 
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-xs text-muted">{ticket.ticket_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-1 line-clamp-1">{ticket.subject}</h3>
                  <p className="text-sm text-muted mb-2 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted ml-auto">{formatDate(ticket.created_at)}</span>
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
            <div className="p-4 border-b border-primary bg-primary/50">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm text-muted">{selectedTicket.ticket_number}</span>
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusIcon(selectedTicket.status)}
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-muted">{selectedTicket.category}</span>
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
                    <p className="text-muted">No messages yet</p>
                    <p className="text-muted text-sm">Start the conversation below</p>
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
                          <span className="text-sm font-medium text-muted">You</span>
                        )}
                        <span className="text-xs text-muted">{formatDate(message.created_at)}</span>
                      </div>
                      <div
                        className={`p-4 rounded-lg ${
                          !message.is_from_support
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                            : 'bg-card border border-secondary text-gray-100'
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
              <div className="p-4 border-t border-primary bg-primary/50">
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
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none transition-colors disabled:opacity-50"
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
                <p className="text-xs text-muted mt-2">Press Enter to send, Shift+Enter for new line</p>
              </div>
            ) : (
              <div className="p-4 border-t border-primary bg-primary/50">
                <div className="bg-secondary/30 border border-secondary rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-muted">
                    {selectedTicket.status === 'resolved' ? 'This ticket has been resolved.' : 'This ticket is closed.'}
                  </p>
                  <p className="text-muted text-sm mt-1">Create a new ticket if you need further assistance.</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#1B2432]">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Select a Ticket</h3>
              <p className="text-muted">Choose a ticket from the list to view the conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#1B2432] to-[#151B26] border-2 border-blue-500/20 rounded-2xl shadow-2xl shadow-blue-500/10 max-w-3xl w-full">
            {/* Header */}
            <div className="relative p-6 border-b border-secondary/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create Support Ticket</h2>
                  <p className="text-sm text-muted">Our team will respond within 24 hours</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewTicketModal(false)}
                disabled={creatingTicket}
                className="absolute top-6 right-6 p-2 hover:bg-hover/50 rounded-lg transition-all group"
              >
                <XCircle className="w-6 h-6 text-muted group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTicket} className="p-6 space-y-5">
              {/* Subject */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-secondary">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-secondary">
                    <Filter className="w-4 h-4 text-purple-400" />
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="technical">🔧 Technical Support</option>
                    <option value="billing">💳 Billing & Payment</option>
                    <option value="general">💬 General Question</option>
                    <option value="feature_request">✨ Feature Request</option>
                    <option value="bug">🐛 Bug Report</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-secondary">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    Priority *
                  </label>
                  <select
                    name="priority"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="low">🟢 Low - General inquiry</option>
                    <option value="medium">🟡 Medium - Need assistance</option>
                    <option value="high">🟠 High - Important issue</option>
                    <option value="urgent">🔴 Urgent - Critical problem</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-secondary">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={6}
                  placeholder="Describe your issue in detail...&#10;&#10;Include:&#10;• What happened?&#10;• What were you trying to do?&#10;• Any error messages?&#10;• Steps to reproduce (if applicable)"
                  className="w-full px-4 py-3 bg-card border border-secondary rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none resize-none transition-all"
                />
                <p className="text-xs text-muted">Be as detailed as possible to help us resolve your issue faster</p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-300 mb-1">Response Time</h4>
                    <p className="text-xs text-muted">
                      • <strong className="text-blue-400">Urgent:</strong> Within 2 hours<br/>
                      • <strong className="text-yellow-400">High:</strong> Within 4 hours<br/>
                      • <strong className="text-green-400">Medium/Low:</strong> Within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  disabled={creatingTicket}
                  className="flex-1 px-6 py-3 bg-secondary hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all border border-secondary hover:border-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
                >
                  {creatingTicket ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Creating Ticket...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Create Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}