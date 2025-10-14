import { Video, Play, Clock, Download, TrendingUp, Zap, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TextToVideoAI() {
  const stats = [
    { label: 'Videos Generated', value: '234', change: '+12%', icon: Video, color: 'purple' },
    { label: 'Total Duration', value: '47min', change: '+8%', icon: Clock, color: 'blue' },
    { label: 'Avg Quality', value: '4K', change: 'Stable', icon: Zap, color: 'green' },
    { label: 'Downloads', value: '189', change: '+15%', icon: Download, color: 'orange' },
  ];

  const usageData = [
    { day: 'Mon', videos: 28 },
    { day: 'Tue', videos: 35 },
    { day: 'Wed', videos: 42 },
    { day: 'Thu', videos: 38 },
    { day: 'Fri', videos: 45 },
    { day: 'Sat', videos: 32 },
    { day: 'Sun', videos: 14 },
  ];

  const recentVideos = [
    { id: '1', prompt: 'A cat playing piano in a jazz club', duration: '15s', quality: '4K', status: 'Completed', thumbnail: '🎹' },
    { id: '2', prompt: 'Sunset over mountains with birds flying', duration: '20s', quality: '1080p', status: 'Completed', thumbnail: '🌄' },
    { id: '3', prompt: 'Futuristic city with flying cars', duration: '30s', quality: '4K', status: 'Processing', thumbnail: '🏙️' },
    { id: '4', prompt: 'Underwater coral reef exploration', duration: '25s', quality: '4K', status: 'Completed', thumbnail: '🐠' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Text-to-Video AI</h1>
          <p className="text-gray-400 mt-1">Generate videos from text descriptions using AI</p>
        </div>
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
              <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </span>
            </div>
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Video Generation This Week</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={usageData}>
            <defs>
              <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
            <Area type="monotone" dataKey="videos" stroke="#A855F7" fillOpacity={1} fill="url(#colorVideos)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Videos</h3>
        <div className="space-y-3">
          {recentVideos.map((video) => (
            <div key={video.id} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center text-3xl">
                {video.thumbnail}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{video.prompt}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400">{video.duration}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">{video.quality}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className={`text-xs ${video.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {video.status}
                  </span>
                </div>
              </div>
              {video.status === 'Completed' && (
                <button className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                  <Play className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
