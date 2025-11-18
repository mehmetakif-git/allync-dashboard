import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { SheetsInstance } from '../../lib/api/sheetsInstances';
import { supabase } from '../../lib/supabase';
import { createIntegrationLog } from '../../lib/api/integrationLogs';
import { useAuth } from '../../contexts/AuthContext';
import ServiceAccountEmail from '../ServiceAccountEmail';
import HelpPopup, { SheetIDHelp } from '../HelpPopup';

interface SheetsInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance?: SheetsInstance | null;
  companyId: string;
  onSuccess: () => void;
}

const PURPOSE_OPTIONS = [
  { value: 'price_list', label: 'Fiyat Listesi (Price List)' },
  { value: 'product_catalog', label: 'Ürün Kataloğu (Product Catalog)' },
  { value: 'stock_tracking', label: 'Stok Takibi (Stock Tracking)' },
  { value: 'general', label: 'Genel (General)' }
];

const INTENT_OPTIONS = [
  { value: 'price_query', label: 'Fiyat Sorgusu (Price Query)' },
  { value: 'stock_check', label: 'Stok Kontrolü (Stock Check)' },
  { value: 'product_info', label: 'Ürün Bilgisi (Product Info)' },
  { value: 'general_query', label: 'Genel Sorgu (General Query)' }
];

export default function SheetsInstanceModal({
  isOpen,
  onClose,
  instance,
  companyId,
  onSuccess
}: SheetsInstanceModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    google_sheet_id: '',
    google_sheet_name: '',
    worksheet_name: 'Sheet1',
    purpose: 'price_list',
    supported_intents: ['price_query'] as string[],
    is_primary: false,
    auto_sync_enabled: true,
    sync_interval_minutes: 15,
    whatsapp_integration_enabled: true,
    status: 'active' as 'active' | 'inactive',
    n8n_workflow_id: '',
    n8n_webhook_url: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showIDHelp, setShowIDHelp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (instance) {
        // Edit mode - populate form
        setFormData({
          google_sheet_id: instance.google_sheet_id || '',
          google_sheet_name: instance.google_sheet_name || '',
          worksheet_name: (instance as any).worksheet_name || 'Sheet1',
          purpose: (instance as any).purpose || 'price_list',
          supported_intents: (instance as any).supported_intents || ['price_query'],
          is_primary: (instance as any).is_primary || false,
          auto_sync_enabled: instance.auto_sync_enabled ?? true,
          sync_interval_minutes: instance.sync_interval_minutes || 15,
          whatsapp_integration_enabled: instance.whatsapp_integration_enabled ?? true,
          status: instance.status as 'active' | 'inactive',
          n8n_workflow_id: instance.n8n_workflow_id || '',
          n8n_webhook_url: instance.n8n_webhook_url || '',
        });
      } else {
        // Create mode - reset form
        setFormData({
          google_sheet_id: '',
          google_sheet_name: '',
          worksheet_name: 'Sheet1',
          purpose: 'price_list',
          supported_intents: ['price_query'],
          is_primary: false,
          auto_sync_enabled: true,
          sync_interval_minutes: 15,
          whatsapp_integration_enabled: true,
          status: 'active',
          n8n_workflow_id: '',
          n8n_webhook_url: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, instance]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.google_sheet_id.trim()) {
      newErrors.google_sheet_id = 'Google Sheet ID zorunludur';
    }

    if (!formData.worksheet_name.trim()) {
      newErrors.worksheet_name = 'Worksheet adı zorunludur';
    }

    if (!formData.purpose) {
      newErrors.purpose = 'Kullanım amacı seçmelisiniz';
    }

    if (formData.supported_intents.length === 0) {
      newErrors.supported_intents = 'En az bir intent seçmelisiniz';
    }

    if (formData.sync_interval_minutes < 1) {
      newErrors.sync_interval_minutes = 'Senkronizasyon aralığı en az 1 dakika olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Generate Google Sheet URL from ID
      const google_sheet_url = `https://docs.google.com/spreadsheets/d/${formData.google_sheet_id}/edit`;

      const dataToSave = {
        company_id: companyId,
        google_sheet_id: formData.google_sheet_id,
        google_sheet_name: formData.google_sheet_name || null,
        google_sheet_url: google_sheet_url,
        worksheet_name: formData.worksheet_name,
        purpose: formData.purpose,
        supported_intents: formData.supported_intents,
        is_primary: formData.is_primary,
        google_service_account_email: 'allync-bot@allync-platform.iam.gserviceaccount.com',
        auto_sync_enabled: formData.auto_sync_enabled,
        sync_interval_minutes: formData.sync_interval_minutes,
        whatsapp_integration_enabled: formData.whatsapp_integration_enabled,
        status: formData.status,
        n8n_workflow_id: formData.n8n_workflow_id || null,
        n8n_webhook_url: formData.n8n_webhook_url || null,
        active_worksheets: {},
        data_mapping: {},
      };

      // If setting as primary, unset other primary sheets for this purpose
      if (formData.is_primary) {
        await supabase
          .from('sheets_instances')
          .update({ is_primary: false })
          .eq('company_id', companyId)
          .eq('purpose', formData.purpose)
          .neq('id', instance?.id || '');
      }

      if (instance) {
        // Update existing
        const { error } = await supabase
          .from('sheets_instances')
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq('id', instance.id);

        if (error) throw error;
        console.log('✅ Product Catalog updated successfully');

        // Log the update
        try {
          await createIntegrationLog({
            company_id: companyId,
            user_id: user?.id || null,
            action: 'update',
            entity_type: 'sheets_instance',
            entity_id: instance.id,
            description: `Updated product catalog: ${formData.google_sheet_name}`,
            details: {
              sheet_name: formData.google_sheet_name,
              worksheet_name: formData.worksheet_name,
              purpose: formData.purpose,
              supported_intents: formData.supported_intents,
              is_primary: formData.is_primary,
            },
            changed_data: {
              old: instance,
              new: dataToSave,
            },
          });
        } catch (logError) {
          console.warn('Failed to create activity log:', logError);
        }
      } else {
        // Create new
        const { data: newSheet, error } = await supabase
          .from('sheets_instances')
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;
        console.log('✅ Product Catalog created successfully');

        // Log the creation
        try {
          await createIntegrationLog({
            company_id: companyId,
            user_id: user?.id || null,
            action: 'create',
            entity_type: 'sheets_instance',
            entity_id: newSheet.id,
            description: `Created product catalog: ${formData.google_sheet_name}`,
            details: {
              sheet_name: formData.google_sheet_name,
              worksheet_name: formData.worksheet_name,
              purpose: formData.purpose,
              supported_intents: formData.supported_intents,
              is_primary: formData.is_primary,
              google_sheet_id: formData.google_sheet_id,
            },
          });
        } catch (logError) {
          console.warn('Failed to create activity log:', logError);
        }
      }

      onSuccess();
    } catch (error: any) {
      console.error('❌ Error saving product catalog:', error);
      setErrors({ submit: error.message || 'Failed to save product catalog' });
    } finally {
      setLoading(false);
    }
  };

  const toggleIntent = (intent: string) => {
    setFormData(prev => ({
      ...prev,
      supported_intents: prev.supported_intents.includes(intent)
        ? prev.supported_intents.filter(i => i !== intent)
        : [...prev.supported_intents, intent]
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/20 p-6 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {instance ? 'Edit Product Catalog' : 'Add Product Catalog'}
                  </h3>
                  <p className="text-sm text-muted">Configure Google Sheets integration for WhatsApp</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="space-y-5">
              {/* Service Account Email Warning */}
              <ServiceAccountEmail variant="sheets" />

              {/* Sheet Name (Optional) */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Sheet Adı (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  value={formData.google_sheet_name}
                  onChange={(e) => setFormData({ ...formData, google_sheet_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Örnek: Ürün Fiyatları"
                />
                <p className="text-xs text-muted mt-1">
                  Bu isim sadece panel'de gösterilecektir
                </p>
              </div>

              {/* Google Sheet ID */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Google Sheet ID *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.google_sheet_id}
                    onChange={(e) => setFormData({ ...formData, google_sheet_id: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  />
                  <button
                    type="button"
                    onClick={() => setShowIDHelp(true)}
                    className="px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 font-medium transition-colors flex items-center gap-2"
                    title="Nasıl bulunur?"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Nasıl?
                  </button>
                </div>
                {errors.google_sheet_id && (
                  <p className="text-red-400 text-xs mt-1">{errors.google_sheet_id}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  💡 URL'den kopyalayın: /d/<span className="text-green-400">[BU KISIM]</span>/edit
                </p>
              </div>

              {/* Worksheet Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Worksheet Adı *
                </label>
                <input
                  type="text"
                  value={formData.worksheet_name}
                  onChange={(e) => setFormData({ ...formData, worksheet_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Sheet1"
                />
                {errors.worksheet_name && (
                  <p className="text-red-400 text-xs mt-1">{errors.worksheet_name}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  💡 Alttaki sekme adı (Sheet1, Ürünler, vs.)
                </p>
              </div>

              {/* Purpose Dropdown */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Kullanım Amacı (Purpose) *
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {PURPOSE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.purpose && (
                  <p className="text-red-400 text-xs mt-1">{errors.purpose}</p>
                )}
              </div>

              {/* Supported Intents */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Desteklenen Intent'ler *
                </label>
                <div className="space-y-2">
                  {INTENT_OPTIONS.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.supported_intents.includes(option.value)}
                        onChange={() => toggleIntent(option.value)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm text-white">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.supported_intents && (
                  <p className="text-red-400 text-xs mt-1">{errors.supported_intents}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  AI bu intent'leri algıladığında bu sheet'i kullanacaktır
                </p>
              </div>

              {/* Is Primary Checkbox */}
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="is_primary" className="text-sm text-white cursor-pointer flex-1">
                  ⭐ Ana sheet olarak ayarla (Bu purpose için varsayılan)
                </label>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 my-4"></div>

              {/* WhatsApp Integration */}
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  id="whatsapp_integration"
                  checked={formData.whatsapp_integration_enabled}
                  onChange={(e) => setFormData({ ...formData, whatsapp_integration_enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="whatsapp_integration" className="text-sm text-white cursor-pointer">
                  WhatsApp Entegrasyonunu Aktif Et
                </label>
              </div>

              {/* Auto Sync */}
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  id="auto_sync"
                  checked={formData.auto_sync_enabled}
                  onChange={(e) => setFormData({ ...formData, auto_sync_enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="auto_sync" className="text-sm text-white cursor-pointer">
                  Otomatik Senkronizasyonu Aktif Et
                </label>
              </div>

              {/* Sync Interval */}
              {formData.auto_sync_enabled && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Senkronizasyon Aralığı (dakika)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={formData.sync_interval_minutes}
                    onChange={(e) => setFormData({ ...formData, sync_interval_minutes: parseInt(e.target.value) || 15 })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.sync_interval_minutes && (
                    <p className="text-red-400 text-xs mt-1">{errors.sync_interval_minutes}</p>
                  )}
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Durum
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active" className="bg-slate-800 text-white">Aktif</option>
                  <option value="inactive" className="bg-slate-800 text-white">İnaktif</option>
                </select>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{errors.submit}</p>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/20 p-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {instance ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {instance ? 'Güncelle' : 'Kaydet'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Help Popup */}
      <HelpPopup
        isOpen={showIDHelp}
        onClose={() => setShowIDHelp(false)}
        title="Google Sheet ID Nasıl Bulunur?"
      >
        <SheetIDHelp />
      </HelpPopup>
    </>
  );
}
