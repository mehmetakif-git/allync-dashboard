import React, { useState, useEffect } from 'react';
import { X, Star, Loader2, CheckCircle, AlertCircle, Phone, User, Shield } from 'lucide-react';
import { PrivilegedContact } from '../../lib/api/privilegedContacts';
import { createPrivilegedContact, updatePrivilegedContact } from '../../lib/api/privilegedContacts';
import { createIntegrationLog } from '../../lib/api/integrationLogs';
import { useAuth } from '../../contexts/AuthContext';

interface PrivilegedContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
  contact?: PrivilegedContact | null; // null for create, object for edit
}

const PRIVILEGE_LEVELS = [
  { value: 'owner', label: '👑 Firma Sahibi', color: 'amber' },
  { value: 'manager', label: '👔 Yönetici', color: 'purple' },
  { value: 'employee', label: '👷 Çalışan', color: 'blue' },
  { value: 'vip_customer', label: '⭐ VIP Müşteri', color: 'pink' },
] as const;

const RESPONSE_STYLES = [
  { value: 'formal', label: 'Resmi' },
  { value: 'casual', label: 'Rahat' },
  { value: 'friendly', label: 'Samimi' },
] as const;

const FEATURE_PERMISSIONS = [
  { key: 'view_stock', label: 'Stok Görüntüleme', icon: '📦' },
  { key: 'export_data', label: 'Veri Export', icon: '📤' },
  { key: 'view_reports', label: 'Rapor Görüntüleme', icon: '📊' },
  { key: 'modify_appointments', label: 'Randevu Düzenleme', icon: '📅' },
  { key: 'access_customer_data', label: 'Müşteri Bilgilerine Erişim', icon: '👥' },
  { key: 'view_all_appointments', label: 'Tüm Randevuları Görüntüleme', icon: '🗓️' },
] as const;

export default function PrivilegedContactModal({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  contact
}: PrivilegedContactModalProps) {
  const { user } = useAuth();
  const isEditMode = !!contact;

  const [formData, setFormData] = useState({
    contact_name: '',
    contact_phone: '',
    privilege_level: 'owner' as 'owner' | 'manager' | 'employee' | 'vip_customer',
    allowed_features: {
      view_stock: false,
      export_data: false,
      view_reports: false,
      modify_appointments: false,
      access_customer_data: false,
      view_all_appointments: false,
    },
    greeting_name: '',
    response_style: 'formal',
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load contact data when editing
  useEffect(() => {
    if (contact) {
      setFormData({
        contact_name: contact.contact_name,
        contact_phone: contact.contact_phone,
        privilege_level: contact.privilege_level,
        allowed_features: contact.allowed_features,
        greeting_name: contact.greeting_name || '',
        response_style: contact.response_style,
        is_active: contact.is_active,
      });
    } else {
      // Reset form for create mode
      setFormData({
        contact_name: '',
        contact_phone: '',
        privilege_level: 'owner',
        allowed_features: {
          view_stock: false,
          export_data: false,
          view_reports: false,
          modify_appointments: false,
          access_customer_data: false,
          view_all_appointments: false,
        },
        greeting_name: '',
        response_style: 'formal',
        is_active: true,
      });
    }
    setErrors({});
  }, [contact, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.contact_name.trim()) {
      newErrors.contact_name = 'İsim gerekli';
    }

    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = 'Telefon numarası gerekli';
    } else {
      // Basic phone validation
      const phoneRegex = /^\+?[0-9\s-()]+$/;
      if (!phoneRegex.test(formData.contact_phone)) {
        newErrors.contact_phone = 'Geçerli bir telefon numarası girin';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const dataToSave = {
        company_id: companyId,
        contact_name: formData.contact_name.trim(),
        contact_phone: formData.contact_phone.trim(),
        privilege_level: formData.privilege_level,
        allowed_features: formData.allowed_features,
        greeting_name: formData.greeting_name.trim() || null,
        response_style: formData.response_style,
        is_active: formData.is_active,
      };

      if (isEditMode && contact) {
        // Update existing
        await updatePrivilegedContact(contact.id, dataToSave);
        console.log('✅ Privileged contact updated successfully');

        // Log the update
        try {
          await createIntegrationLog({
            company_id: companyId,
            user_id: user?.id || null,
            action: 'update',
            entity_type: 'privileged_contact' as any,
            entity_id: contact.id,
            description: `Updated privileged contact: ${formData.contact_name}`,
            details: {
              contact_name: formData.contact_name,
              contact_phone: formData.contact_phone,
              privilege_level: formData.privilege_level,
              is_active: formData.is_active,
            },
            changed_data: {
              old: contact,
              new: dataToSave,
            },
          });
        } catch (logError) {
          console.warn('Failed to create activity log:', logError);
        }
      } else {
        // Create new
        const newContact = await createPrivilegedContact(dataToSave);
        console.log('✅ Privileged contact created successfully');

        // Log the creation
        try {
          await createIntegrationLog({
            company_id: companyId,
            user_id: user?.id || null,
            action: 'create',
            entity_type: 'privileged_contact' as any,
            entity_id: newContact.id,
            description: `Created privileged contact: ${formData.contact_name}`,
            details: {
              contact_name: formData.contact_name,
              contact_phone: formData.contact_phone,
              privilege_level: formData.privilege_level,
            },
          });
        } catch (logError) {
          console.warn('Failed to create activity log:', logError);
        }
      }

      onSuccess();
    } catch (error: any) {
      console.error('❌ Error saving privileged contact:', error);
      setErrors({ submit: error.message || 'Failed to save privileged contact' });
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (feature: keyof typeof formData.allowed_features) => {
    setFormData({
      ...formData,
      allowed_features: {
        ...formData.allowed_features,
        [feature]: !formData.allowed_features[feature],
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-slate-900 to-slate-800 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditMode ? 'Yetkili Kişiyi Düzenle' : 'Yeni Yetkili Kişi Ekle'}
              </h2>
              <p className="text-xs text-gray-400">
                {isEditMode ? 'Özel izinleri ve bilgileri güncelleyin' : 'Maksimum 2 yetkili kişi ekleyebilirsiniz'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
              <User className="w-4 h-4" />
              Temel Bilgiler
            </h3>

            {/* Contact Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                İsim <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="Örn: Ahmet Yılmaz"
                className={`w-full px-4 py-2.5 bg-white/5 border ${
                  errors.contact_name ? 'border-red-500/50' : 'border-white/10'
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
              />
              {errors.contact_name && (
                <p className="mt-1 text-xs text-red-400">{errors.contact_name}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Telefon Numarası <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+90 5XX XXX XX XX"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/5 border ${
                    errors.contact_phone ? 'border-red-500/50' : 'border-white/10'
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
              </div>
              {errors.contact_phone && (
                <p className="mt-1 text-xs text-red-400">{errors.contact_phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Örn: +905551234567 veya 05551234567
              </p>
            </div>
          </div>

          {/* Privilege Level */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Yetki Seviyesi
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {PRIVILEGE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, privilege_level: level.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.privilege_level === level.value
                      ? `border-${level.color}-500 bg-${level.color}-500/10`
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <p className={`text-sm font-medium ${
                    formData.privilege_level === level.value ? 'text-white' : 'text-gray-300'
                  }`}>
                    {level.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Permissions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              İzinler
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURE_PERMISSIONS.map((feature) => (
                <label
                  key={feature.key}
                  className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.allowed_features[feature.key as keyof typeof formData.allowed_features]}
                    onChange={() => toggleFeature(feature.key as keyof typeof formData.allowed_features)}
                    className="w-4 h-4 text-amber-500 bg-white/5 border-white/20 rounded focus:ring-amber-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-300">
                    {feature.icon} {feature.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Personalization */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Kişiselleştirme
            </h3>

            {/* Greeting Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selamlama Adı (Opsiyonel)
              </label>
              <input
                type="text"
                value={formData.greeting_name}
                onChange={(e) => setFormData({ ...formData, greeting_name: e.target.value })}
                placeholder="Örn: Ahmet Bey"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Bot bu isimle selamlama yapacak
              </p>
            </div>

            {/* Response Style */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Yanıt Stili
              </label>
              <select
                value={formData.response_style}
                onChange={(e) => setFormData({ ...formData, response_style: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {RESPONSE_STYLES.map((style) => (
                  <option key={style.value} value={style.value} className="bg-slate-800 text-white">
                    {style.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status (Edit Mode Only) */}
          {isEditMode && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-amber-400">Durum</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Aktif Durumu
                </label>
                <select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="active" className="bg-slate-800 text-white">Aktif</option>
                  <option value="inactive" className="bg-slate-800 text-white">İnaktif</option>
                </select>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {isEditMode ? 'Güncelle' : 'Ekle'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
