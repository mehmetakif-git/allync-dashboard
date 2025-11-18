import React, { useState, useEffect } from 'react';
import { X, Calendar, Loader2, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { CalendarInstance } from '../../lib/api/calendarInstances';
import { supabase } from '../../lib/supabase';
import { createIntegrationLog } from '../../lib/api/integrationLogs';
import { useAuth } from '../../contexts/AuthContext';
import ServiceAccountEmail from '../ServiceAccountEmail';
import HelpPopup, { CalendarIDHelp } from '../HelpPopup';

interface CalendarInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance?: CalendarInstance | null;
  companyId: string;
  onSuccess: () => void;
}

const PURPOSE_OPTIONS = [
  { value: 'appointment', label: 'Randevu (Appointment)' },
  { value: 'meeting', label: 'Toplantı (Meeting)' },
  { value: 'support', label: 'Destek (Support)' },
  { value: 'general', label: 'Genel (General)' }
];

export default function CalendarInstanceModal({
  isOpen,
  onClose,
  instance,
  companyId,
  onSuccess
}: CalendarInstanceModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    instance_name: '',
    google_calendar_id: '',
    calendar_name: '',
    purpose: 'appointment',
    default_duration_minutes: 60,
    is_primary: false,
    timezone: 'Europe/Istanbul',
    auto_approve_appointments: false,
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
        const settings = instance.settings as any || {};
        setFormData({
          instance_name: instance.instance_name || '',
          google_calendar_id: instance.google_calendar_id || '',
          calendar_name: instance.calendar_name || '',
          purpose: (instance as any).purpose || 'appointment',
          default_duration_minutes: settings.default_duration_minutes || 60,
          is_primary: (instance as any).is_primary || false,
          timezone: instance.timezone || 'Europe/Istanbul',
          auto_approve_appointments: instance.auto_approve_appointments || false,
          status: instance.status as 'active' | 'inactive',
          n8n_workflow_id: instance.n8n_workflow_id || '',
          n8n_webhook_url: instance.n8n_webhook_url || '',
        });
      } else {
        // Create mode - reset form
        setFormData({
          instance_name: '',
          google_calendar_id: '',
          calendar_name: '',
          purpose: 'appointment',
          default_duration_minutes: 60,
          is_primary: false,
          timezone: 'Europe/Istanbul',
          auto_approve_appointments: false,
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

    if (!formData.instance_name.trim()) {
      newErrors.instance_name = 'Calendar adı zorunludur';
    }

    if (!formData.google_calendar_id.trim()) {
      newErrors.google_calendar_id = 'Google Calendar ID zorunludur';
    }

    if (!formData.timezone) {
      newErrors.timezone = 'Timezone seçmelisiniz';
    }

    if (!formData.purpose) {
      newErrors.purpose = 'Kullanım amacı seçmelisiniz';
    }

    if (formData.default_duration_minutes < 5) {
      newErrors.default_duration_minutes = 'Varsayılan süre en az 5 dakika olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const dataToSave = {
        company_id: companyId,
        instance_name: formData.instance_name,
        google_calendar_id: formData.google_calendar_id,
        calendar_name: formData.calendar_name || null,
        purpose: formData.purpose,
        is_primary: formData.is_primary,
        timezone: formData.timezone,
        auto_approve_appointments: formData.auto_approve_appointments,
        status: formData.status,
        n8n_workflow_id: formData.n8n_workflow_id || null,
        n8n_webhook_url: formData.n8n_webhook_url || null,
        settings: {
          default_duration_minutes: formData.default_duration_minutes,
          service_account_email: 'allync-bot@allync-platform.iam.gserviceaccount.com'
        },
        business_hours: {},
      };

      // If setting as primary, unset other primary calendars for this purpose
      if (formData.is_primary) {
        await supabase
          .from('calendar_instances')
          .update({ is_primary: false })
          .eq('company_id', companyId)
          .eq('purpose', formData.purpose)
          .neq('id', instance?.id || '');
      }

      if (instance) {
        // Update existing
        const { error } = await supabase
          .from('calendar_instances')
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq('id', instance.id);

        if (error) throw error;
        console.log('✅ Appointment Calendar updated successfully');

        // Log the update
        try {
          await createIntegrationLog({
            company_id: companyId,
            user_id: user?.id || null,
            action: 'update',
            entity_type: 'calendar_instance',
            entity_id: instance.id,
            description: `Updated appointment calendar: ${formData.instance_name}`,
            details: {
              calendar_name: formData.calendar_name,
              purpose: formData.purpose,
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
        const { data: newCalendar, error } = await supabase
          .from('calendar_instances')
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;
        console.log('✅ Appointment Calendar created successfully');

        // Log the creation
        try {
          await createIntegrationLog({
            company_id: companyId,
            user_id: user?.id || null,
            action: 'create',
            entity_type: 'calendar_instance',
            entity_id: newCalendar.id,
            description: `Created appointment calendar: ${formData.instance_name}`,
            details: {
              calendar_name: formData.calendar_name,
              purpose: formData.purpose,
              is_primary: formData.is_primary,
              google_calendar_id: formData.google_calendar_id,
            },
          });
        } catch (logError) {
          console.warn('Failed to create activity log:', logError);
        }
      }

      onSuccess();
    } catch (error: any) {
      console.error('❌ Error saving appointment calendar:', error);
      setErrors({ submit: error.message || 'Failed to save appointment calendar' });
    } finally {
      setLoading(false);
    }
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {instance ? 'Edit Appointment Calendar' : 'Add Appointment Calendar'}
                  </h3>
                  <p className="text-sm text-muted">Configure Google Calendar integration for WhatsApp</p>
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
              <ServiceAccountEmail variant="calendar" />

              {/* Calendar Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Calendar Adı *
                </label>
                <input
                  type="text"
                  value={formData.instance_name}
                  onChange={(e) => setFormData({ ...formData, instance_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örnek: Satış Randevuları"
                />
                {errors.instance_name && (
                  <p className="text-red-400 text-xs mt-1">{errors.instance_name}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  Bu isim panel'de gösterilecektir
                </p>
              </div>

              {/* Google Calendar ID */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Google Calendar ID *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.google_calendar_id}
                    onChange={(e) => setFormData({ ...formData, google_calendar_id: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="primary veya xyz@group.calendar.google.com"
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
                {errors.google_calendar_id && (
                  <p className="text-red-400 text-xs mt-1">{errors.google_calendar_id}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  💡 Calendar Settings → Integrate Calendar → Calendar ID
                </p>
              </div>

              {/* Calendar Display Name (Optional) */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Görünür İsim (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  value={formData.calendar_name}
                  onChange={(e) => setFormData({ ...formData, calendar_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional display name"
                />
                <p className="text-xs text-muted mt-1">
                  Bu isim WhatsApp mesajlarında gösterilecektir
                </p>
              </div>

              {/* Purpose Dropdown */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Kullanım Amacı (Intent) *
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Default Duration */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Varsayılan Süre (dakika) *
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  step="5"
                  value={formData.default_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, default_duration_minutes: parseInt(e.target.value) || 60 })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.default_duration_minutes && (
                  <p className="text-red-400 text-xs mt-1">{errors.default_duration_minutes}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  Randevuların varsayılan uzunluğu (5-480 dakika arası)
                </p>
              </div>

              {/* Is Primary Checkbox */}
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="is_primary" className="text-sm text-white cursor-pointer flex-1">
                  ⭐ Ana calendar olarak ayarla (Bu purpose için varsayılan)
                </label>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 my-4"></div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Timezone *
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Europe/Istanbul" className="bg-slate-800 text-white">Europe/Istanbul (TRT)</option>
                  <option value="America/New_York" className="bg-slate-800 text-white">America/New_York (EST/EDT)</option>
                  <option value="America/Los_Angeles" className="bg-slate-800 text-white">America/Los_Angeles (PST/PDT)</option>
                  <option value="America/Chicago" className="bg-slate-800 text-white">America/Chicago (CST/CDT)</option>
                  <option value="America/Denver" className="bg-slate-800 text-white">America/Denver (MST/MDT)</option>
                  <option value="Europe/London" className="bg-slate-800 text-white">Europe/London (GMT/BST)</option>
                  <option value="Europe/Paris" className="bg-slate-800 text-white">Europe/Paris (CET/CEST)</option>
                  <option value="Asia/Tokyo" className="bg-slate-800 text-white">Asia/Tokyo (JST)</option>
                  <option value="Asia/Shanghai" className="bg-slate-800 text-white">Asia/Shanghai (CST)</option>
                  <option value="Asia/Dubai" className="bg-slate-800 text-white">Asia/Dubai (GST)</option>
                  <option value="Australia/Sydney" className="bg-slate-800 text-white">Australia/Sydney (AEST/AEDT)</option>
                </select>
                {errors.timezone && (
                  <p className="text-red-400 text-xs mt-1">{errors.timezone}</p>
                )}
              </div>

              {/* Auto Approve */}
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  id="auto_approve"
                  checked={formData.auto_approve_appointments}
                  onChange={(e) => setFormData({ ...formData, auto_approve_appointments: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="auto_approve" className="text-sm text-white cursor-pointer">
                  Randevuları Otomatik Onayla (manuel onay gerektirmez)
                </label>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Durum
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity disabled:opacity-50 flex items-center gap-2"
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
        title="Google Calendar ID Nasıl Bulunur?"
      >
        <CalendarIDHelp />
      </HelpPopup>
    </>
  );
}
