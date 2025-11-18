import { useState, useEffect } from 'react';
import { MessageCircle, ArrowLeft, Loader2, Plus, Settings as SettingsIcon, Users as UsersIcon, Mail, AlertTriangle, Download, X, Calendar, FileSpreadsheet, Edit, CheckCircle, XCircle, Star, Shield, Phone } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { OverallTab, CompaniesTab, ServiceContentTab } from '../../../components/admin/ServiceManagementTabs';
import serviceTypesAPI from '../../../lib/api/serviceTypes';
import { getAllCompaniesWithServicePricing, setCompanyServicePricing } from '../../../lib/api/companyServicePricing';
import serviceRequestsAPI from '../../../lib/api/serviceRequests';
import { getAllWhatsappInstancesWithStats } from '../../../lib/api/whatsappInstances';
import { getAllUserProfilesWithDetails } from '../../../lib/api/whatsappUserProfiles';
import { getAllMessagesWithDetails, getMessagesBySession } from '../../../lib/api/whatsappMessages';
import { getAllErrorsWithDetails } from '../../../lib/api/whatsappErrors';
import { getSessionsByCompany } from '../../../lib/api/whatsappSessions';
import { getAllIntegrationLogs, createIntegrationLog, type IntegrationLog } from '../../../lib/api/integrationLogs';
import { getAllCalendarInstances, updateCalendarStatus, type CalendarInstance } from '../../../lib/api/calendarInstances';
import { getAllSheetsInstances, updateSheetStatus, type SheetsInstance } from '../../../lib/api/sheetsInstances';
import { getAllPrivilegedContacts, togglePrivilegedContactStatus, type PrivilegedContact } from '../../../lib/api/privilegedContacts';
import { useAuth } from '../../../contexts/AuthContext';
import WhatsAppInstanceModal from '../../../components/modals/WhatsAppInstanceModal';
import WhatsAppDetailModal from '../../../components/modals/WhatsAppDetailModal';
import CalendarInstanceModal from '../../../components/modals/CalendarInstanceModal';
import SheetsInstanceModal from '../../../components/modals/SheetsInstanceModal';
import PrivilegedContactModal from '../../../components/modals/PrivilegedContactModal';
import { WhatsAppInstance } from '../../../types/whatsapp';

export default function WhatsAppServiceManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overall' | 'companies' | 'conversations' | 'users' | 'errors' | 'content' | 'integrations'>('overall');
  const [loading, setLoading] = useState(true);
  const [serviceData, setServiceData] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [showInstanceModal, setShowInstanceModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // New states for additional tabs
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allErrors, setAllErrors] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingErrors, setLoadingErrors] = useState(false);

  // Integration logs state
  const [integrationLogs, setIntegrationLogs] = useState<IntegrationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Integration management state
  const [integrationSubTab, setIntegrationSubTab] = useState<'management' | 'logs' | 'privileged'>('management');
  const [allCalendarInstances, setAllCalendarInstances] = useState<CalendarInstance[]>([]);
  const [allSheetsInstances, setAllSheetsInstances] = useState<SheetsInstance[]>([]);
  const [allPrivilegedContacts, setAllPrivilegedContacts] = useState<PrivilegedContact[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  const [loadingPrivileged, setLoadingPrivileged] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [showPrivilegedModal, setShowPrivilegedModal] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarInstance | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<SheetsInstance | null>(null);
  const [selectedContact, setSelectedContact] = useState<PrivilegedContact | null>(null);
  const [selectedCompanyForModal, setSelectedCompanyForModal] = useState<string>('');

  // Company filter states
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');
  const [availableCompanies, setAvailableCompanies] = useState<{id: string, name: string}[]>([]);

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalType, setDetailModalType] = useState<'user' | 'message' | 'error' | 'company' | null>(null);
  const [detailModalData, setDetailModalData] = useState<any>(null);

  // Conversations tab states
  const [selectedConversationCompany, setSelectedConversationCompany] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [companySessions, setCompanySessions] = useState<any[]>([]);
  const [sessionMessages, setSessionMessages] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingSessionMessages, setLoadingSessionMessages] = useState(false);

  // Export modal states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'all' | 'bot' | 'customer' | 'agent' | 'selected-session' | 'selected-company'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const SERVICE_GRADIENT = 'from-green-500 to-emerald-600';

  useEffect(() => {
    loadServiceData();
  }, []);

  const loadServiceData = async () => {
    try {
      setLoading(true);

      // Get service data
      const allServices = await serviceTypesAPI.getAllServicesWithStats();
      const whatsappService = allServices.find((s: any) => s.slug === 'whatsapp-automation');

      if (!whatsappService) {
        console.error('WhatsApp service not found in service types');
        // You may need to create it in the database
      }

      setServiceData(whatsappService);

      let companiesData: any[] = [];
      let requestsData: any[] = [];

      if (whatsappService) {
        // Fetch companies using this service with their custom pricing
        companiesData = await getAllCompaniesWithServicePricing(whatsappService.id);

        // Fetch pending service requests for this service
        requestsData = await serviceRequestsAPI.getServiceRequestsByServiceType(whatsappService.id, 'pending');
        setPendingRequests(requestsData);
      }

      // Fetch all WhatsApp instances with stats
      const instancesData = await getAllWhatsappInstancesWithStats();
      setInstances(instancesData);

      // Extract unique companies from instances if no companies from service pricing
      if (companiesData.length === 0 && instancesData.length > 0) {
        console.log('⚠️ No companies from service pricing, extracting from instances');
        const companiesMap = new Map();
        instancesData.forEach((instance: any) => {
          if (instance.company && !companiesMap.has(instance.company.id)) {
            companiesMap.set(instance.company.id, {
              id: instance.company.id,
              name: instance.company.name,
              email: instance.company.email,
              country: instance.company.country,
              status: instance.company.status,
            });
          }
        });
        companiesData = Array.from(companiesMap.values());
      }

      setCompanies(companiesData);

      console.log('📊 Loaded companies:', companiesData.length, companiesData);
      console.log('📋 Loaded pending requests:', requestsData);
      console.log('📱 Loaded instances:', instancesData.length, instancesData);
    } catch (error) {
      console.error('Error loading service data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPricing = async (companyId: string, pricing: any) => {
    if (!serviceData) return;

    try {
      console.log('💾 Setting pricing for company:', companyId, pricing);

      await setCompanyServicePricing(companyId, serviceData.id, pricing);

      console.log('✅ Pricing set successfully');

      // Refresh data
      await loadServiceData();
    } catch (error) {
      console.error('❌ Error setting pricing:', error);
      throw error;
    }
  };

  const handleViewDetails = (companyId: string) => {
    navigate(`/admin/companies/${companyId}`);
  };

  const handleManageInstances = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedInstance(null);
    setShowInstanceModal(true);
  };

  const handleEditInstance = (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
    setSelectedCompanyId(instance.company_id);
    setShowInstanceModal(true);
  };

  const handleCreateInstance = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedInstance(null);
    setShowInstanceModal(true);
  };

  const handleModalClose = () => {
    setShowInstanceModal(false);
    setSelectedInstance(null);
    setSelectedCompanyId('');
  };

  const handleModalSuccess = async () => {
    await loadServiceData();
    handleModalClose();
  };

  const handleEditContent = async (updatedData: any) => {
    if (!serviceData) return;

    try {
      console.log('💾 Updating service content:', updatedData);

      await serviceTypesAPI.updateServiceContent(serviceData.id, updatedData);

      console.log('✅ Service content updated successfully');

      // Refresh data to show updated content
      await loadServiceData();
    } catch (error) {
      console.error('❌ Error updating content:', error);
      throw error;
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }

    try {
      console.log('✅ Approving service request:', requestId);
      await serviceRequestsAPI.approveServiceRequest(requestId, user.id);
      console.log('✅ Request approved successfully');

      // Refresh data
      await loadServiceData();
    } catch (error) {
      console.error('❌ Error approving request:', error);
      throw error;
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }

    try {
      console.log('❌ Rejecting service request:', requestId, 'Reason:', reason);
      await serviceRequestsAPI.rejectServiceRequest(requestId, reason, user.id);
      console.log('✅ Request rejected successfully');

      // Refresh data
      await loadServiceData();
    } catch (error) {
      console.error('❌ Error rejecting request:', error);
      throw error;
    }
  };

  // Load users when Users tab is active
  useEffect(() => {
    if (activeTab === 'users' && allUsers.length === 0 && !loadingUsers) {
      loadUsers();
    }
  }, [activeTab]);

  // Load errors when Errors tab is active
  useEffect(() => {
    if (activeTab === 'errors' && allErrors.length === 0 && !loadingErrors) {
      loadErrors();
    }
  }, [activeTab]);

  // Load integration logs when Integrations tab is active
  useEffect(() => {
    if (activeTab === 'integrations' && integrationLogs.length === 0 && !loadingLogs) {
      loadIntegrationLogs();
    }
  }, [activeTab]);

  // Load all integrations when Integrations tab Management sub-tab is active
  useEffect(() => {
    if (activeTab === 'integrations' && integrationSubTab === 'management' && allCalendarInstances.length === 0 && allSheetsInstances.length === 0 && !loadingIntegrations) {
      loadAllIntegrations();
    }
  }, [activeTab, integrationSubTab]);

  // Load all privileged contacts when Integrations tab Privileged sub-tab is active
  useEffect(() => {
    if (activeTab === 'integrations' && integrationSubTab === 'privileged' && allPrivilegedContacts.length === 0 && !loadingPrivileged) {
      loadAllPrivilegedContacts();
    }
  }, [activeTab, integrationSubTab]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      console.log('📡 Loading all users...');
      const usersData = await getAllUserProfilesWithDetails(500);
      setAllUsers(usersData);

      // Extract unique companies
      extractCompanies(usersData);

      console.log('✅ Loaded', usersData.length, 'users');
    } catch (error) {
      console.error('❌ Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadErrors = async () => {
    try {
      setLoadingErrors(true);
      console.log('📡 Loading all errors...');
      const errorsData = await getAllErrorsWithDetails(500);
      setAllErrors(errorsData);

      // Extract unique companies
      extractCompanies(errorsData);

      console.log('✅ Loaded', errorsData.length, 'errors');
    } catch (error) {
      console.error('❌ Error loading errors:', error);
    } finally {
      setLoadingErrors(false);
    }
  };

  const loadIntegrationLogs = async () => {
    try {
      setLoadingLogs(true);
      console.log('📡 Loading integration logs...');
      const logsData = await getAllIntegrationLogs(200);
      setIntegrationLogs(logsData);

      // Extract unique companies
      extractCompanies(logsData);

      console.log('✅ Loaded', logsData.length, 'integration logs');
    } catch (error) {
      console.error('❌ Error loading integration logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const loadAllIntegrations = async () => {
    try {
      setLoadingIntegrations(true);
      console.log('📡 Loading all calendar and sheets integrations...');

      const [calendarsData, sheetsData] = await Promise.all([
        getAllCalendarInstances(),
        getAllSheetsInstances()
      ]);

      setAllCalendarInstances(calendarsData);
      setAllSheetsInstances(sheetsData);

      console.log('✅ Loaded', calendarsData.length, 'calendars and', sheetsData.length, 'sheets');
    } catch (error) {
      console.error('❌ Error loading integrations:', error);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  // Handle calendar status toggle
  const handleToggleCalendarStatus = async (calendar: CalendarInstance) => {
    try {
      const newStatus = calendar.status === 'active' ? 'inactive' : 'active';
      console.log('🔄 Toggling calendar status:', calendar.id, 'to', newStatus);

      await updateCalendarStatus(calendar.id, newStatus);

      // Create activity log
      await createIntegrationLog({
        company_id: calendar.company_id,
        user_id: user?.id || null,
        action: 'update',
        entity_type: 'calendar_instance',
        entity_id: calendar.id,
        description: `Super admin ${newStatus === 'active' ? 'activated' : 'deactivated'} calendar: ${calendar.instance_name}`,
        details: {
          calendar_name: calendar.calendar_name,
          previous_status: calendar.status,
          new_status: newStatus,
        },
        changed_data: {
          old: { status: calendar.status },
          new: { status: newStatus },
        },
      });

      // Refresh integrations
      await loadAllIntegrations();

      console.log('✅ Calendar status updated successfully');
    } catch (error) {
      console.error('❌ Error toggling calendar status:', error);
      alert('Failed to update calendar status. Please try again.');
    }
  };

  // Handle sheet status toggle
  const handleToggleSheetStatus = async (sheet: SheetsInstance) => {
    try {
      const newStatus = sheet.status === 'active' ? 'inactive' : 'active';
      console.log('🔄 Toggling sheet status:', sheet.id, 'to', newStatus);

      await updateSheetStatus(sheet.id, newStatus);

      // Create activity log
      await createIntegrationLog({
        company_id: sheet.company_id,
        user_id: user?.id || null,
        action: 'update',
        entity_type: 'sheets_instance',
        entity_id: sheet.id,
        description: `Super admin ${newStatus === 'active' ? 'activated' : 'deactivated'} sheet: ${sheet.google_sheet_name}`,
        details: {
          sheet_name: sheet.google_sheet_name,
          previous_status: sheet.status,
          new_status: newStatus,
        },
        changed_data: {
          old: { status: sheet.status },
          new: { status: newStatus },
        },
      });

      // Refresh integrations
      await loadAllIntegrations();

      console.log('✅ Sheet status updated successfully');
    } catch (error) {
      console.error('❌ Error toggling sheet status:', error);
      alert('Failed to update sheet status. Please try again.');
    }
  };

  // Handle edit calendar
  const handleEditCalendar = (calendar: CalendarInstance) => {
    setSelectedCalendar(calendar);
    setSelectedCompanyForModal(calendar.company_id);
    setShowCalendarModal(true);
  };

  // Handle edit sheet
  const handleEditSheet = (sheet: SheetsInstance) => {
    setSelectedSheet(sheet);
    setSelectedCompanyForModal(sheet.company_id);
    setShowSheetsModal(true);
  };

  // Handle calendar modal success
  const handleCalendarModalSuccess = async () => {
    setShowCalendarModal(false);
    setSelectedCalendar(null);
    setSelectedCompanyForModal('');
    await loadAllIntegrations();
    await loadIntegrationLogs(); // Refresh logs too
  };

  // Handle sheet modal success
  const handleSheetModalSuccess = async () => {
    setShowSheetsModal(false);
    setSelectedSheet(null);
    setSelectedCompanyForModal('');
    await loadAllIntegrations();
    await loadIntegrationLogs(); // Refresh logs too
  };

  // Load all privileged contacts
  const loadAllPrivilegedContacts = async () => {
    try {
      setLoadingPrivileged(true);
      console.log('📡 Loading all privileged contacts...');

      const contactsData = await getAllPrivilegedContacts();
      setAllPrivilegedContacts(contactsData);

      console.log('✅ Loaded', contactsData.length, 'privileged contacts');
    } catch (error) {
      console.error('❌ Error loading privileged contacts:', error);
    } finally {
      setLoadingPrivileged(false);
    }
  };

  // Handle privileged contact status toggle
  const handleToggleContactStatus = async (contact: PrivilegedContact) => {
    try {
      const newStatus = !contact.is_active;
      console.log('🔄 Toggling contact status:', contact.id, 'to', newStatus ? 'active' : 'inactive');

      await togglePrivilegedContactStatus(contact.id);

      // Create activity log
      await createIntegrationLog({
        company_id: contact.company_id,
        user_id: user?.id || null,
        action: 'update',
        entity_type: 'privileged_contact' as any,
        entity_id: contact.id,
        description: `Super admin ${newStatus ? 'activated' : 'deactivated'} privileged contact: ${contact.contact_name}`,
        details: {
          contact_name: contact.contact_name,
          contact_phone: contact.contact_phone,
          previous_status: contact.is_active,
          new_status: newStatus,
        },
        changed_data: {
          old: { is_active: contact.is_active },
          new: { is_active: newStatus },
        },
      });

      // Refresh privileged contacts
      await loadAllPrivilegedContacts();

      console.log('✅ Contact status updated successfully');
    } catch (error) {
      console.error('❌ Error toggling contact status:', error);
      alert('Failed to update contact status. Please try again.');
    }
  };

  // Handle edit privileged contact
  const handleEditContact = (contact: PrivilegedContact) => {
    setSelectedContact(contact);
    setSelectedCompanyForModal(contact.company_id);
    setShowPrivilegedModal(true);
  };

  // Handle privileged contact modal success
  const handlePrivilegedModalSuccess = async () => {
    setShowPrivilegedModal(false);
    setSelectedContact(null);
    setSelectedCompanyForModal('');
    await loadAllPrivilegedContacts();
    await loadIntegrationLogs(); // Refresh logs too
  };

  // Extract unique companies from data
  const extractCompanies = (data: any[]) => {
    const companiesMap = new Map<string, string>();
    data.forEach(item => {
      if (item.company?.id && item.company?.name) {
        companiesMap.set(item.company.id, item.company.name);
      }
    });

    const companiesList = Array.from(companiesMap.entries()).map(([id, name]) => ({ id, name }));
    companiesList.sort((a, b) => a.name.localeCompare(b.name));

    setAvailableCompanies(companiesList);
  };

  // Load sessions for selected company
  const loadCompanySessions = async (companyId: string) => {
    try {
      setLoadingSessions(true);
      console.log('📡 Loading sessions for company:', companyId);
      const sessionsData = await getSessionsByCompany(companyId);
      setCompanySessions(sessionsData);
      console.log('✅ Loaded', sessionsData.length, 'sessions');
    } catch (error) {
      console.error('❌ Error loading sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Load messages for selected session
  const loadSessionMessages = async (sessionId: string) => {
    try {
      setLoadingSessionMessages(true);
      console.log('📡 Loading messages for session:', sessionId);
      const messagesData = await getMessagesBySession(sessionId);
      setSessionMessages(messagesData);
      console.log('✅ Loaded', messagesData.length, 'messages');
    } catch (error) {
      console.error('❌ Error loading session messages:', error);
    } finally {
      setLoadingSessionMessages(false);
    }
  };

  // Handle company selection in Conversations tab
  const handleSelectConversationCompany = async (companyId: string) => {
    setSelectedConversationCompany(companyId);
    setSelectedSession(null);
    setSessionMessages([]);
    await loadCompanySessions(companyId);
  };

  // Handle session selection
  const handleSelectSession = async (session: any) => {
    setSelectedSession(session);
    await loadSessionMessages(session.id);
  };

  // Filter data by selected company
  const filteredUsers = selectedCompanyFilter === 'all'
    ? allUsers
    : allUsers.filter(u => u.company?.id === selectedCompanyFilter);

  const filteredErrors = selectedCompanyFilter === 'all'
    ? allErrors
    : allErrors.filter(e => e.company?.id === selectedCompanyFilter);

  // Detail modal handlers
  const handleViewUserDetail = (user: any) => {
    setDetailModalData(user);
    setDetailModalType('user');
    setShowDetailModal(true);
  };

  const handleViewMessageDetail = (message: any) => {
    setDetailModalData(message);
    setDetailModalType('message');
    setShowDetailModal(true);
  };

  const handleViewErrorDetail = (error: any) => {
    setDetailModalData(error);
    setDetailModalType('error');
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setDetailModalType(null);
    setDetailModalData(null);
  };

  // Excel Export Handler
  const handleExport = async () => {
    try {
      setIsExporting(true);
      let dataToExport: any[] = [];
      let filename = 'whatsapp-messages';

      switch (exportType) {
        case 'all':
          // Export all messages from all companies
          const allCompanyMessages = await Promise.all(
            companies.map(async (company) => {
              const sessions = await getSessionsByCompany(company.id);
              const messagesPromises = sessions.map(session => getMessagesBySession(session.id));
              const messagesArrays = await Promise.all(messagesPromises);
              return messagesArrays.flat().map(msg => ({
                company_name: company.name,
                session_id: msg.session_id,
                sender: msg.sender,
                message: msg.message_body || msg.body,
                message_type: msg.message_type,
                sentiment: msg.sentiment,
                created_at: new Date(msg.created_at).toLocaleString(),
              }));
            })
          );
          dataToExport = allCompanyMessages.flat();
          filename = 'all-messages';
          break;

        case 'bot':
          const allBotMessages = await Promise.all(
            companies.map(async (company) => {
              const sessions = await getSessionsByCompany(company.id);
              const messagesPromises = sessions.map(session => getMessagesBySession(session.id));
              const messagesArrays = await Promise.all(messagesPromises);
              return messagesArrays.flat()
                .filter(msg => msg.sender === 'bot')
                .map(msg => ({
                  company_name: company.name,
                  session_id: msg.session_id,
                  message: msg.message_body || msg.body,
                  message_type: msg.message_type,
                  created_at: new Date(msg.created_at).toLocaleString(),
                }));
            })
          );
          dataToExport = allBotMessages.flat();
          filename = 'bot-messages';
          break;

        case 'customer':
          const allCustomerMessages = await Promise.all(
            companies.map(async (company) => {
              const sessions = await getSessionsByCompany(company.id);
              const messagesPromises = sessions.map(session => getMessagesBySession(session.id));
              const messagesArrays = await Promise.all(messagesPromises);
              return messagesArrays.flat()
                .filter(msg => msg.sender === 'customer')
                .map(msg => ({
                  company_name: company.name,
                  session_id: msg.session_id,
                  message: msg.message_body || msg.body,
                  message_type: msg.message_type,
                  sentiment: msg.sentiment,
                  created_at: new Date(msg.created_at).toLocaleString(),
                }));
            })
          );
          dataToExport = allCustomerMessages.flat();
          filename = 'customer-messages';
          break;

        case 'agent':
          const allAgentMessages = await Promise.all(
            companies.map(async (company) => {
              const sessions = await getSessionsByCompany(company.id);
              const messagesPromises = sessions.map(session => getMessagesBySession(session.id));
              const messagesArrays = await Promise.all(messagesPromises);
              return messagesArrays.flat()
                .filter(msg => msg.sender === 'agent')
                .map(msg => ({
                  company_name: company.name,
                  session_id: msg.session_id,
                  message: msg.message_body || msg.body,
                  message_type: msg.message_type,
                  created_at: new Date(msg.created_at).toLocaleString(),
                }));
            })
          );
          dataToExport = allAgentMessages.flat();
          filename = 'agent-messages';
          break;

        case 'selected-session':
          if (!selectedSession) {
            alert('Please select a session first');
            return;
          }
          dataToExport = sessionMessages.map(msg => ({
            sender: msg.sender,
            message: msg.message_body || msg.body,
            message_type: msg.message_type,
            sentiment: msg.sentiment,
            created_at: new Date(msg.created_at).toLocaleString(),
          }));
          filename = `session-${selectedSession.customer_name || 'conversation'}`;
          break;

        case 'selected-company':
          if (!selectedConversationCompany) {
            alert('Please select a company first');
            return;
          }
          const selectedCompany = companies.find(c => c.id === selectedConversationCompany);
          const compSessions = await getSessionsByCompany(selectedConversationCompany);
          const compMessagesPromises = compSessions.map(session => getMessagesBySession(session.id));
          const compMessagesArrays = await Promise.all(compMessagesPromises);
          dataToExport = compMessagesArrays.flat().map(msg => ({
            session_id: msg.session_id,
            sender: msg.sender,
            message: msg.message_body || msg.body,
            message_type: msg.message_type,
            sentiment: msg.sentiment,
            created_at: new Date(msg.created_at).toLocaleString(),
          }));
          filename = `${selectedCompany?.name || 'company'}-messages`;
          break;
      }

      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Messages');

      // Generate and download file
      XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);

      console.log('✅ Exported', dataToExport.length, 'messages');
      setShowExportModal(false);
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate stats
  const totalCompanies = companies.length;
  const activeSubscriptions = companies.filter(c => c.status === 'active').length;
  const totalInstances = instances.length;
  const connectedInstances = instances.filter(i => i.is_connected).length;
  const totalMessages = instances.reduce((sum, i) => sum + (i.stats?.today_messages || 0), 0);
  const activeSessions = instances.reduce((sum, i) => sum + (i.stats?.active_sessions || 0), 0);
  const totalRevenue = companies.reduce((sum, c) => {
    if (c.customPricing) {
      return sum + Object.values(c.customPricing).reduce((psum: number, p: any) => psum + (p.price || 0), 0);
    }
    return sum;
  }, 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
          <p className="text-white text-xl">Loading WhatsApp service data...</p>
        </div>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-8 text-center">
            <MessageCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-orange-400 mb-2">WhatsApp Service Not Found</h2>
            <p className="text-orange-300 mb-4">
              The WhatsApp service type hasn't been created in the database yet.
            </p>
            <p className="text-sm text-muted">
              You need to create a service type with slug 'whatsapp-service' in the service_types table.
            </p>
            <button
              onClick={() => navigate('/admin/services-catalog')}
              className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Go to Services Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/services-catalog')}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${SERVICE_GRADIENT} rounded-xl flex items-center justify-center`}>
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">WhatsApp Service Management</h1>
                <p className="text-muted">Manage WhatsApp bot instances and integrations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Active Companies</p>
                <p className="text-3xl font-bold text-white mt-2">{activeSubscriptions}</p>
              </div>
              <MessageCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Total Instances</p>
                <p className="text-3xl font-bold text-white mt-2">{totalInstances}</p>
                <p className="text-xs text-muted mt-1">{connectedInstances} connected</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${connectedInstances > 0 ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                <div className={`w-6 h-6 rounded-full ${connectedInstances > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Messages Today</p>
                <p className="text-3xl font-bold text-white mt-2">{totalMessages}</p>
              </div>
              <div className="text-4xl">💬</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Active Sessions</p>
                <p className="text-3xl font-bold text-white mt-2">{activeSessions}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-secondary overflow-x-auto">
          <button
            onClick={() => setActiveTab('overall')}
            className={`pb-3 px-4 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'overall' ? 'text-green-400' : 'text-muted hover:text-secondary'
            }`}
          >
            Overall
            {activeTab === 'overall' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`pb-3 px-4 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'companies' ? 'text-green-400' : 'text-muted hover:text-secondary'
            }`}
          >
            Companies ({totalCompanies})
            {activeTab === 'companies' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('conversations')}
            className={`pb-3 px-4 font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'conversations' ? 'text-cyan-400' : 'text-muted hover:text-secondary'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Conversations
            {activeTab === 'conversations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'users' ? 'text-blue-400' : 'text-muted hover:text-secondary'
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            Users ({allUsers.length})
            {activeTab === 'users' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`pb-3 px-4 font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'errors' ? 'text-red-400' : 'text-muted hover:text-secondary'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Errors ({allErrors.filter(e => !e.is_resolved).length})
            {activeTab === 'errors' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`pb-3 px-4 font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'integrations' ? 'text-purple-400' : 'text-muted hover:text-secondary'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Integrations ({integrationLogs.length})
            {activeTab === 'integrations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-3 px-4 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'content' ? 'text-green-400' : 'text-muted hover:text-secondary'
            }`}
          >
            Service Content
            {activeTab === 'content' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overall' && (
          <OverallTab
            serviceData={serviceData}
            totalCompanies={totalCompanies}
            activeSubscriptions={activeSubscriptions}
            totalRevenue={totalRevenue}
            pendingRequests={pendingRequests}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            serviceGradient={SERVICE_GRADIENT}
            additionalStats={{
              'Total Instances': totalInstances,
              'Connected Instances': connectedInstances,
              'Messages Today': totalMessages,
              'Active Sessions': activeSessions,
            }}
          />
        )}

        {activeTab === 'companies' && (
          <CompaniesTab
            companies={companies.map(c => ({
              ...c,
              instances: instances.filter(i => i.company_id === c.id),
            }))}
            onSetPricing={handleSetPricing}
            onViewDetails={handleViewDetails}
            onManageInstances={handleManageInstances}
            serviceGradient={SERVICE_GRADIENT}
          />
        )}

        {/* ========== CONVERSATIONS TAB ========== */}
        {activeTab === 'conversations' && (
          <div className="space-y-4">
            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            </div>

            <div className="flex gap-4 h-[calc(100vh-460px)]">
            {/* Left Sidebar - Companies */}
            <div className="w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-secondary/50">
                <h3 className="text-lg font-semibold text-white">Companies</h3>
                <p className="text-xs text-muted mt-1">Select a company to view conversations</p>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                  </div>
                ) : companies.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted text-sm">No companies found</p>
                    <p className="text-xs text-muted mt-2">Companies with WhatsApp service will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {companies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => handleSelectConversationCompany(company.id)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedConversationCompany === company.id
                            ? 'bg-cyan-500/20 border border-cyan-500/50'
                            : 'bg-primary/50 border border-secondary hover:border-cyan-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white">
                            {company.name?.charAt(0) || 'C'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{company.name}</p>
                            <p className="text-xs text-muted">Click to view sessions</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Middle - Sessions List */}
            <div className="w-96 bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-secondary/50">
                <h3 className="text-lg font-semibold text-white">Sessions</h3>
                <p className="text-xs text-muted mt-1">
                  {selectedConversationCompany ? `${companySessions.length} conversations` : 'Select a company'}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {!selectedConversationCompany ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-muted text-sm">Select a company to view sessions</p>
                  </div>
                ) : loadingSessions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                  </div>
                ) : companySessions.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-muted text-sm">No sessions found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {companySessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => handleSelectSession(session)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedSession?.id === session.id
                            ? 'bg-cyan-500/20 border border-cyan-500/50'
                            : 'bg-primary/50 border border-secondary hover:border-cyan-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-medium text-white">{session.customer_name || 'Unknown'}</p>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            session.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {session.is_active ? 'Active' : 'Closed'}
                          </span>
                        </div>
                        <p className="text-xs text-muted">{session.customer_phone || 'No phone'}</p>
                        <p className="text-xs text-muted mt-1">
                          Messages: {session.message_count || 0}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right - Chat Messages */}
            <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-secondary/50">
                <h3 className="text-lg font-semibold text-white">
                  {selectedSession ? selectedSession.customer_name || 'Conversation' : 'Messages'}
                </h3>
                <p className="text-xs text-muted mt-1">
                  {selectedSession ? selectedSession.customer_phone || 'No phone' : 'Select a session to view messages'}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {!selectedSession ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-muted text-sm">Select a session to view the conversation</p>
                  </div>
                ) : loadingSessionMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                  </div>
                ) : sessionMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-muted text-sm">No messages in this conversation</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessionMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'customer' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === 'customer'
                            ? 'bg-primary border border-secondary'
                            : message.sender === 'bot'
                            ? 'bg-green-500/20 border border-green-500/30'
                            : 'bg-blue-500/20 border border-blue-500/30'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${
                              message.sender === 'customer' ? 'text-blue-400' :
                              message.sender === 'bot' ? 'text-green-400' :
                              'text-orange-400'
                            }`}>
                              {message.sender === 'customer' ? 'Customer' :
                               message.sender === 'bot' ? 'Bot' : 'Agent'}
                            </span>
                            <span className="text-xs text-muted">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-white whitespace-pre-wrap">
                            {message.message_body || message.body || 'No content'}
                          </p>
                          {message.message_type && message.message_type !== 'text' && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs bg-black/30 rounded">
                              {message.message_type}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        )}

        {/* ========== INTEGRATIONS TAB ========== */}
        {activeTab === 'integrations' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] overflow-hidden">
            {/* Sub-tabs Navigation */}
            <div className="flex gap-4 border-b border-secondary/50 px-6 pt-6">
              <button
                onClick={() => setIntegrationSubTab('management')}
                className={`pb-3 px-4 font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${
                  integrationSubTab === 'management' ? 'text-purple-400' : 'text-muted hover:text-secondary'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                Integration Management
                {integrationSubTab === 'management' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
                )}
              </button>
              <button
                onClick={() => setIntegrationSubTab('logs')}
                className={`pb-3 px-4 font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${
                  integrationSubTab === 'logs' ? 'text-purple-400' : 'text-muted hover:text-secondary'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Activity Logs ({integrationLogs.length})
                {integrationSubTab === 'logs' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
                )}
              </button>
              <button
                onClick={() => setIntegrationSubTab('privileged')}
                className={`pb-3 px-4 font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${
                  integrationSubTab === 'privileged' ? 'text-amber-400' : 'text-muted hover:text-secondary'
                }`}
              >
                <Star className="w-4 h-4" />
                Privileged Contacts ({allPrivilegedContacts.length})
                {integrationSubTab === 'privileged' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                )}
              </button>
            </div>

            {/* Integration Management Sub-tab */}
            {integrationSubTab === 'management' && (
              <div>
                <div className="p-6 border-b border-secondary/50">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                    <SettingsIcon className="w-6 h-6 text-purple-400" />
                    Manage All Integrations
                  </h3>
                  <p className="text-sm text-muted">
                    View, edit, and control all calendar and sheets integrations across all companies
                  </p>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <p className="text-sm text-blue-300 font-medium">Total Calendars</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{allCalendarInstances.length}</p>
                      <p className="text-xs text-muted mt-1">
                        {allCalendarInstances.filter(c => c.status === 'active').length} active
                      </p>
                    </div>
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <FileSpreadsheet className="w-4 h-4 text-green-400" />
                        <p className="text-sm text-green-300 font-medium">Total Sheets</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{allSheetsInstances.length}</p>
                      <p className="text-xs text-muted mt-1">
                        {allSheetsInstances.filter(s => s.status === 'active').length} active
                      </p>
                    </div>
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <SettingsIcon className="w-4 h-4 text-purple-400" />
                        <p className="text-sm text-purple-300 font-medium">Total Integrations</p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {allCalendarInstances.length + allSheetsInstances.length}
                      </p>
                      <p className="text-xs text-muted mt-1">Across all companies</p>
                    </div>
                  </div>
                </div>

                {/* Integrations Table */}
                <div className="overflow-x-auto">
                  {loadingIntegrations ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                  ) : allCalendarInstances.length === 0 && allSheetsInstances.length === 0 ? (
                    <div className="text-center py-12">
                      <SettingsIcon className="w-16 h-16 text-muted mx-auto mb-3 opacity-50" />
                      <p className="text-muted">No integrations found</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Integration Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Purpose
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {/* Calendar Instances */}
                        {allCalendarInstances.map((calendar: any) => (
                          <tr key={`calendar-${calendar.id}`} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-xs font-bold text-white">
                                  {calendar.company?.name?.charAt(0) || 'C'}
                                </div>
                                <span className="text-white font-medium">{calendar.company?.name || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-white">
                              {calendar.instance_name || calendar.calendar_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="flex items-center gap-1 text-blue-400">
                                <Calendar className="w-3.5 h-3.5" />
                                Calendar
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {calendar.purpose || 'general'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleToggleCalendarStatus(calendar)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                                  calendar.status === 'active'
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                                }`}
                              >
                                {calendar.status === 'active' ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" />
                                    Inactive
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleEditCalendar(calendar)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg font-medium transition-all"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* Sheets Instances */}
                        {allSheetsInstances.map((sheet: any) => (
                          <tr key={`sheet-${sheet.id}`} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                                  {sheet.company?.name?.charAt(0) || 'C'}
                                </div>
                                <span className="text-white font-medium">{sheet.company?.name || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-white">
                              {sheet.google_sheet_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="flex items-center gap-1 text-green-400">
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                Sheets
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {sheet.purpose || 'general'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleToggleSheetStatus(sheet)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                                  sheet.status === 'active'
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                                }`}
                              >
                                {sheet.status === 'active' ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" />
                                    Inactive
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleEditSheet(sheet)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg font-medium transition-all"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Activity Logs Sub-tab */}
            {integrationSubTab === 'logs' && (
              <div>
                <div className="p-6 border-b border-secondary/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-purple-400" />
                      Integration Activity Logs
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted">
                        Total: <span className="text-white font-semibold">{integrationLogs.length}</span>
                      </span>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <p className="text-sm text-blue-300 font-medium">Calendar Integrations</p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {integrationLogs.filter(log => log.entity_type === 'calendar_instance').length}
                      </p>
                    </div>
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <FileSpreadsheet className="w-4 h-4 text-green-400" />
                        <p className="text-sm text-green-300 font-medium">Sheets Integrations</p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {integrationLogs.filter(log => log.entity_type === 'sheets_instance').length}
                      </p>
                    </div>
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <p className="text-sm text-red-300 font-medium">Failed Operations</p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {integrationLogs.filter(log => log.status === 'failed').length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logs Table */}
                <div className="overflow-x-auto">
                  {loadingLogs ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                  ) : integrationLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-muted mx-auto mb-3 opacity-50" />
                      <p className="text-muted">No integration logs found</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Timestamp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Action
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {integrationLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {log.company?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {log.entity_type === 'calendar_instance' ? (
                                <span className="flex items-center gap-1 text-blue-400">
                                  <Calendar className="w-3.5 h-3.5" />
                                  Calendar
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-green-400">
                                  <FileSpreadsheet className="w-3.5 h-3.5" />
                                  Sheets
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                log.action === 'create' ? 'bg-green-500/20 text-green-400' :
                                log.action === 'update' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {log.action.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300 max-w-md truncate">
                              {log.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {log.user?.full_name || log.user?.email || 'System'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                log.status === 'success' ? 'bg-green-500/20 text-green-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Privileged Contacts Sub-tab */}
            {integrationSubTab === 'privileged' && (
              <div>
                <div className="p-6 border-b border-secondary/50">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                    <Star className="w-6 h-6 text-amber-400" />
                    Privileged Contacts Management
                  </h3>
                  <p className="text-sm text-muted mb-6">
                    View, edit, and control privileged contacts across all companies (Max 2 per company)
                  </p>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-amber-400" />
                        <p className="text-sm text-amber-300 font-medium">Total Contacts</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{allPrivilegedContacts.length}</p>
                      <p className="text-xs text-muted mt-1">
                        {allPrivilegedContacts.filter(c => c.is_active).length} active
                      </p>
                    </div>
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-purple-400" />
                        <p className="text-sm text-purple-300 font-medium">Owners & Managers</p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {allPrivilegedContacts.filter(c => c.privilege_level === 'owner' || c.privilege_level === 'manager').length}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <UsersIcon className="w-4 h-4 text-blue-400" />
                        <p className="text-sm text-blue-300 font-medium">VIP Customers</p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {allPrivilegedContacts.filter(c => c.privilege_level === 'vip_customer').length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Privileged Contacts Table */}
                <div className="overflow-x-auto">
                  {loadingPrivileged ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    </div>
                  ) : allPrivilegedContacts.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="w-16 h-16 text-muted mx-auto mb-3 opacity-50" />
                      <p className="text-muted">No privileged contacts found</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Privilege Level
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Features
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {allPrivilegedContacts.map((contact: any) => (
                          <tr key={contact.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-xs font-bold text-white">
                                  {contact.company?.name?.charAt(0) || 'C'}
                                </div>
                                <span className="text-white font-medium">{contact.company?.name || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-white">
                              {contact.contact_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" />
                                {contact.contact_phone}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`flex items-center gap-1 ${
                                contact.privilege_level === 'owner' ? 'text-amber-400' :
                                contact.privilege_level === 'manager' ? 'text-purple-400' :
                                contact.privilege_level === 'employee' ? 'text-blue-400' :
                                'text-pink-400'
                              }`}>
                                {contact.privilege_level === 'owner' ? '👑 Owner' :
                                 contact.privilege_level === 'manager' ? '👔 Manager' :
                                 contact.privilege_level === 'employee' ? '👷 Employee' :
                                 '⭐ VIP'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex flex-wrap gap-1">
                                {contact.allowed_features.view_stock && (
                                  <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">📦</span>
                                )}
                                {contact.allowed_features.export_data && (
                                  <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">📤</span>
                                )}
                                {contact.allowed_features.view_reports && (
                                  <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">📊</span>
                                )}
                                {contact.allowed_features.modify_appointments && (
                                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">📅</span>
                                )}
                                {contact.allowed_features.access_customer_data && (
                                  <span className="px-1.5 py-0.5 bg-pink-500/20 text-pink-400 text-xs rounded">👥</span>
                                )}
                                {contact.allowed_features.view_all_appointments && (
                                  <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">🗓️</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleToggleContactStatus(contact)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                                  contact.is_active
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                                }`}
                              >
                                {contact.is_active ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" />
                                    Inactive
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleEditContact(contact)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg font-medium transition-all"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <ServiceContentTab
            serviceData={serviceData}
            onEditContent={handleEditContent}
            serviceGradient={SERVICE_GRADIENT}
          />
        )}

        {/* ========== USERS TAB ========== */}
        {activeTab === 'users' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] overflow-hidden">
            <div className="p-6 border-b border-secondary/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">All WhatsApp User Profiles</h3>
                  <p className="text-sm text-muted">Complete list of all WhatsApp users across all companies</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-400">{filteredUsers.length}</p>
                  <p className="text-xs text-muted">
                    {selectedCompanyFilter === 'all' ? 'Total Users' : 'Filtered Users'}
                  </p>
                </div>
              </div>

              {/* Company Filter */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-white">Filter by Company:</label>
                <select
                  value={selectedCompanyFilter}
                  onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Companies ({allUsers.length})</option>
                  {availableCompanies.map(company => {
                    const count = allUsers.filter(u => u.company?.id === company.id).length;
                    return (
                      <option key={company.id} value={company.id}>
                        {company.name} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="p-6">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">No Users Found</p>
                  <p className="text-muted text-sm">
                    {selectedCompanyFilter === 'all'
                      ? 'No WhatsApp user profiles have been created yet.'
                      : 'No users found for the selected company.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary/50 border-b border-secondary">
                      <tr>
                        {selectedCompanyFilter === 'all' && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase">Company</th>
                        )}
                        <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase">Messages</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase">Last Seen</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredUsers.map((userProfile) => (
                        <tr
                          key={userProfile.id}
                          onClick={() => handleViewUserDetail(userProfile)}
                          className="hover:bg-primary/30 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-xs font-bold text-white">
                                {userProfile.company?.name?.charAt(0) || 'C'}
                              </div>
                              <span className="text-sm text-white font-medium">{userProfile.company?.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-white">{userProfile.name || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted font-mono">{userProfile.phone_number || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted">{userProfile.email || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-blue-400 font-medium">{userProfile.total_messages || 0}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-muted">
                              {userProfile.last_seen ? new Date(userProfile.last_seen).toLocaleString() : 'Never'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                              userProfile.customer_status === 'active' || userProfile.status === 'active'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {userProfile.customer_status || userProfile.status || 'inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== ERRORS TAB ========== */}
        {activeTab === 'errors' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] overflow-hidden">
            <div className="p-6 border-b border-secondary/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">All WhatsApp Errors</h3>
                  <p className="text-sm text-muted">System errors and issues across all companies</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-400">{filteredErrors.filter(e => !e.is_resolved).length}</p>
                  <p className="text-xs text-muted">
                    {selectedCompanyFilter === 'all' ? 'Unresolved Errors' : 'Unresolved (Filtered)'}
                  </p>
                </div>
              </div>

              {/* Company Filter */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-white">Filter by Company:</label>
                <select
                  value={selectedCompanyFilter}
                  onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Companies ({allErrors.length})</option>
                  {availableCompanies.map(company => {
                    const count = allErrors.filter(e => e.company?.id === company.id).length;
                    return (
                      <option key={company.id} value={company.id}>
                        {company.name} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="p-6">
              {loadingErrors ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                </div>
              ) : filteredErrors.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">No Errors Found</p>
                  <p className="text-muted text-sm">
                    {selectedCompanyFilter === 'all'
                      ? 'Great! No errors have been logged.'
                      : 'No errors found for the selected company.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredErrors.map((error) => (
                    <div
                      key={error.id}
                      onClick={() => handleViewErrorDetail(error)}
                      className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                      error.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                      error.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                      error.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-blue-500/10 border-blue-500/30'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {selectedCompanyFilter === 'all' && (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
                              {error.company?.name?.charAt(0) || 'C'}
                            </div>
                          )}
                          <div>
                            {selectedCompanyFilter === 'all' && (
                              <p className="text-sm font-medium text-white">{error.company?.name || 'Unknown Company'}</p>
                            )}
                            <p className="text-xs text-muted">{error.error_type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                            error.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            error.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            error.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {error.severity}
                          </span>
                          {error.is_resolved && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium rounded-md bg-green-500/20 text-green-400">
                              Resolved
                            </span>
                          )}
                          <p className="text-xs text-muted mt-1">{new Date(error.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="bg-black/20 rounded-lg p-3 mt-2">
                        <p className="text-sm text-white font-medium mb-1">{error.error_message}</p>
                        {error.error_details && (
                          <pre className="text-xs text-muted mt-2 overflow-x-auto">
                            {JSON.stringify(error.error_details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp Instance Modal */}
      <WhatsAppInstanceModal
        isOpen={showInstanceModal}
        onClose={handleModalClose}
        instance={selectedInstance}
        companyId={selectedCompanyId}
        onSuccess={handleModalSuccess}
      />

      {/* WhatsApp Detail Modal */}
      <WhatsAppDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        type={detailModalType}
        data={detailModalData}
      />

      {/* Calendar Instance Modal */}
      <CalendarInstanceModal
        isOpen={showCalendarModal}
        onClose={() => {
          setShowCalendarModal(false);
          setSelectedCalendar(null);
          setSelectedCompanyForModal('');
        }}
        onSuccess={handleCalendarModalSuccess}
        companyId={selectedCompanyForModal}
        instance={selectedCalendar}
      />

      {/* Sheets Instance Modal */}
      <SheetsInstanceModal
        isOpen={showSheetsModal}
        onClose={() => {
          setShowSheetsModal(false);
          setSelectedSheet(null);
          setSelectedCompanyForModal('');
        }}
        onSuccess={handleSheetModalSuccess}
        companyId={selectedCompanyForModal}
        instance={selectedSheet}
      />

      {/* Privileged Contact Modal */}
      <PrivilegedContactModal
        isOpen={showPrivilegedModal}
        onClose={() => {
          setShowPrivilegedModal(false);
          setSelectedContact(null);
          setSelectedCompanyForModal('');
        }}
        onSuccess={handlePrivilegedModalSuccess}
        companyId={selectedCompanyForModal}
        contact={selectedContact}
      />

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-secondary rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Export Messages to Excel</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-3">Select Export Type:</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-secondary rounded-lg hover:border-cyan-500/50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="exportType"
                      value="all"
                      checked={exportType === 'all'}
                      onChange={(e) => setExportType(e.target.value as any)}
                      className="w-4 h-4 text-cyan-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">All Messages</p>
                      <p className="text-xs text-muted">Export all messages from all companies</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-secondary rounded-lg hover:border-green-500/50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="exportType"
                      value="bot"
                      checked={exportType === 'bot'}
                      onChange={(e) => setExportType(e.target.value as any)}
                      className="w-4 h-4 text-green-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Bot Messages Only</p>
                      <p className="text-xs text-muted">Export only bot responses</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-secondary rounded-lg hover:border-blue-500/50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="exportType"
                      value="customer"
                      checked={exportType === 'customer'}
                      onChange={(e) => setExportType(e.target.value as any)}
                      className="w-4 h-4 text-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Customer Messages Only</p>
                      <p className="text-xs text-muted">Export only customer messages</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-secondary rounded-lg hover:border-orange-500/50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="exportType"
                      value="agent"
                      checked={exportType === 'agent'}
                      onChange={(e) => setExportType(e.target.value as any)}
                      className="w-4 h-4 text-orange-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Agent Messages Only</p>
                      <p className="text-xs text-muted">Export only agent responses</p>
                    </div>
                  </label>

                  {selectedSession && (
                    <label className="flex items-center gap-3 p-3 border border-secondary rounded-lg hover:border-purple-500/50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="exportType"
                        value="selected-session"
                        checked={exportType === 'selected-session'}
                        onChange={(e) => setExportType(e.target.value as any)}
                        className="w-4 h-4 text-purple-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">Selected Session</p>
                        <p className="text-xs text-muted">
                          Export messages from: {selectedSession.customer_name}
                        </p>
                      </div>
                    </label>
                  )}

                  {selectedConversationCompany && (
                    <label className="flex items-center gap-3 p-3 border border-secondary rounded-lg hover:border-pink-500/50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="exportType"
                        value="selected-company"
                        checked={exportType === 'selected-company'}
                        onChange={(e) => setExportType(e.target.value as any)}
                        className="w-4 h-4 text-pink-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">Selected Company</p>
                        <p className="text-xs text-muted">
                          Export all messages from: {companies.find(c => c.id === selectedConversationCompany)?.name}
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 border border-secondary rounded-lg text-white hover:bg-primary transition-colors"
                  disabled={isExporting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
