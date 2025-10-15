import { useState } from 'react';
import { Search, Filter, Download, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

const mockLogs = [
  { id: 1, type: 'success', action: 'User Login', user: 'john@techcorp.com', company: 'Tech Corp', details: 'Successful login from 192.168.1.1', time: '2 min ago' },
  { id: 2, type: 'warning', action: 'Failed Payment', user: 'System', company: 'Startup Inc', details: 'Payment failed for invoice #1234', time: '15 min ago' },
  { id: 3, type: 'info', action: 'Company Created', user: 'info@allyncai.com', company: 'Beauty Salon TR', details: 'New company registration completed', time: '1 hour ago' },
  { id: 4, type: 'error', action: 'API Error', user: 'System', company: 'Law Firm Qatar', details: 'WhatsApp API connection failed', time: '2 hours ago' },
  { id: 5, type: 'success', action: 'Service Activated', user: 'sarah@techcorp.com', company: 'Tech Corp', details: 'WhatsApp automation service enabled', time: '3 hours ago' },
  { id: 6, type: 'warning', action: 'Account Suspended', user: 'info@allyncai.com', company: 'Startup Inc', details: 'Account suspended due to non-payment', time: '5 hours ago' },
];

export default function AdminActivityLogs() {
  const [search, setSearch] = useState('');

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Activity Logs</h2>
          <p className="text-gray-400 text-sm mt-1">System-wide activity and events</p>
        </div>
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Logs
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
          />
        </div>
        <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500">
          <option>All Types</option>
          <option>Success</option>
          <option>Warning</option>
          <option>Error</option>
          <option>Info</option>
        </select>
        <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500">
          <option>Last 24 hours</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>All time</option>
        </select>
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      <div className="space-y-2">
        {mockLogs.map((log) => (
          <div
            key={log.id}
            className={`p-4 border rounded-xl transition-colors hover:bg-gray-800/50 ${getTypeBg(log.type)}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getIcon(log.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="font-medium text-white">{log.action}</p>
                    <p className="text-sm text-gray-400 mt-1">{log.details}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{log.time}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-gray-400">
                    <span className="text-gray-500">User:</span> {log.user}
                  </span>
                  <span className="text-gray-400">
                    <span className="text-gray-500">Company:</span> {log.company}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
          Load More Logs
        </button>
      </div>
    </div>
  );
}
