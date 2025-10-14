import { useState } from 'react';
import { MessageSquare, Send, Search, Clock, CheckCircle, XCircle, AlertCircle, Building2, User, Calendar } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  company: string;
  companyId: string;
  userName: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'waiting-response' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  hasUnread: boolean;
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-1589',
    company: 'Tech Corp',
    companyId: 'c1',
    userName: 'John Smith (Company Admin)',
    subject: 'WhatsApp API Connection Issue',
    category: 'Technical',
    priority: 'high',
    status: 'in-progress',
    createdAt: '2024-12-14 09:30',
    updatedAt: '2024-12-14 14:22',
    hasUnread: true,
    messages: [
      {
        id: 'm1',
        sender: 'user',
        senderName: 'John Smith',
        text: 'Hi, I\'m experiencing connection issues with WhatsApp API. The automation stopped working since yesterday. Can you help?',
        timestamp: '2024-12-14 09:30',
        isRead: true,
      },
      {
        id: 'm2',
        sender: 'admin',
        senderName: 'Support Team',
        text: 'Hello! Thank you for reaching out. I\'ve checked your account and I can see the issue. Our team is working on it. We\'ll have this resolved within 2 hours.',
        timestamp: '2024-12-14 11:15',
        isRead: true,
      },
      {
        id: 'm3',
        sender: 'user',
        senderName: 'John Smith',
        text: 'Thank you! Please keep me updated.',
        timestamp: '2024-12-14 11:20',
        isRead: true,
      },
    ],
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-1587',
    company: 'Digital Solutions Inc',
    companyId: 'c2',
    userName: 'Sarah Johnson (User)',
    subject: 'How to export customer data?',
    category: 'General',
    priority: 'low',
    status: 'open',
    createdAt: '2024-12-14 10:15',
    updatedAt: '2024-12-14 10:15',
    hasUnread: true,
    messages: [
      {
        id: 'm1',
        sender: 'user',
        senderName: 'Sarah Johnson',
        text: 'Hi, I need to export all customer data from WhatsApp Automation. Is there an export feature?',
        timestamp: '2024-12-14 10:15',
        isRead: true,
      },
    ],
  },
  {
    id: '3',
    ticketNumber: 'TKT-2024-1542',
    company: 'Tech Corp',
    companyId: 'c1',
    userName: 'John Smith (Company Admin)',
    subject: 'Upgrade to Enterprise Plan',
    category: 'Billing',
    priority: 'medium',
    status: 'waiting-response',
    createdAt: '2024-12-10 16:45',
    updatedAt: '2024-12-11 10:30',
    hasUnread: false,
    messages: [
      {
        id: 'm1',
        sender: 'user',
        senderName: 'John Smith',
        text: 'Hi, I would like to upgrade my WhatsApp Automation from Pro to Enterprise plan. What\'s the process?',
        timestamp: '2024-12-10 16:45',
        isRead: true,
      },
      {
        id: 'm2',
        sender: 'admin',
        senderName: 'Billing Team',
        text: 'Hello! Thank you for your interest in upgrading. The Enterprise plan includes unlimited messages, priority support, and custom integrations. The cost is $1,499/month. Would you like me to process this upgrade?',
        timestamp: '2024-12-11 10:30',
        isRead: true,
      },
    ],
  },
  {
    id: '4',
    ticketNumber: 'TKT-2024-1489',
    company: 'Innovation Labs',
    companyId: 'c3',
    userName: 'Mike Chen (Company Admin)',
    subject: 'Feature Request: Bulk Message Templates',
    category: 'Feature Request',
    priority: 'low',
    status: 'open',
    createdAt: '2024-12-08 14:20',
    updatedAt: '2024-12-08 14:20',
    hasUnread: true,
    messages: [
      {
        id: 'm1',
        sender: 'user',
        senderName: 'Mike Chen',
        text: 'It would be great if we could create and save multiple message templates for WhatsApp automation. Currently, we have to type the same messages repeatedly.',
        timestamp: '2024-12-08 14:20',
        isRead: true,
      },
    ],
  },
  {
    id: '5',
    ticketNumber: 'TKT-2024-1401',
    company: 'Tech Corp',
    companyId: 'c1',
    userName: 'John Smith (Company Admin)',
    subject: 'Invoice Payment Confirmation',
    category: 'Billing',
    priority: 'medium',
    status: 'resolved',
    createdAt: '2024-12-01 11:30',
    updatedAt: '2024-12-01 15:45',
    hasUnread: false,
    messages: [
      {
        id: 'm1',
        sender: 'user',
        senderName: 'John Smith',
        text: 'I just paid invoice INV-2024-1247 via Stripe but it still shows as pending. Can you check?',
        timestamp: '2024-12-01 11:30',
        isRead: true,
      },
      {
        id: 'm2',
        sender: 'admin',
        senderName: 'Billing Team',
        text: 'Thank you for your payment! I can confirm that we received it. The invoice status has been updated to "Paid". You can download the receipt from your invoices page.',
        timestamp: '2024-12-01 15:45',
        isRead: true,
      },
    ],
  },
];

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in-progress' | 'waiting-response' | 'resolved' | 'closed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [search, setSearch] = useState('');

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    const matchesCompany = filterCompany === 'all' || ticket.companyId === filterCompany;
    const matchesSearch = ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
                         ticket.company.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesPriority && matchesCompany && matchesSearch;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const message: Message = {
      id: `m${Date.now()}`,
      sender: 'admin',
      senderName: 'Support Team',
      text: newMessage,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isRead: false,
    };

    setTickets(tickets.map(t =>
      t.id === selectedTicket.id
        ? { ...t, messages: [...t.messages, message], updatedAt: message.timestamp, status: 'in-progress', hasUnread: false }
        : t
    ));

    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, message],
      updatedAt: message.timestamp,
      status: 'in-progress',
      hasUnread: false,
    });

    setNewMessage('');
  };

  const handleChangeStatus = (status: Ticket['status']) => {
    if (!selectedTicket) return;

    setTickets(tickets.map(t =>
      t.id === selectedTicket.id
        ? { ...t, status, updatedAt: new Date().toLocaleString() }
        : t
    ));

    setSelectedTicket({
      ...selectedTicket,
      status,
      updatedAt: new Date().toLocaleString(),
    });

    alert(`✅ Ticket status changed to: ${status.replace('-', ' ').toUpperCase()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400';
      case 'waiting-response': return 'bg-orange-500/20 text-orange-400';
      case 'resolved': return 'bg-green-500/20 text-green-400';
      case 'closed': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'low': return 'text-green-400 bg-green-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in-progress').length;
  const unreadCount = tickets.filter(t => t.hasUnread).length;

  const companies = Array.from(new Set(tickets.map(t => ({ id: t.companyId, name: t.company }))));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
          <p className="text-gray-400 mt-1">Manage all company support requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-gray-400">Open Tickets</p>
          </div>
          <p className="text-3xl font-bold text-white">{openCount}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-400">In Progress</p>
          </div>
          <p className="text-3xl font-bold text-white">{inProgressCount}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-sm text-gray-400">Unread</p>
          </div>
          <p className="text-3xl font-bold text-white">{unreadCount}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-gray-400">Total Tickets</p>
          </div>
          <p className="text-3xl font-bold text-white">{tickets.length}</p>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="waiting-response">Waiting Response</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Company</label>
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500"
              >
                <option value="all">All Companies</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-bold text-white">Tickets ({filteredTickets.length})</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-800">
              {filteredTickets.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No tickets found</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full p-4 text-left hover:bg-gray-800/50 transition-colors ${
                      selectedTicket?.id === ticket.id ? 'bg-gray-800/70' : ''
                    } ${ticket.hasUnread ? 'bg-red-500/5' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-mono text-xs text-gray-400">{ticket.ticketNumber}</span>
                      {ticket.hasUnread && (
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    <h4 className="font-semibold text-white mb-1 line-clamp-1">{ticket.subject}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{ticket.company}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{ticket.userName}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('-', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">{ticket.updatedAt.split(' ')[0]}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden h-[700px] flex flex-col">
            {selectedTicket ? (
              <>
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{selectedTicket.subject}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm text-gray-400">{selectedTicket.ticketNumber}</span>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Building2 className="w-4 h-4" />
                          {selectedTicket.company}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <User className="w-4 h-4" />
                          {selectedTicket.userName}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {selectedTicket.createdAt}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusIcon(selectedTicket.status)}
                      {selectedTicket.status.replace('-', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      Priority: {selectedTicket.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">Category: {selectedTicket.category}</span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {selectedTicket.status !== 'in-progress' && (
                      <button
                        onClick={() => handleChangeStatus('in-progress')}
                        className="px-3 py-1 text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-colors"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                      <button
                        onClick={() => handleChangeStatus('resolved')}
                        className="px-3 py-1 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {selectedTicket.status !== 'closed' && (
                      <button
                        onClick={() => {
                          if (confirm('Close this ticket? The company will not be able to reply.')) {
                            handleChangeStatus('closed');
                          }
                        }}
                        className="px-3 py-1 text-xs bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 rounded-lg transition-colors"
                      >
                        Close Ticket
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${message.sender === 'admin' ? 'order-2' : 'order-1'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-400">{message.senderName}</span>
                          <span className="text-xs text-gray-500">{message.timestamp}</span>
                        </div>
                        <div
                          className={`p-4 rounded-lg ${
                            message.sender === 'admin'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-800 text-gray-100'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTicket.status !== 'closed' && (
                  <div className="p-4 border-t border-gray-800">
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
                        placeholder="Type your response..."
                        rows={3}
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500 resize-none"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
                  </div>
                )}

                {selectedTicket.status === 'closed' && (
                  <div className="p-4 border-t border-gray-800">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                      <XCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400">This ticket is closed.</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Select a Ticket</h3>
                  <p className="text-gray-400">Choose a ticket from the list to view and respond</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
