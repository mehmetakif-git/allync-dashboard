import { useState } from 'react';
import { Check, Clock, X, Sparkles, Cpu } from 'lucide-react';
import { getCurrentMockUser } from '../utils/mockAuth';
import { serviceTypes } from '../data/services';
import { mockServiceRequests } from '../data/serviceRequests';

const mockCompanyRequests: Record<string, { status: 'approved' | 'pending' | 'rejected'; requestId: string; package: string }> = {
  'whatsapp-automation': { status: 'approved', requestId: 'sr-002', package: 'pro' },
  'instagram-automation': { status: 'approved', requestId: 'sr-001', package: 'basic' },
  'text-to-video': { status: 'approved', requestId: 'sr-003', package: 'pro' },
  'text-to-image': { status: 'approved', requestId: 'sr-004', package: 'basic' },
  'voice-cloning': { status: 'approved', requestId: 'sr-005', package: 'premium' },
  'document-ai': { status: 'approved', requestId: 'sr-006', package: 'pro' },
  'image-to-video': { status: 'approved', requestId: 'sr-007', package: 'basic' },
  'video-to-video': { status: 'approved', requestId: 'sr-008', package: 'pro' },
  'data-analysis': { status: 'approved', requestId: 'sr-009', package: 'premium' },
  'custom-ai': { status: 'approved', requestId: 'sr-010', package: 'custom' },
  'ecommerce': { status: 'approved', requestId: 'sr-011', package: 'pro' },
  'corporate-website': { status: 'approved', requestId: 'sr-012', package: 'basic' },
  'mobile-app': { status: 'approved', requestId: 'sr-013', package: 'premium' },
  'digital-marketing': { status: 'approved', requestId: 'sr-014', package: 'pro' },
  'iot-solutions': { status: 'approved', requestId: 'sr-015', package: 'custom' },
  'cloud-solutions': { status: 'approved', requestId: 'sr-016', package: 'pro' },
  'ui-ux-design': { status: 'approved', requestId: 'sr-017', package: 'basic' },
  'maintenance-support': { status: 'approved', requestId: 'sr-018', package: 'pro' },
};

export default function Services() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'digital'>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [requestNote, setRequestNote] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'pro' | 'premium' | 'custom'>('pro');
  const mockUser = getCurrentMockUser();

  const filteredServices = selectedCategory === 'all'
    ? serviceTypes
    : serviceTypes.filter(s => s.category === selectedCategory);

  const aiCount = serviceTypes.filter(s => s.category === 'ai').length;
  const digitalCount = serviceTypes.filter(s => s.category === 'digital').length;

  const handleRequestService = (service: any) => {
    setSelectedService(service);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = () => {
    alert(`Service request sent to admin!\n\nService: ${selectedService.name_en}\nPackage: ${selectedPackage}\nStatus: Pending Approval\n\nYou'll be notified once the admin reviews your request.`);
    setShowRequestModal(false);
    setRequestNote('');
    setSelectedPackage('pro');
  };

  const getServiceStatus = (serviceId: string) => {
    return mockCompanyRequests[serviceId] || null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
            <Check className="w-4 h-4" />
            Active
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending Approval
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
            <X className="w-4 h-4" />
            Rejected
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <>
      <div className="p-6 space-y-6 bg-gray-950">
        <div>
          <h1 className="text-3xl font-bold text-white">Services</h1>
          <p className="text-gray-400 mt-1">Explore and request AI services for your business</p>
        </div>

        <div className="flex gap-3 border-b border-gray-800">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              selectedCategory === 'all'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            All Services
            <span className="ml-2 px-2 py-0.5 bg-gray-800 rounded-full text-xs">
              {serviceTypes.length}
            </span>
            {selectedCategory === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>

          <button
            onClick={() => setSelectedCategory('ai')}
            className={`px-6 py-3 font-medium transition-colors relative flex items-center gap-2 ${
              selectedCategory === 'ai'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Services
            <span className="ml-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
              {aiCount}
            </span>
            {selectedCategory === 'ai' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>

          <button
            onClick={() => setSelectedCategory('digital')}
            className={`px-6 py-3 font-medium transition-colors relative flex items-center gap-2 ${
              selectedCategory === 'digital'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Digital Services
            <span className="ml-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">
              {digitalCount}
            </span>
            {selectedCategory === 'digital' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service) => {
            const status = getServiceStatus(service.id);
            const Icon = service.icon;

            return (
              <div
                key={service.id}
                className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-black/50 transition-all group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <div className="mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    service.category === 'ai'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {service.category.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{service.name_en}</h3>
                <p className="text-gray-400 text-sm mb-4">{service.description_en}</p>

                <ul className="space-y-2 mb-4">
                  {service.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-400">
                    Contact for Pricing
                  </p>
                </div>

                {status ? (
                  <div className="mt-4">
                    {getStatusBadge(status.status)}
                    {status.status === 'approved' && (
                      <button
                        onClick={() => {
                          if (service.id === 'whatsapp-automation') {
                            window.location.hash = 'whatsapp';
                          } else {
                            window.location.hash = `service/${service.slug}`;
                          }
                        }}
                        className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Open Dashboard
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleRequestService(service)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
                  >
                    Request Service
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showRequestModal && selectedService && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => setShowRequestModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className={`bg-gradient-to-r ${selectedService.color} px-6 py-4`}>
              <h2 className="text-2xl font-bold text-white">Request Service</h2>
              <p className="text-white/80 text-sm mt-1">{selectedService.name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${selectedService.color} rounded-lg flex items-center justify-center`}>
                    <selectedService.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{selectedService.name_en}</p>
                    <p className="text-sm text-gray-400">{selectedService.category.toUpperCase()}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-400 font-medium">Features included:</p>
                  <ul className="space-y-1">
                    {selectedService.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder="Any specific requirements or questions..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  <strong>Note:</strong> Your request will be sent to the administrator for approval.
                  You'll receive a notification once it\'s reviewed.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
