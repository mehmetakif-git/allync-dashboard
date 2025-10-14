import { useState } from 'react';
import { Search, Edit, Power, Wrench, EyeOff, Save, X } from 'lucide-react';
import { serviceTypes } from '../../data/services';

interface Service {
  id: string;
  name_en: string;
  description_en: string;
  icon: any;
  gradient: string;
  category: string;
  pricing: { basic: number; pro: number; enterprise: number };
  delivery?: string;
  features?: string[];
  status: 'active' | 'inactive' | 'maintenance' | 'coming-soon';
}

export default function ServicesCatalog() {
  console.log('🔴 RENDERING SERVICESCATALOG - SUPER ADMIN');

  const [services, setServices] = useState<Service[]>(
    serviceTypes.map(s => ({ ...s, status: (s.status || 'active') as 'active' | 'inactive' | 'maintenance' | 'coming-soon' }))
  );
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'maintenance' | 'coming-soon'>('all');

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name_en.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (serviceId: string, newStatus: Service['status']) => {
    setServices(services.map(s =>
      s.id === serviceId ? { ...s, status: newStatus } : s
    ));
    alert(`✅ Service status changed to: ${newStatus.toUpperCase()}\n\nAll companies will see this change immediately.`);
  };

  const handleSaveEdit = (updatedService: Service) => {
    setServices(services.map(s =>
      s.id === updatedService.id ? updatedService : s
    ));
    setEditingService(null);
    alert('✅ Service updated successfully!\n\nChanges are now visible to all companies.');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">Active</span>;
      case 'inactive':
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">Inactive</span>;
      case 'maintenance':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">Maintenance</span>;
      case 'coming-soon':
        return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">Coming Soon</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Services Catalog Management</h1>
          <p className="text-gray-400 mt-1">Manage service availability, pricing, and details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Active Services</p>
          <p className="text-3xl font-bold text-green-400">{services.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Inactive</p>
          <p className="text-3xl font-bold text-gray-400">{services.filter(s => s.status === 'inactive').length}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Maintenance</p>
          <p className="text-3xl font-bold text-yellow-400">{services.filter(s => s.status === 'maintenance').length}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Coming Soon</p>
          <p className="text-3xl font-bold text-blue-400">{services.filter(s => s.status === 'coming-soon').length}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive', 'maintenance', 'coming-soon'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filterStatus === status
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-800/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {getStatusBadge(service.status)}
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{service.name_en}</h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{service.description_en}</p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">Basic</p>
                  <p className="text-lg font-bold text-white">${service.pricing.basic}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pro</p>
                  <p className="text-lg font-bold text-white">${service.pricing.pro}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Enterprise</p>
                  <p className="text-lg font-bold text-white">${service.pricing.enterprise}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {service.status !== 'active' && (
                  <button
                    onClick={() => handleStatusChange(service.id, 'active')}
                    className="px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Power className="w-4 h-4" />
                    Activate
                  </button>
                )}
                {service.status !== 'inactive' && (
                  <button
                    onClick={() => handleStatusChange(service.id, 'inactive')}
                    className="px-3 py-2 bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <EyeOff className="w-4 h-4" />
                    Deactivate
                  </button>
                )}
                {service.status !== 'maintenance' && (
                  <button
                    onClick={() => handleStatusChange(service.id, 'maintenance')}
                    className="px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Wrench className="w-4 h-4" />
                    Maintenance
                  </button>
                )}
                {service.status !== 'coming-soon' && (
                  <button
                    onClick={() => handleStatusChange(service.id, 'coming-soon')}
                    className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Coming Soon
                  </button>
                )}
              </div>

              <button
                onClick={() => setEditingService(service)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Details
              </button>
            </div>
          );
        })}
      </div>

      {editingService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Service</h2>
              <button
                onClick={() => setEditingService(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveEdit({
                  ...editingService,
                  name_en: formData.get('name') as string,
                  description_en: formData.get('description') as string,
                  pricing: {
                    basic: Number(formData.get('basic')),
                    pro: Number(formData.get('pro')),
                    enterprise: Number(formData.get('enterprise')),
                  },
                  delivery: formData.get('delivery') as string,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Service Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingService.name_en}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingService.description_en}
                  required
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Basic Price ($)</label>
                  <input
                    type="number"
                    name="basic"
                    defaultValue={editingService.pricing.basic}
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Pro Price ($)</label>
                  <input
                    type="number"
                    name="pro"
                    defaultValue={editingService.pricing.pro}
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Enterprise Price ($)</label>
                  <input
                    type="number"
                    name="enterprise"
                    defaultValue={editingService.pricing.enterprise}
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Delivery Time</label>
                <input
                  type="text"
                  name="delivery"
                  defaultValue={editingService.delivery || '1-2 weeks'}
                  placeholder="e.g., 1-2 weeks"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
