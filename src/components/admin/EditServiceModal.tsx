import { useState } from 'react';
import { X, Save, Plus, Trash2, Check } from 'lucide-react';
import * as Icons from 'lucide-react';

interface EditServiceModalProps {
  service: any;
  onClose: () => void;
  onSave: (updatedService: any) => void;
}

export default function EditServiceModal({ service, onClose, onSave }: EditServiceModalProps) {
  const [formData, setFormData] = useState({
    name_en: service.name_en,
    name_tr: service.name_tr,
    description_en: service.description_en,
    description_tr: service.description_tr,
    category: service.category,
    delivery: service.delivery,
    status: service.status,
    features: [...service.features],
    pricing: { ...service.pricing },
  });

  const [newFeature, setNewFeature] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedService = {
      ...service,
      ...formData,
    };

    onSave(updatedService);
    setIsSaving(false);
    setShowSuccess(true);

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Service Updated!</h2>
          <p className="text-gray-400">
            Changes have been saved and are now visible to all users.
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
            <h2 className="text-2xl font-bold text-white">Edit Service</h2>
            <p className="text-gray-400 text-sm mt-1">
              Changes will be visible to all users immediately
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Service Name (English) *
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Service Name (Turkish) *
              </label>
              <input
                type="text"
                value={formData.name_tr}
                onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (English) *
              </label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Turkish) *
              </label>
              <textarea
                value={formData.description_tr}
                onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                rows={3}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'ai' | 'digital' })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="ai">AI Services</option>
                <option value="digital">Digital Services</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Delivery Time *
              </label>
              <input
                type="text"
                value={formData.delivery}
                onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
                placeholder="e.g., 1-2 weeks"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Pricing (Monthly USD) *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Basic Package</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={formData.pricing.basic}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, basic: parseInt(e.target.value) }
                    })}
                    className="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">Pro Package</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={formData.pricing.pro}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, pro: parseInt(e.target.value) }
                    })}
                    className="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">Enterprise Package</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={formData.pricing.enterprise}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, enterprise: parseInt(e.target.value) }
                    })}
                    className="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Features *
            </label>

            <div className="space-y-2 mb-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm">
                    {feature}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                placeholder="Add new feature..."
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Service Status *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'active' })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.status === 'active'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="font-medium text-white">Active</span>
                </div>
                <p className="text-xs text-gray-400">
                  Visible to all users and can be requested
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'maintenance' })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.status === 'maintenance'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="font-medium text-white">Maintenance</span>
                </div>
                <p className="text-xs text-gray-400">
                  Visible but cannot be requested
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'inactive' })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.status === 'inactive'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="font-medium text-white">Inactive</span>
                </div>
                <p className="text-xs text-gray-400">
                  Hidden from all users except Super Admin
                </p>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
