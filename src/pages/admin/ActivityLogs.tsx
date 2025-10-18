import { useState } from 'react';
import { Activity, Search, Filter, Download, User, Settings, LogIn, LogOut, Shield, Trash2 } from 'lucide-react';

interface ActivityLog {
  id: string;
  user: string;
  userEmail: string;
  company: string;
  action: string;
  actionType: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'system';
  details: string;
  ipAddress: string;
  timestamp: string;
}

const mockLogs: ActivityLog[] = [
  {
    id: '1',
    user: 'Allync',
    userEmail: 'info@allyncai.com',
    company: 'Allync',
    action: 'System Settings Updated',
    actionType: 'system',
    details: 'Updated email configuration settings',
    ipAddress: '192.168.1.1',
    timestamp: '2024-03-20 14:30',
  },
  {
    id: '2',
    user: 'John Smith',
    userEmail: 'john.smith@techinnovators.com',
    company: 'Tech Innovators Inc',
    action: 'User Login',
    actionType: 'login',
    details: 'Successful login from Chrome browser',
    ipAddress: '203.0.113.45',
    timestamp: '2024-03-20 14:15',
  },
  {
    id: '3',
    user: 'Allync',
    userEmail: 'info@allyncai.com',
    company: 'Allync',
    action: 'User Created',
    actionType: 'create',
    details: 'Created new user: alice.brown@techinnovators.com',
    ipAddress: '192.168.1.1',
    timestamp: '2024-03-20 13:45',
  },
  {
    id: '4',
    user: 'Michael Chen',
    userEmail: 'michael@globalsolutions.com',
    company: 'Global Solutions Ltd',
    action: 'Service Request',
    actionType: 'create',
    details: 'Requested new service: Email Marketing Automation',
    ipAddress: '198.51.100.23',
    timestamp: '2024-03-20 13:20',
  },
  {
    id: '5',
    user: 'Allync',
    userEmail: 'info@allyncai.com',
    company: 'Allync',
    action: 'Company Suspended',
    actionType: 'update',
    details: 'Suspended company: Digital Marketing Pro',
    ipAddress: '192.168.1.1',
    timestamp: '2024-03-20 12:50',
  },
  {
    id: '6',
    user: 'Emma Davis',
    userEmail: 'emma.davis@digitalmarketingpro.com',
    company: 'Digital Marketing Pro',
    action: 'User Logout',
    actionType: 'logout',
    details: 'User logged out',
    ipAddress: '203.0.113.89',
    timestamp: '2024-03-20 12:30',
  },
  {
    id: '7',
    user: 'Allync',
    userEmail: 'info@allyncai.com',
    company: 'Allync',
    action: 'Invoice Generated',
    actionType: 'create',
    details: 'Generated invoice INV-2024-006 for Data Analytics Corp',
    ipAddress: '192.168.1.1',
    timestamp: '2024-03-20 11:45',
  },
  {
    id: '8',
    user: 'David Wilson',
    userEmail: 'david.w@ecommerceplus.com',
    company: 'E-Commerce Plus',
    action: 'User Login',
    actionType: 'login',
    details: 'Successful login from Firefox browser',
    ipAddress: '198.51.100.67',
    timestamp: '2024-03-20 11:20',
  },
  {
    id: '9',
    user: 'Allync',
    userEmail: 'info@allyncai.com',
    company: 'Allync',
    action: 'Notification Sent',
    actionType: 'system',
    details: 'Sent maintenance notification to all users',
    ipAddress: '192.168.1.1',
    timestamp: '2024-03-20 10:30',
  },
  {
    id: '10',
    user: 'Allync',
    userEmail: 'info@allyncai.com',
    company: 'Allync',
    action: 'Service Approved',
    actionType: 'update',
    details: 'Approved service request for Tech Innovators Inc',
    ipAddress: '192.168.1.1',
    timestamp: '2024-03-20 09:45',
  },
];

export default function ActivityLogs() {
  const [logs] = useState<ActivityLog[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActionType = actionTypeFilter === 'all' || log.actionType === actionTypeFilter;
    return matchesSearch && matchesActionType;
  });

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'login':
        return <LogIn className="w-5 h-5" />;
      case 'logout':
        return <LogOut className="w-5 h-5" />;
      case 'create':
        return <User className="w-5 h-5" />;
      case 'update':
        return <Settings className="w-5 h-5" />;
      case 'delete':
        return <Trash2 className="w-5 h-5" />;
      case 'system':
        return <Shield className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'login':
        return 'bg-green-500/20 text-green-400';
      case 'logout':
        return 'bg-gray-500/20 text-gray-400';
      case 'create':
        return 'bg-blue-500/20 text-blue-400';
      case 'update':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'delete':
        return 'bg-red-500/20 text-red-400';
      case 'system':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleExportLogs = () => {
    if (confirm('Export activity logs to CSV?')) {
      alert('Activity logs exported successfully');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
          <p className="text-gray-400 mt-1">Monitor all system and user activities</p>
        </div>
        <button
          onClick={handleExportLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export Logs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Activities</p>
              <p className="text-3xl font-bold text-white mt-2">{logs.length}</p>
            </div>
            <Activity className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">User Actions</p>
              <p className="text-3xl font-bold text-white mt-2">
                {logs.filter(l => l.actionType === 'login' || l.actionType === 'logout').length}
              </p>
            </div>
            <User className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">System Events</p>
              <p className="text-3xl font-bold text-white mt-2">
                {logs.filter(l => l.actionType === 'system').length}
              </p>
            </div>
            <Shield className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Changes Made</p>
              <p className="text-3xl font-bold text-white mt-2">
                {logs.filter(l => l.actionType === 'create' || l.actionType === 'update' || l.actionType === 'delete').length}
              </p>
            </div>
            <Settings className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search activities by user, action, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={actionTypeFilter}
                onChange={(e) => setActionTypeFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="system">System</option>
              </select>
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${getActionColor(log.actionType)}`}>
                  {getActionIcon(log.actionType)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-medium">{log.action}</h3>
                      <p className="text-gray-300 text-sm mt-1">{log.details}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.user}
                        </span>
                        <span>•</span>
                        <span>{log.company}</span>
                        <span>•</span>
                        <span>IP: {log.ipAddress}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${getActionColor(log.actionType)}`}>
                        {log.actionType}
                      </span>
                      <p className="text-gray-400 text-xs mt-2">{log.timestamp}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Activity Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Logins</p>
                <p className="text-white font-bold text-lg">
                  {logs.filter(l => l.actionType === 'login').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Created</p>
                <p className="text-white font-bold text-lg">
                  {logs.filter(l => l.actionType === 'create').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Updated</p>
                <p className="text-white font-bold text-lg">
                  {logs.filter(l => l.actionType === 'update').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Deleted</p>
                <p className="text-white font-bold text-lg">
                  {logs.filter(l => l.actionType === 'delete').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">System</p>
                <p className="text-white font-bold text-lg">
                  {logs.filter(l => l.actionType === 'system').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-500/20 text-gray-400">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Logouts</p>
                <p className="text-white font-bold text-lg">
                  {logs.filter(l => l.actionType === 'logout').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
