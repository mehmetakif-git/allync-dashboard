import { useState } from 'react';
import { FileText, File, CheckCircle, Clock, TrendingUp, BarChart3, Settings as SettingsIcon, Download, Share2 } from 'lucide-react';
import { mockGeneratedDocuments } from '../../data/mockDocsData';

export default function GoogleDocs() {
  const [activeTab, setActiveTab] = useState('documents');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredDocuments = typeFilter === 'all'
    ? mockGeneratedDocuments
    : mockGeneratedDocuments.filter(d => d.document_type === typeFilter);

  const stats = {
    total: mockGeneratedDocuments.length,
    thisMonth: mockGeneratedDocuments.filter(d => new Date(d.generated_at).getMonth() === new Date().getMonth()).length,
    shared: mockGeneratedDocuments.filter(d => d.is_shared).length,
    avgWords: Math.round(mockGeneratedDocuments.reduce((sum, d) => sum + d.word_count, 0) / mockGeneratedDocuments.length),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'generating': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'report': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'proposal': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'minutes': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Google Docs</h1>
                <p className="text-cyan-100 text-lg">AI document generation & management</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm">
              <Download className="w-5 h-5" />
              Export List
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-400">Total Documents</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-400">This Month</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Share2 className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-400">Shared</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.shared}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <File className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-400">Avg Words</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.avgWords}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl mb-6">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'documents'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Documents
              {activeTab === 'documents' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'analytics'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Analytics
              {activeTab === 'analytics' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'settings'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Settings
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
          </div>
        </div>

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex gap-2">
              {['all', 'report', 'proposal', 'minutes'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    typeFilter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Documents Table */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Document</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Requested By</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">AI Model</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Words</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-white font-medium">{doc.google_doc_name}</p>
                            <p className="text-sm text-gray-400 max-w-xs truncate">{doc.document_title}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getTypeColor(doc.document_type)}`}>
                            {doc.document_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-white">{doc.customer_name || 'Internal'}</p>
                            {doc.customer_phone && (
                              <p className="text-sm text-gray-400">{doc.customer_phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-300">{doc.ai_model}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-300">{doc.word_count.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(doc.status)}`}>
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={doc.google_doc_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors"
                          >
                            Open Doc
                          </a>
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
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-400">Generation Success</span>
                </div>
                <p className="text-3xl font-bold text-white">98%</p>
                <p className="text-sm text-green-500 mt-1">↑ 3% from last month</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-400">Avg Generation Time</span>
                </div>
                <p className="text-3xl font-bold text-white">45s</p>
                <p className="text-sm text-green-500 mt-1">↓ 8s from last month</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-400">Monthly Total</span>
                </div>
                <p className="text-3xl font-bold text-white">301</p>
                <p className="text-sm text-green-500 mt-1">↑ 22% from last month</p>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Document Type Distribution</h3>
              <div className="space-y-4">
                {[
                  { type: 'report', count: 234, color: '#3B82F6' },
                  { type: 'proposal', count: 67, color: '#8B5CF6' },
                  { type: 'minutes', count: 123, color: '#F59E0B' },
                ].map((item) => {
                  const percentage = (item.count / 424) * 100;
                  return (
                    <div key={item.type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 capitalize">{item.type}</span>
                        <span className="text-gray-400 text-sm">{item.count} docs ({percentage.toFixed(0)}%)</span>
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
              <h3 className="text-lg font-semibold text-white mb-4">AI Model Usage</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-blue-500">245</p>
                  <p className="text-gray-400 mt-2">GPT-4</p>
                  <p className="text-sm text-gray-500 mt-1">58% of total</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-purple-500">179</p>
                  <p className="text-gray-400 mt-2">Claude-3</p>
                  <p className="text-sm text-gray-500 mt-1">42% of total</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Average Word Count by Type</h3>
              <div className="space-y-4">
                {[
                  { type: 'Report', words: 1250, color: '#3B82F6' },
                  { type: 'Proposal', words: 850, color: '#8B5CF6' },
                  { type: 'Minutes', words: 650, color: '#F59E0B' },
                ].map((item) => (
                  <div key={item.type} className="space-y-2">
                    <p className="text-gray-300">{item.type}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${(item.words / 1500) * 100}%`, backgroundColor: item.color }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm w-24">{item.words} words</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Google Drive Connection</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Drive Folder ID</label>
                  <input type="text" defaultValue="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74Og" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Folder Name</label>
                  <input type="text" defaultValue="Generated Documents" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Default AI Model</label>
                  <select className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white">
                    <option>GPT-4</option>
                    <option>Claude-3</option>
                    <option>GPT-3.5</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Auto-save to Drive</p>
                    <p className="text-sm text-gray-400">Automatically save generated documents</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Document Templates</h3>
              <div className="space-y-3">
                {[
                  { name: 'Sales Report Template', type: 'report', usage: 89 },
                  { name: 'Project Proposal Template', type: 'proposal', usage: 45 },
                  { name: 'Meeting Minutes Template', type: 'minutes', usage: 67 },
                  { name: 'Contract Template', type: 'contract', usage: 23 },
                ].map((template) => (
                  <div key={template.name} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{template.name}</p>
                      <p className="text-sm text-gray-400">Type: {template.type} • Used {template.usage} times</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
