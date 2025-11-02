import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Zap, DollarSign, Clock, AlertCircle, FileText, Activity, TrendingUp, ArrowRight } from 'lucide-react';
import { getAllCompanies } from '../../lib/api/companies';
import { getAllUsers } from '../../lib/api/users';
import { getAllServiceRequests } from '../../lib/api/serviceRequests';
import { getAllTickets } from '../../lib/api/supportTickets';
import { getAllInvoices } from '../../lib/api/invoices';
import { getRecentActivityLogs } from '../../lib/api/activityLogs';
import { getAllServicesWithStats } from '../../lib/api/serviceTypes';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  gradient: string;
  change?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

function StatCard({ title, value, icon: Icon, gradient, change, onClick, isLoading }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-card backdrop-blur-xl border border-secondary rounded-xl p-6 ${onClick ? 'cursor-pointer hover:border-secondary transition-all' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">{change}</span>
          </div>
        )}
      </div>
      <p className="text-muted text-sm mb-1">{title}</p>
      {isLoading ? (
        <div className="h-9 bg-secondary/20 rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-white">{value}</p>
      )}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
    activeServices: 0,
    monthlyRevenue: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    openTickets: 0,
    pendingInvoices: 0,
  });
  const [recentCompanies, setRecentCompanies] = useState<any[]>([]);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        companiesData,
        usersData,
        servicesData,
        serviceRequestsData,
        ticketsData,
        invoicesData,
        activitiesData,
      ] = await Promise.all([
        getAllCompanies(),
        getAllUsers(),
        getAllServicesWithStats(),
        getAllServiceRequests(),
        getAllTickets(),
        getAllInvoices(),
        getRecentActivityLogs(10),
      ]);

      // Calculate stats
      const activeCompanies = companiesData.filter((c: any) => c.status === 'active').length;
      const activeServices = servicesData.filter((s: any) => s.is_active && s.status === 'active').length;
      const pendingRequests = serviceRequestsData.filter((r: any) => r.status === 'pending').length;
      const approvedRequests = serviceRequestsData.filter((r: any) => r.status === 'approved').length;
      const openTickets = ticketsData.filter((t: any) => t.status === 'open' || t.status === 'in_progress').length;
      const pendingInvoices = invoicesData.filter((i: any) => i.status === 'pending').length;

      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = invoicesData
        .filter((i: any) => {
          const invoiceDate = new Date(i.created_at);
          return i.status === 'paid' &&
                 invoiceDate.getMonth() === currentMonth &&
                 invoiceDate.getFullYear() === currentYear;
        })
        .reduce((sum: number, inv: any) => sum + inv.total_amount, 0);

      setStats({
        totalCompanies: companiesData.length,
        activeCompanies,
        totalUsers: usersData.length,
        activeServices,
        monthlyRevenue,
        pendingRequests,
        approvedRequests,
        openTickets,
        pendingInvoices,
      });

      setRecentCompanies(companiesData.slice(0, 3));
      setRecentTickets(ticketsData.slice(0, 5));
      setRecentRequests(serviceRequestsData.filter((r: any) => r.status === 'pending').slice(0, 5));
      setRecentActivities(activitiesData.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(`/admin/${path}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Super Admin Dashboard</h1>
          <p className="text-muted">System overview and key metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Companies"
            value={stats.totalCompanies}
            icon={Building2}
            gradient="from-blue-500 to-cyan-600"
            change={stats.activeCompanies > 0 ? `${Math.round((stats.activeCompanies / stats.totalCompanies) * 100)}% Active` : undefined}
            onClick={() => handleNavigate('companies')}
            isLoading={loading}
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            gradient="from-green-500 to-emerald-600"
            onClick={() => handleNavigate('users')}
            isLoading={loading}
          />
          <StatCard
            title="Active Services"
            value={stats.activeServices}
            icon={Zap}
            gradient="from-purple-500 to-pink-600"
            onClick={() => handleNavigate('services-catalog')}
            isLoading={loading}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${(stats.monthlyRevenue / 1000).toFixed(1)}K`}
            icon={DollarSign}
            gradient="from-red-500 to-orange-600"
            onClick={() => handleNavigate('revenue')}
            isLoading={loading}
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            icon={Clock}
            gradient="from-yellow-500 to-orange-600"
            onClick={() => handleNavigate('services-catalog')}
            isLoading={loading}
          />
          <StatCard
            title="Open Tickets"
            value={stats.openTickets}
            icon={AlertCircle}
            gradient="from-blue-500 to-purple-600"
            onClick={() => handleNavigate('support-tickets')}
            isLoading={loading}
          />
          <StatCard
            title="Pending Invoices"
            value={stats.pendingInvoices}
            icon={FileText}
            gradient="from-cyan-500 to-blue-600"
            onClick={() => handleNavigate('invoices')}
            isLoading={loading}
          />
          <StatCard
            title="System Health"
            value="Good"
            icon={Activity}
            gradient="from-green-500 to-teal-600"
            onClick={() => handleNavigate('settings')}
            isLoading={loading}
          />
        </div>

        {/* Service Requests & Tickets Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Service Requests Chart */}
          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Service Requests Overview</h2>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-48 h-48 rounded-full bg-secondary/20 animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center h-64">
                  <div className="relative">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="transparent"
                        stroke="rgb(251, 146, 60)"
                        strokeWidth="40"
                        strokeDasharray={`${(stats.pendingRequests / (stats.pendingRequests + stats.approvedRequests || 1)) * 502} 502`}
                        transform="rotate(-90 100 100)"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="transparent"
                        stroke="rgb(34, 197, 94)"
                        strokeWidth="40"
                        strokeDasharray={`${(stats.approvedRequests / (stats.pendingRequests + stats.approvedRequests || 1)) * 502} 502`}
                        strokeDashoffset={`-${(stats.pendingRequests / (stats.pendingRequests + stats.approvedRequests || 1)) * 502}`}
                        transform="rotate(-90 100 100)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">{stats.pendingRequests + stats.approvedRequests}</p>
                        <p className="text-sm text-muted">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm text-muted">Pending ({stats.pendingRequests})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-muted">Approved ({stats.approvedRequests})</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Latest Support Tickets */}
          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Latest Support Tickets</h2>
              <button
                onClick={() => handleNavigate('support-tickets')}
                className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 bg-primary/50 border border-secondary rounded-lg">
                    <div className="h-4 bg-secondary/20 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-secondary/20 rounded animate-pulse w-2/3" />
                  </div>
                ))
              ) : recentTickets.length > 0 ? (
                recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => handleNavigate('support-tickets')}
                    className="p-4 bg-primary/50 border border-secondary rounded-lg hover:border-secondary cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white text-sm truncate">{ticket.subject}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        ticket.priority === 'urgent' ? 'bg-red-500/10 border border-red-500/30 text-red-500' :
                        ticket.priority === 'high' ? 'bg-orange-500/10 border border-orange-500/30 text-orange-500' :
                        'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted truncate">{ticket.company?.name || 'Unknown'}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        ticket.status === 'open' ? 'bg-blue-500/10 text-blue-500' :
                        ticket.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-green-500/10 text-green-500'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted">
                  No tickets yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pending Requests & Recent Companies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pending Service Requests */}
          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Pending Service Requests</h2>
              <button
                onClick={() => handleNavigate('services-catalog')}
                className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 bg-primary/50 border border-secondary rounded-lg">
                    <div className="h-4 bg-secondary/20 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-secondary/20 rounded animate-pulse w-2/3" />
                  </div>
                ))
              ) : recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => handleNavigate('services-catalog')}
                    className="p-4 bg-primary/50 border border-secondary rounded-lg hover:border-secondary cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white truncate">{request.service_type?.name_en || 'Unknown Service'}</span>
                      <span className="px-2 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-xs text-orange-500">
                        Pending
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted truncate">{request.company?.name || 'Unknown'}</span>
                      <span className="text-muted text-xs">{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted">
                  No pending requests
                </div>
              )}
            </div>
          </div>

          {/* Recent Companies */}
          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Companies</h2>
              <button
                onClick={() => handleNavigate('companies')}
                className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 bg-primary/50 border border-secondary rounded-lg">
                    <div className="h-10 bg-secondary/20 rounded animate-pulse mb-3" />
                    <div className="h-4 bg-secondary/20 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-secondary/20 rounded animate-pulse" />
                  </div>
                ))
              ) : recentCompanies.length > 0 ? (
                recentCompanies.map((company) => (
                  <div
                    key={company.id}
                    onClick={() => handleNavigate('companies')}
                    className="p-4 bg-primary/50 border border-secondary rounded-lg hover:border-secondary cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        company.status === 'active' ? 'bg-green-500/10 border border-green-500/30 text-green-500' :
                        'bg-red-500/10 border border-red-500/30 text-red-500'
                      }`}>
                        {company.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-1 truncate">{company.name}</h3>
                    <p className="text-sm text-muted mb-2">{company.country}</p>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>{company.email}</span>
                      <span>{new Date(company.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted">
                  No companies yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <button
              onClick={() => handleNavigate('logs')}
              className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-primary/50 border border-secondary rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary/20 rounded animate-pulse" />
                    <div className="h-3 bg-secondary/20 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              ))
            ) : recentActivities.length > 0 ? (
              recentActivities.map((log) => (
                <div
                  key={log.id}
                  onClick={() => handleNavigate('logs')}
                  className="flex items-start gap-4 p-4 bg-primary/50 border border-secondary rounded-lg hover:border-secondary cursor-pointer transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white truncate">{log.action}</span>
                      <span className="text-xs text-muted">{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-muted truncate">{log.description || 'No description'}</p>
                    <p className="text-xs text-muted mt-1">
                      {log.user?.full_name || 'System'} • {log.company?.name || 'System'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
