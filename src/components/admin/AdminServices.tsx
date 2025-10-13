import { Eye, Edit, Power, Users, Search } from 'lucide-react';
import { serviceTypes } from '../../data/services';

export default function AdminServices() {
  const handleViewDashboard = (slug: string) => {
    if (slug === 'whatsapp-automation') {
      window.location.hash = 'whatsapp';
    } else if (slug === 'instagram-automation') {
      window.location.hash = 'service/instagram-automation';
    } else if (slug === 'text-to-video') {
      window.location.hash = 'service/text-to-video';
    } else {
      window.location.hash = `service/${slug}`;
    }
  };

  const handleEditService = (serviceName: string) => {
    const newName = prompt(`Edit service name:`, serviceName);
    if (newName && newName !== serviceName) {
      alert(`✅ Service updated!\n\nOld name: ${serviceName}\nNew name: ${newName}\n\nNote: In production, this will update the database.`);
    }
  };

  const handleToggleStatus = (serviceName: string, currentStatus: boolean) => {
    if (confirm(`${currentStatus ? 'Deactivate' : 'Activate'} ${serviceName}?`)) {
      alert(`✅ Service ${currentStatus ? 'deactivated' : 'activated'}!\n\n${serviceName} is now ${currentStatus ? 'inactive' : 'active'}.`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Service Management</h2>
          <p className="text-gray-400 text-sm mt-1">View, test, and manage all services</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
            />
          </div>
          <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500">
            <option>All Categories</option>
            <option>AI Services</option>
            <option>Digital Services</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {serviceTypes.map((service) => {
          const Icon = service.icon;
          const mockCompanyCount = Math.floor(Math.random() * 8) + 1;

          return (
            <div
              key={service.id}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:bg-gray-800/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white">{service.name_en}</h3>
                      <p className="text-sm text-gray-400 mt-1">{service.description_en}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      service.category === 'ai'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {service.category.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{mockCompanyCount} companies using</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Power className={`w-4 h-4 ${service.is_active ? 'text-green-400' : 'text-red-400'}`} />
                      <span className={service.is_active ? 'text-green-400' : 'text-red-400'}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDashboard(service.slug)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Dashboard
                    </button>
                    <button
                      onClick={() => handleEditService(service.name_en)}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Service
                    </button>
                    <button
                      onClick={() => handleToggleStatus(service.name_en, service.is_active)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        service.is_active
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                      {service.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
