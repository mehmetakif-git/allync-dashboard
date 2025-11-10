import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Loader2, CheckCircle, AlertCircle, QrCode } from 'lucide-react';
import { WhatsAppInstance, InstanceType } from '../../types/whatsapp';
import {
  createWhatsappInstance,
  updateWhatsappInstance,
  testConnection
} from '../../lib/api/whatsappInstances';
import { validatePhoneNumber, validateInstanceId, validateAPIKey } from '../../lib/utils/whatsappValidators';

interface WhatsAppInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance?: WhatsAppInstance | null;
  companyId: string;
  onSuccess: () => void;
}

export default function WhatsAppInstanceModal({
  isOpen,
  onClose,
  instance,
  companyId,
  onSuccess
}: WhatsAppInstanceModalProps) {
  const [formData, setFormData] = useState({
    instance_name: '',
    instance_id: '',
    phone_number: '',
    evolution_api_url: '',
    evolution_api_key: '',
    gemini_api_key: '',
    instance_type: 'support' as InstanceType,
    ai_system_prompt: '',
    auto_reply_enabled: true,
    business_hours_only: false,
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; qr_code?: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log('🔄 WhatsAppInstanceModal useEffect triggered', {
      isOpen,
      hasInstance: !!instance,
      instanceId: instance?.id,
      companyId
    });

    if (instance) {
      console.log('📝 Editing existing instance:', instance.instance_name);
      setFormData({
        instance_name: instance.instance_name || '',
        instance_id: instance.instance_id || '',
        phone_number: instance.phone_number || '',
        evolution_api_url: instance.evolution_api_url || '',
        evolution_api_key: instance.evolution_api_key || '',
        gemini_api_key: instance.gemini_api_key || '',
        instance_type: instance.instance_type || 'support',
        ai_system_prompt: instance.ai_system_prompt || '',
        auto_reply_enabled: instance.settings?.auto_reply_enabled ?? true,
        business_hours_only: instance.settings?.business_hours_only ?? false,
      });
    } else {
      // Reset for new instance
      console.log('✨ Creating new instance');
      setFormData({
        instance_name: '',
        instance_id: '',
        phone_number: '',
        evolution_api_url: '',
        evolution_api_key: '',
        gemini_api_key: '',
        instance_type: 'support',
        ai_system_prompt: 'You are a helpful customer service assistant. Be professional, friendly, and concise in your responses.',
        auto_reply_enabled: true,
        business_hours_only: false,
      });
    }
    setErrors({});
    setTestResult(null);
  }, [instance, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.instance_name.trim()) {
      newErrors.instance_name = 'Instance name is required';
    }

    if (!formData.instance_id.trim()) {
      newErrors.instance_id = 'Instance ID is required';
    } else if (!validateInstanceId(formData.instance_id)) {
      newErrors.instance_id = 'Instance ID can only contain letters, numbers, hyphens, and underscores';
    }

    if (formData.phone_number && !validatePhoneNumber(formData.phone_number)) {
      newErrors.phone_number = 'Invalid phone number format';
    }

    if (!formData.evolution_api_url.trim()) {
      newErrors.evolution_api_url = 'Evolution API URL is required';
    } else if (!formData.evolution_api_url.startsWith('http')) {
      newErrors.evolution_api_url = 'API URL must start with http:// or https://';
    }

    if (!formData.evolution_api_key.trim()) {
      newErrors.evolution_api_key = 'Evolution API key is required';
    } else if (!validateAPIKey(formData.evolution_api_key)) {
      newErrors.evolution_api_key = 'Invalid API key format';
    }

    if (formData.gemini_api_key && !validateAPIKey(formData.gemini_api_key)) {
      newErrors.gemini_api_key = 'Invalid Gemini API key format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!instance || !instance.id) {
      setTestResult({ success: false, message: 'Save instance first before testing connection' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testConnection(instance.id);
      setTestResult(result);
    } catch (error: any) {
      setTestResult({ success: false, message: error.message || 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent multiple submissions
    if (loading) {
      console.log('⚠️ Already submitting, ignoring duplicate request');
      return;
    }

    if (!validateForm()) {
      return;
    }

    console.log('💾 Submitting instance form...');
    setLoading(true);

    try {
      const instanceData = {
        company_id: companyId,
        instance_name: formData.instance_name,
        instance_id: formData.instance_id,
        phone_number: formData.phone_number || null,
        evolution_api_url: formData.evolution_api_url,
        evolution_api_key: formData.evolution_api_key,
        gemini_api_key: formData.gemini_api_key || null,
        instance_type: formData.instance_type,
        ai_system_prompt: formData.ai_system_prompt || null,
        settings: {
          auto_reply_enabled: formData.auto_reply_enabled,
          business_hours_only: formData.business_hours_only,
        },
      };

      if (instance?.id) {
        console.log('📝 Updating existing instance:', instance.id);
        await updateWhatsappInstance(instance.id, instanceData);
      } else {
        console.log('✨ Creating new instance');
        await createWhatsappInstance(instanceData);
      }

      console.log('✅ Instance saved successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save instance' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Don't render anything if companyId is missing
  if (!companyId) {
    console.error('❌ WhatsAppInstanceModal: No companyId provided');
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-secondary/95 via-primary/95 to-secondary/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <MessageCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {instance ? 'Edit WhatsApp Instance' : 'Create WhatsApp Instance'}
              </h2>
              <p className="text-sm text-muted mt-0.5">Configure Evolution API and AI settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Instance Name *
                </label>
                <input
                  type="text"
                  value={formData.instance_name}
                  onChange={(e) => setFormData({ ...formData, instance_name: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  placeholder="e.g., Customer Support Bot"
                />
                {errors.instance_name && (
                  <p className="text-red-400 text-xs mt-1">{errors.instance_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Instance ID *
                </label>
                <input
                  type="text"
                  value={formData.instance_id}
                  onChange={(e) => setFormData({ ...formData, instance_id: e.target.value })}
                  disabled={!!instance}
                  className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g., support-bot-001"
                />
                {errors.instance_id && (
                  <p className="text-red-400 text-xs mt-1">{errors.instance_id}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  placeholder="+1234567890"
                />
                {errors.phone_number && (
                  <p className="text-red-400 text-xs mt-1">{errors.phone_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Instance Type
                </label>
                <select
                  value={formData.instance_type}
                  onChange={(e) => setFormData({ ...formData, instance_type: e.target.value as InstanceType })}
                  className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  <option value="support" className="bg-slate-800 text-white">Support</option>
                  <option value="sales" className="bg-slate-800 text-white">Sales</option>
                  <option value="marketing" className="bg-slate-800 text-white">Marketing</option>
                  <option value="general" className="bg-slate-800 text-white">General</option>
                  <option value="info" className="bg-slate-800 text-white">Info</option>
                </select>
              </div>
            </div>
          </div>

          {/* Evolution API Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Evolution API Configuration</h3>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Evolution API URL *
              </label>
              <input
                type="url"
                value={formData.evolution_api_url}
                onChange={(e) => setFormData({ ...formData, evolution_api_url: e.target.value })}
                className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                placeholder="https://api.evolution.com"
              />
              {errors.evolution_api_url && (
                <p className="text-red-400 text-xs mt-1">{errors.evolution_api_url}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Evolution API Key *
              </label>
              <input
                type="password"
                value={formData.evolution_api_key}
                onChange={(e) => setFormData({ ...formData, evolution_api_key: e.target.value })}
                className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                placeholder="Enter your Evolution API key"
              />
              {errors.evolution_api_key && (
                <p className="text-red-400 text-xs mt-1">{errors.evolution_api_key}</p>
              )}
            </div>
          </div>

          {/* AI Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">AI Configuration</h3>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                value={formData.gemini_api_key}
                onChange={(e) => setFormData({ ...formData, gemini_api_key: e.target.value })}
                className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                placeholder="Enter Gemini API key (optional)"
              />
              {errors.gemini_api_key && (
                <p className="text-red-400 text-xs mt-1">{errors.gemini_api_key}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                AI System Prompt
              </label>
              <textarea
                value={formData.ai_system_prompt}
                onChange={(e) => setFormData({ ...formData, ai_system_prompt: e.target.value })}
                rows={4}
                className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                placeholder="Define how the AI should behave..."
              />
            </div>
          </div>

          {/* Bot Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Bot Behavior</h3>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Auto Reply</p>
                <p className="text-xs text-muted mt-0.5">Automatically respond to messages</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, auto_reply_enabled: !formData.auto_reply_enabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.auto_reply_enabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    formData.auto_reply_enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Business Hours Only</p>
                <p className="text-xs text-muted mt-0.5">Only reply during business hours</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, business_hours_only: !formData.business_hours_only })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.business_hours_only ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    formData.business_hours_only ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Test Connection Result */}
          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    testResult.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {testResult.message}
                  </p>
                  {testResult.qr_code && (
                    <div className="mt-3 p-3 bg-white rounded-lg">
                      <img src={testResult.qr_code} alt="QR Code" className="w-48 h-48 mx-auto" />
                      <p className="text-xs text-center text-gray-600 mt-2">Scan with WhatsApp to connect</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/10 bg-secondary/30 -mx-6 -mb-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              {instance && (
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-6 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {testing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      Test Connection
                    </>
                  )}
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  instance ? 'Update Instance' : 'Create Instance'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
