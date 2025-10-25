import { useState } from 'react';
import { X } from 'lucide-react';

export interface UserFormData {
  name: string;
  email: string;
  role: 'super_admin' | 'company_admin' | 'user';
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData: UserFormData;
  isLoading?: boolean;
  showRoleSuperAdmin?: boolean; // Option to show super_admin role
  userInfo?: {
    company?: string;
    joinedDate?: string;
  };
}

export default function EditUserModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isLoading = false,
  showRoleSuperAdmin = false,
  userInfo
}: EditUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      // Error handling is done in parent component
      console.error('Error submitting form:', error);
    }
  };

  const handleClose = () => {
    setFormData(initialData);
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
      <div className="relative bg-secondary border border-secondary rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit User</h2>
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
              placeholder="Enter full name"
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
              placeholder="user@example.com"
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

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

          {/* User Info (if provided) */}
          {userInfo && (
            <div className="bg-primary/50 border border-secondary rounded-lg p-4">
              {userInfo.company && (
                <p className="text-sm text-muted">
                  <strong className="text-white">Company:</strong> {userInfo.company}
                </p>
              )}
              {userInfo.joinedDate && (
                <p className="text-sm text-muted mt-2">
                  <strong className="text-white">Joined:</strong> {userInfo.joinedDate}
                </p>
              )}
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
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Update User'}
          </button>
        </div>
      </div>
    </div>
  );
}