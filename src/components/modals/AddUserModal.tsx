import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getAllCompanies } from '../../lib/api/companies';

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'company_admin' | 'user';
  companyId: string;
  sendEmail: boolean;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
  defaultCompanyId?: string; // If called from CompanyDetail, pre-select company
  showRoleSuperAdmin?: boolean; // Option to show super_admin role
}

export default function AddUserModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false,
  defaultCompanyId,
  showRoleSuperAdmin = false,
}: AddUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'user',
    companyId: defaultCompanyId || '',
    sendEmail: true,
  });
  
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch companies when modal opens
  useEffect(() => {
    if (isOpen && !defaultCompanyId) {
      fetchCompanies();
    }
  }, [isOpen, defaultCompanyId]);

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

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.companyId && !showRoleSuperAdmin) {
      newErrors.companyId = 'Company is required';
    }

    // Super admin doesn't need company
    if (formData.role === 'super_admin' && formData.companyId) {
      setFormData({ ...formData, companyId: '' });
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
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      companyId: defaultCompanyId || '',
      sendEmail: true,
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-secondary border border-secondary rounded-xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add New User</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 bg-primary border ${
                errors.name ? 'border-red-500' : 'border-secondary'
              } rounded-lg text-white focus:outline-none focus:border-blue-500`}
              placeholder="John Doe"
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-3 bg-primary border ${
                errors.email ? 'border-red-500' : 'border-secondary'
              } rounded-lg text-white focus:outline-none focus:border-blue-500`}
              placeholder="john@example.com"
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Company Selection */}
          {!defaultCompanyId && (
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Company {formData.role !== 'super_admin' && '*'}
              </label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className={`w-full px-4 py-3 bg-primary border ${
                  errors.companyId ? 'border-red-500' : 'border-secondary'
                } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                disabled={isLoading || loadingCompanies || formData.role === 'super_admin'}
              >
                <option value="">
                  {loadingCompanies ? 'Loading companies...' : formData.role === 'super_admin' ? 'No company (Super Admin)' : 'Select a company'}
                </option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {errors.companyId && <p className="text-red-500 text-xs mt-1">{errors.companyId}</p>}
              {formData.role === 'super_admin' && (
                <p className="text-xs text-muted mt-1">Super admins don't belong to any company</p>
              )}
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            >
              {showRoleSuperAdmin && <option value="super_admin">Super Admin</option>}
              <option value="company_admin">Company Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Temporary Password *
            </label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-4 py-3 bg-primary border ${
                errors.password ? 'border-red-500' : 'border-secondary'
              } rounded-lg text-white focus:outline-none focus:border-blue-500`}
              placeholder="Enter temporary password"
              disabled={isLoading}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            <p className="text-xs text-muted mt-1">User will be required to change this on first login</p>
          </div>

          {/* Send Email Checkbox */}
          <div className="bg-secondary/50 border border-secondary rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sendEmail}
                onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                className="w-5 h-5 rounded border-secondary bg-gray-700 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <div>
                <p className="text-white font-medium">Send welcome email</p>
                <p className="text-muted text-xs">Email will include login credentials and instructions</p>
              </div>
            </label>
          </div>

          {/* Email Info */}
          {formData.sendEmail && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-400 text-sm">
                📧 A welcome email will be sent to <strong>{formData.email || '[user email]'}</strong> with their login credentials.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-hover disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating User...' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}