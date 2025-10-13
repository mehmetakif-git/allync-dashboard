import { Users, Activity, Clock, Star, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function WhatsAppAnalytics() {
  const kpis = [
    { label: 'Total Conversations', value: '156', change: '+12%', icon: Users, color: 'blue' },
    { label: 'Active Sessions', value: '23', change: '+5%', icon: Activity, color: 'green' },
    { label: 'Avg Response Time', value: '2m 34s', change: '-8%', icon: Clock, color: 'yellow' },
    { label: 'Satisfaction Score', value: '4.7', change: '+0.3', icon: Star, color: 'purple' },
  ];

  const messagesData = [
    { day: 'Mon', customer: 45, bot: 48, total: 93 },
    { day: 'Tue', customer: 52, bot: 55, total: 107 },
    { day: 'Wed', customer: 38, bot: 41, total: 79 },
    { day: 'Thu', customer: 61, bot: 64, total: 125 },
    { day: 'Fri', customer: 55, bot: 58, total: 113 },
    { day: 'Sat', customer: 42, bot: 45, total: 87 },
    { day: 'Sun', customer: 35, bot: 38, total: 73 },
  ];

  const hourlyData = [
    { hour: '00:00', messages: 2 },
    { hour: '03:00', messages: 1 },
    { hour: '06:00', messages: 5 },
    { hour: '09:00', messages: 35 },
    { hour: '12:00', messages: 48 },
    { hour: '15:00', messages: 52 },
    { hour: '18:00', messages: 41 },
    { hour: '21:00', messages: 28 },
  ];

  const intentData = [
    { name: 'Randevu', value: 45, color: '#3B82F6' },
    { name: 'Sorular', value: 35, color: '#10B981' },
    { name: 'Şikayetler', value: 10, color: '#EF4444' },
    { name: 'Diğer', value: 10, color: '#6B7280' },
  ];

  const sentimentData = [
    { name: 'Pozitif', value: 70, color: '#10B981' },
    { name: 'Nötr', value: 25, color: '#F59E0B' },
    { name: 'Negatif', value: 5, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-black/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-${kpi.color}-500/20 rounded-lg flex items-center justify-center`}>
                <kpi.icon className={`w-6 h-6 text-${kpi.color}-400`} />
              </div>
              <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {kpi.change}
              </span>
            </div>
            <p className="text-sm text-gray-400">{kpi.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Mesaj Trendleri</h3>
            <p className="text-sm text-gray-400 mt-1">Son 7 günün özeti</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-400">Müşteri</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-400">Bot</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={messagesData}>
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
            <Legend />
            <Line type="monotone" dataKey="customer" stroke="#3B82F6" strokeWidth={2} name="Müşteri Mesajları" />
            <Line type="monotone" dataKey="bot" stroke="#10B981" strokeWidth={2} name="Bot Yanıtları" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white">Saatlik Aktivite</h3>
          <p className="text-sm text-gray-400 mt-1">Mesaj yoğunluğu saatlere göre</p>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="hour" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Bar dataKey="messages" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Mesajlar" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Niyet Dağılımı</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={intentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {intentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Duygu Analizi</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sentimentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis dataKey="name" type="category" stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
