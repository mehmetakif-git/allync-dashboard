import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { SheetsInstance } from '../../lib/api/sheetsInstances';
import { supabase } from '../../lib/supabase';

interface SheetsInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance?: SheetsInstance | null;
  companyId: string;
  onSuccess: () => void;
}

export default function SheetsInstanceModal({
  isOpen,
  onClose,
  instance,
  companyId,
  onSuccess
}: SheetsInstanceModalProps) {
  const [formData, setFormData] = useState({
    google_sheet_id: '',
    google_sheet_name: '',
    google_sheet_url: '',
    google_service_account_email: '',
    auto_sync_enabled: true,
    sync_interval_minutes: 15,
    whatsapp_integration_enabled: true,
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
          google_sheet_id: instance.google_sheet_id || '',
          google_sheet_name: instance.google_sheet_name || '',
          google_sheet_url: instance.google_sheet_url || '',
          google_service_account_email: instance.google_service_account_email || '',
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
          google_sheet_url: '',
          google_service_account_email: '',
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
      newErrors.google_sheet_id = 'Google Sheet ID is required';
    }

    if (!formData.google_sheet_name.trim()) {
      newErrors.google_sheet_name = 'Sheet name is required';
    }

    if (formData.sync_interval_minutes < 1) {
      newErrors.sync_interval_minutes = 'Sync interval must be at least 1 minute';
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
        google_sheet_id: formData.google_sheet_id,
        google_sheet_name: formData.google_sheet_name,
        google_sheet_url: formData.google_sheet_url || null,
        google_service_account_email: formData.google_service_account_email || null,
        auto_sync_enabled: formData.auto_sync_enabled,
        sync_interval_minutes: formData.sync_interval_minutes,
        whatsapp_integration_enabled: formData.whatsapp_integration_enabled,
        status: formData.status,
        n8n_workflow_id: formData.n8n_workflow_id || null,
        n8n_webhook_url: formData.n8n_webhook_url || null,
        active_worksheets: {},
        data_mapping: {},
      };

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
        console.log('✅ Sheets instance updated successfully');
      } else {
        // Create new
        const { error } = await supabase
          .from('sheets_instances')
          .insert([dataToSave]);

        if (error) throw error;
        console.log('✅ Sheets instance created successfully');
      }

      onSuccess();
    } catch (error: any) {
      console.error('❌ Error saving sheets instance:', error);
      setErrors({ submit: error.message || 'Failed to save sheets instance' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gradient-to-br from-secondary/95 via-primary/95 to-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {instance ? 'Edit Sheets Instance' : 'Add Sheets Instance'}
                </h3>
                <p className="text-sm text-muted">Configure Google Sheets integration</p>
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
            {/* Sheet Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Sheet Name *
              </label>
              <input
                type="text"
                value={formData.google_sheet_name}
                onChange={(e) => setFormData({ ...formData, google_sheet_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Customer Data"
              />
              {errors.google_sheet_name && (
                <p className="text-red-400 text-xs mt-1">{errors.google_sheet_name}</p>
              )}
            </div>

            {/* Google Sheet ID */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Google Sheet ID *
              </label>
              <input
                type="text"
                value={formData.google_sheet_id}
                onChange={(e) => setFormData({ ...formData, google_sheet_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              />
              {errors.google_sheet_id && (
                <p className="text-red-400 text-xs mt-1">{errors.google_sheet_id}</p>
              )}
              <p className="text-xs text-muted mt-1">
                Found in the Sheet URL: docs.google.com/spreadsheets/d/[SHEET_ID]/edit
              </p>
            </div>

            {/* Google Sheet URL */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Google Sheet URL
              </label>
              <input
                type="url"
                value={formData.google_sheet_url}
                onChange={(e) => setFormData({ ...formData, google_sheet_url: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>

            {/* Service Account Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Google Service Account Email
              </label>
              <input
                type="email"
                value={formData.google_service_account_email}
                onChange={(e) => setFormData({ ...formData, google_service_account_email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="service-account@project.iam.gserviceaccount.com"
              />
              <p className="text-xs text-muted mt-1">
                Share the Google Sheet with this email for API access
              </p>
            </div>

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
                Enable WhatsApp Integration (sync data to/from WhatsApp)
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
                Enable Auto Sync (automatically sync data at intervals)
              </label>
            </div>

            {/* Sync Interval */}
            {formData.auto_sync_enabled && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Sync Interval (minutes)
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
                <p className="text-xs text-muted mt-1">
                  How often to sync data (1-1440 minutes)
                </p>
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
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
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
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
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity disabled:opacity-50 flex items-center gap-2"
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
