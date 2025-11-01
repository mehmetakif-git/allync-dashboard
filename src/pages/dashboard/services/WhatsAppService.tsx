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
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { getWhatsappInstanceByCompanyService } from '../../../lib/api/whatsappInstances';
import { getSessionsByCompany } from '../../../lib/api/whatsappSessions';
import { getUserProfiles, type WhatsAppUserProfile } from '../../../lib/api/whatsappUserProfiles';
import type { WhatsAppInstance, WhatsAppSession } from '../../../types/whatsapp';
import ConversationDetail from '../../../components/whatsapp/ConversationDetail';
import AnalyticsDashboard from '../../../components/whatsapp/AnalyticsDashboard';
import { formatPhoneNumber, formatMessageTime } from '../../../lib/utils/whatsappFormatters';
import * as XLSX from 'xlsx';

type TabType = 'conversations' | 'analytics' | 'users' | 'settings';
type ConversationFilter = 'all' | 'active' | 'closed';

export default function WhatsAppService() {
  const { user } = useAuth();
  const { serviceId } = useParams<{ serviceId: string }>();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('conversations');

  // Data state
  const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [userProfiles, setUserProfiles] = useState<WhatsAppUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Conversation state
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [conversationFilter, setConversationFilter] = useState<ConversationFilter>('active');
  const [conversationSearch, setConversationSearch] = useState('');

  // Users state
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Refresh states
  const [refreshingConversations, setRefreshingConversations] = useState(false);
  const [refreshingUsers, setRefreshingUsers] = useState(false);

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
    if (!user?.company_id) return;

    console.log('🔔 Setting up real-time subscription for sessions');

    // Subscribe to sessions table changes
    const sessionsSubscription = supabase
      .channel(`sessions-${user.company_id}`)
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
      .subscribe();

    // Subscribe to messages table changes (to update unread counts)
    const messagesSubscription = supabase
      .channel(`messages-${user.company_id}`)
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
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('🔕 Cleaning up real-time subscriptions');
      sessionsSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, [user?.company_id]);

  // Fetch user profiles when users tab is active
  useEffect(() => {
    if (activeTab === 'users' && user?.company_id && userProfiles.length === 0) {
      setLoadingUsers(true);
      fetchUserProfiles().finally(() => setLoadingUsers(false));
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
    </div>
  );
}
