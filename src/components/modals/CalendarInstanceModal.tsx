import React, { useState, useEffect } from 'react';
import { X, Calendar, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { CalendarInstance } from '../../lib/api/calendarInstances';
import { supabase } from '../../lib/supabase';

interface CalendarInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance?: CalendarInstance | null;
  companyId: string;
  onSuccess: () => void;
}

export default function CalendarInstanceModal({
  isOpen,
  onClose,
  instance,
  companyId,
  onSuccess
}: CalendarInstanceModalProps) {
  const [formData, setFormData] = useState({
    instance_name: '',
    google_calendar_id: '',
    calendar_name: '',
    timezone: 'America/New_York',
    auto_approve_appointments: false,
    status: 'active' as 'active' | 'inactive',
    n8n_workflow_id: '',
    n8n_webhook_url: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (instance) {
        // Edit mode - populate form
        setFormData({
          instance_name: instance.instance_name || '',
          google_calendar_id: instance.google_calendar_id || '',
          calendar_name: instance.calendar_name || '',
          timezone: instance.timezone || 'America/New_York',
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
          timezone: 'America/New_York',
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
      newErrors.instance_name = 'Instance name is required';
    }

    if (!formData.google_calendar_id.trim()) {
      newErrors.google_calendar_id = 'Google Calendar ID is required';
    }

    if (!formData.timezone) {
      newErrors.timezone = 'Timezone is required';
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
        timezone: formData.timezone,
        auto_approve_appointments: formData.auto_approve_appointments,
        status: formData.status,
        n8n_workflow_id: formData.n8n_workflow_id || null,
        n8n_webhook_url: formData.n8n_webhook_url || null,
        settings: {},
        business_hours: {},
      };

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
        console.log('✅ Calendar instance updated successfully');
      } else {
        // Create new
        const { error } = await supabase
          .from('calendar_instances')
          .insert([dataToSave]);

        if (error) throw error;
        console.log('✅ Calendar instance created successfully');
      }

      onSuccess();
    } catch (error: any) {
      console.error('❌ Error saving calendar instance:', error);
      setErrors({ submit: error.message || 'Failed to save calendar instance' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gradient-to-br from-secondary/95 via-primary/95 to-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {instance ? 'Edit Calendar Instance' : 'Add Calendar Instance'}
                </h3>
                <p className="text-sm text-muted">Configure Google Calendar integration</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-4">
            {/* Instance Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Instance Name *
              </label>
              <input
                type="text"
                value={formData.instance_name}
                onChange={(e) => setFormData({ ...formData, instance_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Main Calendar"
              />
              {errors.instance_name && (
                <p className="text-red-400 text-xs mt-1">{errors.instance_name}</p>
              )}
            </div>

            {/* Google Calendar ID */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Google Calendar ID *
              </label>
              <input
                type="text"
                value={formData.google_calendar_id}
                onChange={(e) => setFormData({ ...formData, google_calendar_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="e.g., primary or xyz@group.calendar.google.com"
              />
              {errors.google_calendar_id && (
                <p className="text-red-400 text-xs mt-1">{errors.google_calendar_id}</p>
              )}
              <p className="text-xs text-muted mt-1">
                Find this in Google Calendar settings under "Calendar ID"
              </p>
            </div>

            {/* Calendar Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Calendar Display Name
              </label>
              <input
                type="text"
                value={formData.calendar_name}
                onChange={(e) => setFormData({ ...formData, calendar_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional display name"
              />
            </div>

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
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                <option value="America/Denver">America/Denver (MST/MDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
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
                Auto-approve appointments (appointments will be automatically confirmed)
              </label>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* N8N Workflow ID */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                N8N Workflow ID
              </label>
              <input
                type="text"
                value={formData.n8n_workflow_id}
                onChange={(e) => setFormData({ ...formData, n8n_workflow_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Optional N8N workflow ID"
              />
            </div>

            {/* N8N Webhook URL */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                N8N Webhook URL
              </label>
              <input
                type="url"
                value={formData.n8n_webhook_url}
                onChange={(e) => setFormData({ ...formData, n8n_webhook_url: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="https://your-n8n-instance.com/webhook/..."
              />
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
        <div className="p-6 border-t border-white/10 bg-secondary/30 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {instance ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {instance ? 'Update' : 'Create'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
