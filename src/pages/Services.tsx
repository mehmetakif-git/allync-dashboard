import { useState } from 'react';
import { MessageCircle, Instagram, Video, Image, Mic, FileText, BarChart, Sparkles, Check, Clock, X } from 'lucide-react';
import { getCurrentMockUser } from '../utils/mockAuth';

const services = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Automation',
    description: 'Automate customer conversations with AI',
    icon: MessageCircle,
    gradient: 'from-green-500 to-emerald-600',
    price: 299,
    features: ['Unlimited messages', 'AI responses', 'Analytics dashboard', 'Multi-agent support'],
  },
  {
    id: 'instagram',
    name: 'Instagram Automation',
    description: 'Automate DMs and comments with AI',
    icon: Instagram,
    gradient: 'from-pink-500 to-purple-600',
    price: 399,
    features: ['Auto-reply DMs', 'Comment management', 'Story replies', 'Analytics'],
  },
  {
    id: 'text-to-video',
    name: 'Text to Video AI',
    description: 'Convert text to professional videos',
    icon: Video,
    gradient: 'from-blue-500 to-cyan-600',
    price: 499,
    features: ['HD video generation', 'Custom avatars', 'Voice synthesis', 'Multi-language'],
  },
  {
    id: 'text-to-image',
    name: 'Text to Image AI',
    description: 'Generate images from text descriptions',
    icon: Image,
    gradient: 'from-violet-500 to-purple-600',
    price: 399,
    features: ['4K generation', 'Style transfer', 'Batch processing', 'API access'],
  },
  {
    id: 'voice-cloning',
    name: 'Voice Cloning',
    description: 'Clone and synthesize realistic voices',
    icon: Mic,
    gradient: 'from-orange-500 to-red-600',
    price: 599,
    features: ['Voice cloning', 'Text-to-speech', 'Multi-language', 'Emotion control'],
  },
  {
    id: 'document-ai',
    name: 'Document AI',
    description: 'Extract and analyze document data',
    icon: FileText,
    gradient: 'from-gray-500 to-gray-600',
    price: 299,
    features: ['OCR', 'Data extraction', 'Classification', 'Batch processing'],
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis AI',
    description: 'Automated insights from your data',
    icon: BarChart,
    gradient: 'from-yellow-500 to-orange-600',
    price: 799,
    features: ['Predictive analytics', 'Visualization', 'Reports', 'Real-time insights'],
  },
  {
    id: 'custom-ai',
    name: 'Custom AI Development',
    description: 'Tailored AI solutions for your needs',
    icon: Sparkles,
    gradient: 'from-fuchsia-500 to-pink-600',
    price: 1999,
    features: ['Custom models', 'Dedicated support', 'Full integration', 'Training included'],
  },
];

const mockCompanyRequests: Record<string, { status: 'approved' | 'pending' | 'rejected'; requestId: string }> = {
  whatsapp: { status: 'approved', requestId: 'REQ-002' },
  instagram: { status: 'pending', requestId: 'REQ-001' },
};

export default function Services() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [requestNote, setRequestNote] = useState('');
  const mockUser = getCurrentMockUser();

  const handleRequestService = (service: any) => {
    setSelectedService(service);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = () => {
    alert(`Service request sent to admin!\n\nService: ${selectedService.name}\nStatus: Pending Approval\n\nYou'll be notified once the admin reviews your request.`);
    setShowRequestModal(false);
    setRequestNote('');
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => {
            const status = getServiceStatus(service.id);
            const Icon = service.icon;

            return (
              <div
                key={service.id}
                className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-xl hover:shadow-black/50 transition-all group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{service.description}</p>

                <ul className="space-y-2 mb-4">
                  {service.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-white">
                    ${service.price}
                    <span className="text-sm text-gray-400 font-normal">/month</span>
                  </p>
                </div>

                {status ? (
                  <div className="mt-4">
                    {getStatusBadge(status.status)}
                    {status.status === 'approved' && (
                      <button
                        onClick={() => {
                          if (service.id === 'whatsapp') {
                            window.location.hash = 'whatsapp';
                          } else {
                            alert(`${service.name} dashboard coming soon!`);
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
            <div className={`bg-gradient-to-r ${selectedService.gradient} px-6 py-4`}>
              <h2 className="text-2xl font-bold text-white">Request Service</h2>
              <p className="text-white/80 text-sm mt-1">{selectedService.name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${selectedService.gradient} rounded-lg flex items-center justify-center`}>
                    <selectedService.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{selectedService.name}</p>
                    <p className="text-2xl font-bold text-white">
                      ${selectedService.price}
                      <span className="text-sm text-gray-400 font-normal">/month</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
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
                  You'll receive a notification once it's reviewed.
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
