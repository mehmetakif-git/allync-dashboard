import { useState, useEffect } from 'react';
import { X, MessageSquare, Building2, User, AlertCircle, Tag, Zap } from 'lucide-react';
import { getAllCompanies } from '../../lib/api/companies';
import { getServiceTypes } from '../../lib/api/companies';
import { getAllUsers } from '../../lib/api/users';
import { useAuth } from '../../contexts/AuthContext';

export interface CreateTicketFormData {
  companyId: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'feature_request' | 'bug' | 'general' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  serviceTypeId?: string;
  assignedTo?: string;
  tags: string[];
}

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTicketFormData) => Promise<void>;
  isLoading?: boolean;
  initialCompanyId?: string; // Pre-select company (e.g., from CompanyDetail page)
}

export default function CreateTicketModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialCompanyId
}: CreateTicketModalProps) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [availableAssignees, setAvailableAssignees] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<CreateTicketFormData>({
    companyId: '',
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
    serviceTypeId: '',
    assignedTo: '',
    tags: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch data on mount
  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
      // Set initial company ID if provided
      if (initialCompanyId) {
        setFormData(prev => ({ ...prev, companyId: initialCompanyId }));
      }
    }
  }, [isOpen, initialCompanyId]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      const [companiesData, servicesData, usersData] = await Promise.all([
        getAllCompanies(),
        getServiceTypes(),
        getAllUsers(),
      ]);

      setCompanies(companiesData || []);
      setServiceTypes(servicesData || []);

      // Filter super admins for assignee list
      const superAdmins = (usersData || []).filter(
        (user: any) => user.role === 'super_admin'
      );
      setAvailableAssignees(superAdmins);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyId) newErrors.companyId = 'Company is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (formData.subject.length < 5) newErrors.subject = 'Subject must be at least 5 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';

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
        companyId: initialCompanyId || '',
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium',
        serviceTypeId: '',
        assignedTo: '',
        tags: [],
      });
      setTagInput('');
      setErrors({});
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleInputChange = (field: keyof CreateTicketFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const selectedCompany = companies.find(c => c.id === formData.companyId);

  const categoryOptions = [
    { value: 'technical', label: 'Technical Issue', color: 'text-blue-400' },
    { value: 'billing', label: 'Billing Question', color: 'text-green-400' },
    { value: 'feature_request', label: 'Feature Request', color: 'text-purple-400' },
    { value: 'bug', label: 'Bug Report', color: 'text-red-400' },
    { value: 'general', label: 'General Inquiry', color: 'text-gray-400' },
    { value: 'urgent', label: 'Urgent Issue', color: 'text-orange-400' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { value: 'high', label: 'High Priority', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/20 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create Support Ticket</h2>
              <p className="text-sm text-muted">Create a new support ticket for a company</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
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
              <p className="text-blue-400 font-medium mb-1">Support Ticket Creation</p>
              <p className="text-blue-300/70">
                Ticket will be created with 'open' status. Company will be notified via email.
              </p>
            </div>
          </div>

          {loadingData ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted">Loading data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Company Selection */}
              {!initialCompanyId && (
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <select
                      value={formData.companyId}
                      onChange={(e) => handleInputChange('companyId', e.target.value)}
                      disabled={isLoading}
                      className={`w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                        errors.companyId ? 'border-red-500' : 'border-secondary'
                      }`}
                    >
                      <option value="" className="bg-slate-800 text-white">Select a company...</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id} className="bg-slate-800 text-white">
                          {company.name} ({company.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.companyId && (
                    <p className="mt-1 text-sm text-red-500">{errors.companyId}</p>
                  )}
                  {selectedCompany && (
                    <div className="mt-2 text-xs text-muted">
                      <p>Country: {selectedCompany.country} • Status: {selectedCompany.status}</p>
                    </div>
                  )}
                </div>
              )}

              {initialCompanyId && selectedCompany && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-sm text-muted mb-1">Creating ticket for:</p>
                  <p className="text-white font-semibold">{selectedCompany.name}</p>
                  <p className="text-sm text-muted">{selectedCompany.email}</p>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  disabled={isLoading}
                  placeholder="Brief description of the issue..."
                  className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.subject ? 'border-red-500' : 'border-secondary'
                  }`}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isLoading}
                  rows={5}
                  placeholder="Detailed description of the issue or request..."
                  className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.description ? 'border-red-500' : 'border-secondary'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                )}
                <p className="mt-1 text-xs text-muted">Minimum 10 characters</p>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.category ? 'border-red-500' : 'border-secondary'
                    }`}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.priority ? 'border-red-500' : 'border-secondary'
                    }`}
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.priority && (
                    <p className="mt-1 text-sm text-red-500">{errors.priority}</p>
                  )}
                </div>
              </div>

              {/* Service Type & Assignee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Related Service (Optional)
                  </label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <select
                      value={formData.serviceTypeId || ''}
                      onChange={(e) => handleInputChange('serviceTypeId', e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="" className="bg-slate-800 text-white">No service</option>
                      {serviceTypes.map((service: any) => (
                        <option key={service.id} value={service.id} className="bg-slate-800 text-white">
                          {service.name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assign To */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Assign To (Optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <select
                      value={formData.assignedTo || ''}
                      onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="" className="bg-slate-800 text-white">Unassigned</option>
                      {availableAssignees.map((assignee: any) => (
                        <option key={assignee.id} value={assignee.id} className="bg-slate-800 text-white">
                          {assignee.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Tags (Optional)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      placeholder="Add tag and press Enter..."
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={isLoading || !tagInput.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          disabled={isLoading}
                          className="hover:text-blue-300 transition-colors disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/20 p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-white/10 border border-white/20 hover:bg-white/15 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || loadingData}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5" />
                Create Ticket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
