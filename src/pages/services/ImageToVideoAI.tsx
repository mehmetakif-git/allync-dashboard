import { Film, Image, Play, Download, TrendingUp, Zap, Upload } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ImageToVideoAI() {
  const stats = [
    { label: 'Images Animated', value: '156', change: '+18%', icon: Image, color: 'pink' },
    { label: 'Videos Created', value: '143', change: '+14%', icon: Film, color: 'blue' },
    { label: 'Avg Duration', value: '8s', change: 'Optimal', icon: Zap, color: 'green' },
    { label: 'Total Downloads', value: '127', change: '+20%', icon: Download, color: 'orange' },
  ];

  const usageData = [
    { day: 'Mon', conversions: 18 },
    { day: 'Tue', conversions: 24 },
    { day: 'Wed', conversions: 28 },
    { day: 'Thu', conversions: 22 },
    { day: 'Fri', conversions: 30 },
    { day: 'Sat', conversions: 15 },
    { day: 'Sun', conversions: 6 },
  ];

  const recentConversions = [
    { id: '1', name: 'Product showcase.jpg', duration: '10s', motion: 'Zoom & Pan', status: 'Completed' },
    { id: '2', name: 'Landscape photo.png', duration: '8s', motion: 'Parallax', status: 'Completed' },
    { id: '3', name: 'Portrait image.jpg', duration: '12s', motion: 'Ken Burns', status: 'Processing' },
    { id: '4', name: 'Architecture.jpg', duration: '15s', motion: 'Dolly', status: 'Completed' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Image-to-Video AI</h1>
          <p className="text-gray-400 mt-1">Animate still images with AI-powered motion</p>
        </div>
        <button className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Image
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
        <h3 className="text-xl font-bold text-white mb-4">Conversions This Week</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={usageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
            <Bar dataKey="conversions" fill="#EC4899" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Conversions</h3>
        <div className="space-y-3">
          {recentConversions.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-700 rounded-lg flex items-center justify-center">
                  <Image className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{item.duration}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{item.motion}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className={`text-xs ${item.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
              {item.status === 'Completed' && (
                <button className="p-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors">
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
