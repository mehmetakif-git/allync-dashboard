import { useState } from 'react';
import { Search, MessageCircle, Clock, TrendingUp, Users, CheckCheck } from 'lucide-react';
import { mockWhatsAppSessions } from '../../data/mockWhatsAppSessions';
import { mockWhatsAppMessages } from '../../data/mockWhatsAppMessages';

export default function WhatsAppAutomation() {
  const [sessions] = useState(mockWhatsAppSessions);
  const [selectedSession, setSelectedSession] = useState(sessions[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');

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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">WhatsApp Automation</h1>
          <p className="text-gray-400">Monitor and view all customer conversations</p>
        </div>

        {/* Stats Cards */}
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

        {/* WhatsApp Interface */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
          <div className="flex h-full">
            {/* Left Panel - Conversations List */}
            <div className="w-full md:w-96 border-r border-gray-700 flex flex-col">
              {/* Search & Filter */}
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

              {/* Conversations List */}
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
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-lg">
                          {session.customer_name.charAt(0)}
                        </span>
                      </div>

                      {/* Content */}
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

                        {/* Status badge */}
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

            {/* Right Panel - Message Thread */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
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

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0f1a]">
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

              {/* Info Banner - No sending */}
              <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span>View-only mode - Messages are handled by automation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
