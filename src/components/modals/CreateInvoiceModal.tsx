import { useState, useEffect } from 'react';
import { X, DollarSign, Building2, Calendar, FileText, AlertCircle } from 'lucide-react';
import { getAllCompanies } from '../../lib/api/companies';
import { useAuth } from '../../contexts/AuthContext';

export interface CreateInvoiceFormData {
  companyId: string;
  amount: number;
  dueDate: string;
  customDescription: string;
  serviceId?: string;
  notes: string;
  autoSuspendOnOverdue: boolean;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInvoiceFormData) => Promise<void>;
  isLoading?: boolean;
  initialCompanyId?: string; // Pre-select company (e.g., from CompanyDetail page)
}

export default function CreateInvoiceModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialCompanyId
}: CreateInvoiceModalProps) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [selectedCompanyServices, setSelectedCompanyServices] = useState<any[]>([]);

  // Calculate default due date (15 days from now)
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<CreateInvoiceFormData>({
    companyId: '',
    amount: 0,
    dueDate: getDefaultDueDate(),
    customDescription: '',
    serviceId: '',
    notes: '',
    autoSuspendOnOverdue: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch companies on mount and set initial company
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      // Set initial company ID if provided
      if (initialCompanyId) {
        setFormData(prev => ({ ...prev, companyId: initialCompanyId }));
      }
    }
  }, [isOpen, initialCompanyId]);

  // Fetch company services when company is selected
  useEffect(() => {
    if (formData.companyId) {
      fetchCompanyServices(formData.companyId);
    } else {
      setSelectedCompanyServices([]);
    }
  }, [formData.companyId]);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const data = await getAllCompanies();
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchCompanyServices = async (companyId: string) => {
    try {
      // Fetch company's active services
      const { data } = await import('../../lib/supabase').then(m => m.supabase
        .from('company_services')
        .select(`
          id,
          package,
          service_types(id, name_en, slug)
        `)
        .eq('company_id', companyId)
        .eq('status', 'active')
      );
      setSelectedCompanyServices(data || []);
    } catch (error) {
      console.error('Error fetching company services:', error);
      setSelectedCompanyServices([]);
    }
  };

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyId) newErrors.companyId = 'Company is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (!formData.customDescription.trim()) newErrors.customDescription = 'Description is required';

    // Validate due date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.dueDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      newErrors.dueDate = 'Due date cannot be in the past';
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
        companyId: '',
        amount: 0,
        dueDate: getDefaultDueDate(),
        customDescription: '',
        serviceId: '',
        notes: '',
        autoSuspendOnOverdue: true,
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handleInputChange = (field: keyof CreateInvoiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedCompany = companies.find(c => c.id === formData.companyId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-secondary shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-secondary/95 backdrop-blur-sm border-b border-secondary p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create Manual Invoice</h2>
              <p className="text-sm text-muted">Generate a custom invoice for a company</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-hover rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-400 font-medium mb-1">Manual Invoice</p>
              <p className="text-blue-300/70">
                This invoice will be created with pending status. Company will be notified via email.
              </p>
            </div>
          </div>

          {/* Company Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Company <span className="text-red-500">*</span>
            </label>
            {loadingCompanies ? (
              <div className="h-10 bg-primary/50 rounded-lg animate-pulse"></div>
            ) : (
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <select
                  value={formData.companyId}
                  onChange={(e) => handleInputChange('companyId', e.target.value)}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2 bg-primary border rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.companyId ? 'border-red-500' : 'border-secondary'
                  }`}
                >
                  <option value="">Select a company...</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name} ({company.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {errors.companyId && (
              <p className="mt-1 text-sm text-red-500">{errors.companyId}</p>
            )}
            {selectedCompany && (
              <div className="mt-2 text-xs text-muted">
                <p>Country: {selectedCompany.country} • Status: {selectedCompany.status}</p>
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Amount (USD) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                disabled={isLoading}
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-2 bg-primary border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.amount ? 'border-red-500' : 'border-secondary'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                disabled={isLoading}
                className={`w-full pl-10 pr-4 py-2 bg-primary border rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.dueDate ? 'border-red-500' : 'border-secondary'
                }`}
              />
            </div>
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>
            )}
            <p className="mt-1 text-xs text-muted">Default: 15 days from today</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.customDescription}
              onChange={(e) => handleInputChange('customDescription', e.target.value)}
              disabled={isLoading}
              rows={3}
              placeholder="E.g., Website Development - Premium Package (Monthly)"
              className={`w-full px-4 py-2 bg-primary border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.customDescription ? 'border-red-500' : 'border-secondary'
              }`}
            />
            {errors.customDescription && (
              <p className="mt-1 text-sm text-red-500">{errors.customDescription}</p>
            )}
          </div>

          {/* Service Selection (Optional) */}
          {selectedCompanyServices.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Related Service (Optional)
              </label>
              <select
                value={formData.serviceId || ''}
                onChange={(e) => handleInputChange('serviceId', e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">No service</option>
                {selectedCompanyServices.map((service: any) => (
                  <option key={service.id} value={service.id}>
                    {service.service_types?.name_en || 'Unknown Service'} - {service.package?.toUpperCase()}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted">Link this invoice to a specific service</p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Internal Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              disabled={isLoading}
              rows={2}
              placeholder="Add internal notes (not visible to customer)..."
              className="w-full px-4 py-2 bg-primary border border-secondary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Auto Suspend Toggle */}
          <div className="flex items-start gap-3 p-4 bg-primary/50 rounded-lg border border-secondary">
            <input
              type="checkbox"
              id="autoSuspend"
              checked={formData.autoSuspendOnOverdue}
              onChange={(e) => handleInputChange('autoSuspendOnOverdue', e.target.checked)}
              disabled={isLoading}
              className="mt-1 w-4 h-4 rounded border-secondary bg-primary text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <label htmlFor="autoSuspend" className="flex-1 cursor-pointer">
              <p className="text-sm font-medium text-white">Auto-suspend service on overdue</p>
              <p className="text-xs text-muted mt-1">
                Automatically suspend company's services if invoice becomes overdue
              </p>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-secondary/95 backdrop-blur-sm border-t border-secondary p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Create Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
