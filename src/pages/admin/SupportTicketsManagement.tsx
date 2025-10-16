import { useState } from 'react';
import { MessageSquare, Search, Filter, Send, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Message {
  id: string;
  sender: string;
  senderRole: 'user' | 'admin';
  content: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  company: string;
  user: string;
  userEmail: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdDate: string;
  lastUpdate: string;
  messages: Message[];
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-001',
    company: 'Tech Innovators Inc',
    user: 'John Smith',
    userEmail: 'john.smith@techinnovators.com',
    subject: 'WhatsApp API Connection Issue',
    category: 'Technical',
    priority: 'high',
    status: 'in_progress',
    createdDate: '2024-03-20 10:30',
    lastUpdate: '2024-03-20 14:15',
    messages: [
      {
        id: 'm1',
        sender: 'John Smith',
        senderRole: 'user',
        content: 'We are experiencing connection issues with WhatsApp API. Messages are not being sent.',
        timestamp: '2024-03-20 10:30',
      },
      {
        id: 'm2',
        sender: 'Allync Support Team',
        senderRole: 'admin',
        content: 'Thank you for reporting this. We are investigating the issue. Could you please provide your API credentials?',
        timestamp: '2024-03-20 14:15',
      },
    ],
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-002',
    company: 'Global Solutions Ltd',
    user: 'Michael Chen',
    userEmail: 'michael@globalsolutions.com',
    subject: 'Billing Question',
    category: 'Billing',
    priority: 'medium',
    status: 'open',
    createdDate: '2024-03-19 15:20',
    lastUpdate: '2024-03-19 15:20',
    messages: [
      {
        id: 'm3',
        sender: 'Michael Chen',
        senderRole: 'user',
        content: 'I have a question about my last invoice. Can you explain the charges?',
        timestamp: '2024-03-19 15:20',
      },
    ],
  },
  {
    id: '3',
    ticketNumber: 'TKT-2024-003',
    company: 'Digital Marketing Pro',
    user: 'Emma Davis',
    userEmail: 'emma.davis@digitalmarketingpro.com',
    subject: 'Feature Request: Custom Templates',
    category: 'Feature Request',
    priority: 'low',
    status: 'open',
    createdDate: '2024-03-18 11:45',
    lastUpdate: '2024-03-18 11:45',
    messages: [
      {
        id: 'm4',
        sender: 'Emma Davis',
        senderRole: 'user',
        content: 'It would be great to have custom message templates for Instagram DM automation.',
        timestamp: '2024-03-18 11:45',
      },
    ],
  },
  {
    id: '4',
    ticketNumber: 'TKT-2024-004',
    company: 'E-Commerce Plus',
    user: 'David Wilson',
    userEmail: 'david.w@ecommerceplus.com',
    subject: 'Account Access Problem',
    category: 'Account',
    priority: 'urgent',
    status: 'resolved',
    createdDate: '2024-03-17 09:00',
    lastUpdate: '2024-03-17 16:30',
    messages: [
      {
        id: 'm5',
        sender: 'David Wilson',
        senderRole: 'user',
        content: 'I cannot log into my account. Password reset is not working.',
        timestamp: '2024-03-17 09:00',
      },
      {
        id: 'm6',
        sender: 'Allync Support Team',
        senderRole: 'admin',
        content: 'I have reset your password manually. Please check your email for the new credentials.',
        timestamp: '2024-03-17 16:30',
      },
    ],
  },
];

export default function SupportTicketsManagement() {
  const [tickets] = useState<Ticket[]>(mockTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    if (confirm('Send this reply to the user?')) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      alert('Reply sent successfully');
      setReplyMessage('');
    }
  };

  const handleResolveTicket = async (ticket: Ticket) => {
    if (confirm(`Mark ticket ${ticket.ticketNumber} as resolved?`)) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
      alert('Ticket marked as resolved');
      setShowDetailsModal(false);
    }
  };

  const handleCloseTicket = async (ticket: Ticket) => {
    if (confirm(`Close ticket ${ticket.ticketNumber}? This action cannot be undone.`)) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
      alert('Ticket closed successfully');
      setShowDetailsModal(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/20 text-blue-400';
      case 'in_progress':
        return 'bg-purple-500/20 text-purple-400';
      case 'resolved':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
        <p className="text-gray-400 mt-1">Manage all support tickets from all companies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Tickets</p>
              <p className="text-3xl font-bold text-white mt-2">{tickets.length}</p>
            </div>
            <MessageSquare className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Open Tickets</p>
              <p className="text-3xl font-bold text-white mt-2">
                {tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Resolved</p>
              <p className="text-3xl font-bold text-white mt-2">
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Urgent</p>
              <p className="text-3xl font-bold text-white mt-2">
                {tickets.filter(t => t.priority === 'urgent').length}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tickets by subject, company, or ticket number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Ticket #</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Subject</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Company</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Priority</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="py-4 px-4">
                    <p className="text-white font-medium">{ticket.ticketNumber}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-medium">{ticket.subject}</p>
                      <p className="text-gray-400 text-sm">{ticket.category}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white">{ticket.company}</p>
                      <p className="text-gray-400 text-sm">{ticket.user}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-300 text-sm">{ticket.createdDate}</p>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowDetailsModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailsModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedTicket.ticketNumber}</h2>
                  <p className="text-gray-400 mt-1">{selectedTicket.subject}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="flex gap-3 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(selectedTicket.priority)}`}>
                  {selectedTicket.priority}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300">
                  {selectedTicket.category}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Company</p>
                  <p className="text-white">{selectedTicket.company}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">User</p>
                  <p className="text-white">{selectedTicket.user}</p>
                  <p className="text-gray-400 text-sm">{selectedTicket.userEmail}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Created</p>
                  <p className="text-white">{selectedTicket.createdDate}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Last Update</p>
                  <p className="text-white">{selectedTicket.lastUpdate}</p>
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-3">Conversation</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.senderRole === 'admin' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium">{message.sender}</p>
                        <p className="text-gray-400 text-xs">{message.timestamp}</p>
                      </div>
                      <p className="text-gray-300">{message.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Reply</label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Type your reply..."
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={isLoading}
                    className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => handleResolveTicket(selectedTicket)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Mark as Resolved
                  </button>
                )}
                {selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => handleCloseTicket(selectedTicket)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                  >
                    Close Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
