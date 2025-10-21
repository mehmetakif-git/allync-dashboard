import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface ServiceContentModalProps {
  serviceData: any;
  onClose: () => void;
  onSave: (updatedData: any) => void;
}

export default function ServiceContentModal({ serviceData, onClose, onSave }: ServiceContentModalProps) {
  const [formData, setFormData] = useState({
    name_en: serviceData?.name_en || '',
    name_tr: serviceData?.name_tr || '',
    description_en: serviceData?.description_en || '',
    description_tr: serviceData?.description_tr || '',
    features_en: serviceData?.features_en || [],
    features_tr: serviceData?.features_tr || [],
    pricing_starter: serviceData?.pricing?.starter || 0,
    pricing_professional: serviceData?.pricing?.professional || 0,
    pricing_enterprise: serviceData?.pricing?.enterprise || 0,
    delivery_time_en: serviceData?.delivery_time_en || '',
    delivery_time_tr: serviceData?.delivery_time_tr || '',
    status: serviceData?.status || 'active'
  });

  const handleAddFeature = () => {
    setFormData({
      ...formData,
      features_en: [...formData.features_en, ''],
      features_tr: [...formData.features_tr, '']
    });
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features_en: formData.features_en.filter((_, i) => i !== index),
      features_tr: formData.features_tr.filter((_, i) => i !== index)
    });
  };

  const handleFeatureChange = (index: number, language: 'en' | 'tr', value: string) => {
    const key = language === 'en' ? 'features_en' : 'features_tr';
    const newFeatures = [...formData[key]];
    newFeatures[index] = value;
    setFormData({ ...formData, [key]: newFeatures });
  };

  const handleSave = () => {
    // TODO: API Call - PUT /api/services/${serviceData.id}
    console.log('TODO: API Call - PUT /api/services/' + serviceData.id, formData);
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Edit Service Content</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Service Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Service Name (English)
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Service Name (Turkish)
              </label>
              <input
                type="text"
                value={formData.name_tr}
                onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (English)
              </label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Turkish)
              </label>
              <textarea
                value={formData.description_tr}
                onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">Features</label>
              <button
                onClick={handleAddFeature}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </button>
            </div>

            <div className="space-y-3">
              {formData.features_en.map((_, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 items-start">
                  <input
                    type="text"
                    placeholder="English feature"
                    value={formData.features_en[index]}
                    onChange={(e) => handleFeatureChange(index, 'en', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Turkish feature"
                      value={formData.features_tr[index]}
                      onChange={(e) => handleFeatureChange(index, 'tr', e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleRemoveFeature(index)}
                      className="p-2 hover:bg-gray-700 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">Pricing</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Starter ($)</label>
                <input
                  type="number"
                  value={formData.pricing_starter}
                  onChange={(e) => setFormData({ ...formData, pricing_starter: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Professional ($)</label>
                <input
                  type="number"
                  value={formData.pricing_professional}
                  onChange={(e) => setFormData({ ...formData, pricing_professional: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Enterprise ($)</label>
                <input
                  type="number"
                  value={formData.pricing_enterprise}
                  onChange={(e) => setFormData({ ...formData, pricing_enterprise: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Delivery Time (English)
              </label>
              <input
                type="text"
                value={formData.delivery_time_en}
                onChange={(e) => setFormData({ ...formData, delivery_time_en: e.target.value })}
                placeholder="e.g., 2-3 business days"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Delivery Time (Turkish)
              </label>
              <input
                type="text"
                value={formData.delivery_time_tr}
                onChange={(e) => setFormData({ ...formData, delivery_time_tr: e.target.value })}
                placeholder="e.g., 2-3 iş günü"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Service Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Service Status</label>
            <div className="flex gap-4">
              {['active', 'maintenance', 'inactive'].map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={formData.status === status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-300 capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
