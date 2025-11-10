import { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  Download,
  User,
  Settings,
  LogIn,
  LogOut, // ✅ Already imported!
  Shield,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Calendar,
  RefreshCw,
  FileText,
  BarChart3,
  Eye,
} from 'lucide-react';
import {
  getActivityLogs,
  getActivityStatistics,
  getActivityTimeline,
  getTopActiveUsers,
  getCriticalActivityLogs,
} from '../../lib/api/activityLogs';
import { exportActivityLogs } from '../../lib/utils/exportUtils';
import type {
  ActivityLog,
  ActivityLogFilters,
  ActivityStatistics,
  ActivityTimeline,
  TopActiveUser,
} from '../../lib/api/activityTypes';

export default function ActivityLogs() {
  // =====================================================
  // STATE
  // =====================================================
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [statistics, setStatistics] = useState<ActivityStatistics | null>(null);
  const [timeline, setTimeline] = useState<ActivityTimeline[]>([]);
  const [topUsers, setTopUsers] = useState<TopActiveUser[]>([]);
  const [criticalLogs, setCriticalLogs] = useState<ActivityLog[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadData();
  }, [
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedSeverity,
    selectedDevice,
    dateRange,
    customStartDate,
    customEndDate,
    currentPage,
  ]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Build filters
      const filters: ActivityLogFilters = {};

      if (selectedCategory !== 'all') filters.action_category = selectedCategory;
      if (selectedStatus !== 'all') filters.status = selectedStatus as any;
      if (selectedSeverity !== 'all') filters.severity_level = selectedSeverity as any;
      if (selectedDevice !== 'all') filters.device_type = selectedDevice as any;
      if (searchTerm) filters.search = searchTerm;

      // Date range filters
      const now = new Date();
      if (dateRange === 'today') {
        const today = new Date(now.setHours(0, 0, 0, 0));
        filters.start_date = today.toISOString();
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filters.start_date = weekAgo.toISOString();
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filters.start_date = monthAgo.toISOString();
      } else if (dateRange === 'custom') {
        if (customStartDate) filters.start_date = new Date(customStartDate).toISOString();
        if (customEndDate) filters.end_date = new Date(customEndDate).toISOString();
      }

      // Fetch logs with pagination
      const response = await getActivityLogs({
        filters,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        include_user: true,
        include_company: true,
      });

      setLogs(response.data);
      setTotalRecords(response.pagination.total);
      setTotalPages(response.pagination.pages);

      // Load statistics and analytics
      const [statsData, timelineData, usersData, criticalData] = await Promise.all([
        getActivityStatistics(),
        getActivityTimeline(undefined, 24),
        getTopActiveUsers(undefined, 5, 7),
        getCriticalActivityLogs(5),
      ]);

      setStatistics(statsData);
      setTimeline(timelineData);
      setTopUsers(usersData);
      setCriticalLogs(criticalData);
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EXPORT HANDLERS
  // =====================================================

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      setExporting(true);

      // Build filters for export
      const filters: ActivityLogFilters = {};
      if (selectedCategory !== 'all') filters.action_category = selectedCategory;
      if (selectedStatus !== 'all') filters.status = selectedStatus as any;
      if (selectedSeverity !== 'all') filters.severity_level = selectedSeverity as any;
      if (searchTerm) filters.search = searchTerm;

      // Fetch ALL logs (no pagination limit for export)
      const response = await getActivityLogs({
        filters,
        limit: 10000, // High limit for export
        offset: 0,
        include_user: true,
        include_company: true,
      });

      // Export
      const result = exportActivityLogs(response.data, {
        format,
        filters,
        include_user_details: true,
        include_company_details: true,
      });

      alert(`✅ Successfully exported ${result.record_count} records to ${result.filename}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('❌ Failed to export activity logs');
    } finally {
      setExporting(false);
    }
  };

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  const getActionIcon = (category: string, action?: string) => {
    // Special handling for specific actions
    if (action?.toLowerCase().includes('logout')) {
      return <LogOut className="w-5 h-5" />;
    }
    if (action?.toLowerCase().includes('login')) {
      return <LogIn className="w-5 h-5" />;
    }
    
    // Category-based icons
    switch (category) {
      case 'auth':
        return <LogIn className="w-5 h-5" />;
      case 'create':
        return <User className="w-5 h-5" />;
      case 'update':
        return <Settings className="w-5 h-5" />;
      case 'delete':
        return <Trash2 className="w-5 h-5" />;
      case 'system':
        return <Shield className="w-5 h-5" />;
      case 'view':
        return <Eye className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  // ✅ NEW: Get icon background based on action
  const getActionIconBackground = (category: string, action?: string, severity: string) => {
    // Special backgrounds for login/logout
    if (action?.toLowerCase().includes('logout')) {
      return 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-400'; // 🟧 Orange for logout
    }
    if (action?.toLowerCase().includes('login')) {
      return 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400'; // 🟦 Blue for login
    }
    
    // Use severity color for other actions
    return getSeverityColor(severity);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 border border-red-500/30">
            <Shield className="w-3 h-3" />
            SUPER ADMIN
          </span>
        );
      case 'company_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30">
            <User className="w-3 h-3" />
            COMPANY ADMIN
          </span>
        );
      case 'user':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            <User className="w-3 h-3" />
            USER
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
            <User className="w-3 h-3" />
            {role || 'SYSTEM'}
          </span>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'pending':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400';
      case 'error':
        return 'bg-orange-500/20 text-orange-400';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'info':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
            <p className="text-muted mt-1">Monitor all system and user activities</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'analytics' : 'list')}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/15 flex items-center gap-2 transition-colors"
            >
              {viewMode === 'list' ? (
                <>
                  <BarChart3 className="w-5 h-5" />
                  Analytics
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  List View
                </>
              )}
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/15 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="relative group">
              <button
                disabled={exporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/50 font-semibold"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/15 rounded-t-lg transition-colors"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/15 transition-colors"
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/15 rounded-b-lg transition-colors"
                >
                  Export as JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-sm">Total Activities</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {statistics.total_logs.toLocaleString()}
                  </p>
                </div>
                <Activity className="w-12 h-12 text-blue-500" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="text-green-400">
                  {statistics.success_count} success
                </span>
                <span className="text-muted">•</span>
                <span className="text-red-400">{statistics.failed_count} failed</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-sm">Active Users</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {statistics.unique_users.toLocaleString()}
                  </p>
                </div>
                <User className="w-12 h-12 text-green-500" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                <TrendingUp className="w-3 h-3" />
                {statistics.login_count} logins today
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-sm">Critical Events</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {statistics.critical_count + statistics.warning_count}
                  </p>
                </div>
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="text-red-400">
                  {statistics.critical_count} critical
                </span>
                <span className="text-muted">•</span>
                <span className="text-yellow-400">
                  {statistics.warning_count} warnings
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-sm">Avg Response</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {statistics.avg_duration_ms
                      ? `${Math.round(statistics.avg_duration_ms)}ms`
                      : 'N/A'}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-purple-500" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                Performance metric
              </div>
            </div>
          </div>
        )}

        {viewMode === 'analytics' ? (
          /* Analytics View */
          <div className="space-y-6">
            {/* Timeline Chart */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Activity Timeline (24h)</h2>
              <div className="space-y-2">
                {timeline.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-muted text-sm w-32">
                      {new Date(item.hour).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <div className="flex-1 bg-gray-700 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full flex items-center px-3"
                        style={{
                          width: `${(Number(item.log_count) / Math.max(...timeline.map((t) => Number(t.log_count)))) * 100}%`,
                        }}
                      >
                        <span className="text-white text-sm font-medium">
                          {item.log_count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Top Active Users (7 days)</h2>
              <div className="space-y-3">
                {topUsers.map((user, index) => (
                  <div
                    key={user.user_id}
                    className={`flex items-center justify-between bg-white/10 border border-white/20 rounded-xl p-4 border-l-4 ${
                      index === 0
                        ? 'border-yellow-500'
                        : index === 1
                        ? 'border-gray-400'
                        : index === 2
                        ? 'border-orange-600'
                        : 'border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                            : index === 1
                            ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                            : index === 2
                            ? 'bg-gradient-to-r from-orange-600 to-orange-700'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}
                      >
                        {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{user.user_name}</p>
                          {getRoleBadge(user.user_role)}
                        </div>
                        <p className="text-muted text-sm">{user.user_email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">{user.activity_count}</p>
                      <p className="text-muted text-xs">activities</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Logs */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-500" />
                Recent Critical Events
              </h2>
              <div className="space-y-3">
                {criticalLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white/10 border border-white/20 rounded-xl p-4 border-l-4 border-red-500"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-medium">{log.action}</h3>
                        <p className="text-muted text-sm mt-1">{log.description}</p>
                        {log.error_message && (
                          <p className="text-red-400 text-xs mt-2 font-mono">
                            {log.error_message}
                          </p>
                        )}
                      </div>
                      <span className="text-muted text-xs whitespace-nowrap ml-4">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <>
            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="auth">Authentication</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="view">View</option>
                  <option value="system">System</option>
                  <option value="service">Service</option>
                  <option value="payment">Payment</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="warning">Warning</option>
                  <option value="pending">Pending</option>
                </select>

                {/* Date Range */}
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                  <option value="custom">Custom Range</option>
                </select>

                {/* Severity Filter */}
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Severity</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>

                {/* Device Filter */}
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Devices</option>
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                </select>

                {/* Custom Date Range */}
                {dateRange === 'custom' && (
                  <>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Activity Logs List */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Activity Logs ({totalRecords.toLocaleString()})
                </h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-20">
                  <Activity className="w-16 h-16 text-muted mx-auto mb-4" />
                  <p className="text-muted text-lg">No activity logs found</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className={`bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-gray-650 transition-colors border-l-4 ${
                          log.user?.role === 'super_admin'
                            ? 'border-red-500'
                            : log.user?.role === 'company_admin'
                            ? 'border-blue-500'
                            : log.user?.role === 'user'
                            ? 'border-green-500'
                            : 'border-gray-500'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon with Action-Specific Background */}
                          <div
                            className={`p-2 rounded-lg ${getActionIconBackground(log.action_category || '', log.action, log.severity_level)}`}
                          >
                            {getActionIcon(log.action_category || '', log.action)}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {/* Action Title with Status */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-white font-medium">{log.action}</h3>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${getStatusColor(log.status)}`}
                                  >
                                    {getStatusIcon(log.status)}
                                    {log.status}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${getSeverityColor(log.severity_level)}`}
                                  >
                                    {log.severity_level}
                                  </span>
                                </div>

                                {/* Description */}
                                <p className="text-muted text-sm mt-1">{log.description}</p>

                                {/* User Info Row - ENHANCED */}
                                <div className="flex items-center gap-3 mt-3 flex-wrap">
                                  {/* User with Role Badge */}
                                  {log.user ? (
                                    <div className="flex items-center gap-2">
                                      <User className="w-3 h-3 text-muted" />
                                      <span className="text-white text-sm font-medium">
                                        {log.user.full_name}
                                      </span>
                                      {getRoleBadge(log.user.role)}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <Shield className="w-3 h-3 text-gray-400" />
                                      <span className="text-gray-400 text-sm">System</span>
                                    </div>
                                  )}

                                  {/* Company Badge - ENHANCED */}
                                  {log.company?.name && (
                                    <>
                                      <span className="text-muted">•</span>
                                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                        <svg
                                          className="w-3 h-3"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                          />
                                        </svg>
                                        {log.company.name}
                                      </div>
                                    </>
                                  )}

                                  {/* IP Address */}
                                  {log.ip_address && (
                                    <>
                                      <span className="text-muted">•</span>
                                      <span className="text-muted text-xs font-mono">
                                        IP: {log.ip_address}
                                      </span>
                                    </>
                                  )}

                                  {/* Device & Browser */}
                                  {log.device_type && (
                                    <>
                                      <span className="text-muted">•</span>
                                      <span className="text-muted text-xs capitalize">
                                        {log.device_type}
                                      </span>
                                    </>
                                  )}
                                  {log.browser && (
                                    <>
                                      <span className="text-muted">•</span>
                                      <span className="text-muted text-xs">{log.browser}</span>
                                    </>
                                  )}
                                </div>

                                {/* Error Message */}
                                {log.error_message && (
                                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-mono">
                                    {log.error_message}
                                  </div>
                                )}
                              </div>

                              {/* Timestamp and Duration */}
                              <div className="text-right ml-4">
                                <p className="text-muted text-xs whitespace-nowrap">
                                  {formatDate(log.created_at)}
                                </p>
                                {log.duration_ms && (
                                  <p className="text-muted text-xs mt-1">
                                    {log.duration_ms}ms
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
                      <p className="text-muted text-sm">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                        {Math.min(currentPage * ITEMS_PER_PAGE, totalRecords)} of{' '}
                        {totalRecords} results
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <span className="text-white">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}