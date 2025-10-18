import { useState } from 'react';
import { Search, MessageCircle, Clock, TrendingUp, Users, ThumbsUp, Send, CheckCheck, BarChart3, Settings } from 'lucide-react';
import { mockInstagramPosts, mockInstagramComments, getCommentsByPost } from '../../data/mockInstagramComments';
import { mockInstagramDMSessions } from '../../data/mockInstagramDMSessions';
import { mockInstagramDMMessages } from '../../data/mockInstagramDMMessages';

export default function InstagramAutomation() {
  const [activeTab, setActiveTab] = useState<'comments' | 'dms' | 'analytics' | 'settings'>('comments');

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

  const tabs = [
    { id: 'comments', label: 'Comments', icon: MessageCircle, badge: mockInstagramComments.length },
    { id: 'dms', label: 'Direct Messages', icon: Send, badge: dmStats.activeSessions },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Instagram Automation</h1>
          <p className="text-gray-400">AI-powered comment responses and engagement management</p>
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
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Comments</span>
              <MessageCircle className="w-5 h-5 text-pink-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalComments}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Bot Responses</span>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.botResponses}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Avg Response Time</span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.avgResponseTime}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Positive Rate</span>
              <ThumbsUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.positiveRate}%</p>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
          <div className="flex h-full">
            <div className="w-full md:w-96 border-r border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className={`w-full p-4 border-b border-gray-700 hover:bg-gray-700/50 transition-colors text-left ${
                      selectedPost.id === post.id ? 'bg-gray-700/50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
                        <img
                          src={post.image_url}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                          {post.caption}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
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
              <div className="p-4 border-b border-gray-700 bg-gray-900/50">
                <div className="flex gap-4">
                  <img
                    src={selectedPost.image_url}
                    alt="Post"
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm mb-2">{selectedPost.caption}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {selectedPost.comment_count} comments
                      </span>
                      <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
                          <div className="bg-gray-800 rounded-lg px-4 py-2">
                            <p className="text-sm font-medium text-white mb-1">{comment.username}</p>
                            <p className="text-sm text-gray-300">{comment.comment_text}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">{formatCommentTime(comment.created_at)}</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                comment.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                                comment.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                                'bg-gray-500/20 text-gray-400'
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
                      <p className="text-gray-400">No comments on this post yet</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
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
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Total Conversations</span>
                  <MessageCircle className="w-5 h-5 text-pink-500" />
                </div>
                <p className="text-2xl font-bold text-white">{dmStats.totalSessions}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Active Conversations</span>
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-white">{dmStats.activeSessions}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Total Messages</span>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-white">{dmStats.totalMessages}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Avg Response Time</span>
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-white">{dmStats.avgResponseTime}</p>
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
                        value={dmSearchTerm}
                        onChange={(e) => setDMSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setDMFilterStatus('all')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          dmFilterStatus === 'all'
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setDMFilterStatus('active')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          dmFilterStatus === 'active'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => setDMFilterStatus('closed')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          dmFilterStatus === 'closed'
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
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
                        className={`w-full p-4 border-b border-gray-700 hover:bg-gray-700/50 transition-colors text-left ${
                          selectedDMSession.id === session.id ? 'bg-gray-700/50' : ''
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
                              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {formatTime(session.last_message_time)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-400 truncate flex-1">
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
                      <img
                        src={selectedDMSession.profile_picture_url}
                        alt={selectedDMSession.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="text-white font-medium">{selectedDMSession.username}</h3>
                        <p className="text-sm text-gray-400">
                          {selectedDMSession.is_active ? 'Active now' : 'Conversation closed'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
                                : 'bg-gray-800 text-white'
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
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-400">Detailed analytics and insights will be available here.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-8 text-center">
            <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Settings</h3>
            <p className="text-gray-400">Bot configuration and settings will be available here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
