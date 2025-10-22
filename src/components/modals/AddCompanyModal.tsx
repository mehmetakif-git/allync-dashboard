import { useState } from 'react';
import { X } from 'lucide-react';

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
  adminName: string;
  adminEmail: string;
  status: 'active' | 'suspended' | 'inactive';
}

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function AddCompanyModal({ isOpen, onClose, onSubmit, isLoading = false }: AddCompanyModalProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    email: '',
    phone: '',
    country: '',
    address: '',
    city: '',
    postalCode: '',
    taxId: '',
    registrationNumber: '',
    billingEmail: '',
    website: '',
    adminName: '',
    adminEmail: '',
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.taxId.trim()) newErrors.taxId = 'Tax ID is required';
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Billing email validation (if provided)
    if (formData.billingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)) {
      newErrors.billingEmail = 'Invalid email format';
    }

    // Admin email validation (if provided)
    if (formData.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        phone: '',
        country: '',
        address: '',
        city: '',
        postalCode: '',
        taxId: '',
        registrationNumber: '',
        billingEmail: '',
        website: '',
        adminName: '',
        adminEmail: '',
        status: 'active',
      });
      setErrors({});
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error submitting form:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      country: '',
      address: '',
      city: '',
      postalCode: '',
      taxId: '',
      registrationNumber: '',
      billingEmail: '',
      website: '',
      adminName: '',
      adminEmail: '',
      status: 'active',
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Company</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-900 border ${
                    errors.name ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                  placeholder="Enter company name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-900 border ${
                      errors.email ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                    placeholder="contact@company.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-900 border ${
                      errors.phone ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                    placeholder="+1 234 567 8900"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="border-b border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Address</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-900 border ${
                    errors.address ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                  placeholder="123 Main Street"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-900 border ${
                      errors.city ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                    placeholder="New York"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-900 border ${
                      errors.postalCode ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                    placeholder="10001"
                  />
                  {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-900 border ${
                      errors.country ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                    placeholder="USA"
                  />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Tax & Registration */}
          <div className="border-b border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tax & Registration</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tax ID / VAT Number *
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-900 border ${
                      errors.taxId ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                    placeholder="TR1234567890"
                  />
                  {errors.taxId && <p className="text-red-500 text-xs mt-1">{errors.taxId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Registration Number *
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-900 border ${
                      errors.registrationNumber ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                    placeholder="123456"
                  />
                  {errors.registrationNumber && <p className="text-red-500 text-xs mt-1">{errors.registrationNumber}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Billing Email
                </label>
                <input
                  type="email"
                  value={formData.billingEmail}
                  onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-900 border ${
                    errors.billingEmail ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                  placeholder="billing@company.com"
                />
                {errors.billingEmail && <p className="text-red-500 text-xs mt-1">{errors.billingEmail}</p>}
                <p className="text-xs text-gray-500 mt-1">If different from main email</p>
              </div>
            </div>
          </div>

          {/* Initial Admin User */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Initial Admin User (Optional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Name
                </label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-900 border ${
                    errors.adminEmail ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                  placeholder="admin@company.com"
                />
                {errors.adminEmail && <p className="text-red-500 text-xs mt-1">{errors.adminEmail}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding Company...' : 'Add Company'}
          </button>
        </div>
      </div>
    </div>
  );
}