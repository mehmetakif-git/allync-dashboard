import { useState } from 'react';
import { X, Check, Zap, Star, Crown } from 'lucide-react';

interface RequestServiceModalProps {
  service: any;
  onClose: () => void;
  onSubmit: (packageType: 'basic' | 'pro' | 'enterprise', notes: string) => void;
}

export default function RequestServiceModal({ service, onClose, onSubmit }: RequestServiceModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'pro' | 'enterprise'>('basic');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const packages = [
    {
      id: 'basic',
      name: 'Basic',
      icon: Zap,
      price: service.pricing.basic,
      color: 'from-gray-600 to-gray-700',
      features: ['Standard features', 'Email support', 'Monthly reports', 'Basic analytics'],
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Star,
      price: service.pricing.pro,
      color: 'from-blue-600 to-cyan-600',
      features: ['All Basic features', 'Priority support', 'Weekly reports', 'Advanced analytics', 'API access'],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Crown,
      price: service.pricing.enterprise,
      color: 'from-purple-600 to-pink-600',
      features: ['All Pro features', '24/7 dedicated support', 'Daily reports', 'Custom integrations', 'SLA guarantee', 'Dedicated account manager'],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    onSubmit(selectedPackage, notes);
    setIsSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
          <p className="text-gray-400">
            Your service request has been sent to the Super Admin for approval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Request Service</h2>
            <p className="text-gray-400 text-sm mt-1">{service.name_en}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Select Package</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const Icon = pkg.icon;
                const isSelected = selectedPackage === pkg.id;

                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackage(pkg.id as any)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold rounded-full">
                        POPULAR
                      </div>
                    )}

                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pkg.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    <h4 className="text-lg font-bold text-white mb-1">{pkg.name}</h4>
                    <p className="text-2xl font-bold text-white mb-3">
                      ${pkg.price}<span className="text-sm text-gray-400">/month</span>
                    </p>

                    <ul className="space-y-1.5 mb-3">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-400 flex items-start">
                          <Check className="w-3 h-3 text-green-500 mr-1.5 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {isSelected && (
                      <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-700">
                        <Check className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-500">Selected</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific requirements or questions about this service..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              rows={4}
            />
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-white mb-3">Request Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Service:</span>
                <span className="text-white font-medium">{service.name_en}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Package:</span>
                <span className="text-white font-medium capitalize">{selectedPackage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly Cost:</span>
                <span className="text-white font-bold">${service.pricing[selectedPackage]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Delivery Time:</span>
                <span className="text-white font-medium">{service.delivery}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
