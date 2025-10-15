import { Zap, Activity, TrendingUp, AlertCircle, ArrowRight, MessageSquare, Clock } from 'lucide-react';
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
    status: 'active',
    lastActivity: '2 minutes ago',
  },
  {
    id: 'instagram-automation',
    name: 'Instagram Automation',
    status: 'active',
    lastActivity: '1 hour ago',
  },
];

export default function Dashboard() {
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
        <p className="text-gray-400 mt-1">Your services overview</p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-blue-300 mb-1">Limited Access</h3>
            <p className="text-sm text-blue-300">
              You have view-only access to company services. Contact your Company Admin to request new services or manage billing.
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Company Services</h2>
        </div>

        {mockActiveServices.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Services</h3>
            <p className="text-gray-400">Your company doesn't have any active services yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockActiveServices.map((service) => {
              const Icon = getServiceIcon(service.id);
              const gradient = getServiceGradient(service.id);

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
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">View service details and reports</p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Activity className="w-3 h-3" />
                      {service.lastActivity}
                    </div>
                  </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => window.location.hash = 'support'}
          className="p-6 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-all hover:scale-105 flex items-center justify-between"
        >
          <div className="text-left">
            <p className="font-bold text-lg mb-1">Get Support</p>
            <p className="text-sm text-purple-200">Contact our team</p>
          </div>
          <MessageSquare className="w-6 h-6" />
        </button>

        <button
          onClick={() => alert('Contact your Company Admin to request new services')}
          className="p-6 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-all hover:scale-105 flex items-center justify-between"
        >
          <div className="text-left">
            <p className="font-bold text-lg mb-1">Request Service</p>
            <p className="text-sm text-blue-200">Contact Company Admin</p>
          </div>
          <AlertCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
