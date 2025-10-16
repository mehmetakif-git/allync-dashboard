import { useState } from 'react';
import { Package, Search, Edit, Eye, EyeOff, DollarSign, Save, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  pricing: {
    monthly: number;
    yearly: number;
    oneTime: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  features: string[];
  totalUsers: number;
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'WhatsApp Business AI',
    slug: 'whatsapp',
    description: 'Automate WhatsApp customer support with AI-powered responses',
    category: 'Messaging',
    pricing: { monthly: 499, yearly: 4990, oneTime: 0 },
    status: 'active',
    features: ['24/7 AI Support', 'Multi-language', 'Analytics Dashboard', 'Custom Templates'],
    totalUsers: 45,
  },
  {
    id: '2',
    name: 'Instagram DM Automation',
    slug: 'instagram',
    description: 'Automate Instagram direct messages and engagement',
    category: 'Social Media',
    pricing: { monthly: 399, yearly: 3990, oneTime: 0 },
    status: 'active',
    features: ['Auto-reply', 'Lead Generation', 'Analytics', 'Scheduling'],
    totalUsers: 38,
  },
  {
    id: '3',
    name: 'Text to Video AI',
    slug: 'text-to-video',
    description: 'Convert text content into engaging video content',
    category: 'Content Creation',
    pricing: { monthly: 599, yearly: 5990, oneTime: 0 },
    status: 'active',
    features: ['AI Voice-over', 'Custom Branding', 'HD Export', '100+ Templates'],
    totalUsers: 32,
  },
  {
    id: '4',
    name: 'AI Customer Support',
    slug: 'ai-support',
    description: 'Intelligent customer support chatbot for your website',
    category: 'Support',
    pricing: { monthly: 449, yearly: 4490, oneTime: 0 },
    status: 'active',
    features: ['Custom Training', 'Multi-channel', 'Live Handoff', 'Analytics'],
    totalUsers: 41,
  },
  {
    id: '5',
    name: 'Email Marketing Automation',
    slug: 'email-marketing',
    description: 'Automated email campaigns with AI personalization',
    category: 'Marketing',
    pricing: { monthly: 299, yearly: 2990, oneTime: 0 },
    status: 'active',
    features: ['AI Personalization', 'A/B Testing', 'Analytics', 'Templates'],
    totalUsers: 28,
  },
  {
    id: '6',
    name: 'Social Media Analytics',
    slug: 'social-analytics',
    description: 'Comprehensive social media performance tracking',
    category: 'Analytics',
    pricing: { monthly: 349, yearly: 3490, oneTime: 0 },
    status: 'active',
    features: ['Multi-platform', 'Custom Reports', 'Real-time Data', 'Competitor Analysis'],
    totalUsers: 24,
  },
  {
    id: '7',
    name: 'AI Voice Assistant',
    slug: 'voice-assistant',
    description: 'Voice-powered AI assistant for customer interactions',
    category: 'Voice',
    pricing: { monthly: 549, yearly: 5490, oneTime: 0 },
    status: 'maintenance',
    features: ['Natural Language', 'Call Recording', 'Analytics', 'Custom Voice'],
    totalUsers: 12,
  },
  {
    id: '8',
    name: 'Live Chat Support',
    slug: 'live-chat',
    description: 'Real-time live chat with AI assistance',
    category: 'Support',
    pricing: { monthly: 399, yearly: 3990, oneTime: 0 },
    status: 'inactive',
    features: ['AI-powered Suggestions', 'Canned Responses', 'File Sharing', 'Chat History'],
    totalUsers: 0,
  },
];

export default function ServicesCatalog() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (service: Service) => {
    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    if (confirm(`${newStatus === 'active' ? 'Enable' : 'Disable'} ${service.name}?`)) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const updatedServices = services.map(s =>
        s.id === service.id ? { ...s, status: newStatus } : s
      );
      setServices(updatedServices);
      setIsLoading(false);
      alert(`${service.name} ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`);
    }
  };

  const handleSaveService = async () => {
    if (!selectedService) return;

    if (confirm('Save changes to this service?')) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      alert('Service updated successfully');
      setShowEditModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Services Catalog</h1>
        <p className="text-gray-400 mt-1">Manage all available services and their configurations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Services</p>
              <p className="text-3xl font-bold text-white mt-2">{services.length}</p>
            </div>
            <Package className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Services</p>
              <p className="text-3xl font-bold text-white mt-2">
                {services.filter(s => s.status === 'active').length}
              </p>
            </div>
            <Eye className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Subscribers</p>
              <p className="text-3xl font-bold text-white mt-2">
                {services.reduce((sum, s) => sum + s.totalUsers, 0)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Monthly Revenue</p>
              <p className="text-3xl font-bold text-white mt-2">
                ${services.reduce((sum, s) => sum + (s.pricing.monthly * s.totalUsers), 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-gray-700 rounded-lg p-6 hover:bg-gray-650 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{service.name}</h3>
                  <p className="text-gray-400 text-sm">{service.category}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  service.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  service.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {service.status}
                </span>
              </div>

              <p className="text-gray-300 text-sm mb-4">{service.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Monthly:</span>
                  <span className="text-white font-medium">${service.pricing.monthly}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Yearly:</span>
                  <span className="text-white font-medium">${service.pricing.yearly}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Active Users:</span>
                  <span className="text-white font-medium">{service.totalUsers}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedService(service);
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(service)}
                  disabled={isLoading}
                  className={`flex-1 px-3 py-2 rounded text-sm flex items-center justify-center gap-2 ${
                    service.status === 'active'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } disabled:opacity-50`}
                >
                  {service.status === 'active' ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Enable
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEditModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Edit Service</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Service Name</label>
                <input
                  type="text"
                  defaultValue={selectedService.name}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Description</label>
                <textarea
                  defaultValue={selectedService.description}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Category</label>
                  <input
                    type="text"
                    defaultValue={selectedService.category}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Status</label>
                  <select
                    defaultValue={selectedService.status}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Monthly Price ($)</label>
                  <input
                    type="number"
                    defaultValue={selectedService.pricing.monthly}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Yearly Price ($)</label>
                  <input
                    type="number"
                    defaultValue={selectedService.pricing.yearly}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">One-time ($)</label>
                  <input
                    type="number"
                    defaultValue={selectedService.pricing.oneTime}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Features</label>
                <div className="space-y-2">
                  {selectedService.features.map((feature, index) => (
                    <div key={index} className="bg-gray-700 rounded px-3 py-2 text-white text-sm">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveService}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
