import { Zap, TrendingUp, AlertCircle, Clock, CheckCircle, CreditCard, MessageSquare, ArrowRight, Activity } from 'lucide-react';
import { serviceTypes } from '../data/services';

// MOCK DATA - NO DB YET
// To change active services, simply edit this array:
// - Add/remove services from mockActiveServices
// - Change status: 'active' | 'pending-setup'
// - Update usage numbers
// When DB is connected, this will be replaced with real API calls
const mockActiveServices = [
  {
    id: 'whatsapp-automation',
    name: 'WhatsApp Automation',
    plan: 'Pro',
    status: 'active',
    monthlyUsage: {
      current: 8420,
      limit: 15000,
      unit: 'messages',
    },
    lastActivity: '2 minutes ago',
    growth: '+15.3%',
  },
  {
    id: 'instagram-automation',
    name: 'Instagram Automation',
    plan: 'Basic',
    status: 'active',
    monthlyUsage: {
      current: 245,
      limit: 500,
      unit: 'posts',
    },
    lastActivity: '1 hour ago',
    growth: '+8.7%',
  },
  {
    id: 'text-to-video',
    name: 'Text-to-Video AI',
    plan: 'Enterprise',
    status: 'pending-setup',
    monthlyUsage: {
      current: 0,
      limit: 1000,
      unit: 'videos',
    },
    lastActivity: 'Not started',
    growth: 'N/A',
  },
];

const mockPendingRequests = [
  {
    id: '1',
    service: 'Voice Cloning',
    plan: 'Pro',
    requestedAt: '2024-12-13 16:45',
    status: 'pending',
  },
];

const mockRecentActivity = [
  {
    id: '1',
    type: 'service',
    title: 'WhatsApp message sent',
    description: 'Automated response to customer inquiry',
    timestamp: '2 minutes ago',
  },
  {
    id: '2',
    type: 'invoice',
    title: 'Invoice paid',
    description: 'INV-2024-1247 - $2,147.00',
    timestamp: '3 hours ago',
  },
  {
    id: '3',
    type: 'ticket',
    title: 'Support ticket resolved',
    description: 'TKT-2024-1589 - WhatsApp API issue',
    timestamp: '5 hours ago',
  },
];

export default function CompanyAdminDashboard() {
  const activeServicesCount = mockActiveServices.filter(s => s.status === 'active').length;
  const pendingSetupCount = mockActiveServices.filter(s => s.status === 'pending-setup').length;

  const getServiceIcon = (serviceId: string) => {
    const service = serviceTypes.find(s => s.id === serviceId);
    return service ? service.icon : Zap;
  };

  const getServiceGradient = (serviceId: string) => {
    const service = serviceTypes.find(s => s.id === serviceId);
    return service ? service.gradient : 'from-blue-500 to-blue-700';
  };

  const handleViewService = (serviceId: string) => {
    window.location.hash = `service/${serviceId}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back! Here's your services overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-200" />
          </div>
          <p className="text-blue-200 text-sm mb-1">Active Services</p>
          <p className="text-3xl font-bold">{activeServicesCount}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-yellow-200 text-sm mb-1">Pending Setup</p>
          <p className="text-3xl font-bold">{pendingSetupCount}</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-green-200 text-sm mb-1">Service Requests</p>
          <p className="text-3xl font-bold">{mockPendingRequests.length}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <p className="text-purple-200 text-sm mb-1">Monthly Cost</p>
          <p className="text-3xl font-bold">$2,147</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Active Services</h2>
          <button
            onClick={() => window.location.hash = 'services'}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
          >
            View All Services
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {mockActiveServices.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Services</h3>
            <p className="text-gray-400 mb-4">You don't have any active services yet. Browse our catalog to get started!</p>
            <button
              onClick={() => window.location.hash = 'services'}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              Browse Services
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockActiveServices.map((service) => {
              const Icon = getServiceIcon(service.id);
              const gradient = getServiceGradient(service.id);
              const usagePercent = (service.monthlyUsage.current / service.monthlyUsage.limit) * 100;

              return (
                <div
                  key={service.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-800/50 transition-all hover:scale-105 cursor-pointer"
                  onClick={() => handleViewService(service.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    {service.status === 'active' ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                        Setup Required
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">Plan: {service.plan}</p>

                  {service.status === 'active' ? (
                    <>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">Monthly Usage</span>
                          <span className="text-white font-medium">
                            {service.monthlyUsage.current.toLocaleString()} / {service.monthlyUsage.limit.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              usagePercent > 80 ? 'bg-red-500' : usagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Activity className="w-3 h-3" />
                          {service.lastActivity}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-400">
                          <TrendingUp className="w-3 h-3" />
                          {service.growth}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="pt-3 border-t border-gray-800">
                      <p className="text-sm text-yellow-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Service approved, setup required
                      </p>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewService(service.id);
                    }}
                    className="w-full mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-white">Pending Service Requests</h3>
            <button
              onClick={() => window.location.hash = 'services'}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="p-4">
            {mockPendingRequests.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {mockPendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{request.service}</p>
                      <p className="text-sm text-gray-400">Plan: {request.plan}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                        Pending
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{request.requestedAt.split(' ')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-bold text-white">Recent Activity</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {activity.type === 'service' && <Zap className="w-4 h-4 text-blue-400" />}
                    {activity.type === 'invoice' && <CreditCard className="w-4 h-4 text-green-400" />}
                    {activity.type === 'ticket' && <MessageSquare className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{activity.title}</p>
                    <p className="text-xs text-gray-400">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => window.location.hash = 'services'}
          className="p-6 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-all hover:scale-105 flex items-center justify-between"
        >
          <div className="text-left">
            <p className="font-bold text-lg mb-1">Browse Services</p>
            <p className="text-sm text-blue-200">Discover new features</p>
          </div>
          <ArrowRight className="w-6 h-6" />
        </button>

        <button
          onClick={() => window.location.hash = 'invoices'}
          className="p-6 bg-green-600 hover:bg-green-700 rounded-xl text-white transition-all hover:scale-105 flex items-center justify-between"
        >
          <div className="text-left">
            <p className="font-bold text-lg mb-1">Pay Invoices</p>
            <p className="text-sm text-green-200">Manage billing</p>
          </div>
          <ArrowRight className="w-6 h-6" />
        </button>

        <button
          onClick={() => window.location.hash = 'support'}
          className="p-6 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-all hover:scale-105 flex items-center justify-between"
        >
          <div className="text-left">
            <p className="font-bold text-lg mb-1">Get Support</p>
            <p className="text-sm text-purple-200">Contact our team</p>
          </div>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
