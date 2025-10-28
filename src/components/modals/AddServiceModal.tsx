import { useState, useEffect, Fragment } from 'react';
import { X, Package, DollarSign, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '../../lib/supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface AddServiceFormData {
  companyId: string;
  serviceTypeId: string;
  package: 'basic' | 'pro' | 'premium' | 'custom';
  priceAmount?: number;
  billingCycle?: 'monthly' | 'yearly' | 'one-time';
  startDate: string;
  endDate?: string;
  notes?: string;
}

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddServiceFormData) => Promise<void>;
  isLoading?: boolean;
  initialCompanyId?: string; // Pre-select company if provided
}

// =====================================================
// COMPONENT
// =====================================================

export default function AddServiceModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialCompanyId
}: AddServiceModalProps) {
  // ===== STATES =====
  const [companies, setCompanies] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<AddServiceFormData>({
    companyId: '',
    serviceTypeId: '',
    package: 'basic',
    priceAmount: undefined,
    billingCycle: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
  });

  // ===== FETCH DATA =====
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Set initial company if provided
  useEffect(() => {
    if (initialCompanyId && isOpen) {
      setFormData(prev => ({ ...prev, companyId: initialCompanyId }));
    }
  }, [initialCompanyId, isOpen]);

  const fetchData = async () => {
    try {
      setLoadingData(true);

      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, email')
        .order('name');

      if (companiesError) throw companiesError;

      // Fetch service types
      const { data: serviceTypesData, error: serviceTypesError } = await supabase
        .from('service_types')
        .select('id, name_en, name_tr, slug, category, icon, color, pricing_basic, pricing_standard, pricing_premium')
        .eq('is_active', true)
        .order('sort_order');

      if (serviceTypesError) throw serviceTypesError;

      setCompanies(companiesData || []);
      setServiceTypes(serviceTypesData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // ===== VALIDATION =====
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyId) {
      newErrors.companyId = 'Please select a company';
    }

    if (!formData.serviceTypeId) {
      newErrors.serviceTypeId = 'Please select a service type';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.package === 'custom' && !formData.priceAmount) {
      newErrors.priceAmount = 'Price is required for custom package';
    }

    if (formData.priceAmount && formData.priceAmount <= 0) {
      newErrors.priceAmount = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== HANDLERS =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  const handleClose = () => {
    setFormData({
      companyId: initialCompanyId || '',
      serviceTypeId: '',
      package: 'basic',
      priceAmount: undefined,
      billingCycle: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  const handlePackageChange = (packageType: 'basic' | 'pro' | 'premium' | 'custom') => {
    setFormData(prev => ({
      ...prev,
      package: packageType,
      priceAmount: packageType === 'custom' ? prev.priceAmount : undefined,
    }));

    // Auto-fill price if standard package is selected
    if (packageType !== 'custom' && formData.serviceTypeId) {
      const selectedService = serviceTypes.find(s => s.id === formData.serviceTypeId);
      if (selectedService) {
        const pricingKey = `pricing_${packageType === 'pro' ? 'standard' : packageType}`;
        const pricing = selectedService[pricingKey];
        if (pricing && pricing.price) {
          setFormData(prev => ({ ...prev, priceAmount: pricing.price }));
        }
      }
    }
  };

  // ===== RENDER HELPERS =====
  const getPackageColor = (pkg: string) => {
    switch (pkg) {
      case 'basic': return 'border-blue-500/50 bg-blue-500/10';
      case 'pro': return 'border-purple-500/50 bg-purple-500/10';
      case 'premium': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'custom': return 'border-green-500/50 bg-green-500/10';
      default: return 'border-secondary bg-primary';
    }
  };

  const getPackageSelectedColor = (pkg: string) => {
    switch (pkg) {
      case 'basic': return 'border-blue-500 bg-blue-500/20';
      case 'pro': return 'border-purple-500 bg-purple-500/20';
      case 'premium': return 'border-yellow-500 bg-yellow-500/20';
      case 'custom': return 'border-green-500 bg-green-500/20';
      default: return 'border-blue-500 bg-blue-500/20';
    }
  };

  // ===== RENDER =====
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-secondary border border-secondary shadow-2xl transition-all">
                {/* HEADER */}
                <div className="flex items-center justify-between p-6 border-b border-secondary sticky top-0 bg-secondary z-10">
                  <Dialog.Title className="text-2xl font-bold text-white flex items-center gap-3">
                    <Package className="w-6 h-6 text-green-500" />
                    Add Service to Company
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="text-muted hover:text-white transition-colors disabled:opacity-50"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* BODY */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {loadingData ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-muted mt-4">Loading data...</p>
                    </div>
                  ) : (
                    <>
                      {/* Company Selection */}
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Company <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.companyId}
                          onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                          disabled={!!initialCompanyId || isLoading}
                          className={`w-full px-4 py-3 bg-primary border rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                            errors.companyId ? 'border-red-500' : 'border-secondary'
                          }`}
                        >
                          <option value="">Select a company...</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                        {errors.companyId && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.companyId}
                          </p>
                        )}
                      </div>

                      {/* Service Type Selection */}
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Service Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.serviceTypeId}
                          onChange={(e) => setFormData({ ...formData, serviceTypeId: e.target.value })}
                          disabled={isLoading}
                          className={`w-full px-4 py-3 bg-primary border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                            errors.serviceTypeId ? 'border-red-500' : 'border-secondary'
                          }`}
                        >
                          <option value="">Select a service type...</option>
                          {serviceTypes.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name_en} ({service.category})
                            </option>
                          ))}
                        </select>
                        {errors.serviceTypeId && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.serviceTypeId}
                          </p>
                        )}
                      </div>

                      {/* Package Selection */}
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-3">
                          Package <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {(['basic', 'pro', 'premium', 'custom'] as const).map((pkg) => (
                            <button
                              key={pkg}
                              type="button"
                              onClick={() => handlePackageChange(pkg)}
                              disabled={isLoading}
                              className={`p-4 border-2 rounded-lg transition-all disabled:opacity-50 ${
                                formData.package === pkg
                                  ? getPackageSelectedColor(pkg)
                                  : getPackageColor(pkg)
                              }`}
                            >
                              <p className="text-white font-medium capitalize">{pkg}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Price and Billing Cycle */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Price */}
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-2">
                            Price (USD) {formData.package === 'custom' && <span className="text-red-500">*</span>}
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.priceAmount || ''}
                              onChange={(e) => setFormData({ ...formData, priceAmount: parseFloat(e.target.value) || undefined })}
                              disabled={isLoading}
                              placeholder="0.00"
                              className={`w-full pl-10 pr-4 py-3 bg-primary border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
                                errors.priceAmount ? 'border-red-500' : 'border-secondary'
                              }`}
                            />
                          </div>
                          {errors.priceAmount && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.priceAmount}
                            </p>
                          )}
                        </div>

                        {/* Billing Cycle */}
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-2">
                            Billing Cycle
                          </label>
                          <select
                            value={formData.billingCycle || ''}
                            onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as any })}
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Select billing cycle...</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="one-time">One-time</option>
                          </select>
                        </div>
                      </div>

                      {/* Start and End Date */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-2">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                            <input
                              type="date"
                              value={formData.startDate}
                              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                              disabled={isLoading}
                              className={`w-full pl-10 pr-4 py-3 bg-primary border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                                errors.startDate ? 'border-red-500' : 'border-secondary'
                              }`}
                            />
                          </div>
                          {errors.startDate && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.startDate}
                            </p>
                          )}
                        </div>

                        {/* End Date */}
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-2">
                            End Date (Optional)
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                            <input
                              type="date"
                              value={formData.endDate || ''}
                              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                              disabled={isLoading}
                              className={`w-full pl-10 pr-4 py-3 bg-primary border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                                errors.endDate ? 'border-red-500' : 'border-secondary'
                              }`}
                            />
                          </div>
                          {errors.endDate && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.endDate}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Internal Notes (Optional)
                        </label>
                        <textarea
                          value={formData.notes || ''}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          disabled={isLoading}
                          rows={3}
                          placeholder="Add any internal notes about this service addition..."
                          className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                        />
                        <p className="mt-1 text-xs text-muted">These notes are only visible to super admins</p>
                      </div>
                    </>
                  )}
                </form>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-secondary sticky bottom-0 bg-secondary">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-6 py-3 bg-primary hover:bg-secondary border border-secondary text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || loadingData}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding Service...
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        Add Service
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
