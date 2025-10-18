import { useState } from 'react';
import { Search, MessageCircle, Clock, TrendingUp, Users, CheckCheck, BarChart3, UserCircle, Settings, Mail, Phone, Tag, Edit3, Eye, Download } from 'lucide-react';
import { mockWhatsAppSessions } from '../../data/mockWhatsAppSessions';
import { mockWhatsAppMessages } from '../../data/mockWhatsAppMessages';
import { mockWhatsAppCustomers } from '../../data/mockWhatsAppCustomers';

export default function WhatsAppAutomation() {
  const [activeTab, setActiveTab] = useState<'conversations' | 'analytics' | 'customers' | 'settings'>('conversations');
  const [sessions] = useState(mockWhatsAppSessions);
  const [selectedSession, setSelectedSession] = useState(sessions[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');

  const [customers] = useState(mockWhatsAppCustomers);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const messages = mockWhatsAppMessages[selectedSession.id] || [];

  const filteredSessions = sessions.filter(session => {
    const matchesSearch =
      session.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.customer_phone.includes(searchTerm);

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && session.is_active) ||
      (filterStatus === 'closed' && !session.is_active);

    return matchesSearch && matchesFilter;
  });

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.phone_number.includes(customerSearch) ||
      customer.email?.toLowerCase().includes(customerSearch.toLowerCase());

    const matchesFilter =
      customerFilter === 'all' || customer.customer_status === customerFilter;

    return matchesSearch && matchesFilter;
  });

  const dailyMessages = [
    { date: 'Mon', messages: 45, sessions: 12 },
    { date: 'Tue', messages: 62, sessions: 18 },
    { date: 'Wed', messages: 53, sessions: 15 },
    { date: 'Thu', messages: 71, sessions: 21 },
    { date: 'Fri', messages: 58, sessions: 16 },
    { date: 'Sat', messages: 39, sessions: 11 },
    { date: 'Sun', messages: 42, sessions: 13 },
  ];

  const hourlyDistribution = [
    { hour: '00:00', count: 2 },
    { hour: '03:00', count: 1 },
    { hour: '06:00', count: 3 },
    { hour: '09:00', count: 15 },
    { hour: '12:00', count: 28 },
    { hour: '15:00', count: 35 },
    { hour: '18:00', count: 22 },
    { hour: '21:00', count: 12 },
  ];

  const tabs = [
    { id: 'conversations', label: 'Conversations', icon: MessageCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: UserCircle, badge: customers.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats = {
    totalSessions: sessions.length,
    activeSessions: sessions.filter(s => s.is_active).length,
    totalMessages: sessions.reduce((sum, s) => sum + s.message_count, 0),
    avgResponseTime: '2.3 min',
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">WhatsApp Automation</h1>
          <p className="text-gray-400">Monitor and manage your WhatsApp business automation</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="px-2 py-0.5 bg-gray-700 text-white text-xs font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'conversations' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Total Sessions</span>
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Active Sessions</span>
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.activeSessions}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Total Messages</span>
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Avg Response Time</span>
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.avgResponseTime}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
              <div className="flex h-full">
                <div className="w-full md:w-96 border-r border-gray-700 flex flex-col">
                  <div className="p-4 border-b border-gray-700">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setFilterStatus('all')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterStatus('active')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === 'active'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => setFilterStatus('closed')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === 'closed'
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        Closed
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {filteredSessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className={`w-full p-4 border-b border-gray-700 hover:bg-gray-700/50 transition-colors text-left ${
                          selectedSession.id === session.id ? 'bg-gray-700/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-lg">
                              {session.customer_name.charAt(0)}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="text-white font-medium truncate">
                                {session.customer_name}
                              </h3>
                              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {formatTime(session.last_message_time)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-400 truncate flex-1">
                                {session.last_message}
                              </p>
                              {session.unread_count > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                  {session.unread_count}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                session.is_active
                                  ? 'bg-green-500/20 text-green-500'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {session.is_active ? 'Active' : 'Closed'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {session.message_count} messages
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-gray-700 bg-gray-900/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {selectedSession.customer_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{selectedSession.customer_name}</h3>
                        <p className="text-sm text-gray-400">{selectedSession.customer_phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.message_owner === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              message.message_owner === 'outgoing'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-800 text-white'
                            }`}
                          >
                            {message.sender === 'bot' && message.message_owner === 'outgoing' && (
                              <p className="text-xs text-green-200 mb-1 font-medium">Bot</p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.message_body}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-xs opacity-70">
                                {formatMessageTime(message.timestamp)}
                              </span>
                              {message.message_owner === 'outgoing' && (
                                <CheckCheck className="w-4 h-4 opacity-70" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">No messages in this conversation yet</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                      <MessageCircle className="w-4 h-4" />
                      <span>View-only mode - Messages are handled by automation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">This Week</span>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">370</p>
                <p className="text-sm text-gray-400">Total Messages</p>
                <p className="text-xs text-green-500 mt-2">↑ 12% from last week</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Avg Response Time</span>
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">2.3 min</p>
                <p className="text-sm text-gray-400">Average Speed</p>
                <p className="text-xs text-green-500 mt-2">↓ 15% faster</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Resolution Rate</span>
                  <CheckCheck className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">94%</p>
                <p className="text-sm text-gray-400">Issues Resolved</p>
                <p className="text-xs text-green-500 mt-2">↑ 3% improvement</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Customer Satisfaction</span>
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">4.8</p>
                <p className="text-sm text-gray-400">Out of 5.0</p>
                <p className="text-xs text-green-500 mt-2">↑ 0.2 higher</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Daily Messages</h3>
                <div className="space-y-3">
                  {dailyMessages.map((day) => (
                    <div key={day.date}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400">{day.date}</span>
                        <span className="text-sm text-white font-medium">{day.messages} messages</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                          style={{ width: `${(day.messages / 71) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Peak Hours</h3>
                <div className="space-y-3">
                  {hourlyDistribution.map((hour) => (
                    <div key={hour.hour}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400">{hour.hour}</span>
                        <span className="text-sm text-white font-medium">{hour.count} messages</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${(hour.count / 35) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Top Customer Intents</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Order Tracking</span>
                    <span className="text-white font-medium">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Product Inquiry</span>
                    <span className="text-white font-medium">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Support Request</span>
                    <span className="text-white font-medium">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Other</span>
                    <span className="text-white font-medium">9%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Sentiment Analysis</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">😊 Positive</span>
                    <span className="text-green-500 font-medium">67%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">😐 Neutral</span>
                    <span className="text-gray-400 font-medium">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">😞 Negative</span>
                    <span className="text-red-500 font-medium">8%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Bot Performance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Auto-Resolved</span>
                    <span className="text-white font-medium">82%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Agent Escalation</span>
                    <span className="text-white font-medium">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Success Rate</span>
                    <span className="text-green-500 font-medium">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers by name, phone, or email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value as any)}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Customer</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tags</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Messages</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Last Seen</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {customer.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{customer.name}</p>
                              <p className="text-xs text-gray-400">ID: {customer.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Phone className="w-3 h-3" />
                              {customer.phone_number}
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Mail className="w-3 h-3" />
                                {customer.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {customer.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  tag === 'VIP' ? 'bg-purple-500/20 text-purple-400' :
                                  tag === 'Frequent' ? 'bg-blue-500/20 text-blue-400' :
                                  tag === 'New' ? 'bg-green-500/20 text-green-400' :
                                  tag === 'Issue' ? 'bg-red-500/20 text-red-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-medium">{customer.total_messages}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-400">
                            {formatTime(customer.last_seen)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            customer.customer_status === 'active'
                              ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                              : customer.customer_status === 'inactive'
                              ? 'bg-gray-500/10 border border-gray-500/30 text-gray-400'
                              : 'bg-red-500/10 border border-red-500/30 text-red-500'
                          }`}>
                            {customer.customer_status.charAt(0).toUpperCase() + customer.customer_status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-blue-500" />
                            </button>
                            <button
                              className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
                              title="Edit Notes"
                            >
                              <Edit3 className="w-4 h-4 text-purple-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedCustomer && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">
                          {selectedCustomer.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedCustomer.name}</h2>
                        <p className="text-gray-400">{selectedCustomer.phone_number}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-900/50 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Total Messages</p>
                        <p className="text-2xl font-bold text-white">{selectedCustomer.total_messages}</p>
                      </div>
                      <div className="p-4 bg-gray-900/50 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Customer Since</p>
                        <p className="text-lg font-medium text-white">
                          {new Date(selectedCustomer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {selectedCustomer.email && (
                      <div className="p-4 bg-gray-900/50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">Email</span>
                        </div>
                        <p className="text-white">{selectedCustomer.email}</p>
                      </div>
                    )}

                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Tag className="w-4 h-4" />
                        <span className="text-sm">Tags</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCustomer.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <p className="text-sm text-gray-400 mb-2">Notes</p>
                      <p className="text-white">{selectedCustomer.notes}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        const customerSessions = sessions.filter(
                          s => s.customer_phone === selectedCustomer.phone_number
                        );
                        if (customerSessions.length > 0) {
                          setSelectedSession(customerSessions[0]);
                          setActiveTab('conversations');
                          setSelectedCustomer(null);
                        }
                      }}
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      View Conversations
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-400 text-sm">
                <strong>Note:</strong> Settings are managed by your system administrator. Contact support to modify bot configuration.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Bot Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bot Name</label>
                  <input
                    type="text"
                    value="Tech Support Bot"
                    readOnly
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Greeting Message</label>
                  <textarea
                    value="Hello! Welcome to our support. How can I help you today?"
                    readOnly
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Connected Phone Number</label>
                  <input
                    type="text"
                    value="+974 5555 0000"
                    readOnly
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Instance ID</label>
                  <input
                    type="text"
                    value="wa_instance_techcorp_001"
                    readOnly
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Instance Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Connection Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-white font-medium">Connected</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Last Connected</p>
                  <p className="text-white font-medium">2 hours ago</p>
                </div>

                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Service Status</p>
                  <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-500 rounded text-sm font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
