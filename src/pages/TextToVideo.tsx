import { Video, Settings, TrendingUp, Clock, Film, Play, CheckCircle, XCircle, AlertCircle, Download, Image } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const generationData = [
  { day: 'Mon', videos: 42 },
  { day: 'Tue', videos: 48 },
  { day: 'Wed', videos: 45 },
  { day: 'Thu', videos: 52 },
  { day: 'Fri', videos: 49 },
  { day: 'Sat', videos: 38 },
  { day: 'Sun', videos: 35 },
];

const recentGenerations = [
  { id: 1, time: '2 min ago', project: 'Product Demo - Summer Collection', duration: '0:45', resolution: '4K', status: 'success' },
  { id: 2, time: '15 min ago', project: 'Social Media Ad - Black Friday', duration: '0:30', resolution: 'HD', status: 'success' },
  { id: 3, time: '23 min ago', project: 'Tutorial Series - Episode 5', duration: '3:24', resolution: '4K', status: 'success' },
  { id: 4, time: '35 min ago', project: 'Corporate Presentation Q4', duration: '2:15', resolution: 'HD', status: 'processing' },
  { id: 5, time: '42 min ago', project: 'Marketing Video - New Launch', duration: '1:12', resolution: '4K', status: 'success' },
  { id: 6, time: '1 hr ago', project: 'Customer Testimonial #12', duration: '0:52', resolution: 'HD', status: 'success' },
  { id: 7, time: '1 hr ago', project: 'Product Explainer Video', duration: '1:45', resolution: '4K', status: 'success' },
  { id: 8, time: '2 hrs ago', project: 'Instagram Reel - Behind Scenes', duration: '0:28', resolution: 'HD', status: 'failed' },
  { id: 9, time: '2 hrs ago', project: 'Training Module - Safety', duration: '4:32', resolution: 'HD', status: 'success' },
  { id: 10, time: '3 hrs ago', project: 'Event Highlights 2024', duration: '2:48', resolution: '4K', status: 'success' },
];

export default function TextToVideo() {
  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Video className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Text-to-Video AI</h1>
            <p className="text-gray-400 mt-1">Create professional videos from text</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Videos Created</p>
            <Film className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">342</p>
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+12% vs last month</span>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-cyan-500/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Total Duration</p>
            <Clock className="w-5 h-5 text-cyan-500" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">12.5 hrs</p>
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+8% vs last month</span>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Avg Render Time</p>
            <Play className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">45s</p>
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>-15% faster</span>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-cyan-500/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Success Rate</p>
            <CheckCircle className="w-5 h-5 text-cyan-500" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">99.2%</p>
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+0.3% vs last month</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Active Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            { name: 'Otomatik video oluşturma', icon: Video },
            { name: '4K/HD format', icon: Film },
            { name: 'Voiceover entegrasyonu', icon: Play },
            { name: 'Özel template', icon: Image },
            { name: 'Hızlı render', icon: TrendingUp },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium text-sm">{feature.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Video Generation Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={generationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="videos"
              stroke="#3B82F6"
              strokeWidth={3}
              name="Videos Generated"
              dot={{ fill: '#3B82F6', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Generations</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Project Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Duration</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Resolution</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentGenerations.map((gen) => (
                <tr key={gen.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {gen.time}
                  </td>
                  <td className="py-3 px-4 text-sm text-white font-medium">{gen.project}</td>
                  <td className="py-3 px-4 text-sm text-gray-400">{gen.duration}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      gen.resolution === '4K'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {gen.resolution}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {gen.status === 'success' && (
                      <div className="flex items-center gap-1 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Success</span>
                      </div>
                    )}
                    {gen.status === 'processing' && (
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Processing</span>
                      </div>
                    )}
                    {gen.status === 'failed' && (
                      <div className="flex items-center gap-1 text-red-400 text-sm">
                        <XCircle className="w-4 h-4" />
                        <span>Failed</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
          <Video className="w-5 h-5" />
          Create Video
        </button>
        <button className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
          <Film className="w-5 h-5" />
          View Gallery
        </button>
        <button className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>
    </div>
  );
}
