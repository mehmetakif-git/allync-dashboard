import { useState } from 'react';
import { Sheet, Search, TrendingUp, Database, BarChart3, Settings as SettingsIcon, Download, RefreshCw } from 'lucide-react';
import { mockSheetsDataCache, mockSheetsQueries } from '../../data/mockSheetsData';

export default function GoogleSheets() {
  const [activeTab, setActiveTab] = useState('queries');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQueries = searchTerm
    ? mockSheetsQueries.filter(q =>
        q.query_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : mockSheetsQueries;

  const stats = {
    totalQueries: mockSheetsQueries.length,
    successfulQueries: mockSheetsQueries.filter(q => q.response_type === 'found').length,
    cachedItems: mockSheetsDataCache.length,
    avgResponseTime: '1.9 sec',
  };

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case 'found': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'not_found': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'multiple_results': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 text-white mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <Sheet className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Google Sheets</h1>
                <p className="text-green-100 text-lg">WhatsApp data queries & inventory management</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm">
                <RefreshCw className="w-5 h-5" />
                Sync Now
              </button>
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm">
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-400">Total Queries</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalQueries}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-400">Successful</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.successfulQueries}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-400">Cached Items</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.cachedItems}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-400">Avg Response</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.avgResponseTime}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl mb-6">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('queries')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'queries'
                  ? 'text-green-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Queries
              {activeTab === 'queries' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'analytics'
                  ? 'text-green-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Analytics
              {activeTab === 'analytics' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'settings'
                  ? 'text-green-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Settings
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></div>
              )}
            </button>
          </div>
        </div>

        {/* Queries Tab */}
        {activeTab === 'queries' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            {/* Queries Table */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Query</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Intent</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Results</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Response</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredQueries.map((query) => (
                      <tr key={query.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-white font-medium">{query.customer_name}</p>
                            <p className="text-sm text-gray-400">{query.customer_phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white max-w-xs truncate">{query.query_text}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 capitalize">
                            {query.query_intent.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-300">{query.results_count} found</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getResponseTypeColor(query.response_type)}`}>
                            {query.response_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-400 text-sm">{new Date(query.created_at).toLocaleString()}</span>
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
                  <span className="text-sm text-gray-400">Success Rate</span>
                </div>
                <p className="text-3xl font-bold text-white">93%</p>
                <p className="text-sm text-green-500 mt-1">↑ 5% from last month</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-400">Avg Query Time</span>
                </div>
                <p className="text-3xl font-bold text-white">1.9s</p>
                <p className="text-sm text-green-500 mt-1">↓ 0.3s from last month</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Search className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-400">Total Queries</span>
                </div>
                <p className="text-3xl font-bold text-white">467</p>
                <p className="text-sm text-green-500 mt-1">↑ 18% from last month</p>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Query Intent Distribution</h3>
              <div className="space-y-4">
                {[
                  { intent: 'price_check', count: 142, color: '#10B981' },
                  { intent: 'stock_check', count: 98, color: '#3B82F6' },
                  { intent: 'product_search', count: 89, color: '#8B5CF6' },
                  { intent: 'general_info', count: 138, color: '#F59E0B' },
                ].map((item) => {
                  const percentage = (item.count / 467) * 100;
                  return (
                    <div key={item.intent}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 capitalize">{item.intent.replace('_', ' ')}</span>
                        <span className="text-gray-400 text-sm">{item.count} queries ({percentage.toFixed(0)}%)</span>
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
              <h3 className="text-lg font-semibold text-white mb-4">Cached Data Items</h3>
              <div className="space-y-3">
                {mockSheetsDataCache.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{item.data_json.name}</p>
                      <p className="text-sm text-gray-400">{item.worksheet_name} - Row {item.row_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{item.data_json.price} QAR</p>
                      <p className="text-sm text-gray-400">Stock: {item.data_json.stock}</p>
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
              <h3 className="text-lg font-semibold text-white mb-4">Google Sheets Connection</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Sheet ID</label>
                  <input type="text" defaultValue="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Sheet Name</label>
                  <input type="text" defaultValue="Product Inventory" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Sync Interval</label>
                  <select className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white">
                    <option>Every 5 minutes</option>
                    <option>Every 15 minutes</option>
                    <option>Every 30 minutes</option>
                    <option>Every 1 hour</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Auto-sync enabled</p>
                    <p className="text-sm text-gray-400">Automatically sync data at set intervals</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Column Mapping</h3>
              <div className="space-y-3">
                {[
                  { column: 'A', field: 'SKU', type: 'text' },
                  { column: 'B', field: 'Product Name', type: 'text' },
                  { column: 'C', field: 'Category', type: 'text' },
                  { column: 'D', field: 'Price', type: 'currency' },
                  { column: 'E', field: 'Stock', type: 'number' },
                ].map((mapping) => (
                  <div key={mapping.column} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold">
                        {mapping.column}
                      </div>
                      <div>
                        <p className="text-white font-medium">{mapping.field}</p>
                        <p className="text-sm text-gray-400">{mapping.type}</p>
                      </div>
                    </div>
                    <span className="text-gray-400">Searchable</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
