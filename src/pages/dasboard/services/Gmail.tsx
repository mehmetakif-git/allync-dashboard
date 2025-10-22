import { useState } from 'react';
import { Mail, Send, Inbox, Archive, Star, TrendingUp, Clock, BarChart3, Settings as SettingsIcon, Download } from 'lucide-react';
import { mockGmailMessages } from '../../../data/mockGmailData';

export default function Gmail() {
  const [activeTab, setActiveTab] = useState('emails');
  const [directionFilter, setDirectionFilter] = useState('all');

  const filteredEmails = directionFilter === 'all'
    ? mockGmailMessages
    : mockGmailMessages.filter(e => e.direction === directionFilter);

  const stats = {
    total: mockGmailMessages.length,
    inbound: mockGmailMessages.filter(e => e.direction === 'inbound').length,
    outbound: mockGmailMessages.filter(e => e.direction === 'outbound').length,
    unread: mockGmailMessages.filter(e => !e.is_read).length,
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'product_inquiry': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'product_information': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'invoice': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'bulk_order': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-8 text-white mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <Mail className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Gmail Integration</h1>
                <p className="text-red-100 text-lg">WhatsApp email management & notifications</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm">
              <Download className="w-5 h-5" />
              Export Emails
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-400">Total Emails</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Inbox className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-400">Received</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.inbound}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Send className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-400">Sent</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.outbound}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Archive className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-400">Unread</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.unread}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl mb-6">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('emails')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'emails'
                  ? 'text-red-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Emails
              {activeTab === 'emails' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'analytics'
                  ? 'text-red-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Analytics
              {activeTab === 'analytics' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'settings'
                  ? 'text-red-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Settings
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
              )}
            </button>
          </div>
        </div>

        {/* Emails Tab */}
        {activeTab === 'emails' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex gap-2">
              {['all', 'inbound', 'outbound'].map((direction) => (
                <button
                  key={direction}
                  onClick={() => setDirectionFilter(direction as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    directionFilter === direction
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {direction}
                </button>
              ))}
            </div>

            {/* Emails Table */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">From/To</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Summary</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Intent</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredEmails.map((email) => (
                      <tr key={email.id} className={`hover:bg-gray-700/30 transition-colors ${!email.is_read ? 'bg-blue-500/5' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {email.direction === 'inbound' ? (
                              <Inbox className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Send className="w-4 h-4 text-green-500" />
                            )}
                            <div>
                              <p className="text-white font-medium">{email.from_name}</p>
                              <p className="text-sm text-gray-400">{email.from_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium max-w-xs truncate">{email.subject}</p>
                          {!email.is_read && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">New</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-300 max-w-md truncate">{email.ai_summary}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getIntentColor(email.ai_intent)}`}>
                            {email.ai_intent.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Star className={`w-4 h-4 ${getPriorityColor(email.ai_priority)}`} />
                            <span className={`capitalize ${getPriorityColor(email.ai_priority)}`}>
                              {email.ai_priority}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-400 text-sm">
                            {new Date(email.gmail_received_at || email.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-400">Response Rate</span>
                </div>
                <p className="text-3xl font-bold text-white">92%</p>
                <p className="text-sm text-green-500 mt-1">↑ 8% from last month</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-400">Avg Response Time</span>
                </div>
                <p className="text-3xl font-bold text-white">5.2 min</p>
                <p className="text-sm text-green-500 mt-1">↓ 1.3 min from last month</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-400">Monthly Volume</span>
                </div>
                <p className="text-3xl font-bold text-white">892</p>
                <p className="text-sm text-green-500 mt-1">↑ 15% from last month</p>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Email Intent Distribution</h3>
              <div className="space-y-4">
                {[
                  { intent: 'product_inquiry', count: 245, color: '#3B82F6' },
                  { intent: 'product_information', count: 198, color: '#10B981' },
                  { intent: 'invoice', count: 312, color: '#F59E0B' },
                  { intent: 'bulk_order', count: 137, color: '#8B5CF6' },
                ].map((item) => {
                  const percentage = (item.count / 892) * 100;
                  return (
                    <div key={item.intent}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 capitalize">{item.intent.replace('_', ' ')}</span>
                        <span className="text-gray-400 text-sm">{item.count} emails ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="h-3 rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Email Priority Breakdown</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-red-500">125</p>
                  <p className="text-gray-400 mt-2">High Priority</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-yellow-500">498</p>
                  <p className="text-gray-400 mt-2">Medium Priority</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-green-500">269</p>
                  <p className="text-gray-400 mt-2">Low Priority</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-500 text-sm">
                Note: Settings are view-only. Contact your system administrator or support to modify service configuration.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Gmail Account</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <input type="email" defaultValue="business@techcorp.com" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white cursor-not-allowed" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Account Name</label>
                  <input type="text" defaultValue="Tech Corp Business" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white cursor-not-allowed" readOnly />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-white font-medium">WhatsApp notifications</p>
                    <p className="text-sm text-gray-400">Get notified via WhatsApp for new emails</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-not-allowed">
                    <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Auto-reply enabled</p>
                    <p className="text-sm text-gray-400">Automatically reply to common inquiries</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-not-allowed">
                    <input type="checkbox" className="sr-only peer" disabled />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Email Templates</h3>
              <div className="space-y-3">
                {[
                  { name: 'Product Inquiry Response', usage: 145 },
                  { name: 'Order Confirmation', usage: 234 },
                  { name: 'Shipping Update', usage: 189 },
                  { name: 'Support Follow-up', usage: 98 },
                ].map((template) => (
                  <div key={template.name} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{template.name}</p>
                      <p className="text-sm text-gray-400">Used {template.usage} times</p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Instance Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Connection Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white font-medium">Connected</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Last Email Sync</p>
                  <p className="text-white font-medium">1 minute ago</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Service Status</p>
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/30 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
