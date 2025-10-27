import { useState } from 'react';
import { X, Check, Zap, Star, Crown } from 'lucide-react';

interface RequestServiceModalProps {
  service: any;
  onClose: () => void;
  onSubmit: (packageType: 'basic' | 'standard' | 'premium', notes: string) => void;
}

export default function RequestServiceModal({ service, onClose, onSubmit }: RequestServiceModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const packages = [
    {
      id: 'basic',
      name: 'Basic',
      icon: Zap,
      price: service.pricing_basic?.price || 0,
      currency: service.pricing_basic?.currency || 'USD',
      period: service.pricing_basic?.period || 'month',
      color: 'from-gray-600 to-gray-700',
      features: service.pricing_basic?.features_en || ['Standard features', 'Email support', 'Monthly reports', 'Basic analytics'],
    },
    {
      id: 'standard',
      name: 'Standard',
      icon: Star,
      price: service.pricing_standard?.price || 0,
      currency: service.pricing_standard?.currency || 'USD',
      period: service.pricing_standard?.period || 'month',
      color: 'from-blue-600 to-cyan-600',
      features: service.pricing_standard?.features_en || ['All Basic features', 'Priority support', 'Weekly reports', 'Advanced analytics', 'API access'],
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: Crown,
      price: service.pricing_premium?.price || 0,
      currency: service.pricing_premium?.currency || 'USD',
      period: service.pricing_premium?.period || 'month',
      color: 'from-purple-600 to-pink-600',
      features: service.pricing_premium?.features_en || ['All Standard features', '24/7 dedicated support', 'Daily reports', 'Custom integrations', 'SLA guarantee', 'Dedicated account manager'],
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
        <div className="bg-secondary border border-secondary rounded-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
          <p className="text-muted">
            Your service request has been sent to the Super Admin for approval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-secondary border border-secondary rounded-xl max-w-4xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Request Service</h2>
            <p className="text-muted text-sm mt-1">{service.name_en}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-hover rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Select Package</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const Icon = pkg.icon;
                const isSelected = selectedPackage === pkg.id;
                const currencySymbol = pkg.currency === 'USD' ? '$' : pkg.currency === 'EUR' ? '€' : '₺';
                const periodText = pkg.period === 'month' ? 'month' : pkg.period === 'year' ? 'year' : 'one-time';

                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackage(pkg.id as any)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-secondary bg-primary/50 hover:border-secondary'
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
                      {currencySymbol}{pkg.price}<span className="text-sm text-muted">/{periodText}</span>
                    </p>

                    <ul className="space-y-1.5 mb-3">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="text-xs text-muted flex items-start">
                          <Check className="w-3 h-3 text-green-500 mr-1.5 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {isSelected && (
                      <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-secondary">
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
            <label className="block text-sm font-medium text-secondary mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific requirements or questions about this service..."
              className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              rows={4}
            />
          </div>

          <div className="bg-primary/50 border border-secondary rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-white mb-3">Request Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Service:</span>
                <span className="text-white font-medium">{service.name_en}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Package:</span>
                <span className="text-white font-medium capitalize">{selectedPackage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Monthly Cost:</span>
                <span className="text-white font-bold">
                  {service[`pricing_${selectedPackage}`]?.currency === 'USD' ? '$' :
                   service[`pricing_${selectedPackage}`]?.currency === 'EUR' ? '€' : '₺'}
                  {service[`pricing_${selectedPackage}`]?.price || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery Time:</span>
                <span className="text-white font-medium">{service.metadata?.delivery_time || '1-2 weeks'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-hover text-white rounded-lg font-medium transition-colors"
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
