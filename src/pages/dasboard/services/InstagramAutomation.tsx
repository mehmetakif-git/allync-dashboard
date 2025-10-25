import { useState } from 'react';
import { Search, MessageCircle, Clock, TrendingUp, Users, ThumbsUp, Send, CheckCheck, BarChart3, Settings, Edit3, Eye, Download, Tag, User, ChevronDown, Plus, Info, Instagram } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { mockInstagramPosts, mockInstagramComments, getCommentsByPost } from '../../../data/mockInstagramComments';
import { mockInstagramDMSessions } from '../../../data/mockInstagramDMSessions';
import { mockInstagramDMMessages } from '../../../data/mockInstagramDMMessages';
import { mockInstagramUsers } from '../../../data/mockInstagramUsers';
import { mockInstagramInstances, connectionStatusColors, connectionStatusLabels } from '../../../data/mockInstagramData';

export default function InstagramAutomation() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'comments' | 'dms' | 'customers' | 'analytics' | 'settings'>('comments');
  const [showInstanceDropdown, setShowInstanceDropdown] = useState(false);
  const [showAddInstanceInfo, setShowAddInstanceInfo] = useState(false);

  // TODO: Replace with API call
  // const { data: instances } = await supabase
  //   .from('instagram_instances')
  //   .select('*')
  //   .eq('company_id', user?.companyId);
  const instances = mockInstagramInstances.filter(i => i.companyId === user?.companyId);
  const [selectedInstanceId, setSelectedInstanceId] = useState(instances[0]?.id);
  const selectedInstance = instances.find(i => i.id === selectedInstanceId) || instances[0];

  const [posts] = useState(mockInstagramPosts);
  const [selectedPost, setSelectedPost] = useState(posts[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const [dmSessions] = useState(mockInstagramDMSessions);
  const [selectedDMSession, setSelectedDMSession] = useState(dmSessions[0]);
  const [dmSearchTerm, setDMSearchTerm] = useState('');
  const [dmFilterStatus, setDMFilterStatus] = useState<'all' | 'active' | 'closed'>('all');

  const comments = getCommentsByPost(selectedPost.id);

  const filteredPosts = posts.filter(post =>
    post.caption.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalComments: mockInstagramComments.length,
    botResponses: mockInstagramComments.filter(c => c.is_bot_reply).length,
    avgResponseTime: '2.1 min',
    positiveRate: Math.round((mockInstagramComments.filter(c => c.sentiment === 'positive').length / mockInstagramComments.length) * 100),
  };

  const dmMessages = mockInstagramDMMessages[selectedDMSession.id] || [];

  const filteredDMSessions = dmSessions.filter(session => {
    const matchesSearch =
      session.username.toLowerCase().includes(dmSearchTerm.toLowerCase()) ||
      session.last_message.toLowerCase().includes(dmSearchTerm.toLowerCase());

    const matchesFilter =
      dmFilterStatus === 'all' ||
      (dmFilterStatus === 'active' && session.is_active) ||
      (dmFilterStatus === 'closed' && !session.is_active);

    return matchesSearch && matchesFilter;
  });

  const dmStats = {
    totalSessions: dmSessions.length,
    activeSessions: dmSessions.filter(s => s.is_active).length,
    totalMessages: dmSessions.reduce((sum, s) => sum + s.message_count, 0),
    avgResponseTime: '2.5 min',
  };

  const [users] = useState(mockInstagramUsers);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const filteredCustomers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(customerSearch.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(customerSearch.toLowerCase());

    const matchesFilter =
      customerFilter === 'all' || user.customer_status === customerFilter;

    return matchesSearch && matchesFilter;
  });

  const dailyEngagement = [
    { date: 'Mon', comments: 15, dms: 8 },
    { date: 'Tue', comments: 22, dms: 12 },
    { date: 'Wed', comments: 18, dms: 9 },
    { date: 'Thu', comments: 28, dms: 15 },
    { date: 'Fri', comments: 24, dms: 11 },
    { date: 'Sat', comments: 12, dms: 6 },
    { date: 'Sun', comments: 14, dms: 7 },
  ];

  const sentimentData = [
    { sentiment: 'Positive', percentage: 67, color: 'from-green-500 to-emerald-500' },
    { sentiment: 'Neutral', percentage: 25, color: 'from-blue-500 to-cyan-500' },
    { sentiment: 'Negative', percentage: 8, color: 'from-red-500 to-pink-500' },
  ];

  const tabs = [
    { id: 'comments', label: 'Comments', icon: MessageCircle, badge: mockInstagramComments.length },
    { id: 'dms', label: 'Direct Messages', icon: Send, badge: dmStats.activeSessions },
    { id: 'customers', label: 'Customers', icon: User, badge: users.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

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

  const formatCommentTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!selectedInstance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-card backdrop-blur-sm border border-secondary rounded-lg p-8 text-center">
            <Instagram className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary mb-2">No Instagram Account</h3>
            <p className="text-muted">No Instagram automation instance found for your company.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Instagram Automation</h1>
              <p className="text-muted">AI-powered comment responses and engagement management</p>
            </div>

            <div className="flex items-center gap-3">
              {instances.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setShowInstanceDropdown(!showInstanceDropdown)}
                    className="flex items-center gap-3 px-4 py-3 bg-secondary border border-secondary rounded-lg hover:bg-hover transition-colors"
                  >
                    <div className="text-left">
                      <div className="text-sm text-muted">Current Account</div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{selectedInstance.instanceName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${connectionStatusColors[selectedInstance.connectionStatus]}`}>
                          {connectionStatusLabels[selectedInstance.connectionStatus]}
                        </span>
                      </div>
                      <div className="text-xs text-muted">{selectedInstance.username}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted" />
                  </button>

                  {showInstanceDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-secondary border border-secondary rounded-lg shadow-xl z-50">
                      <div className="p-2">
                        {instances.map((instance) => (
                          <button
                            key={instance.id}
                            onClick={() => {
                              setSelectedInstanceId(instance.id);
                              setShowInstanceDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              instance.id === selectedInstanceId
                                ? 'bg-pink-600 text-white'
                                : 'hover:bg-hover text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{instance.instanceName}</div>
                                <div className="text-xs text-muted">{instance.username}</div>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-xs border ${connectionStatusColors[instance.connectionStatus]}`}>
                                {connectionStatusLabels[instance.connectionStatus]}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowAddInstanceInfo(true)}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-secondary rounded-lg hover:border-pink-500 hover:bg-pink-500/10 transition-all text-muted hover:text-pink-400"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add Account</span>
                </button>

                {showAddInstanceInfo && (
                  <div className="absolute right-0 mt-2 w-80 bg-secondary border border-secondary rounded-lg shadow-xl z-50 p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Info className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-white font-medium mb-1">Add New Instagram Account</h3>
                        <p className="text-sm text-muted">Contact our support team to add additional Instagram accounts to your automation.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddInstanceInfo(false)}
                      className="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
                    >
                      Got it
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
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
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                    : 'bg-secondary text-muted hover:bg-hover'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'comments' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">Total Comments</span>
              <MessageCircle className="w-5 h-5 text-pink-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalComments}</p>
          </div>

          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">Bot Responses</span>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.botResponses}</p>
          </div>

          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">Avg Response Time</span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.avgResponseTime}</p>
          </div>

          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">Positive Rate</span>
              <ThumbsUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.positiveRate}%</p>
          </div>
        </div>

        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
          <div className="flex h-full">
            <div className="w-full md:w-96 border-r border-secondary flex flex-col">
              <div className="p-4 border-b border-secondary">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-primary border border-secondary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className={`w-full p-4 border-b border-secondary hover:bg-hover/50 transition-colors text-left ${
                      selectedPost.id === post.id ? 'bg-secondary/50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-primary">
                        <img
                          src={post.image_url}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-secondary line-clamp-2 mb-2">
                          {post.caption}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {post.comment_count}
                          </span>
                          <span>{formatTime(post.last_comment_time)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-secondary bg-primary/50">
                <div className="flex gap-4">
                  <img
                    src={selectedPost.image_url}
                    alt="Post"
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm mb-2">{selectedPost.caption}</p>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {selectedPost.comment_count} comments
                      </span>
                      <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-primary via-secondary to-primary">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="space-y-2">
                      <div className="flex gap-3">
                        <img
                          src={comment.profile_picture_url}
                          alt={comment.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="bg-secondary rounded-lg px-4 py-2">
                            <p className="text-sm font-medium text-white mb-1">{comment.username}</p>
                            <p className="text-sm text-secondary">{comment.comment_text}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted">{formatCommentTime(comment.created_at)}</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                comment.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                                comment.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                                'bg-gray-500/20 text-muted'
                              }`}>
                                {comment.sentiment}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {comment.bot_response && (
                        <div className="flex gap-3 ml-11">
                          <div className="flex-1">
                            <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg px-4 py-2">
                              <p className="text-xs font-medium text-pink-200 mb-1">Bot Response</p>
                              <p className="text-sm text-white">{comment.bot_response}</p>
                              <span className="text-xs text-pink-200 opacity-70 mt-2 block">
                                {comment.responded_at && formatCommentTime(comment.responded_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-muted">No comments on this post yet</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-secondary bg-primary/50">
                <div className="flex items-center justify-center gap-2 text-muted text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span>View-only mode - Comments are handled by AI automation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === 'dms' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Total Conversations</span>
                  <MessageCircle className="w-5 h-5 text-pink-500" />
                </div>
                <p className="text-2xl font-bold text-white">{dmStats.totalSessions}</p>
              </div>

              <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Active Conversations</span>
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-white">{dmStats.activeSessions}</p>
              </div>

              <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Total Messages</span>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-white">{dmStats.totalMessages}</p>
              </div>

              <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Avg Response Time</span>
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-white">{dmStats.avgResponseTime}</p>
              </div>
            </div>

            <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
              <div className="flex h-full">
                <div className="w-full md:w-96 border-r border-secondary flex flex-col">
                  <div className="p-4 border-b border-secondary">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={dmSearchTerm}
                        onChange={(e) => setDMSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-primary border border-secondary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setDMFilterStatus('all')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          dmFilterStatus === 'all'
                            ? 'bg-pink-600 text-white'
                            : 'bg-primary text-muted hover:bg-hover'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setDMFilterStatus('active')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          dmFilterStatus === 'active'
                            ? 'bg-purple-600 text-white'
                            : 'bg-primary text-muted hover:bg-hover'
                        }`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => setDMFilterStatus('closed')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          dmFilterStatus === 'closed'
                            ? 'bg-hover text-white'
                            : 'bg-primary text-muted hover:bg-hover'
                        }`}
                      >
                        Closed
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {filteredDMSessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => setSelectedDMSession(session)}
                        className={`w-full p-4 border-b border-secondary hover:bg-hover/50 transition-colors text-left ${
                          selectedDMSession.id === session.id ? 'bg-secondary/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={session.profile_picture_url}
                            alt={session.username}
                            className="w-12 h-12 rounded-full"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="text-white font-medium truncate">
                                {session.username}
                              </h3>
                              <span className="text-xs text-muted whitespace-nowrap ml-2">
                                {formatTime(session.last_message_time)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted truncate flex-1">
                                {session.last_message}
                              </p>
                              {session.unread_count > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-pink-500 text-white text-xs font-bold rounded-full">
                                  {session.unread_count}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                session.is_active
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : 'bg-gray-500/20 text-muted'
                              }`}>
                                {session.is_active ? 'Active' : 'Closed'}
                              </span>
                              <span className="text-xs text-muted">
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
                  <div className="p-4 border-b border-secondary bg-primary/50">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedDMSession.profile_picture_url}
                        alt={selectedDMSession.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="text-white font-medium">{selectedDMSession.username}</h3>
                        <p className="text-sm text-muted">
                          {selectedDMSession.is_active ? 'Active now' : 'Conversation closed'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-primary via-secondary to-primary">
                    {dmMessages.length > 0 ? (
                      dmMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.message_owner === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              message.message_owner === 'outgoing'
                                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                                : 'bg-secondary text-white'
                            }`}
                          >
                            {message.sender === 'bot' && message.message_owner === 'outgoing' && (
                              <p className="text-xs text-pink-200 mb-1 font-medium">Bot</p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-xs opacity-70">
                                {formatCommentTime(message.timestamp)}
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
                          <p className="text-muted">No messages in this conversation yet</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-secondary bg-primary/50">
                    <div className="flex items-center justify-center gap-2 text-muted text-sm">
                      <MessageCircle className="w-4 h-4" />
                      <span>View-only mode - Messages are handled by automation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

{activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    placeholder="Search customers by username or name..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-primary border border-secondary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value as any)}
                  className="px-4 py-2 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
                <button className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/50 border-b border-secondary">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Followers</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Tags</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Engagement</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Last Seen</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredCustomers.map((user) => (
                      <tr key={user.id} className="hover:bg-hover/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.profile_picture_url}
                              alt={user.username}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="text-white font-medium">{user.username}</p>
                              <p className="text-xs text-muted">{user.full_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-secondary">{user.follower_count?.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  tag === 'VIP' ? 'bg-purple-500/20 text-purple-400' :
                                  tag === 'Frequent' ? 'bg-pink-500/20 text-pink-400' :
                                  tag === 'New' ? 'bg-green-500/20 text-green-400' :
                                  tag === 'Influencer' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-gray-500/20 text-muted'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-white">{user.total_comments} comments</p>
                            <p className="text-muted">{user.total_dms} DMs</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-muted">
                            {formatTime(user.last_interaction)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.customer_status === 'active'
                              ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                              : user.customer_status === 'inactive'
                              ? 'bg-gray-500/10 border border-secondary/30 text-muted'
                              : 'bg-red-500/10 border border-red-500/30 text-red-500'
                          }`}>
                            {user.customer_status.charAt(0).toUpperCase() + user.customer_status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedCustomer(user)}
                              className="p-2 hover:bg-pink-500/10 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-pink-500" />
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
                <div className="bg-secondary border border-secondary rounded-xl max-w-2xl w-full p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={selectedCustomer.profile_picture_url}
                        alt={selectedCustomer.username}
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedCustomer.username}</h2>
                        <p className="text-muted">{selectedCustomer.full_name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-muted hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-primary/50 rounded-lg">
                        <p className="text-sm text-muted mb-1">Followers</p>
                        <p className="text-2xl font-bold text-white">{selectedCustomer.follower_count?.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-primary/50 rounded-lg">
                        <p className="text-sm text-muted mb-1">Following</p>
                        <p className="text-2xl font-bold text-white">{selectedCustomer.following_count?.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-primary/50 rounded-lg">
                        <p className="text-sm text-muted mb-1">Comments</p>
                        <p className="text-2xl font-bold text-white">{selectedCustomer.total_comments}</p>
                      </div>
                      <div className="p-4 bg-primary/50 rounded-lg">
                        <p className="text-sm text-muted mb-1">DMs</p>
                        <p className="text-2xl font-bold text-white">{selectedCustomer.total_dms}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/50 rounded-lg">
                      <div className="flex items-center gap-2 text-muted mb-2">
                        <Tag className="w-4 h-4" />
                        <span className="text-sm">Tags</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCustomer.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-lg text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-primary/50 rounded-lg">
                      <p className="text-sm text-muted mb-2">Notes</p>
                      <p className="text-white">{selectedCustomer.notes}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="w-full px-6 py-3 bg-gray-700 hover:bg-hover text-white rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-4">
                <p className="text-sm text-muted mb-1">This Week</p>
                <p className="text-3xl font-bold text-white">133</p>
                <p className="text-xs text-green-500 mt-2">↑ 18% from last week</p>
              </div>
              <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-4">
                <p className="text-sm text-muted mb-1">Avg Response</p>
                <p className="text-3xl font-bold text-white">2.1 min</p>
                <p className="text-xs text-green-500 mt-2">↓ 22% faster</p>
              </div>
              <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-4">
                <p className="text-sm text-muted mb-1">Engagement Rate</p>
                <p className="text-3xl font-bold text-white">8.4%</p>
                <p className="text-xs text-green-500 mt-2">↑ 2.1% higher</p>
              </div>
              <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-4">
                <p className="text-sm text-muted mb-1">Bot Success</p>
                <p className="text-3xl font-bold text-white">94%</p>
                <p className="text-xs text-green-500 mt-2">↑ 3% improvement</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Daily Engagement</h3>
                <div className="space-y-3">
                  {dailyEngagement.map((day) => (
                    <div key={day.date}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted">{day.date}</span>
                        <span className="text-sm text-white font-medium">{day.comments + day.dms} interactions</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${((day.comments + day.dms) / 40) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Sentiment Analysis</h3>
                <div className="space-y-4">
                  {sentimentData.map((item) => (
                    <div key={item.sentiment}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted">{item.sentiment}</span>
                        <span className="text-white font-medium">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className={`bg-gradient-to-r ${item.color} h-3 rounded-full`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
              <p className="text-pink-400 text-sm">
                <strong>Note:</strong> Settings are managed by your system administrator. Contact support to modify bot configuration.
              </p>
            </div>

            <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Bot Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Connected Account</label>
                  <input
                    type="text"
                    value="@your_business_account"
                    readOnly
                    className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">AI Model</label>
                  <input
                    type="text"
                    value="GPT-4 (OpenRouter)"
                    readOnly
                    className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Comment Auto-Reply</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-primary border border-secondary rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-white">Enabled</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">DM Auto-Reply</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-primary border border-secondary rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-white">Enabled</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Instance Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-primary/50 rounded-lg">
                  <p className="text-sm text-muted mb-2">Connection Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-white font-medium">Connected</span>
                  </div>
                </div>
                <div className="p-4 bg-primary/50 rounded-lg">
                  <p className="text-sm text-muted mb-2">Last Synced</p>
                  <p className="text-white font-medium">5 minutes ago</p>
                </div>
                <div className="p-4 bg-primary/50 rounded-lg">
                  <p className="text-sm text-muted mb-2">Service Status</p>
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
