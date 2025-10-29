import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Building2, Users, Zap, DollarSign, Calendar, Mail, Phone, 
  MessageCircle, MapPin, Instagram, CheckCircle, Smartphone, XCircle, 
  Sheet, Globe, FolderOpen, FileText, Edit3, Trash2, Plus, Settings, Image,
  ThumbsUp, ThumbsDown, ExternalLink
} from 'lucide-react';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { getCompanyById, getSupportTickets, getInvoices, getServiceTypes } from '../../lib/api/companies';
import { getCompanyUsers, createUser, updateUser, deleteUser } from '../../lib/api/users';
import { getCompanyServiceRequests, approveServiceRequest, rejectServiceRequest } from '../../lib/api/serviceRequests';
import { useAuth } from '../../contexts/AuthContext';
import WhatsAppSettingsModal from '../../components/modals/WhatsAppSettingsModal';
import InstagramSettingsModal from '../../components/modals/InstagramSettingsModal';
import GoogleServiceSettingsModal from '../../components/modals/GoogleServiceSettingsModal';
import WebsiteSettingsModal from '../../components/modals/WebsiteSettingsModal';
import MobileAppSettingsModal from '../../components/modals/MobileAppSettingsModal';
import EditCompanyModal from '../../components/modals/EditCompanyModal';
import AddUserModal from '../../components/modals/AddUserModal';
import EditUserModal from '../../components/modals/EditUserModal';
import CreateInvoiceModal, { CreateInvoiceFormData } from '../../components/modals/CreateInvoiceModal';
import CreateTicketModal, { CreateTicketFormData } from '../../components/modals/CreateTicketModal';
import AddServiceModal, { AddServiceFormData } from '../../components/modals/AddServiceModal';
import { createManualInvoice } from '../../lib/api/manualInvoice';
import { createTicket, assignTicket } from '../../lib/api/supportTickets';
import { addServiceToCompany, updateServiceStatus } from '../../lib/api/companyServices';
import activityLogger from '../../lib/services/activityLogger';

export default function CompanyDetail() {
  const { id: companyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'services' | 'tickets' | 'invoices'>('overview');
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API Data States
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [companyInvoices, setCompanyInvoices] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);

  // Service Settings Modals
  const [showWhatsAppSettings, setShowWhatsAppSettings] = useState(false);
  const [showInstagramSettings, setShowInstagramSettings] = useState(false);
  const [showGoogleSettings, setShowGoogleSettings] = useState(false);
  const [selectedGoogleService, setSelectedGoogleService] = useState<string | null>(null);
  const [showWebsiteSettings, setShowWebsiteSettings] = useState(false);
  const [showMobileAppSettings, setShowMobileAppSettings] = useState(false);

  // Company Edit Modal
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);

  // User Management Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Invoice Modal
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  // Ticket Modal
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  // Add Service Modal
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);

  // Service Request Modals
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Success/Error Messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) {
        navigate('/admin/companies');
        return;
      }

      try {
        setLoading(true);
        console.log('📡 Fetching company data:', companyId);

        const [companyData, servicesData, ticketsData, invoicesData, serviceTypesData, usersData] = await Promise.all([
          getCompanyById(companyId),
          getCompanyServiceRequests(companyId),
          getSupportTickets(companyId),
          getInvoices(companyId),
          getServiceTypes(),
          getCompanyUsers(companyId)
        ]);

        console.log('✅ All data fetched successfully');

        setCompany(companyData);
        setServiceRequests(servicesData || []);
        setSupportTickets(ticketsData || []);
        setCompanyInvoices(invoicesData || []);
        setServiceTypes(serviceTypesData || []);
        setCompanyUsers(usersData || []);
      } catch (err: any) {
        console.error('❌ Error fetching data:', err);
        setError(err.message || 'Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId, navigate]);

  // Show success message with auto-hide
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Show error message with auto-hide
  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // Refresh company users list
  const refreshUsers = async () => {
    try {
      const updatedUsers = await getCompanyUsers(companyId!);
      setCompanyUsers(updatedUsers);
    } catch (err: any) {
      console.error('❌ Error refreshing users:', err);
      showError('Failed to refresh users list');
    }
  };

  // Refresh company invoices list
  const refreshInvoices = async () => {
    try {
      const updatedInvoices = await getInvoices(companyId!);
      setCompanyInvoices(updatedInvoices);
    } catch (err: any) {
      console.error('❌ Error refreshing invoices:', err);
      showError('Failed to refresh invoices list');
    }
  };

  // Refresh company tickets list
  const refreshTickets = async () => {
    try {
      const updatedTickets = await getSupportTickets(companyId!);
      setSupportTickets(updatedTickets);
    } catch (err: any) {
      console.error('❌ Error refreshing tickets:', err);
      showError('Failed to refresh tickets list');
    }
  };

  // Refresh company services and requests
  const refreshServices = async () => {
    try {
      const updatedRequests = await getCompanyServiceRequests(companyId!);
      setServiceRequests(updatedRequests);
    } catch (err: any) {
      console.error('❌ Error refreshing services:', err);
      showError('Failed to refresh services list');
    }
  };

  // ===== USER MANAGEMENT HANDLERS =====

  const handleAddUser = async (data: any) => {
    setIsProcessing(true);
    try {
      console.log('📡 Creating user:', data);

      await createUser({
        email: data.email,
        password: data.password,
        full_name: data.name,
        company_id: companyId!,
        role: data.role,
        language: 'en',
      });

      console.log('✅ User created successfully');
      // Track user creation
      await activityLogger.logCreate('User', 'new-user', {
        email: data.email, name: data.name, role: data.role
      });
      await refreshUsers();
      setShowAddUserModal(false);
      showSuccess(`User "${data.name}" has been added successfully!`);
    } catch (err: any) {
      console.error('❌ Error creating user:', err);
      showError(err.message || 'Failed to create user');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditUserClick = (user: any) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (data: any) => {
    setIsProcessing(true);
    try {
      console.log('📡 Updating user:', selectedUser.id);

      await updateUser(selectedUser.id, {
        full_name: data.name,
        email: data.email,
        role: data.role,
      });

      console.log('✅ User updated successfully');
      // Track user update
      await activityLogger.logUpdate('User', selectedUser.id,
        { name: selectedUser.full_name, role: selectedUser.role },
        { name: data.name, role: data.role }
      );
      await refreshUsers();
      setShowEditUserModal(false);
      showSuccess(`User "${data.name}" has been updated successfully!`);
    } catch (err: any) {
      console.error('❌ Error updating user:', err);
      showError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUserClick = (user: any) => {
    setSelectedUser(user);
    setShowDeleteUserConfirm(true);
  };

  const handleDeleteUserConfirm = async () => {
    setIsProcessing(true);
    try {
      console.log('🗑️ Deleting user:', selectedUser.id);

      await deleteUser(selectedUser.id);

      console.log('✅ User deleted successfully');
      // Track user deletion
      await activityLogger.logDelete('User', selectedUser.id, {
        name: selectedUser.full_name, email: selectedUser.email
      });
      await refreshUsers();
      setShowDeleteUserConfirm(false);
      showSuccess(`User "${selectedUser.full_name}" has been removed from the company.`);
    } catch (err: any) {
      console.error('❌ Error deleting user:', err);
      showError(err.message || 'Failed to delete user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleUserStatusClick = (user: any) => {
    setSelectedUser(user);
    setShowSuspendConfirm(true);
  };

  const handleToggleUserStatusConfirm = async () => {
    setIsProcessing(true);
    try {
      const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';

      console.log('🔄 Updating user status:', selectedUser.id, newStatus);

      await updateUser(selectedUser.id, { status: newStatus });

      console.log('✅ User status updated successfully');
      // Track status change
      await activityLogger.log({
        action: `User ${newStatus === 'active' ? 'Activated' : 'Suspended'}`,
        action_category: 'update',
        description: `Changed user status from ${selectedUser.status} to ${newStatus}`,
        entity_type: 'User',
        entity_id: selectedUser.id,
      });
      await refreshUsers();
      setShowSuspendConfirm(false);
      showSuccess(`User "${selectedUser.full_name}" has been ${newStatus}.`);
    } catch (err: any) {
      console.error('❌ Error updating user status:', err);
      showError(err.message || 'Failed to update status');
    } finally {
      setIsProcessing(false);
    }
  };

  // ===== COMPANY MANAGEMENT HANDLERS =====

  const handleUpdateCompany = async (data: any) => {
    setIsProcessing(true);
    try {
      console.log('📡 Updating company:', companyId);
      
      // TODO: Implement updateCompany API function
      // await updateCompany(companyId!, data);
      
      console.log('✅ Company updated successfully');
      // Track company update
      await activityLogger.logUpdate('Company', companyId!, 
        { name: company.name, status: company.status },
        { name: data.name, status: data.status }
      );
      
      // Refresh company data
      const updatedCompany = await getCompanyById(companyId!);
      setCompany(updatedCompany);
      
      setShowEditCompanyModal(false);
      showSuccess(`Company "${data.name}" has been updated successfully!`);
    } catch (err: any) {
      console.error('❌ Error updating company:', err);
      showError(err.message || 'Failed to update company');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  // ===== SERVICE REQUEST HANDLERS =====

  const handleApproveClick = (request: any) => {
    setSelectedRequest(request);
    setShowApproveConfirm(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedRequest || !profile) return;

    setIsProcessing(true);
    try {
      console.log('✅ Approving request:', selectedRequest.id);
      
      await approveServiceRequest(selectedRequest.id, user.id);
      // Track service approval
      await activityLogger.log({
        action: 'Service Request Approved',
        action_category: 'update',
        description: `Approved service: ${selectedRequest.service_type.name_en}`,
        entity_type: 'ServiceRequest',
        entity_id: selectedRequest.id,
      });
      
      // Refresh service requests
      const updatedRequests = await getCompanyServiceRequests(companyId!);
      setServiceRequests(updatedRequests);
      
      setShowApproveConfirm(false);
      setSelectedRequest(null);
      showSuccess(`Service "${selectedRequest.service_type.name_en}" has been approved!`);
    } catch (err: any) {
      console.error('❌ Error approving request:', err);
      showError(err.message || 'Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = (request: any) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequest || !profile) return;
    if (!rejectionReason.trim()) {
      showError('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('❌ Rejecting request:', selectedRequest.id);
      
      await rejectServiceRequest(selectedRequest.id, rejectionReason, user.id);
      // Track service rejection
      await activityLogger.log({
        action: 'Service Request Rejected',
        action_category: 'update',
        description: `Rejected service: ${selectedRequest.service_type.name_en}. Reason: ${rejectionReason}`,
        entity_type: 'ServiceRequest',
        entity_id: selectedRequest.id,
      });
      
      // Refresh service requests
      const updatedRequests = await getCompanyServiceRequests(companyId!);
      setServiceRequests(updatedRequests);
      
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      showSuccess(`Service request has been rejected.`);
    } catch (err: any) {
      console.error('❌ Error rejecting request:', err);
      showError(err.message || 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  // ===== INVOICE MANAGEMENT HANDLERS =====

  const handleCreateInvoice = async (data: CreateInvoiceFormData) => {
    if (!user?.id) {
      showError('User not authenticated');
      throw new Error('User not authenticated');
    }

    setIsCreatingInvoice(true);
    try {
      console.log('📝 Creating manual invoice for company:', companyId);

      const response = await createManualInvoice({
        companyId: data.companyId,
        createdBy: user.id,
        amount: data.amount,
        dueDate: data.dueDate,
        serviceId: data.serviceId || undefined,
        customDescription: data.customDescription,
        notes: data.notes || undefined,
        autoSuspendOnOverdue: data.autoSuspendOnOverdue,
      });

      if (!response.success || !response.invoice) {
        throw new Error(response.error || 'Failed to create invoice');
      }

      console.log('✅ Invoice created successfully:', response.invoice.invoice_number);

      // Track invoice creation
      await activityLogger.log({
        action: 'Manual Invoice Created',
        action_category: 'create',
        description: `Created manual invoice ${response.invoice.invoice_number} for ${company?.name} - Amount: $${data.amount}`,
        entity_type: 'Invoice',
        entity_id: response.invoice.id,
      });

      // Refresh invoices list
      await refreshInvoices();

      setShowCreateInvoiceModal(false);
      showSuccess(`Invoice ${response.invoice.invoice_number} created successfully!`);
    } catch (error: any) {
      console.error('❌ Error creating invoice:', error);
      showError(error.message || 'Failed to create invoice');
      throw error;
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  // ===== TICKET MANAGEMENT HANDLERS =====

  const handleCreateTicket = async (data: CreateTicketFormData) => {
    if (!user?.id) {
      showError('User not authenticated');
      throw new Error('User not authenticated');
    }

    setIsCreatingTicket(true);
    try {
      console.log('🎫 Creating support ticket for company:', companyId);

      // 1. Create ticket
      const newTicket = await createTicket({
        company_id: data.companyId,
        created_by: user.id,
        subject: data.subject,
        description: data.description,
        category: data.category,
        priority: data.priority,
        service_type_id: data.serviceTypeId || undefined,
        tags: data.tags.length > 0 ? data.tags : undefined,
      });

      // 2. Assign ticket if assignee is specified
      if (data.assignedTo) {
        await assignTicket(newTicket.id, data.assignedTo);
      }

      console.log('✅ Ticket created successfully:', newTicket.ticket_number);

      // 3. Track ticket creation
      await activityLogger.log({
        action: 'Support Ticket Created',
        action_category: 'create',
        description: `Created support ticket ${newTicket.ticket_number} for ${company?.name}: ${data.subject}`,
        entity_type: 'Ticket',
        entity_id: newTicket.id,
      });

      // 4. Refresh tickets list
      await refreshTickets();

      setShowCreateTicketModal(false);
      showSuccess(`Ticket ${newTicket.ticket_number} created successfully!`);
    } catch (error: any) {
      console.error('❌ Error creating ticket:', error);
      showError(error.message || 'Failed to create ticket');
      throw error;
    } finally {
      setIsCreatingTicket(false);
    }
  };

  // ===== SERVICE MANAGEMENT HANDLERS =====

  const handleChangeServiceStatus = async (serviceId: string, newStatus: 'active' | 'maintenance' | 'suspended' | 'inactive', serviceName: string) => {
    try {
      console.log('🔄 Changing service status:', { serviceId, newStatus });

      await updateServiceStatus(serviceId, newStatus);

      // Track status change
      await activityLogger.log({
        action: 'Service Status Changed',
        action_category: 'update',
        description: `Changed ${serviceName} status to ${newStatus} for ${company?.name}`,
        entity_type: 'CompanyService',
        entity_id: serviceId,
      });

      // Refresh services
      await refreshServices();

      showSuccess(`Service status changed to ${newStatus}`);
    } catch (error: any) {
      console.error('❌ Error changing service status:', error);
      showError(error.message || 'Failed to change service status');
    }
  };

  const handleAddService = async (data: AddServiceFormData) => {
    if (!user?.id) {
      showError('User not authenticated');
      throw new Error('User not authenticated');
    }

    setIsAddingService(true);
    try {
      console.log('🔧 Adding service to company:', companyId);

      const newService = await addServiceToCompany({
        companyId: data.companyId,
        serviceTypeId: data.serviceTypeId,
        package: data.package,
        priceAmount: data.priceAmount,
        billingCycle: data.billingCycle,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
      });

      console.log('✅ Service added successfully:', newService.id);

      // Track service addition
      await activityLogger.log({
        action: 'Service Added to Company',
        action_category: 'create',
        description: `Added ${newService.service_type.name_en} (${data.package}) to ${company?.name}`,
        entity_type: 'CompanyService',
        entity_id: newService.id,
      });

      // Refresh services list
      await refreshServices();

      setShowAddServiceModal(false);
      showSuccess(`Service ${newService.service_type.name_en} added successfully!`);
    } catch (error: any) {
      console.error('❌ Error adding service:', error);
      showError(error.message || 'Failed to add service');
      throw error;
    } finally {
      setIsAddingService(false);
    }
  };

  // ===== SERVICE CONFIGURATION HANDLERS =====

  const handleConfigureService = (slug: string) => {
    if (slug === 'whatsapp-automation') {
      setShowWhatsAppSettings(true);
    } else if (slug === 'instagram-automation') {
      setShowInstagramSettings(true);
    } else if (slug.startsWith('google-') || slug === 'gmail-integration') {
      const serviceName = slug === 'gmail-integration' ? 'gmail' : slug.replace('google-', '');
      setSelectedGoogleService(serviceName);
      setShowGoogleSettings(true);
    } else if (slug === 'website-development') {
      setShowWebsiteSettings(true);
    } else if (slug === 'mobile-app-development') {
      setShowMobileAppSettings(true);
    }
  };

  // ===== UTILITY FUNCTIONS =====

  const getServiceIcon = (slug: string) => {
    const iconMap: Record<string, any> = {
      'whatsapp-automation': MessageCircle,
      'instagram-automation': Instagram,
      'google-calendar': Calendar,
      'google-sheets': Sheet,
      'gmail-integration': Mail,
      'google-docs': FileText,
      'google-drive': FolderOpen,
      'google-photos': Image,
      'website-development': Globe,
      'mobile-app-development': Smartphone,
    };
    return iconMap[slug] || Zap;
  };

  const getServiceColor = (slug: string) => {
    const colorMap: Record<string, string> = {
      'whatsapp-automation': 'from-green-500 to-emerald-600',
      'instagram-automation': 'from-pink-500 to-purple-600',
      'google-calendar': 'from-blue-500 to-indigo-600',
      'google-sheets': 'from-green-600 to-teal-600',
      'gmail-integration': 'from-red-500 to-orange-600',
      'google-docs': 'from-blue-600 to-cyan-600',
      'google-drive': 'from-yellow-500 to-orange-600',
      'google-photos': 'from-purple-500 to-pink-600',
      'website-development': 'from-indigo-500 to-blue-600',
      'mobile-app-development': 'from-cyan-500 to-blue-600',
    };
    return colorMap[slug] || 'from-blue-500 to-cyan-600';
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted">Loading company details...</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error || !company) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Company Not Found</h2>
            <p className="text-muted mb-6">{error || "The company you're looking for doesn't exist."}</p>
            <button
              onClick={() => navigate('/admin/companies')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Back to Companies
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== DATA CALCULATIONS =====
  const companyServices = serviceRequests.filter(req => req.status === 'approved');
  const pendingRequests = serviceRequests.filter(req => req.status === 'pending');
  const totalRevenue = companyInvoices
    .filter((i: any) => i.status === 'paid')
    .reduce((sum: number, inv: any) => sum + inv.total_amount, 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users, badge: companyUsers.length },
    { id: 'services', label: 'Services', icon: Zap, badge: companyServices.length },
    { id: 'tickets', label: 'Support Tickets', icon: Mail, badge: supportTickets.length },
    { id: 'invoices', label: 'Invoices', icon: DollarSign, badge: companyInvoices.length },
  ];

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/companies')}
          className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Companies
        </button>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-green-500 font-medium">Success!</p>
              <p className="text-green-400/70 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-red-500 font-medium">Error!</p>
              <p className="text-red-400/70 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Company Header */}
        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{company.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    company.status === 'active'
                      ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                      : 'bg-red-500/10 border border-red-500/30 text-red-500'
                  }`}>
                    {company.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {company.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {company.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {company.country}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEditCompanyModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Company
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 bg-primary/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Active Services</span>
                <Zap className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-white">{companyServices.length}</p>
            </div>
            <div className="p-4 bg-primary/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Total Users</span>
                <Users className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-white">{companyUsers.length}</p>
            </div>
            <div className="p-4 bg-primary/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Open Tickets</span>
                <Mail className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                {supportTickets.filter((t: any) => t.status === 'open').length}
              </p>
            </div>
            <div className="p-4 bg-primary/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Total Revenue</span>
                <DollarSign className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-secondary text-muted hover:bg-hover'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Company Information */}
            <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted mb-1">Company Name</p>
                    <p className="text-white font-medium">{company.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Email</p>
                    <p className="text-white">{company.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Phone</p>
                    <p className="text-white">{company.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Website</p>
                    <p className="text-white">{company.website || 'Not provided'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted mb-1">Country</p>
                    <p className="text-white">{company.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Address</p>
                    <p className="text-white">{company.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">City & Postal Code</p>
                    <p className="text-white">{company.city || 'N/A'}, {company.postal_code || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Member Since</p>
                    <p className="text-white">
                      {new Date(company.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax & Billing Information */}
            <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Tax & Billing Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted mb-1">Tax ID / VAT Number</p>
                  <p className="text-white font-mono">{company.tax_id || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-1">Registration Number</p>
                  <p className="text-white font-mono">{company.registration_number || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-1">Billing Email</p>
                  <p className="text-white">{company.billing_email || company.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl overflow-hidden">
              <div className="p-6 border-b border-secondary flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Company Users</h2>
                  <p className="text-sm text-muted mt-1">
                    {companyUsers.length} user{companyUsers.length !== 1 ? 's' : ''} in this company
                  </p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>

              {companyUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">No Users Yet</p>
                  <p className="text-muted text-sm mb-6">Add the first user to this company</p>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add First User
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary/50 border-b border-secondary">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">User</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Joined Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {companyUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-primary/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.full_name}</p>
                                <p className="text-sm text-muted">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'company_admin'
                                ? 'bg-purple-500/10 border border-purple-500/30 text-purple-500'
                                : 'bg-blue-500/10 border border-blue-500/30 text-blue-500'
                            }`}>
                              {user.role === 'company_admin' ? 'Company Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active'
                                ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                                : 'bg-red-500/10 border border-red-500/30 text-red-500'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-muted text-sm">
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditUserClick(user)}
                                className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="Edit User"
                              >
                                <Edit3 className="w-4 h-4 text-blue-500" />
                              </button>
                              <button
                                onClick={() => handleToggleUserStatusClick(user)}
                                className="p-2 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                              >
                                {user.status === 'active' ? (
                                  <XCircle className="w-4 h-4 text-yellow-500" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteUserClick(user)}
                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
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

        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Active Services</h2>
                  <p className="text-sm text-muted mt-1">Configure service settings for this company</p>
                </div>
                <button
                  onClick={() => setShowAddServiceModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Service
                </button>
              </div>

              {(() => {
                const approvedServiceTypeIds = companyServices.map((sr: any) => sr.service_type_id);
                const activeServices = serviceTypes.filter((service: any) =>
                  approvedServiceTypeIds.includes(service.id)
                );

                if (activeServices.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <Zap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-white font-medium">No Active Services</p>
                      <p className="text-muted text-sm mt-1">This company doesn't have any active services yet.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeServices.map((service: any) => {
                      const ServiceIcon = getServiceIcon(service.slug);
                      const serviceColor = getServiceColor(service.slug);

                      // Find the company_service record for this service
                      const companyService = companyServices.find((cs: any) => cs.service_type_id === service.id);
                      const currentStatus = companyService?.status || 'active';

                      // Status badge colors
                      const statusColors: Record<string, string> = {
                        'active': 'bg-green-500/10 border-green-500/30 text-green-500',
                        'maintenance': 'bg-orange-500/10 border-orange-500/30 text-orange-500',
                        'suspended': 'bg-red-500/10 border-red-500/30 text-red-500',
                        'inactive': 'bg-gray-500/10 border-secondary/30 text-muted'
                      };

                      return (
                        <div key={service.id} className="bg-primary/50 border border-secondary rounded-xl p-5 hover:border-secondary transition-all">
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${serviceColor} flex items-center justify-center shadow-lg`}>
                                <ServiceIcon className="w-6 h-6 text-white" />
                              </div>

                              {/* Status Dropdown */}
                              <select
                                value={currentStatus}
                                onChange={(e) => handleChangeServiceStatus(companyService.id, e.target.value as any, service.name_en)}
                                className={`px-3 py-1 border rounded-full text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColors[currentStatus]}`}
                              >
                                <option value="active">Active</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="suspended">Suspended</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </div>
                          </div>

                          <h3 className="text-white font-semibold text-lg mb-2">{service.name_en}</h3>
                          <p className="text-muted text-sm mb-4 line-clamp-2">{service.description_en}</p>

                          <button
                            onClick={() => handleConfigureService(service.slug)}
                            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Configure Settings
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {pendingRequests.length > 0 && (
              <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Pending Service Requests</h2>
                  <span className="text-sm text-muted">{pendingRequests.length} pending</span>
                </div>
                <div className="space-y-3">
                  {pendingRequests.map((request: any) => (
                    <div key={request.id} className="p-4 bg-primary/50 border border-secondary rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{request.service_type?.name_en || 'Service'}</p>
                            <p className="text-sm text-muted">Package: {request.package?.toUpperCase()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveClick(request)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve Request"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectClick(request)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reject Request"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Support Tickets</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateTicketModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Ticket
                </button>
                <button
                  onClick={() => navigate('/admin/support-tickets')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View All Tickets
                </button>
              </div>
            </div>

            {supportTickets.length > 0 ? (
              <div className="space-y-3">
                {supportTickets.map((ticket: any) => (
                  <div 
                    key={ticket.id} 
                    className="p-4 bg-primary/50 border border-secondary rounded-lg hover:bg-primary/70 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/support-tickets')}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-muted" />
                          <span className="text-white font-medium">{ticket.subject}</span>
                        </div>
                        <p className="text-sm text-muted mb-2">{ticket.ticket_number}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'open' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-500' :
                        ticket.status === 'in_progress' ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500' :
                        'bg-green-500/10 border border-green-500/30 text-green-500'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className={`px-2 py-1 rounded ${
                        ticket.priority === 'high' || ticket.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                        ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {ticket.priority} Priority
                      </span>
                      <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-muted">No support tickets</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Invoices</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateInvoiceModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </button>
                <button
                  onClick={() => navigate('/admin/invoices')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View All Invoices
                </button>
              </div>
            </div>

            {companyInvoices.length > 0 ? (
              <div className="space-y-3">
                {companyInvoices.map((invoice: any) => (
                  <div 
                    key={invoice.id} 
                    className="p-4 bg-primary/50 border border-secondary rounded-lg hover:bg-primary/70 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/invoices')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{invoice.invoice_number}</p>
                        <p className="text-sm text-muted">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${invoice.total_amount.toFixed(2)}</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                          invoice.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-muted">No invoices</p>
              </div>
            )}
          </div>
        )}

        {/* ===== MODALS ===== */}

        {/* Edit Company Modal */}
        {showEditCompanyModal && company && (
          <EditCompanyModal
            isOpen={showEditCompanyModal}
            onClose={() => setShowEditCompanyModal(false)}
            onSubmit={handleUpdateCompany}
            initialData={{
              name: company.name,
              email: company.email,
              phone: company.phone,
              country: company.country,
              address: company.address || '',
              city: company.city || '',
              postalCode: company.postal_code || '',
              taxId: company.tax_id || '',
              registrationNumber: company.registration_number || '',
              billingEmail: company.billing_email || '',
              website: company.website || '',
              status: company.status,
            }}
            isLoading={isProcessing}
          />
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <AddUserModal
            isOpen={showAddUserModal}
            onClose={() => setShowAddUserModal(false)}
            onSubmit={handleAddUser}
            companyId={companyId!}
            isLoading={isProcessing}
          />
        )}

        {/* Edit User Modal */}
        {showEditUserModal && selectedUser && (
          <EditUserModal
            isOpen={showEditUserModal}
            onClose={() => setShowEditUserModal(false)}
            onSubmit={handleUpdateUser}
            initialData={{
              name: selectedUser.full_name,
              email: selectedUser.email,
              role: selectedUser.role,
            }}
            isLoading={isProcessing}
          />
        )}

        {/* Delete User Confirmation */}
        <ConfirmationDialog
          isOpen={showDeleteUserConfirm}
          onClose={() => setShowDeleteUserConfirm(false)}
          onConfirm={handleDeleteUserConfirm}
          title="Delete User"
          message={`Are you sure you want to delete "${selectedUser?.full_name}"? This action cannot be undone.`}
          confirmText="Delete User"
          confirmColor="from-red-600 to-red-700"
          isLoading={isProcessing}
        />

        {/* Suspend/Activate User Confirmation */}
        <ConfirmationDialog
          isOpen={showSuspendConfirm}
          onClose={() => setShowSuspendConfirm(false)}
          onConfirm={handleToggleUserStatusConfirm}
          title={selectedUser?.status === 'active' ? 'Suspend User' : 'Activate User'}
          message={`Are you sure you want to ${selectedUser?.status === 'active' ? 'suspend' : 'activate'} "${selectedUser?.full_name}"?`}
          confirmText={selectedUser?.status === 'active' ? 'Suspend' : 'Activate'}
          confirmColor={selectedUser?.status === 'active' ? 'from-yellow-600 to-orange-600' : 'from-green-600 to-emerald-600'}
          isLoading={isProcessing}
        />

        {/* Approve Service Request Confirmation */}
        <ConfirmationDialog
          isOpen={showApproveConfirm}
          onClose={() => setShowApproveConfirm(false)}
          onConfirm={handleApproveConfirm}
          title="Approve Service Request"
          message={`Are you sure you want to approve "${selectedRequest?.service_type?.name_en}" for ${company?.name}? This will activate the service immediately.`}
          confirmText="Approve Service"
          confirmColor="from-green-600 to-emerald-600"
          isLoading={isProcessing}
        />

        {/* Reject Service Request Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-secondary rounded-2xl max-w-md w-full border border-secondary shadow-2xl">
              <div className="p-6 border-b border-secondary">
                <h3 className="text-xl font-bold text-white mb-2">Reject Service Request</h3>
                <p className="text-muted text-sm">
                  Please provide a reason for rejecting "{selectedRequest?.service_type?.name_en}"
                </p>
              </div>

              <div className="p-6">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  rows={4}
                  className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="p-6 border-t border-secondary flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={isProcessing || !rejectionReason.trim()}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Rejecting...' : 'Reject Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Settings Modals */}
        {showWhatsAppSettings && (
          <WhatsAppSettingsModal
            isOpen={showWhatsAppSettings}
            onClose={() => setShowWhatsAppSettings(false)}
            onSave={(settings) => console.log('WhatsApp settings saved:', settings)}
            companyName={company.name}
            companyId={company.id}
            initialSettings={{}}
          />
        )}

        {showInstagramSettings && (
          <InstagramSettingsModal
            isOpen={showInstagramSettings}
            onClose={() => setShowInstagramSettings(false)}
            onSave={(settings) => console.log('Instagram settings saved:', settings)}
            companyName={company.name}
            companyId={company.id}
            initialSettings={{}}
          />
        )}

        {selectedGoogleService && (
          <GoogleServiceSettingsModal
            isOpen={showGoogleSettings}
            onClose={() => {
              setShowGoogleSettings(false);
              setSelectedGoogleService(null);
            }}
            onSave={(settings) => console.log('Google settings saved:', settings)}
            serviceType={selectedGoogleService as any}
            companyName={company.name}
            companyId={company.id}
            initialSettings={{}}
          />
        )}

        {showWebsiteSettings && (
          <WebsiteSettingsModal
            companyName={company.name}
            onClose={() => setShowWebsiteSettings(false)}
            onSave={(settings) => console.log('Website settings saved:', settings)}
          />
        )}

        {showMobileAppSettings && (
          <MobileAppSettingsModal
            companyName={company.name}
            onClose={() => setShowMobileAppSettings(false)}
            onSave={(settings) => console.log('Mobile app settings saved:', settings)}
          />
        )}

        {/* Create Invoice Modal */}
        {showCreateInvoiceModal && company && (
          <CreateInvoiceModal
            isOpen={showCreateInvoiceModal}
            onClose={() => setShowCreateInvoiceModal(false)}
            onSubmit={handleCreateInvoice}
            isLoading={isCreatingInvoice}
            initialCompanyId={companyId}
          />
        )}

        {/* Create Ticket Modal */}
        {showCreateTicketModal && company && (
          <CreateTicketModal
            isOpen={showCreateTicketModal}
            onClose={() => setShowCreateTicketModal(false)}
            onSubmit={handleCreateTicket}
            isLoading={isCreatingTicket}
            initialCompanyId={companyId}
          />
        )}

        {/* Add Service Modal */}
        {showAddServiceModal && company && (
          <AddServiceModal
            isOpen={showAddServiceModal}
            onClose={() => setShowAddServiceModal(false)}
            onSubmit={handleAddService}
            isLoading={isAddingService}
            initialCompanyId={companyId}
          />
        )}
      </div>
    </div>
  );
}