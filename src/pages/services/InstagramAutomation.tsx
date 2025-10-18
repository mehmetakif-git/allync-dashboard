import { useState } from 'react';
import { Search, MessageCircle, Clock, TrendingUp, Users, ThumbsUp, Image as ImageIcon } from 'lucide-react';
import { mockInstagramPosts, mockInstagramComments, getCommentsByPost } from '../../data/mockInstagramComments';

export default function InstagramAutomation() {
  const [posts] = useState(mockInstagramPosts);
  const [selectedPost, setSelectedPost] = useState(posts[0]);
  const [searchTerm, setSearchTerm] = useState('');

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
      </div>
    </div>
  );
}
