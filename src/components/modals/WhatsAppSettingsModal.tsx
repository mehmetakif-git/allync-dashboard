import { useState, useEffect } from 'react';
import { X, Plus, Settings, Trash2, Power, CheckCircle, XCircle, Loader2, AlertCircle, Calendar, FileSpreadsheet } from 'lucide-react';
import { WhatsAppInstance } from '../../types/whatsapp';
import { getWhatsappInstancesByCompany, deleteWhatsappInstance } from '../../lib/api/whatsappInstances';
import { getCalendarInstances, CalendarInstance } from '../../lib/api/calendarInstances';
import { getSheetsInstances, SheetsInstance } from '../../lib/api/sheetsInstances';
import WhatsAppInstanceModal from './WhatsAppInstanceModal';
import CalendarInstanceModal from './CalendarInstanceModal';
import SheetsInstanceModal from './SheetsInstanceModal';
import { formatPhoneNumber } from '../../lib/utils/whatsappFormatters';
import { supabase } from '../../lib/supabase';

interface WhatsAppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  companyName: string;
  companyId: string;
  initialSettings?: any;
}

export default function WhatsAppSettingsModal({
  isOpen,
  onClose,
  companyName,
  companyId,
}: WhatsAppSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'instances' | 'calendar' | 'sheets'>('instances');
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [calendarInstances, setCalendarInstances] = useState<CalendarInstance[]>([]);
  const [sheetsInstances, setSheetsInstances] = useState<SheetsInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [showInstanceModal, setShowInstanceModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarInstance | null>(null);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<SheetsInstance | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && companyId) {
      loadInstances();
    }
  }, [isOpen, companyId]);

  // Load calendar instances when tab is active
  useEffect(() => {
    if (isOpen && activeTab === 'calendar' && calendarInstances.length === 0) {
      loadCalendarInstances();
    }
  }, [isOpen, activeTab]);

  // Load sheets instances when tab is active
  useEffect(() => {
    if (isOpen && activeTab === 'sheets' && sheetsInstances.length === 0) {
      loadSheetsInstances();
    }
  }, [isOpen, activeTab]);

  const loadInstances = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading instances for company:', companyId);

      if (!companyId) {
        console.error('❌ No companyId provided');
        setInstances([]);
        setLoading(false);
        return;
      }

      const data = await getWhatsappInstancesByCompany(companyId);
      console.log('✅ Loaded instances:', data);
      setInstances(data);
    } catch (error) {
      console.error('❌ Failed to load instances:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarInstances = async () => {
    try {
      setLoadingCalendar(true);
      console.log('📅 Loading calendar instances for company:', companyId);
      const data = await getCalendarInstances(companyId);
      console.log('✅ Loaded calendar instances:', data);
      setCalendarInstances(data);
    } catch (error) {
      console.error('❌ Failed to load calendar instances:', error);
    } finally {
      setLoadingCalendar(false);
    }
  };

  const loadSheetsInstances = async () => {
    try {
      setLoadingSheets(true);
      console.log('📊 Loading sheets instances for company:', companyId);
      const data = await getSheetsInstances(companyId);
      console.log('✅ Loaded sheets instances:', data);
      setSheetsInstances(data);
    } catch (error) {
      console.error('❌ Failed to load sheets instances:', error);
    } finally {
      setLoadingSheets(false);
    }
  };

  const handleCreateInstance = () => {
    setSelectedInstance(null);
    setShowInstanceModal(true);
  };

  const handleEditInstance = (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
    setShowInstanceModal(true);
  };

  const handleDeleteInstance = async (instanceId: string) => {
    try {
      setDeleting(true);
      await deleteWhatsappInstance(instanceId);
      await loadInstances();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete instance:', error);
      alert('Failed to delete instance');
    } finally {
      setDeleting(false);
    }
  };

  const handleInstanceModalClose = () => {
    setShowInstanceModal(false);
    // Delay clearing selectedInstance to prevent race condition
    setTimeout(() => {
      setSelectedInstance(null);
    }, 100);
  };

  const handleInstanceModalSuccess = async () => {
    // Close modal first
    setShowInstanceModal(false);

    // Reload instances after modal is closed
    setTimeout(async () => {
      await loadInstances();
      setSelectedInstance(null);
    }, 100);
  };

  // Calendar handlers
  const handleCreateCalendar = () => {
    setSelectedCalendar(null);
    setShowCalendarModal(true);
  };

  const handleEditCalendar = (calendar: CalendarInstance) => {
    setSelectedCalendar(calendar);
    setShowCalendarModal(true);
  };

  const handleDeleteCalendar = async (calendarId: string) => {
    if (!confirm('Are you sure you want to delete this calendar integration?')) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('calendar_instances')
        .delete()
        .eq('id', calendarId);

      if (error) throw error;
      await loadCalendarInstances();
      console.log('✅ Calendar instance deleted');
    } catch (error) {
      console.error('❌ Failed to delete calendar instance:', error);
      alert('Failed to delete calendar instance');
    } finally {
      setDeleting(false);
    }
  };

  const handleCalendarModalSuccess = async () => {
    setShowCalendarModal(false);
    setTimeout(async () => {
      await loadCalendarInstances();
      setSelectedCalendar(null);
    }, 100);
  };

  // Sheets handlers
  const handleCreateSheet = () => {
    setSelectedSheet(null);
    setShowSheetsModal(true);
  };

  const handleEditSheet = (sheet: SheetsInstance) => {
    setSelectedSheet(sheet);
    setShowSheetsModal(true);
  };

  const handleDeleteSheet = async (sheetId: string) => {
    if (!confirm('Are you sure you want to delete this sheets integration?')) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('sheets_instances')
        .delete()
        .eq('id', sheetId);

      if (error) throw error;
      await loadSheetsInstances();
      console.log('✅ Sheets instance deleted');
    } catch (error) {
      console.error('❌ Failed to delete sheets instance:', error);
      alert('Failed to delete sheets instance');
    } finally {
      setDeleting(false);
    }
  };

  const handleSheetsModalSuccess = async () => {
    setShowSheetsModal(false);
    setTimeout(async () => {
      await loadSheetsInstances();
      setSelectedSheet(null);
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-secondary/95 via-primary/95 to-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">WhatsApp Service Configuration</h2>
                <p className="text-sm text-muted mt-1">{companyName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10">
              <button
                onClick={() => setActiveTab('instances')}
                className={`pb-3 px-4 font-medium transition-colors relative flex items-center gap-2 ${
                  activeTab === 'instances' ? 'text-green-400' : 'text-muted hover:text-white'
                }`}
              >
                <Power className="w-4 h-4" />
                Instances ({instances.length})
                {activeTab === 'instances' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`pb-3 px-4 font-medium transition-colors relative flex items-center gap-2 ${
                  activeTab === 'calendar' ? 'text-blue-400' : 'text-muted hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Google Calendar ({calendarInstances.length})
                {activeTab === 'calendar' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('sheets')}
                className={`pb-3 px-4 font-medium transition-colors relative flex items-center gap-2 ${
                  activeTab === 'sheets' ? 'text-purple-400' : 'text-muted hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Google Sheets ({sheetsInstances.length})
                {activeTab === 'sheets' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
            {/* ========== INSTANCES TAB ========== */}
            {activeTab === 'instances' && (loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
              </div>
            ) : instances.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No WhatsApp Instances</h3>
                <p className="text-muted text-sm mb-6">
                  This company doesn't have any WhatsApp instances configured yet.
                  <br />
                  Create one to get started with WhatsApp automation.
                </p>
                <button
                  onClick={handleCreateInstance}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create First Instance
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Create New Button */}
                <button
                  onClick={handleCreateInstance}
                  className="w-full p-4 bg-green-500/10 hover:bg-green-500/20 border-2 border-dashed border-green-500/30 rounded-lg transition-colors flex items-center justify-center gap-2 text-green-400 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add New Instance
                </button>

                {/* Instance List */}
                {instances.map((instance) => (
                  <div
                    key={instance.id}
                    className="bg-secondary/50 backdrop-blur-sm rounded-xl border border-white/10 p-5 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {instance.instance_name || 'Unnamed Instance'}
                          </h3>
                          {instance.is_connected ? (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 text-green-400 rounded-md text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Connected
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 text-red-400 rounded-md text-xs font-medium">
                              <XCircle className="w-3 h-3" />
                              Disconnected
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted">
                            <span className="font-medium">Instance ID:</span> {instance.instance_id}
                          </p>
                          {instance.phone_number && (
                            <p className="text-sm text-muted">
                              <span className="font-medium">Phone:</span> {formatPhoneNumber(instance.phone_number)}
                            </p>
                          )}
                          <p className="text-sm text-muted">
                            <span className="font-medium">Type:</span>{' '}
                            <span className="capitalize">{instance.instance_type || 'N/A'}</span>
                          </p>
                          {instance.last_connected_at && (
                            <p className="text-sm text-muted">
                              <span className="font-medium">Last Connected:</span>{' '}
                              {new Date(instance.last_connected_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditInstance(instance)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                          title="Edit Instance"
                        >
                          <Settings className="w-5 h-5" />
                        </button>

                        {/* Delete Button */}
                        {deleteConfirm === instance.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteInstance(instance.id)}
                              disabled={deleting}
                              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {deleting ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              disabled={deleting}
                              className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(instance.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                            title="Delete Instance"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                      <div className="text-center">
                        <p className="text-xs text-muted mb-1">Status</p>
                        <p className="text-sm font-medium text-white capitalize">
                          {instance.status || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted mb-1">Auto Reply</p>
                        <p className="text-sm font-medium text-white">
                          {instance.settings?.auto_reply_enabled ? (
                            <span className="text-green-400">Enabled</span>
                          ) : (
                            <span className="text-gray-400">Disabled</span>
                          )}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted mb-1">Business Hours</p>
                        <p className="text-sm font-medium text-white">
                          {instance.settings?.business_hours_only ? (
                            <span className="text-blue-400">Only</span>
                          ) : (
                            <span className="text-gray-400">24/7</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* ========== CALENDAR TAB ========== */}
            {activeTab === 'calendar' && (
              <>
                {/* Create Button */}
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={handleCreateCalendar}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Calendar Integration
                  </button>
                </div>

                {loadingCalendar ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : calendarInstances.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Google Calendar Integrations</h3>
                    <p className="text-muted text-sm mb-6">
                      This company doesn't have any Google Calendar integrations configured yet.
                    </p>
                    <button
                      onClick={handleCreateCalendar}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Create First Integration
                    </button>
                  </div>
                ) : (
              <div className="space-y-4">
                {calendarInstances.map((calendar) => (
                  <div
                    key={calendar.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-400/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">
                              {calendar.instance_name || calendar.calendar_name || 'Unnamed Calendar'}
                            </h4>
                            <p className="text-xs text-muted">{calendar.google_calendar_id || 'No Calendar ID'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted mb-1">Timezone</p>
                            <p className="text-sm text-white">{calendar.timezone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted mb-1">Status</p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                              calendar.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {calendar.status}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-muted mb-1">Auto Approve</p>
                            <p className="text-sm text-white">
                              {calendar.auto_approve_appointments ? (
                                <span className="text-green-400">Yes</span>
                              ) : (
                                <span className="text-gray-400">No</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted mb-1">Created</p>
                            <p className="text-sm text-white">{new Date(calendar.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditCalendar(calendar)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                          title="Edit Calendar"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCalendar(calendar.id)}
                          disabled={deleting}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Calendar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                )}
              </>
            )}

            {/* ========== SHEETS TAB ========== */}
            {activeTab === 'sheets' && (
              <>
                {/* Create Button */}
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={handleCreateSheet}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Sheets Integration
                  </button>
                </div>

                {loadingSheets ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  </div>
                ) : sheetsInstances.length === 0 ? (
                  <div className="text-center py-12">
                    <FileSpreadsheet className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Google Sheets Integrations</h3>
                    <p className="text-muted text-sm mb-6">
                      This company doesn't have any Google Sheets integrations configured yet.
                    </p>
                    <button
                      onClick={handleCreateSheet}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Create First Integration
                    </button>
                  </div>
                ) : (
              <div className="space-y-4">
                {sheetsInstances.map((sheet) => (
                  <div
                    key={sheet.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-400/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <FileSpreadsheet className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">
                              {sheet.google_sheet_name || 'Unnamed Sheet'}
                            </h4>
                            <p className="text-xs text-muted font-mono">{sheet.google_sheet_id || 'No Sheet ID'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted mb-1">Status</p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                              sheet.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {sheet.status}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-muted mb-1">WhatsApp Integration</p>
                            <p className="text-sm text-white">
                              {sheet.whatsapp_integration_enabled ? (
                                <span className="text-green-400">Enabled</span>
                              ) : (
                                <span className="text-gray-400">Disabled</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted mb-1">Auto Sync</p>
                            <p className="text-sm text-white">
                              {sheet.auto_sync_enabled ? (
                                <span className="text-green-400">Every {sheet.sync_interval_minutes} min</span>
                              ) : (
                                <span className="text-gray-400">Disabled</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted mb-1">Last Sync</p>
                            <p className="text-sm text-white">
                              {sheet.last_sync_at ? new Date(sheet.last_sync_at).toLocaleString() : 'Never'}
                            </p>
                          </div>
                        </div>
                        {sheet.google_sheet_url && (
                          <div className="mt-4">
                            <a
                              href={sheet.google_sheet_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm transition-colors"
                            >
                              Open Sheet
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditSheet(sheet)}
                          className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                          title="Edit Sheets Integration"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSheet(sheet.id)}
                          disabled={deleting}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Sheets Integration"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-secondary/30 flex items-center justify-between">
            <p className="text-sm text-muted">
              {activeTab === 'instances' && `${instances.length} ${instances.length === 1 ? 'instance' : 'instances'} configured`}
              {activeTab === 'calendar' && `${calendarInstances.length} calendar ${calendarInstances.length === 1 ? 'integration' : 'integrations'}`}
              {activeTab === 'sheets' && `${sheetsInstances.length} sheets ${sheetsInstances.length === 1 ? 'integration' : 'integrations'}`}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Instance Create/Edit Modal */}
      <WhatsAppInstanceModal
        isOpen={showInstanceModal}
        onClose={handleInstanceModalClose}
        instance={selectedInstance}
        companyId={companyId}
        onSuccess={handleInstanceModalSuccess}
      />

      {/* Calendar Create/Edit Modal */}
      <CalendarInstanceModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        instance={selectedCalendar}
        companyId={companyId}
        onSuccess={handleCalendarModalSuccess}
      />

      {/* Sheets Create/Edit Modal */}
      <SheetsInstanceModal
        isOpen={showSheetsModal}
        onClose={() => setShowSheetsModal(false)}
        instance={selectedSheet}
        companyId={companyId}
        onSuccess={handleSheetsModalSuccess}
      />
    </>
  );
}
