import { useState } from 'react';
import { Image, Camera, Star, TrendingUp, Users, BarChart3, Settings as SettingsIcon, Download, Grid, List } from 'lucide-react';
import { mockPhotos, mockPhotoAlbums } from '../../data/mockPhotosData';

export default function GooglePhotos() {
  const [activeTab, setActiveTab] = useState('photos');
  const [viewMode, setViewMode] = useState('grid');
  const [albumFilter, setAlbumFilter] = useState('all');

  const filteredPhotos = albumFilter === 'all'
    ? mockPhotos
    : mockPhotos.filter(p => p.album_name === albumFilter);

  const stats = {
    totalPhotos: mockPhotos.length,
    thisMonth: mockPhotos.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).length,
    whatsappUploads: mockPhotos.filter(p => p.uploaded_via_whatsapp).length,
    totalAlbums: mockPhotoAlbums.length,
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
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <Image className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Google Photos</h1>
                <p className="text-pink-100 text-lg">WhatsApp photo management & AI tagging</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-white/10 rounded-lg p-1 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
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
              <Image className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-400">Total Photos</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalPhotos}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Camera className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-400">This Month</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-400">WhatsApp Uploads</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.whatsappUploads}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-400">Albums</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalAlbums}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl mb-6">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'photos'
                  ? 'text-purple-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Photos
              {activeTab === 'photos' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'analytics'
                  ? 'text-purple-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Analytics
              {activeTab === 'analytics' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'settings'
                  ? 'text-purple-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Settings
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
              )}
            </button>
          </div>
        </div>

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            {/* Album Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setAlbumFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  albumFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                All Photos
              </button>
              {mockPhotoAlbums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => setAlbumFilter(album.name)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    albumFilter === album.name
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {album.name} ({album.photos_count})
                </button>
              ))}
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPhotos.map((photo) => (
                  <div key={photo.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500 transition-colors">
                    <div className="relative aspect-square bg-gray-900">
                      <img src={photo.google_photos_url} alt={photo.filename} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-2 right-2">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                      {photo.uploaded_via_whatsapp && (
                        <div className="absolute bottom-2 left-2">
                          <span className="px-2 py-1 bg-green-500/80 text-white text-xs rounded backdrop-blur-sm">
                            WhatsApp
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-white font-medium text-sm truncate">{photo.filename}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {formatFileSize(photo.file_size_bytes)} • {photo.width}x{photo.height}
                      </p>
                      {photo.ai_description && (
                        <p className="text-gray-500 text-xs mt-2 line-clamp-2">{photo.ai_description}</p>
                      )}
                      {photo.ai_tags && photo.ai_tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {photo.ai_tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Photo</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Album</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tags</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredPhotos.map((photo) => (
                        <tr key={photo.id} className="hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-900">
                                <img src={photo.google_photos_url} alt={photo.filename} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{photo.filename}</p>
                                <p className="text-sm text-gray-400">{photo.width}x{photo.height}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-300 max-w-xs truncate">{photo.ai_description || '-'}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-gray-300">{formatFileSize(photo.file_size_bytes)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-gray-300">{photo.album_name || 'No album'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1 flex-wrap">
                              {photo.ai_tags?.slice(0, 2).map((tag, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {photo.uploaded_via_whatsapp ? (
                              <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/30 rounded-full text-xs font-medium">
                                WhatsApp
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-medium">
                                Manual
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-400">Upload Growth</span>
                </div>
                <p className="text-3xl font-bold text-white">+34%</p>
                <p className="text-sm text-green-500 mt-1">vs last month</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-400">Avg Photo Size</span>
                </div>
                <p className="text-3xl font-bold text-white">1.6 MB</p>
                <p className="text-sm text-gray-400 mt-1">Average file size</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Camera className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-400">Monthly Uploads</span>
                </div>
                <p className="text-3xl font-bold text-white">298</p>
                <p className="text-sm text-gray-400 mt-1">photos this month</p>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Photos by Album</h3>
              <div className="space-y-4">
                {mockPhotoAlbums.map((album) => {
                  const percentage = (album.photos_count / mockPhotos.length) * 100;
                  return (
                    <div key={album.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">{album.name}</span>
                        <span className="text-gray-400 text-sm">{album.photos_count} photos ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Most Common AI Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['laptop', 'office', 'desk', 'technology', 'workspace', 'product', 'professional', 'delivery'].map((tag) => (
                  <span key={tag} className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Upload Sources</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-green-500">{stats.whatsappUploads}</p>
                  <p className="text-gray-400 mt-2">WhatsApp Uploads</p>
                  <p className="text-sm text-gray-500 mt-1">{((stats.whatsappUploads / stats.totalPhotos) * 100).toFixed(0)}% of total</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-blue-500">{stats.totalPhotos - stats.whatsappUploads}</p>
                  <p className="text-gray-400 mt-2">Manual Uploads</p>
                  <p className="text-sm text-gray-500 mt-1">{(((stats.totalPhotos - stats.whatsappUploads) / stats.totalPhotos) * 100).toFixed(0)}% of total</p>
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
              <h3 className="text-lg font-semibold text-white mb-4">Google Photos Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Account Email</label>
                  <input type="email" defaultValue="photos@techcorp.com" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white cursor-not-allowed" readOnly />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Auto-upload from WhatsApp</p>
                    <p className="text-sm text-gray-400">Automatically upload photos sent via WhatsApp</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-not-allowed">
                    <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-white font-medium">AI photo tagging</p>
                    <p className="text-sm text-gray-400">Automatically tag photos using AI</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-not-allowed">
                    <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Auto-organize albums</p>
                    <p className="text-sm text-gray-400">Organize photos into albums by date</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-not-allowed">
                    <input type="checkbox" className="sr-only peer" disabled />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Albums</h3>
              <div className="space-y-3">
                {mockPhotoAlbums.map((album) => (
                  <div key={album.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <Image className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{album.name}</p>
                        <p className="text-sm text-gray-400">{album.photos_count} photos</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                      Manage
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
                  <p className="text-sm text-gray-400 mb-2">Last Photo Upload</p>
                  <p className="text-white font-medium">45 minutes ago</p>
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
