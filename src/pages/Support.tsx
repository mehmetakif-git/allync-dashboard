import { useState } from 'react';
import { MessageSquare, Send, Plus, Clock, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';

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
        senderName: 'You',
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
        senderName: 'You',
        text: 'Thank you! Please keep me updated.',
        timestamp: '2024-12-14 11:20',
        isRead: true,
      },
      {
        id: 'm4',
        sender: 'admin',
        senderName: 'Support Team',
        text: 'Good news! The issue has been fixed. Your WhatsApp automation is now working properly. Please test and let us know if you face any other issues.',
        timestamp: '2024-12-14 14:22',
        isRead: false,
      },
    ],
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-1542',
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
        senderName: 'You',
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
    id: '3',
    ticketNumber: 'TKT-2024-1489',
    subject: 'Feature Request: Bulk Message Templates',
    category: 'Feature Request',
    priority: 'low',
    status: 'open',
    createdAt: '2024-12-08 14:20',
    updatedAt: '2024-12-08 14:20',
    hasUnread: false,
    messages: [
      {
        id: 'm1',
        sender: 'user',
        senderName: 'You',
        text: 'It would be great if we could create and save multiple message templates for WhatsApp automation. Currently, we have to type the same messages repeatedly.',
        timestamp: '2024-12-08 14:20',
        isRead: true,
      },
    ],
  },
  {
    id: '4',
    ticketNumber: 'TKT-2024-1401',
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
        senderName: 'You',
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

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in-progress' | 'waiting-response' | 'resolved' | 'closed'>('all');
  const [search, setSearch] = useState('');

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    if (!confirm(
      `📤 Send Message?\n\n` +
      `Are you sure you want to send this message?\n\n` +
      `Ticket: ${selectedTicket.ticketNumber}\n` +
      `Message: ${newMessage.substring(0, 100)}${newMessage.length > 100 ? '...' : ''}`
    )) {
      return;
    }

    const message: Message = {
      id: `m${Date.now()}`,
      sender: 'user',
      senderName: 'You',
      text: newMessage,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isRead: true,
    };

    setTickets(tickets.map(t =>
      t.id === selectedTicket.id
        ? { ...t, messages: [...t.messages, message], updatedAt: message.timestamp, status: 'waiting-response' }
        : t
    ));

    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, message],
      updatedAt: message.timestamp,
      status: 'waiting-response',
    });

    setNewMessage('');
  };

  const handleCreateTicket = (data: any) => {
    if (!confirm(
      `🎫 Create Support Ticket?\n\n` +
      `Subject: ${data.subject}\n` +
      `Priority: ${data.priority.toUpperCase()}\n\n` +
      `This will notify our support team immediately.`
    )) {
      return;
    }

    const newTicket: Ticket = {
      id: `t${Date.now()}`,
      ticketNumber: `TKT-2024-${Math.floor(Math.random() * 9000) + 1000}`,
      subject: data.subject,
      category: data.category,
      priority: data.priority,
      status: 'open',
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      hasUnread: false,
      messages: [
        {
          id: 'm1',
          sender: 'user',
          senderName: 'You',
          text: data.message,
          timestamp: new Date().toLocaleString(),
          isRead: true,
        },
      ],
    };

    setTickets([newTicket, ...tickets]);
    setShowNewTicketModal(false);
    alert(`✅ Ticket Created!\n\nTicket Number: ${newTicket.ticketNumber}\n\nOur support team will respond shortly.`);
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
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
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

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div className="w-96 border-r border-gray-800 flex flex-col bg-gray-900/50">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Support Tickets</h2>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
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
              className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['all', 'open', 'in-progress', 'waiting-response', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {status === 'all' ? 'All' : status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredTickets.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No tickets found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full p-4 text-left hover:bg-gray-800/50 transition-colors ${
                    selectedTicket?.id === ticket.id ? 'bg-gray-800/70' : ''
                  } ${ticket.hasUnread ? 'bg-blue-500/5' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-xs text-gray-400">{ticket.ticketNumber}</span>
                    {ticket.hasUnread && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white mb-1 line-clamp-1">{ticket.subject}</h3>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-1">
                    {ticket.messages[ticket.messages.length - 1]?.text}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('-', ' ')}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">{ticket.updatedAt.split(' ')[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedTicket ? (
          <>
            <div className="p-4 border-b border-gray-800 bg-gray-900/50">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-gray-400">{selectedTicket.ticketNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusIcon(selectedTicket.status)}
                      {selectedTicket.status.replace('-', ' ')}
                    </span>
                    <span className="text-sm text-gray-400">Category: {selectedTicket.category}</span>
                    <span className={`text-sm font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      Priority: {selectedTicket.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-400">{message.senderName}</span>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <div
                      className={`p-4 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
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
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 resize-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
              </div>
            )}

            {selectedTicket.status === 'closed' && (
              <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                  <XCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">This ticket is closed. Create a new ticket if you need further assistance.</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Select a Ticket</h3>
              <p className="text-gray-400">Choose a ticket from the list to view the conversation</p>
            </div>
          </div>
        )}
      </div>

      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Ticket</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateTicket({
                  subject: formData.get('subject'),
                  category: formData.get('category'),
                  priority: formData.get('priority'),
                  message: formData.get('message'),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                  <select
                    name="category"
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                  <select
                    name="priority"
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
