import { useState } from 'react';
import { FolderOpen, File, Upload, Download, Share2, TrendingUp, HardDrive, BarChart3, Settings as SettingsIcon, Search } from 'lucide-react';
import { mockDriveFiles } from '../../../data/mockDriveData';

export default function GoogleDrive() {
  const [activeTab, setActiveTab] = useState('files');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredFiles = mockDriveFiles.filter(file => {
    const matchesSearch = searchTerm === '' ||
      file.google_file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || file.google_file_type === typeFilter;
    return matchesSearch && matchesType && file.status === 'active';
  });

  const stats = {
    totalFiles: mockDriveFiles.filter(f => f.status === 'active').length,
    sharedFiles: mockDriveFiles.filter(f => f.is_shared).length,
    whatsappUploads: mockDriveFiles.filter(f => f.uploaded_via_whatsapp).length,
    totalStorage: (mockDriveFiles.reduce((sum, f) => sum + f.file_size_bytes, 0) / (1024 * 1024)).toFixed(1),
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'image': return '🖼️';
      case 'spreadsheet': return '📊';
      case 'document': return '📝';
      default: return '📁';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-8 text-white mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <FolderOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Google Drive</h1>
                <p className="text-orange-100 text-lg">WhatsApp file management & storage</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm">
                <Upload className="w-5 h-5" />
                Upload File
              </button>
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm">
                <Download className="w-5 h-5" />
                Export List
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <File className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-muted">Total Files</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalFiles}</p>
          </div>
          <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Share2 className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted">Shared Files</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.sharedFiles}</p>
          </div>
          <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Upload className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted">WhatsApp Uploads</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.whatsappUploads}</p>
          </div>
          <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <HardDrive className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-muted">Storage Used</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalStorage} MB</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl mb-6">
          <div className="flex border-b border-secondary">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'files'
                  ? 'text-yellow-500'
                  : 'text-muted hover:text-secondary'
              }`}
            >
              Files
              {activeTab === 'files' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'analytics'
                  ? 'text-yellow-500'
                  : 'text-muted hover:text-secondary'
              }`}
            >
              Analytics
              {activeTab === 'analytics' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'settings'
                  ? 'text-yellow-500'
                  : 'text-muted hover:text-secondary'
              }`}
            >
              Settings
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"></div>
              )}
            </button>
          </div>
        </div>

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-secondary border border-secondary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-4 py-3 bg-secondary border border-secondary rounded-lg text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="image">Images</option>
                <option value="spreadsheet">Spreadsheets</option>
              </select>
            </div>

            {/* Files Table */}
            <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">File</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Size</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Folder</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Source</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Shared</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-hover/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getFileTypeIcon(file.google_file_type)}</span>
                            <div>
                              <p className="text-white font-medium">{file.google_file_name}</p>
                              {file.ai_summary && (
                                <p className="text-sm text-muted max-w-xs truncate">{file.ai_summary}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-secondary capitalize">{file.google_file_type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-secondary">{formatFileSize(file.file_size_bytes)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-secondary">{file.parent_folder_name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {file.uploaded_via_whatsapp ? (
                            <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/30 rounded-full text-xs font-medium">
                              WhatsApp
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-700 text-secondary rounded-full text-xs font-medium">
                              Manual
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {file.is_shared ? (
                            <Share2 className="w-4 h-4 text-blue-500" />
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={file.google_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-500 hover:text-yellow-400 text-sm font-medium transition-colors"
                          >
                            Open
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
              <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-muted">Upload Growth</span>
                </div>
                <p className="text-3xl font-bold text-white">+28%</p>
                <p className="text-sm text-green-500 mt-1">vs last month</p>
              </div>
              <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Share2 className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-muted">Sharing Activity</span>
                </div>
                <p className="text-3xl font-bold text-white">156</p>
                <p className="text-sm text-muted mt-1">files shared this month</p>
              </div>
              <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-muted">Total Uploads</span>
                </div>
                <p className="text-3xl font-bold text-white">690</p>
                <p className="text-sm text-muted mt-1">this month</p>
              </div>
            </div>

            <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">File Type Distribution</h3>
              <div className="space-y-4">
                {[
                  { type: 'PDF Documents', count: 245, color: '#EF4444' },
                  { type: 'Images', count: 189, color: '#3B82F6' },
                  { type: 'Spreadsheets', count: 156, color: '#10B981' },
                  { type: 'Others', count: 100, color: '#8B5CF6' },
                ].map((item) => {
                  const percentage = (item.count / 690) * 100;
                  return (
                    <div key={item.type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-secondary">{item.type}</span>
                        <span className="text-muted text-sm">{item.count} files ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="h-3 rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Storage by Folder</h3>
              <div className="space-y-4">
                {[
                  { folder: 'Documents', size: 2.5, color: '#F59E0B' },
                  { folder: 'Customer Photos', size: 1.8, color: '#8B5CF6' },
                  { folder: 'Invoices', size: 0.9, color: '#10B981' },
                  { folder: 'Reports', size: 0.8, color: '#3B82F6' },
                ].map((item) => (
                  <div key={item.folder} className="space-y-2">
                    <p className="text-secondary">{item.folder}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${(item.size / 3) * 100}%`, backgroundColor: item.color }}
                        />
                      </div>
                      <span className="text-muted text-sm w-16">{item.size} GB</span>
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
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-500 text-sm">
                Note: Settings are view-only. Contact your system administrator or support to modify service configuration.
              </p>
            </div>

            <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Google Drive Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Root Folder ID</label>
                  <input type="text" defaultValue="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74Og" className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white cursor-not-allowed" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Folder Name</label>
                  <input type="text" defaultValue="Company Files" className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white cursor-not-allowed" readOnly />
                </div>
                <div className="flex items-center justify-between p-4 bg-primary rounded-lg">
                  <div>
                    <p className="text-white font-medium">Auto-organize files</p>
                    <p className="text-sm text-muted">Automatically organize uploaded files by type</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-not-allowed">
                    <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-primary rounded-lg">
                  <div>
                    <p className="text-white font-medium">AI file tagging</p>
                    <p className="text-sm text-muted">Use AI to automatically tag and categorize files</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-not-allowed">
                    <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Organization Rules</h3>
              <div className="space-y-3">
                {[
                  { fileType: 'Images (jpg, png)', destination: 'Photos' },
                  { fileType: 'PDFs', destination: 'Documents' },
                  { fileType: 'Spreadsheets (xlsx, csv)', destination: 'Reports' },
                  { fileType: 'Invoices', destination: 'Invoices' },
                ].map((rule) => (
                  <div key={rule.fileType} className="flex items-center justify-between p-4 bg-primary rounded-lg">
                    <div>
                      <p className="text-white font-medium">{rule.fileType}</p>
                      <p className="text-sm text-muted">Auto-move to: {rule.destination}</p>
                    </div>
                    <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Instance Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted mb-2">Connection Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white font-medium">Connected</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted mb-2">Last File Upload</p>
                  <p className="text-white font-medium">30 minutes ago</p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-2">Service Status</p>
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
