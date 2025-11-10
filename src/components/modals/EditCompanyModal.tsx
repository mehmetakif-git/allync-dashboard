import { useState } from 'react';
import { X } from 'lucide-react';

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CompanyFormData) => Promise<void>;
  initialData: CompanyFormData;
  companyName: string;
}

export interface CompanyFormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
  taxId: string;
  registrationNumber: string;
  billingEmail: string;
  website: string;
  status: string;
}

export default function EditCompanyModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditCompanyModalProps) {
  const [formData, setFormData] = useState<CompanyFormData>(initialData);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error saving company:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const isValid = formData.name && formData.email && formData.phone;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-secondary border border-secondary rounded-xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Company</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <div className="space-y-6 mb-6">
          {/* Basic Information */}
          <div className="border-b border-secondary pb-4">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="border-b border-secondary pb-4">
            <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tax & Billing */}
          <div className="border-b border-secondary pb-4">
            <h3 className="text-lg font-semibold text-white mb-4">Tax & Billing Information</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Tax ID / VAT Number *
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="e.g., TR1234567890"
                    className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="e.g., 123456"
                    className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Billing Email
                </label>
                <input
                  type="email"
                  value={formData.billingEmail}
                  onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                  placeholder="billing@company.com"
                  className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-muted mt-1">If different from main email</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Company Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="active" className="bg-slate-800 text-white">Active</option>
                <option value="suspended" className="bg-slate-800 text-white">Suspended</option>
                <option value="inactive" className="bg-slate-800 text-white">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-hover text-white rounded-lg font-medium transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !isValid}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Updating...' : 'Update Company'}
          </button>
        </div>
      </div>
    </div>
  );
}