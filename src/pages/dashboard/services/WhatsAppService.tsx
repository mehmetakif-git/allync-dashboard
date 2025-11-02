import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  MessageCircle,
  BarChart3,
  Users,
  Settings,
  Loader2,
  AlertCircle,
  Download,
  Search,
  Clock,
  Phone,
  RefreshCw,
  AlertTriangle,
  Calendar,
  FileSpreadsheet,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { getWhatsappInstanceByCompanyService } from '../../../lib/api/whatsappInstances';
import { getSessionsByCompany } from '../../../lib/api/whatsappSessions';
import { getUserProfiles, type WhatsAppUserProfile } from '../../../lib/api/whatsappUserProfiles';
import { getErrors, type WhatsAppError } from '../../../lib/api/whatsappErrors';
import { getCalendarInstances, type CalendarInstance } from '../../../lib/api/calendarInstances';
import { getSheetsWithWhatsAppIntegration, type SheetsInstance } from '../../../lib/api/sheetsInstances';
import { getCompanyServices } from '../../../lib/api/companyServices';
import type { WhatsAppInstance, WhatsAppSession } from '../../../types/whatsapp';
import ConversationDetail from '../../../components/whatsapp/ConversationDetail';
import AnalyticsDashboard from '../../../components/whatsapp/AnalyticsDashboard';
import { formatPhoneNumber, formatMessageTime } from '../../../lib/utils/whatsappFormatters';
import * as XLSX from 'xlsx';
import { Wrench } from 'lucide-react';

type TabType = 'conversations' | 'analytics' | 'users' | 'integrations' | 'errors' | 'settings';
type ConversationFilter = 'all' | 'active' | 'closed';
type ErrorFilter = 'all' | 'unresolved' | 'critical';

export default function WhatsAppService() {
  const { user } = useAuth();
  const { serviceId } = useParams<{ serviceId: string }>();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('conversations');

  // Data state
  const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [userProfiles, setUserProfiles] = useState<WhatsAppUserProfile[]>([]);
  const [companyServices, setCompanyServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Conversation state
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [conversationFilter, setConversationFilter] = useState<ConversationFilter>('active');
  const [conversationSearch, setConversationSearch] = useState('');

  // Users state
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Errors state
  const [errors, setErrors] = useState<WhatsAppError[]>([]);
  const [errorFilter, setErrorFilter] = useState<ErrorFilter>('unresolved');
  const [errorSearch, setErrorSearch] = useState('');
  const [loadingErrors, setLoadingErrors] = useState(false);

  // Integrations state
  const [calendarInstances, setCalendarInstances] = useState<CalendarInstance[]>([]);
  const [sheetsInstances, setSheetsInstances] = useState<SheetsInstance[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);

  // Refresh states
  const [refreshingConversations, setRefreshingConversations] = useState(false);
  const [refreshingUsers, setRefreshingUsers] = useState(false);
  const [refreshingErrors, setRefreshingErrors] = useState(false);
  const [refreshingIntegrations, setRefreshingIntegrations] = useState(false);

  // KVKK / Privacy consent states
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasUserConsent, setHasUserConsent] = useState(false);
  const [checkingConsent, setCheckingConsent] = useState(true);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user?.company_id) return;
    try {
      setRefreshingConversations(true);
      const sessionsData = await getSessionsByCompany(user.company_id);
      setSessions(sessionsData);
      console.log('✅ Conversations refreshed');
    } catch (err) {
      console.error('❌ Error refreshing conversations:', err);
    } finally {
      setRefreshingConversations(false);
    }
  };

  // Fetch user profiles
  const fetchUserProfiles = async () => {
    if (!user?.company_id) return;
    try {
      setRefreshingUsers(true);
      const profiles = await getUserProfiles(user.company_id);
      setUserProfiles(profiles);
      console.log('✅ User profiles refreshed');
    } catch (err) {
      console.error('❌ Error refreshing user profiles:', err);
    } finally {
      setRefreshingUsers(false);
    }
  };

  // Fetch errors
  const fetchErrors = async () => {
    if (!user?.company_id) return;
    try {
      setRefreshingErrors(true);
      const filters: any = {};

      if (errorFilter === 'unresolved') {
        filters.isResolved = false;
      } else if (errorFilter === 'critical') {
        filters.isResolved = false;
        filters.severity = ['high', 'critical'];
      }

      const errorsData = await getErrors(user.company_id, filters);
      setErrors(errorsData);
      console.log('✅ Errors refreshed');
    } catch (err) {
      console.error('❌ Error refreshing errors:', err);
    } finally {
      setRefreshingErrors(false);
    }
  };

  // Fetch integrations
  const fetchIntegrations = async () => {
    if (!user?.company_id) return;
    try {
      setRefreshingIntegrations(true);
      const [calendars, sheets] = await Promise.all([
        getCalendarInstances(user.company_id),
        getSheetsWithWhatsAppIntegration(user.company_id),
      ]);
      setCalendarInstances(calendars);
      setSheetsInstances(sheets);
      console.log('✅ Integrations refreshed');
    } catch (err) {
      console.error('❌ Error refreshing integrations:', err);
    } finally {
      setRefreshingIntegrations(false);
    }
  };

  // Check if user has given KVKK consent for WhatsApp service
  const checkUserConsent = async () => {
    if (!user?.id || !serviceId) return;

    try {
      setCheckingConsent(true);

      // Check user_service_consents table
      const { data, error } = await supabase
        .from('user_service_consents')
        .select('*')
        .eq('user_id', user.id)
        .eq('service_type', 'whatsapp-automation')
        .eq('consent_given', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('Error checking consent:', error);
      }

      if (data) {
        setHasUserConsent(true);
        setShowConsentModal(false);
      } else {
        // First time accessing - show consent modal
        setHasUserConsent(false);
        setShowConsentModal(true);
      }
    } catch (err) {
      console.error('Error checking consent:', err);
    } finally {
      setCheckingConsent(false);
    }
  };

  // Handle user consent acceptance
  const handleAcceptConsent = async () => {
    if (!user?.id || !user?.company_id) return;

    try {
      // Save consent to database
      const { error } = await supabase
        .from('user_service_consents')
        .insert({
          user_id: user.id,
          company_id: user.company_id,
          service_type: 'whatsapp-automation',
          consent_given: true,
          consent_date: new Date().toISOString(),
          consent_version: '1.0',
          ip_address: null, // Could be tracked if needed
        });

      if (error) {
        console.error('Error saving consent:', error);
        alert('Onay kaydedilemedi. Lütfen tekrar deneyin.');
        return;
      }

      setHasUserConsent(true);
      setShowConsentModal(false);
      console.log('✅ User consent recorded');
    } catch (err) {
      console.error('Error saving consent:', err);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Check user consent on mount (KVKK compliance)
  useEffect(() => {
    if (user?.id && serviceId) {
      checkUserConsent();
    }
  }, [user?.id, serviceId]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId || !user?.company_id) {
        setError('Service ID or Company ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📡 Fetching WhatsApp data for service:', serviceId);

        // Get company services to check maintenance status
        const servicesData = await getCompanyServices(user.company_id);
        setCompanyServices(servicesData || []);

        // Get WhatsApp instance
        const instanceData = await getWhatsappInstanceByCompanyService(serviceId);
        setInstance(instanceData);

        if (instanceData) {
          // Get sessions
          await fetchConversations();
        }

        console.log('✅ Data loaded');
      } catch (err: any) {
        console.error('❌ Error loading data:', err);
        setError(err.message || 'Failed to load WhatsApp data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId, user?.company_id]);

  // Real-time subscription for conversations
  useEffect(() => {
    if (!user?.company_id || !instance) return;

    console.log('🔔 Setting up real-time subscription for sessions and messages');

    // Subscribe to sessions table changes
    const sessionsChannel = supabase
      .channel(`whatsapp-sessions-${user.company_id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'whatsapp_sessions',
          filter: `company_id=eq.${user.company_id}`,
        },
        (payload: any) => {
          console.log('🔔 Session changed:', payload.eventType, payload);
          // Refresh conversations when any change occurs
          fetchConversations();
        }
      )
      .subscribe((status) => {
        console.log('📡 Sessions subscription status:', status);
      });

    // Subscribe to messages table changes (to update unread counts)
    const messagesChannel = supabase
      .channel(`whatsapp-messages-${user.company_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
        },
        (payload: any) => {
          console.log('🔔 New message received:', payload);
          // Refresh conversations to update message counts and last message
          fetchConversations();
        }
      )
      .subscribe((status) => {
        console.log('📡 Messages subscription status:', status);
      });

    // Cleanup subscriptions on unmount
    return () => {
      console.log('🔕 Cleaning up real-time subscriptions');
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user?.company_id, instance]);

  // Fetch user profiles when users tab is active
  useEffect(() => {
    if (activeTab === 'users' && user?.company_id && userProfiles.length === 0) {
      setLoadingUsers(true);
      fetchUserProfiles().finally(() => setLoadingUsers(false));
    }
  }, [activeTab, user?.company_id]);

  // Fetch errors when errors tab is active
  useEffect(() => {
    if (activeTab === 'errors' && user?.company_id) {
      setLoadingErrors(true);
      fetchErrors().finally(() => setLoadingErrors(false));
    }
  }, [activeTab, user?.company_id, errorFilter]);

  // Fetch integrations when integrations tab is active
  useEffect(() => {
    if (activeTab === 'integrations' && user?.company_id) {
      setLoadingIntegrations(true);
      fetchIntegrations().finally(() => setLoadingIntegrations(false));
    }
  }, [activeTab, user?.company_id]);

  // Filter conversations
  const filteredSessions = sessions.filter((session) => {
    // Filter by status
    if (conversationFilter === 'active' && session.status !== 'active') return false;
    if (conversationFilter === 'closed' && session.status !== 'closed') return false;

    // Filter by search
    if (conversationSearch) {
      const searchLower = conversationSearch.toLowerCase();
      const nameMatch = session.customer_name?.toLowerCase().includes(searchLower);
      const phoneMatch = session.customer_phone?.includes(searchLower);
      return nameMatch || phoneMatch;
    }

    return true;
  });

  // Filter users
  const filteredUsers = userProfiles.filter((user) => {
    if (!userSearch) return true;
    const searchLower = userSearch.toLowerCase();
    const nameMatch = user.name?.toLowerCase().includes(searchLower);
    const phoneMatch = user.phone_number.includes(searchLower);
    return nameMatch || phoneMatch;
  });

  // Filter errors
  const filteredErrors = errors.filter((error) => {
    if (!errorSearch) return true;
    const searchLower = errorSearch.toLowerCase();
    const typeMatch = error.error_type?.toLowerCase().includes(searchLower);
    const messageMatch = error.error_message?.toLowerCase().includes(searchLower);
    return typeMatch || messageMatch;
  });

  const unresolvedErrors = errors.filter((e) => !e.is_resolved).length;
  const criticalErrors = errors.filter((e) => !e.is_resolved && (e.severity === 'high' || e.severity === 'critical')).length;

  // Export conversations to Excel
  const exportConversationsToExcel = () => {
    const data = filteredSessions.map((session) => ({
      'Customer Name': session.customer_name || 'Unknown',
      'Phone Number': session.customer_phone || 'N/A',
      'Status': session.status,
      'Total Messages': session.message_count,
      'Unread Count': session.unread_count,
      'Last Message': session.last_message || '',
      'Last Message Time': session.last_message_time
        ? new Date(session.last_message_time).toLocaleString()
        : 'N/A',
      'Created At': new Date(session.created_at).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Conversations');
    XLSX.writeFile(workbook, `whatsapp-conversations-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export users to Excel
  const exportUsersToExcel = () => {
    const data = filteredUsers.map((user) => ({
      'Name': user.name || 'Unknown',
      'Phone Number': user.phone_number,
      'Email': user.email || 'N/A',
      'Total Messages': user.total_messages,
      'Status': user.customer_status || 'N/A',
      'Tags': user.tags?.join(', ') || '',
      'Last Seen': user.last_seen
        ? new Date(user.last_seen).toLocaleString()
        : 'Never',
      'Created At': new Date(user.created_at).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, `whatsapp-users-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export errors to Excel
  const exportErrorsToExcel = () => {
    const data = filteredErrors.map((error) => ({
      'Error Type': error.error_type,
      'Message': error.error_message,
      'Severity': error.severity.toUpperCase(),
      'Status': error.is_resolved ? 'Resolved' : 'Unresolved',
      'Created At': new Date(error.created_at).toLocaleString(),
      'Resolved At': error.resolved_at
        ? new Date(error.resolved_at).toLocaleString()
        : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Errors');
    XLSX.writeFile(workbook, `whatsapp-errors-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
          <p className="text-white text-xl">Loading WhatsApp Service...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Service</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check maintenance mode
  const currentServiceInstance = companyServices.find(
    (cs: any) => cs.id === serviceId
  );

  const isGloballyInMaintenance = currentServiceInstance?.service_type?.status === 'maintenance';
  const isInstanceInMaintenance = currentServiceInstance?.status === 'maintenance';
  const isInMaintenance = isGloballyInMaintenance || isInstanceInMaintenance;
  const maintenanceReason = currentServiceInstance?.metadata?.maintenance_reason ||
    (isGloballyInMaintenance ? 'This service is temporarily unavailable for all users.' : undefined);

  // Super admin can always access the service
  const isSuperAdmin = user?.role === 'super_admin';

  // Maintenance mode - Show ONLY for company_admin (NOT for super_admin)
  if (isInMaintenance && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-8">
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-orange-500/10 border-2 border-orange-500/50 rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Wrench className="w-12 h-12 text-orange-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-orange-400 mb-3">🔧 Service Under Maintenance</h2>
                <p className="text-orange-300/80 text-lg mb-4">
                  WhatsApp service is temporarily unavailable
                </p>
                {maintenanceReason && (
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4 mb-4">
                    <p className="text-orange-200/90 text-sm font-medium mb-1">Maintenance Reason:</p>
                    <p className="text-orange-300/70 text-sm">{maintenanceReason}</p>
                  </div>
                )}
                <p className="text-orange-200/60 text-sm">
                  We're working on improvements. Please check back shortly.
                </p>
                <p className="text-orange-200/50 text-xs mt-3">
                  Your conversation data is safe and will be available once maintenance is complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No instance state
  if (!instance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card backdrop-blur-sm border border-secondary rounded-xl p-8 text-center">
            <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No WhatsApp Instance</h3>
            <p className="text-muted mb-4">
              This WhatsApp service hasn't been configured yet.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-300 mb-2">
                <strong>What's needed:</strong>
              </p>
              <ul className="text-sm text-muted space-y-1 list-disc list-inside">
                <li>WhatsApp bot instance configuration</li>
                <li>Evolution API connection</li>
                <li>Gemini AI setup for bot responses</li>
              </ul>
            </div>
            <p className="text-muted text-sm mt-4">
              Please contact your administrator to set up your WhatsApp service.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeSessions = sessions.filter((s) => s.status === 'active').length;
  const closedSessions = sessions.filter((s) => s.status === 'closed').length;

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">WhatsApp Service</h1>
                <p className="text-muted text-sm">
                  {instance.instance_name} • {instance.is_connected ? '🟢 Connected' : '🔴 Disconnected'}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="bg-card/50 backdrop-blur-sm border border-secondary rounded-lg px-4 py-2">
                <p className="text-xs text-muted">Active Chats</p>
                <p className="text-xl font-bold text-green-400">{activeSessions}</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-secondary rounded-lg px-4 py-2">
                <p className="text-xs text-muted">Total Users</p>
                <p className="text-xl font-bold text-blue-400">{userProfiles.length}</p>
              </div>
            </div>
          </div>

          {/* Connection Status Banner */}
          {!instance.is_connected && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-orange-400 font-medium text-sm">WhatsApp Not Connected</p>
                  <p className="text-orange-300/70 text-xs">
                    Contact your administrator to reconnect this instance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-secondary/50">
          <button
            onClick={() => setActiveTab('conversations')}
            className={`pb-3 px-4 font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === 'conversations' ? 'text-green-400' : 'text-muted hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Conversations
            {activeTab === 'conversations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-4 font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === 'analytics' ? 'text-green-400' : 'text-muted hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
            {activeTab === 'analytics' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === 'users' ? 'text-green-400' : 'text-muted hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Users
            {activeTab === 'users' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`pb-3 px-4 font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === 'integrations' ? 'text-blue-400' : 'text-muted hover:text-white'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Integrations
            {activeTab === 'integrations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`pb-3 px-4 font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === 'errors' ? 'text-red-400' : 'text-muted hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Errors
            {unresolvedErrors > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {unresolvedErrors}
              </span>
            )}
            {activeTab === 'errors' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-4 font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === 'settings' ? 'text-green-400' : 'text-muted hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
            {activeTab === 'settings' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {/* ========== CONVERSATIONS TAB ========== */}
        {activeTab === 'conversations' && (
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-280px)]">
            {/* Session List - Fixed Height with Scroll */}
            <div className="col-span-4 bg-card/50 backdrop-blur-xl border border-secondary rounded-xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-secondary/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Conversations</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchConversations}
                      disabled={refreshingConversations}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors group disabled:opacity-50"
                      title="Refresh conversations"
                    >
                      <RefreshCw className={`w-4 h-4 text-muted group-hover:text-green-400 ${refreshingConversations ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={exportConversationsToExcel}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                      title="Export to Excel"
                    >
                      <Download className="w-4 h-4 text-muted group-hover:text-green-400" />
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={conversationSearch}
                    onChange={(e) => setConversationSearch(e.target.value)}
                    className="w-full bg-secondary/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setConversationFilter('active')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      conversationFilter === 'active'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-lg shadow-green-500/10'
                        : 'bg-secondary/30 text-muted hover:bg-secondary/50 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${conversationFilter === 'active' ? 'bg-green-400' : 'bg-muted'}`} />
                      <span>Active</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                        conversationFilter === 'active' ? 'bg-green-500/30' : 'bg-white/10'
                      }`}>
                        {activeSessions}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setConversationFilter('closed')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      conversationFilter === 'closed'
                        ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 shadow-lg shadow-gray-500/10'
                        : 'bg-secondary/30 text-muted hover:bg-secondary/50 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${conversationFilter === 'closed' ? 'bg-gray-400' : 'bg-muted'}`} />
                      <span>Closed</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                        conversationFilter === 'closed' ? 'bg-gray-500/30' : 'bg-white/10'
                      }`}>
                        {closedSessions}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setConversationFilter('all')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      conversationFilter === 'all'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                        : 'bg-secondary/30 text-muted hover:bg-secondary/50 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${conversationFilter === 'all' ? 'bg-blue-400' : 'bg-muted'}`} />
                      <span>All</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                        conversationFilter === 'all' ? 'bg-blue-500/30' : 'bg-white/10'
                      }`}>
                        {sessions.length}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      conversationFilter === 'active' ? 'bg-green-500/10' :
                      conversationFilter === 'closed' ? 'bg-gray-500/10' :
                      'bg-blue-500/10'
                    }`}>
                      <MessageCircle className={`w-8 h-8 ${
                        conversationFilter === 'active' ? 'text-green-400' :
                        conversationFilter === 'closed' ? 'text-gray-400' :
                        'text-blue-400'
                      }`} />
                    </div>
                    <p className="text-white font-medium mb-2">
                      {conversationSearch ? 'No conversations found' :
                       conversationFilter === 'active' ? 'No active conversations' :
                       conversationFilter === 'closed' ? 'No closed conversations' :
                       'No conversations yet'}
                    </p>
                    <p className="text-muted text-sm max-w-xs mx-auto">
                      {conversationSearch
                        ? 'Try a different search term or filter'
                        : conversationFilter === 'active'
                        ? 'Active conversations will appear here when customers start chatting'
                        : conversationFilter === 'closed'
                        ? 'Closed conversations will appear here'
                        : 'Conversations will appear here when customers start chatting'}
                    </p>
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`w-full text-left rounded-lg p-3 transition-all border group ${
                        selectedSessionId === session.id
                          ? 'border-green-500/50 bg-green-500/10 shadow-lg shadow-green-500/5'
                          : session.status === 'active'
                          ? 'bg-secondary/30 hover:bg-secondary/50 border-green-500/20 hover:border-green-500/40'
                          : 'bg-secondary/20 hover:bg-secondary/40 border-transparent hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* Status Indicator Dot */}
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            session.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                          }`} />
                          <h4 className="font-semibold text-white text-sm truncate">
                            {session.customer_name || 'Unknown User'}
                          </h4>
                        </div>
                        {session.unread_count > 0 && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full ml-2 flex-shrink-0 animate-pulse">
                            {session.unread_count}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted mb-2 pl-4">
                        {formatPhoneNumber(session.customer_phone || '')}
                      </p>

                      {session.last_message && (
                        <p className="text-xs text-white/70 truncate mb-3 pl-4 italic">
                          "{session.last_message}"
                        </p>
                      )}

                      <div className="flex items-center justify-between pl-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                              session.status === 'active'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : session.status === 'closed'
                                ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              session.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                            }`} />
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </span>

                          {session.message_count > 0 && (
                            <span className="text-xs text-muted bg-white/5 px-2 py-1 rounded">
                              {session.message_count} msgs
                            </span>
                          )}
                        </div>

                        {session.last_message_time && (
                          <span className="text-xs text-muted">
                            {formatMessageTime(session.last_message_time)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Conversation Detail - Fixed Height with Scroll */}
            <div className="col-span-8 bg-card/50 backdrop-blur-xl border border-secondary rounded-xl overflow-hidden">
              {selectedSessionId ? (
                <ConversationDetail
                  sessionId={selectedSessionId}
                  onClose={() => setSelectedSessionId(null)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-white font-medium mb-2">Select a conversation</p>
                    <p className="text-muted text-sm">
                      Choose a conversation from the list to view messages
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== ANALYTICS TAB ========== */}
        {activeTab === 'analytics' && user?.company_id && (
          <div className="bg-card/50 backdrop-blur-xl border border-secondary rounded-xl p-6">
            <AnalyticsDashboard companyId={user.company_id} />
          </div>
        )}

        {/* ========== USERS TAB ========== */}
        {activeTab === 'users' && (
          <div className="bg-card/50 backdrop-blur-xl border border-secondary rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-secondary/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">WhatsApp Users</h3>
                  <p className="text-sm text-muted">
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchUserProfiles}
                    disabled={refreshingUsers}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors group disabled:opacity-50"
                    title="Refresh users"
                  >
                    <RefreshCw className={`w-4 h-4 text-muted group-hover:text-green-400 ${refreshingUsers ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={exportUsersToExcel}
                    disabled={filteredUsers.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Export to Excel
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search by name or phone number..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-secondary/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-360px)]">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">No users found</p>
                  <p className="text-muted text-sm">
                    {userSearch
                      ? 'Try a different search term'
                      : 'Users will appear here when they start conversations'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-secondary/30 border border-white/5 rounded-lg p-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {user.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium mb-1 truncate">
                              {user.name || 'Unknown User'}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted mb-2">
                              <Phone className="w-3 h-3" />
                              {formatPhoneNumber(user.phone_number)}
                              {user.customer_status && (
                                <>
                                  <span>•</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    user.customer_status === 'active' ? 'bg-green-500/20 text-green-400' :
                                    user.customer_status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                                    user.customer_status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                                    'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {user.customer_status}
                                  </span>
                                </>
                              )}
                            </div>
                            {user.tags && user.tags.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                {user.tags.slice(0, 3).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {user.tags.length > 3 && (
                                  <span className="text-xs text-muted">
                                    +{user.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary/30 rounded-lg p-3">
                          <p className="text-xs text-muted mb-1">Total Messages</p>
                          <p className="text-lg font-bold text-white">{user.total_messages}</p>
                        </div>
                        <div className="bg-secondary/30 rounded-lg p-3">
                          <p className="text-xs text-muted mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last Seen
                          </p>
                          <p className="text-xs font-medium text-white truncate">
                            {user.last_seen
                              ? formatMessageTime(user.last_seen)
                              : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== ERRORS TAB ========== */}
        {activeTab === 'errors' && (
          <div className="bg-card/50 backdrop-blur-xl border border-secondary rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-secondary/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">WhatsApp Errors</h3>
                  <p className="text-sm text-muted">
                    {filteredErrors.length} error{filteredErrors.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchErrors}
                    disabled={refreshingErrors}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors group disabled:opacity-50"
                    title="Refresh errors"
                  >
                    <RefreshCw className={`w-4 h-4 text-muted group-hover:text-red-400 ${refreshingErrors ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={exportErrorsToExcel}
                    disabled={filteredErrors.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Export to Excel
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search errors..."
                  value={errorSearch}
                  onChange={(e) => setErrorSearch(e.target.value)}
                  className="w-full bg-secondary/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setErrorFilter('unresolved')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    errorFilter === 'unresolved'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/10'
                      : 'bg-secondary/30 text-muted hover:bg-secondary/50 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${errorFilter === 'unresolved' ? 'bg-orange-400 animate-pulse' : 'bg-muted'}`} />
                    <span>Unresolved</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      errorFilter === 'unresolved' ? 'bg-orange-500/30' : 'bg-white/10'
                    }`}>
                      {unresolvedErrors}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setErrorFilter('critical')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    errorFilter === 'critical'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/10'
                      : 'bg-secondary/30 text-muted hover:bg-secondary/50 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <AlertTriangle className={`w-3 h-3 ${errorFilter === 'critical' ? 'text-red-400' : 'text-muted'}`} />
                    <span>Critical</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      errorFilter === 'critical' ? 'bg-red-500/30' : 'bg-white/10'
                    }`}>
                      {criticalErrors}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setErrorFilter('all')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    errorFilter === 'all'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'bg-secondary/30 text-muted hover:bg-secondary/50 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${errorFilter === 'all' ? 'bg-blue-400' : 'bg-muted'}`} />
                    <span>All</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      errorFilter === 'all' ? 'bg-blue-500/30' : 'bg-white/10'
                    }`}>
                      {errors.length}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Errors List */}
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-360px)]">
              {loadingErrors ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                </div>
              ) : filteredErrors.length === 0 ? (
                <div className="text-center py-12">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    errorFilter === 'critical' ? 'bg-red-500/10' :
                    errorFilter === 'unresolved' ? 'bg-orange-500/10' :
                    'bg-blue-500/10'
                  }`}>
                    <AlertTriangle className={`w-8 h-8 ${
                      errorFilter === 'critical' ? 'text-red-400' :
                      errorFilter === 'unresolved' ? 'text-orange-400' :
                      'text-blue-400'
                    }`} />
                  </div>
                  <p className="text-white font-medium mb-2">
                    {errorSearch ? 'No errors found' :
                     errorFilter === 'critical' ? 'No critical errors' :
                     errorFilter === 'unresolved' ? 'No unresolved errors' :
                     'No errors logged'}
                  </p>
                  <p className="text-muted text-sm max-w-xs mx-auto">
                    {errorSearch
                      ? 'Try a different search term or filter'
                      : errorFilter === 'critical'
                      ? 'All critical errors have been resolved'
                      : errorFilter === 'unresolved'
                      ? 'All errors have been resolved'
                      : 'No errors have been logged for this WhatsApp instance'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredErrors.map((error) => (
                    <div
                      key={error.id}
                      className={`bg-secondary/30 border rounded-lg p-4 hover:bg-secondary/50 transition-colors ${
                        error.severity === 'critical' ? 'border-red-500/30' :
                        error.severity === 'high' ? 'border-orange-500/30' :
                        error.severity === 'medium' ? 'border-yellow-500/30' :
                        'border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            error.severity === 'critical' ? 'bg-red-500/20' :
                            error.severity === 'high' ? 'bg-orange-500/20' :
                            error.severity === 'medium' ? 'bg-yellow-500/20' :
                            'bg-blue-500/20'
                          }`}>
                            <AlertTriangle className={`w-5 h-5 ${
                              error.severity === 'critical' ? 'text-red-400' :
                              error.severity === 'high' ? 'text-orange-400' :
                              error.severity === 'medium' ? 'text-yellow-400' :
                              'text-blue-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-semibold text-sm">{error.error_type}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                                error.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                error.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                error.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {error.severity}
                              </span>
                            </div>
                            <p className="text-sm text-white/70 mb-2">{error.error_message}</p>
                            <div className="flex items-center gap-3 text-xs text-muted">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatMessageTime(error.created_at)}
                              </div>
                              {error.is_resolved && (
                                <span className="text-green-400">✓ Resolved</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          error.is_resolved
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {error.is_resolved ? 'Resolved' : 'Open'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== INTEGRATIONS TAB ========== */}
        {activeTab === 'integrations' && (
          <div className="bg-card/50 backdrop-blur-xl border border-secondary rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-secondary/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">External Integrations</h3>
                  <p className="text-sm text-muted">
                    Google Calendar and Sheets integrations connected to this WhatsApp instance
                  </p>
                </div>
                <button
                  onClick={() => {
                    setRefreshingIntegrations(true);
                    fetchIntegrations().finally(() => setRefreshingIntegrations(false));
                  }}
                  disabled={refreshingIntegrations}
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh Integrations"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${refreshingIntegrations ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {loadingIntegrations ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Google Calendar Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <h4 className="text-white font-semibold">Google Calendar Instances</h4>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                        {calendarInstances.length}
                      </span>
                    </div>

                    {calendarInstances.length === 0 ? (
                      <div className="bg-secondary/30 border border-white/5 rounded-lg p-6 text-center">
                        <Calendar className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-muted">No calendar integrations found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {calendarInstances.map((calendar) => (
                          <div
                            key={calendar.id}
                            className="bg-secondary/30 border border-white/5 rounded-lg p-4 hover:border-blue-500/30 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="text-white font-medium">
                                    {calendar.instance_name || calendar.calendar_name || 'Unnamed Calendar'}
                                  </h5>
                                  <span
                                    className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                                      calendar.status === 'active'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-gray-500/20 text-gray-400'
                                    }`}
                                  >
                                    {calendar.status}
                                  </span>
                                </div>
                                <div className="space-y-1 text-sm text-muted">
                                  {calendar.calendar_name && (
                                    <p>
                                      <span className="font-medium">Calendar:</span> {calendar.calendar_name}
                                    </p>
                                  )}
                                  <p>
                                    <span className="font-medium">Timezone:</span> {calendar.timezone}
                                  </p>
                                  <p>
                                    <span className="font-medium">Auto Approve:</span>{' '}
                                    {calendar.auto_approve_appointments ? (
                                      <span className="text-green-400">Enabled</span>
                                    ) : (
                                      <span className="text-gray-400">Disabled</span>
                                    )}
                                  </p>
                                  {calendar.n8n_workflow_id && (
                                    <p>
                                      <span className="font-medium">Workflow ID:</span>{' '}
                                      <span className="font-mono text-xs">{calendar.n8n_workflow_id}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                              {calendar.google_calendar_id && (
                                <a
                                  href={`https://calendar.google.com/calendar/u/0/r?cid=${calendar.google_calendar_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                                  title="Open in Google Calendar"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Google Sheets Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FileSpreadsheet className="w-5 h-5 text-green-400" />
                      <h4 className="text-white font-semibold">Google Sheets Instances</h4>
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                        {sheetsInstances.length}
                      </span>
                    </div>

                    {sheetsInstances.length === 0 ? (
                      <div className="bg-secondary/30 border border-white/5 rounded-lg p-6 text-center">
                        <FileSpreadsheet className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-muted">No sheets integrations with WhatsApp enabled</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sheetsInstances.map((sheet) => (
                          <div
                            key={sheet.id}
                            className="bg-secondary/30 border border-white/5 rounded-lg p-4 hover:border-green-500/30 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="text-white font-medium">
                                    {sheet.google_sheet_name || 'Unnamed Sheet'}
                                  </h5>
                                  <span
                                    className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                                      sheet.status === 'active'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-gray-500/20 text-gray-400'
                                    }`}
                                  >
                                    {sheet.status}
                                  </span>
                                  {sheet.whatsapp_integration_enabled && (
                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-md">
                                      WhatsApp Enabled
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-1 text-sm text-muted">
                                  <p>
                                    <span className="font-medium">Sheet ID:</span>{' '}
                                    <span className="font-mono text-xs">{sheet.google_sheet_id}</span>
                                  </p>
                                  <p>
                                    <span className="font-medium">Auto Sync:</span>{' '}
                                    {sheet.auto_sync_enabled ? (
                                      <span className="text-green-400">
                                        Every {sheet.sync_interval_minutes} min
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">Disabled</span>
                                    )}
                                  </p>
                                  {sheet.last_sync_at && (
                                    <p>
                                      <span className="font-medium">Last Sync:</span>{' '}
                                      {new Date(sheet.last_sync_at).toLocaleString()}
                                    </p>
                                  )}
                                  {sheet.n8n_workflow_id && (
                                    <p>
                                      <span className="font-medium">Workflow ID:</span>{' '}
                                      <span className="font-mono text-xs">{sheet.n8n_workflow_id}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                              {sheet.google_sheet_url && (
                                <a
                                  href={sheet.google_sheet_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                                  title="Open Google Sheet"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info notice */}
                  {(calendarInstances.length > 0 || sheetsInstances.length > 0) && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-300 font-medium mb-1">
                            Integration Information
                          </p>
                          <p className="text-sm text-muted">
                            These integrations are automatically synced with your WhatsApp instance.
                            Calendar appointments and sheet data can trigger automated WhatsApp messages
                            based on your configured workflows.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== SETTINGS TAB ========== */}
        {activeTab === 'settings' && (
          <div className="bg-card/50 backdrop-blur-xl border border-secondary rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Instance Configuration</h3>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm text-muted mb-2">Instance Name</label>
                <input
                  type="text"
                  value={instance.instance_name || 'N/A'}
                  readOnly
                  className="w-full bg-secondary/50 border border-secondary rounded-lg px-4 py-2.5 text-white cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-2">Phone Number</label>
                <input
                  type="text"
                  value={formatPhoneNumber(instance.phone_number || '')}
                  readOnly
                  className="w-full bg-secondary/50 border border-secondary rounded-lg px-4 py-2.5 text-white cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-2">Instance Type</label>
                <input
                  type="text"
                  value={instance.instance_type?.toUpperCase() || 'N/A'}
                  readOnly
                  className="w-full bg-secondary/50 border border-secondary rounded-lg px-4 py-2.5 text-white cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-2">Connection Status</label>
                <input
                  type="text"
                  value={instance.is_connected ? '🟢 Connected' : '🔴 Disconnected'}
                  readOnly
                  className={`w-full border rounded-lg px-4 py-2.5 cursor-not-allowed font-medium ${
                    instance.is_connected
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                />
              </div>
            </div>

            {/* Auto Reply Settings */}
            <div className="bg-secondary/30 border border-white/5 rounded-lg p-6 mb-6">
              <h4 className="text-white font-medium mb-4">Bot Configuration</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Auto Reply</p>
                    <p className="text-xs text-muted">Automatically respond to messages</p>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full flex items-center ${
                      instance.settings?.auto_reply_enabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        instance.settings?.auto_reply_enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Business Hours Only</p>
                    <p className="text-xs text-muted">Only reply during business hours</p>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full flex items-center ${
                      instance.settings?.business_hours_only ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        instance.settings?.business_hours_only
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* KVKK Data Deletion Section */}
            <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    🗑️ Verilerimi Sil (KVKK Hakkı)
                  </h4>
                  <p className="text-sm text-red-300/80 mb-3">
                    6698 sayılı KVKK kapsamında, WhatsApp servisi ile ilgili tüm kişisel verilerinizi kalıcı olarak silme hakkına sahipsiniz.
                  </p>
                  <div className="bg-black/30 border border-red-500/20 rounded-lg p-4 mb-4">
                    <p className="text-xs text-red-200/90 font-medium mb-2">⚠️ Silinecek Veriler:</p>
                    <ul className="text-xs text-red-300/70 space-y-1 list-disc list-inside ml-2">
                      <li>Tüm WhatsApp mesaj geçmişiniz</li>
                      <li>Müşteri profil bilgileriniz</li>
                      <li>Oturum (session) kayıtlarınız</li>
                      <li>Hata logları ve sistem kayıtları</li>
                      <li>İstatistik ve analiz verileri</li>
                    </ul>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-4">
                    <p className="text-xs text-orange-300">
                      <strong>DİKKAT:</strong> Bu işlem geri alınamaz! Verileriniz kalıcı olarak silinecek ve
                      kurtarılamayacaktır. WhatsApp instance ayarlarınız ve bağlantınız korunacaktır, sadece
                      mesaj geçmişi ve kullanıcı verileri silinecektir.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      const confirmed = window.confirm(
                        '⚠️ TÜM VERİLERİNİZİ SİLMEK ÜZERE OLDUĞUNUZDAN EMİN MİSİNİZ?\n\n' +
                        'Bu işlem:\n' +
                        '• Tüm WhatsApp mesajlarınızı silecek\n' +
                        '• Müşteri profil bilgilerinizi silecek\n' +
                        '• Oturum kayıtlarınızı silecek\n' +
                        '• GERİ ALINAMAZ!\n\n' +
                        'Devam etmek istiyor musunuz?'
                      );

                      if (!confirmed) return;

                      const doubleConfirm = window.confirm(
                        '⚠️ SON ONAY!\n\n' +
                        'Bu işlem GERİ ALINAMAZ.\n' +
                        'Verileriniz KALICI olarak silinecek.\n\n' +
                        'EVET, VERİLERİMİ SİL'
                      );

                      if (!doubleConfirm) return;

                      try {
                        if (!user?.company_id) {
                          alert('Şirket bilgisi bulunamadı');
                          return;
                        }

                        console.log('🗑️ Starting KVKK data deletion for company:', user.company_id);

                        // First, get all session IDs for this company
                        const { data: sessions, error: getSessionsError } = await supabase
                          .from('whatsapp_sessions')
                          .select('id')
                          .eq('company_id', user.company_id);

                        if (getSessionsError) throw getSessionsError;

                        const sessionIds = sessions?.map(s => s.id) || [];

                        // Delete messages for these sessions
                        if (sessionIds.length > 0) {
                          const { error: messagesError } = await supabase
                            .from('whatsapp_messages')
                            .delete()
                            .in('session_id', sessionIds);

                          if (messagesError) throw messagesError;
                          console.log('✅ Messages deleted');
                        }

                        // Delete sessions
                        const { error: sessionsError } = await supabase
                          .from('whatsapp_sessions')
                          .delete()
                          .eq('company_id', user.company_id);

                        if (sessionsError) throw sessionsError;
                        console.log('✅ Sessions deleted');

                        // Delete user profiles
                        const { error: profilesError } = await supabase
                          .from('whatsapp_user_profiles')
                          .delete()
                          .eq('company_id', user.company_id);

                        if (profilesError) throw profilesError;
                        console.log('✅ User profiles deleted');

                        // Delete errors
                        const { error: errorsError } = await supabase
                          .from('whatsapp_errors')
                          .delete()
                          .eq('company_id', user.company_id);

                        if (errorsError) throw errorsError;
                        console.log('✅ Errors deleted');

                        // Log the deletion for compliance (audit trail)
                        await supabase
                          .from('user_service_consents')
                          .insert({
                            user_id: user.id,
                            company_id: user.company_id,
                            service_type: 'whatsapp-automation',
                            consent_given: false,
                            consent_date: new Date().toISOString(),
                            consent_version: '1.0',
                            ip_address: null,
                            notes: 'User requested data deletion (KVKK right)',
                          });

                        console.log('✅ Deletion logged for compliance');
                        alert('✅ Tüm verileriniz başarıyla silindi.\n\nSayfa yenilenecek.');
                        window.location.reload();
                      } catch (error) {
                        console.error('❌ Error deleting data:', error);
                        alert('❌ Veri silinirken bir hata oluştu. Lütfen tekrar deneyin veya destek ekibiyle iletişime geçin.');
                      }
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    TÜM VERİLERİMİ KALICI OLARAK SİL
                  </button>
                </div>
              </div>
            </div>

            {/* Read-only notice */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300 font-medium mb-1">
                    Configuration is Read-Only
                  </p>
                  <p className="text-sm text-muted">
                    All WhatsApp settings are managed by your administrator. Contact support if you
                    need to make changes to your instance configuration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KVKK / Privacy Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-gradient-to-br from-card via-primary to-card border-2 border-blue-500/50 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">WhatsApp Hizmeti Aydınlatma Metni</h2>
                  <p className="text-sm text-blue-300">KVKK ve Gizlilik Politikası</p>
                </div>
              </div>

              {/* Content */}
              <div className="bg-black/30 border border-secondary rounded-xl p-6 mb-6 max-h-96 overflow-y-auto custom-scrollbar">
                <div className="space-y-4 text-sm text-gray-300">
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">📋 Veri Sorumlusu</h3>
                    <p>
                      Bu WhatsApp servisi kapsamında toplanan kişisel verilerinizin veri sorumlusu <strong className="text-white">Allync</strong> olup,
                      verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında işlenmektedir.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">🔍 Toplanan Veriler</h3>
                    <p className="mb-2">WhatsApp servisi kapsamında aşağıdaki veriler toplanmaktadır:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>WhatsApp telefon numaranız</li>
                      <li>Adınız ve profil bilgileriniz</li>
                      <li>Gönderdiğiniz ve aldığınız mesajlar</li>
                      <li>Mesaj gönderim zamanları ve oturum bilgileri</li>
                      <li>Bot ile yaptığınız etkileşimler ve sorgu geçmişi</li>
                      <li>Hata kayıtları ve sistem logları</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">🎯 Veri İşleme Amaçları</h3>
                    <p className="mb-2">Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>WhatsApp botunun size hizmet sunabilmesi</li>
                      <li>Mesajlarınızın kaydedilmesi ve analiz edilmesi</li>
                      <li>Müşteri destek taleplerinin yönetilmesi</li>
                      <li>Hizmet kalitesinin iyileştirilmesi</li>
                      <li>İstatistiksel analizler ve raporlama</li>
                      <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">🔒 Veri Güvenliği</h3>
                    <p>
                      Kişisel verileriniz, KVKK ve ilgili mevzuat kapsamında uygun güvenlik önlemleriyle korunmaktadır.
                      Verileriniz şifrelenmiş olarak saklanır ve yetkisiz erişime karşı korunur.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">⚖️ Haklarınız</h3>
                    <p className="mb-2">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                      <li>İşlenmişse bilgi talep etme</li>
                      <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                      <li>Yurt içinde veya yurt dışında aktarıldığı 3. kişileri bilme</li>
                      <li>Verilerin eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                      <li><strong className="text-red-400">Verilerin silinmesini veya yok edilmesini talep etme</strong></li>
                      <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize
                          bir sonucun ortaya çıkması durumunda buna itiraz etme</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">🗑️ Veri Silme Hakkı</h3>
                    <p>
                      Dilediğiniz zaman <strong className="text-white">Settings (Ayarlar)</strong> sekmesinden
                      <strong className="text-red-400"> "Verilerimi Sil"</strong> butonuna tıklayarak tüm WhatsApp
                      mesaj geçmişinizi ve kişisel verilerinizi kalıcı olarak silebilirsiniz. Bu işlem geri alınamaz.
                    </p>
                  </section>

                  <section className="border-t border-gray-700 pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-white mb-2">📧 İletişim</h3>
                    <p>
                      KVKK kapsamındaki haklarınızı kullanmak veya sorularınız için:
                      <a href="mailto:privacy@allync.com" className="text-blue-400 hover:text-blue-300 ml-1">
                        privacy@allync.com
                      </a>
                    </p>
                  </section>

                  <section className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mt-4">
                    <p className="text-orange-300 text-xs">
                      ⚠️ <strong>Önemli:</strong> Bu servisi kullanmaya devam ederek yukarıdaki aydınlatma metnini
                      okuduğunuzu ve kişisel verilerinizin belirtilen amaçlarla işlenmesine açık rıza gösterdiğinizi
                      kabul etmiş olursunuz.
                    </p>
                  </section>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleAcceptConsent}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  ✓ Okudum, Anladım ve Kabul Ediyorum
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Bu metni kabul etmeden servisi kullanamazsınız. Onay vermek istemiyorsanız lütfen sayfayı kapatın.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
