import { Film, Wand2, Download, Clock, TrendingUp, Zap, Upload } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VideoToVideoAI() {
  const stats = [
    { label: 'Videos Enhanced', value: '89', change: '+22%', icon: Film, color: 'indigo' },
    { label: 'Total Duration', value: '3.2h', change: '+16%', icon: Clock, color: 'blue' },
    { label: 'Avg Quality', value: '4K', change: 'Enhanced', icon: Zap, color: 'green' },
    { label: 'Style Transfers', value: '67', change: '+28%', icon: Wand2, color: 'purple' },
  ];

  const usageData = [
    { day: 'Mon', videos: 12 },
    { day: 'Tue', videos: 15 },
    { day: 'Wed', videos: 18 },
    { day: 'Thu', videos: 14 },
    { day: 'Fri', videos: 20 },
    { day: 'Sat', videos: 8 },
    { day: 'Sun', videos: 2 },
  ];

  const recentEnhancements = [
    { id: '1', name: 'Wedding ceremony.mp4', enhancement: 'Upscale 4K', duration: '2:45', status: 'Completed' },
    { id: '2', name: 'Product demo.mov', enhancement: 'Color Grading', duration: '1:20', status: 'Completed' },
    { id: '3', name: 'Travel vlog.mp4', enhancement: 'Style Transfer', duration: '5:30', status: 'Processing' },
    { id: '4', name: 'Corporate video.mp4', enhancement: 'Stabilization', duration: '3:15', status: 'Completed' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Video-to-Video AI</h1>
          <p className="text-gray-400 mt-1">Enhance and transform videos with AI</p>
        </div>
        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Video
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
        <h3 className="text-xl font-bold text-white mb-4">Enhancements This Week</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={usageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
            <Line type="monotone" dataKey="videos" stroke="#6366F1" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Enhancements</h3>
        <div className="space-y-3">
          {recentEnhancements.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center">
                  <Film className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{item.enhancement}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{item.duration}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className={`text-xs ${item.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
              {item.status === 'Completed' && (
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
