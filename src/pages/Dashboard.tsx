import { Zap, MessageCircle, AlertCircle, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const messageData = [
  { day: 'Mon', messages: 180 },
  { day: 'Tue', messages: 220 },
  { day: 'Wed', messages: 195 },
  { day: 'Thu', messages: 247 },
  { day: 'Fri', messages: 210 },
  { day: 'Sat', messages: 165 },
  { day: 'Sun', messages: 140 },
];

const serviceData = [
  { service: 'WhatsApp', usage: 750 },
  { service: 'Text to Video', usage: 320 },
  { service: 'Text to Image', usage: 580 },
];

const activities = [
  { id: '1', icon: DollarSign, text: 'Invoice #INV-2025-0023 paid', time: '2 hours ago', color: 'text-green-500 bg-green-500/10' },
  { id: '2', icon: MessageCircle, text: 'New WhatsApp conversation started', time: '3 hours ago', color: 'text-blue-500 bg-blue-500/10' },
  { id: '3', icon: AlertCircle, text: 'Support ticket #TICKET-2025-0023 created', time: '5 hours ago', color: 'text-orange-500 bg-orange-500/10' },
  { id: '4', icon: Zap, text: 'Text to Video AI service activated', time: 'Yesterday', color: 'text-purple-500 bg-purple-500/10' },
];

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="p-6 space-y-6 bg-gray-950">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('dashboard.title')}</h1>
          <p className="text-gray-400 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="text-sm text-gray-400">
          {t('dashboard.lastUpdated')}: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-black/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{t('dashboard.stats.activeServices')}</p>
              <h3 className="text-3xl font-bold text-white">3</h3>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">+1 this month</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-black/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{t('dashboard.stats.messagesToday')}</p>
              <h3 className="text-3xl font-bold text-white">247</h3>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">+12%</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-black/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{t('dashboard.stats.openTickets')}</p>
              <h3 className="text-3xl font-bold text-white">2</h3>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-orange-500 font-medium">1 urgent</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-black/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{t('dashboard.stats.revenueMonth')}</p>
              <h3 className="text-3xl font-bold text-white">$1,247</h3>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">+8%</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-sm p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">{t('dashboard.charts.messagesOverTime')}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={messageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Line type="monotone" dataKey="messages" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-sm p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">{t('dashboard.charts.serviceUsage')}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={serviceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="service" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Bar dataKey="usage" fill="#A855F7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-bold text-white mb-4">{t('dashboard.recentActivity')}</h2>
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-800/50 rounded-lg transition-colors">
                  <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-sm p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">{t('dashboard.quickActions')}</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <span className="font-medium">Create Support Ticket</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700">
              <span className="font-medium">View All Services</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700">
              <span className="font-medium">Download Latest Invoice</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
