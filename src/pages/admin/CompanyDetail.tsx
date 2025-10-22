import { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Users, Zap, DollarSign, Calendar, Mail, Phone, MapPin, CheckCircle, XCircle, Edit3, Trash2, Plus, Settings } from 'lucide-react';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { getCompanyById, getServiceRequests, getSupportTickets, getInvoices, getServiceTypes } from '../../lib/api/companies';
import WhatsAppSettingsModal from '../../components/modals/WhatsAppSettingsModal';
import InstagramSettingsModal from '../../components/modals/InstagramSettingsModal';
import GoogleServiceSettingsModal from '../../components/modals/GoogleServiceSettingsModal';
import WebsiteSettingsModal from '../../components/modals/WebsiteSettingsModal';
import MobileAppSettingsModal from '../../components/modals/MobileAppSettingsModal';

interface CompanyDetailProps {
  companyId: string;
  onBack: () => void;
}

export default function CompanyDetail({ companyId, onBack }: CompanyDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'services' | 'tickets' | 'invoices'>('overview');
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // API Data States
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [companyInvoices, setCompanyInvoices] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  
  const [showWhatsAppSettings, setShowWhatsAppSettings] = useState(false);
  const [showInstagramSettings, setShowInstagramSettings] = useState(false);
  const [showGoogleSettings, setShowGoogleSettings] = useState(false);
  const [selectedGoogleService, setSelectedGoogleService] = useState<string | null>(null);
  const [showWebsiteSettings, setShowWebsiteSettings] = useState(false);
  const [showMobileAppSettings, setShowMobileAppSettings] = useState(false);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('📡 Fetching company data:', companyId);
        
        // Fetch all data in parallel
        const [companyData, servicesData, ticketsData, invoicesData, serviceTypesData] = await Promise.all([
          getCompanyById(companyId),
          getServiceRequests(companyId),
          getSupportTickets(companyId),
          getInvoices(companyId),
          getServiceTypes()
        ]);
        
        console.log('✅ All data fetched:', {
          company: companyData,
          services: servicesData,
          tickets: ticketsData,
          invoices: invoicesData,
          serviceTypes: serviceTypesData
        });
        
        setCompany(companyData);
        setServiceRequests(servicesData || []);
        setSupportTickets(ticketsData || []);
        setCompanyInvoices(invoicesData || []);
        setServiceTypes(serviceTypesData || []);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  // User management states
  const [companyUsers, setCompanyUsers] = useState([
    { id: '1', name: 'Sarah Smith', email: 'sarah@techcorp.com', role: 'Company Admin', status: 'Active', joinedDate: '2024-03-15' },
    { id: '2', name: 'John Doe', email: 'john@techcorp.com', role: 'User', status: 'Active', joinedDate: '2024-04-20' },
    { id: '3', name: 'Jane Wilson', email: 'jane@techcorp.com', role: 'User', status: 'Active', joinedDate: '2024-05-10' },
    { id: '4', name: 'Mike Brown', email: 'mike@techcorp.com', role: 'User', status: 'Suspended', joinedDate: '2024-06-01' },
    { id: '5', name: 'Emily Davis', email: 'emily@techcorp.com', role: 'User', status: 'Active', joinedDate: '2024-07-15' },
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'User',
    password: '',
  });

  const [isProcessingUser, setIsProcessingUser] = useState(false);
  const [showUserSuccessMessage, setShowUserSuccessMessage] = useState(false);
  const [userSuccessMessage, setUserSuccessMessage] = useState('');

  // Company edit states
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    address: '',
    city: '',
    postalCode: '',
    taxId: '',
    registrationNumber: '',
    billingEmail: '',
    website: '',
    status: 'active',
  });

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading company details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !company) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Company Not Found</h2>
            <p className="text-gray-400 mb-6">{error || "The company you're looking for doesn't exist."}</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Back to Companies
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter service requests
  const companyServices = serviceRequests.filter(req => req.status === 'approved');
  const pendingRequests = serviceRequests.filter(req => req.status === 'pending');

  const totalRevenue = companyInvoices
    .filter((i: any) => i.status === 'paid')
    .reduce((sum: number, inv: any) => sum + inv.total_amount, 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users, badge: 5 },
    { id: 'services', label: 'Services', icon: Zap, badge: companyServices.length },
    { id: 'tickets', label: 'Support Tickets', icon: Mail, badge: supportTickets.length },
    { id: 'invoices', label: 'Invoices', icon: DollarSign, badge: companyInvoices.length },
  ];

  const handleAddUser = async () => {
    setIsProcessingUser(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newUser = {
      id: String(companyUsers.length + 1),
      name: userFormData.name,
      email: userFormData.email,
      role: userFormData.role,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setCompanyUsers([...companyUsers, newUser]);
    setIsProcessingUser(false);
    setShowAddUserModal(false);
    setUserFormData({ name: '', email: '', role: 'User', password: '' });

    setUserSuccessMessage(`User "${userFormData.name}" has been added successfully!`);
    setShowUserSuccessMessage(true);
    setTimeout(() => setShowUserSuccessMessage(false), 3000);

    console.log('User Added:', newUser);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    setIsProcessingUser(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const updatedUsers = companyUsers.map(u =>
      u.id === selectedUser.id
        ? { ...u, name: userFormData.name, email: userFormData.email, role: userFormData.role }
        : u
    );

    setCompanyUsers(updatedUsers);
    setIsProcessingUser(false);
    setShowEditUserModal(false);

    setUserSuccessMessage(`User "${userFormData.name}" has been updated successfully!`);
    setShowUserSuccessMessage(true);
    setTimeout(() => setShowUserSuccessMessage(false), 3000);

    console.log('User Updated:', { id: selectedUser.id, ...userFormData });
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setShowDeleteUserConfirm(true);
  };

  const handleDeleteUserConfirm = async () => {
    setIsProcessingUser(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setCompanyUsers(companyUsers.filter(u => u.id !== selectedUser.id));
    setIsProcessingUser(false);
    setShowDeleteUserConfirm(false);

    setUserSuccessMessage(`User "${selectedUser.name}" has been removed from the company.`);
    setShowUserSuccessMessage(true);
    setTimeout(() => setShowUserSuccessMessage(false), 3000);

    console.log('User Deleted:', selectedUser.id);
  };

  const handleToggleUserStatus = (user: any) => {
    setSelectedUser(user);
    setShowSuspendConfirm(true);
  };

  const handleToggleUserStatusConfirm = async () => {
    setIsProcessingUser(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newStatus = selectedUser.status === 'Active' ? 'Suspended' : 'Active';
    const updatedUsers = companyUsers.map(u =>
      u.id === selectedUser.id ? { ...u, status: newStatus } : u
    );

    setCompanyUsers(updatedUsers);
    setIsProcessingUser(false);
    setShowSuspendConfirm(false);

    setUserSuccessMessage(`User "${selectedUser.name}" has been ${newStatus.toLowerCase()}.`);
    setShowUserSuccessMessage(true);
    setTimeout(() => setShowUserSuccessMessage(false), 3000);

    console.log('User Status Updated:', { id: selectedUser.id, newStatus });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Companies
        </button>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 mb-6">
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
                <div className="flex items-center gap-4 text-sm text-gray-400">
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
              onClick={() => {
                setCompanyFormData({
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
                });
                setShowEditCompanyModal(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Company
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Active Services</span>
                <Zap className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-white">{companyServices.length}</p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Total Users</span>
                <Users className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-white">5</p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Open Tickets</span>
                <Mail className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-white">{supportTickets.filter((t: any) => t.status === 'open').length}</p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Total Revenue</span>
                <DollarSign className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Company Name</p>
                    <p className="text-white font-medium">{company.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <p className="text-white">{company.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Phone</p>
                    <p className="text-white">{company.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Website</p>
                    <p className="text-white">{company.website || 'Not provided'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Country</p>
                    <p className="text-white">{company.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Address</p>
                    <p className="text-white">{company.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">City & Postal Code</p>
                    <p className="text-white">{company.city || 'N/A'}, {company.postal_code || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Member Since</p>
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

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Tax & Billing Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Tax ID / VAT Number</p>
                  <p className="text-white font-mono">{company.tax_id || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Registration Number</p>
                  <p className="text-white font-mono">{company.registration_number || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Billing Email</p>
                  <p className="text-white">{company.billing_email || company.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Active Services</h2>
                <p className="text-sm text-gray-400 mt-1">Configure service settings for this company</p>
              </div>

              {(() => {
                // Get approved service type IDs from service requests
                const approvedServiceTypeIds = companyServices.map((sr: any) => sr.service_type_id);
                
                // Filter service types to show only approved ones
                const activeServices = serviceTypes.filter((service: any) =>
                  approvedServiceTypeIds.includes(service.id)
                );

                if (activeServices.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <Zap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-white font-medium">No Active Services</p>
                      <p className="text-gray-400 text-sm mt-1">This company doesn't have any active services yet.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeServices.map((service: any) => {
                      const handleConfigureClick = () => {
                        if (service.slug === 'whatsapp-automation') {
                          setShowWhatsAppSettings(true);
                        } else if (service.slug === 'instagram-automation') {
                          setShowInstagramSettings(true);
                        } else if (service.slug.startsWith('google-')) {
                          const serviceName = service.slug.replace('google-', '');
                          setSelectedGoogleService(serviceName);
                          setShowGoogleSettings(true);
                        } else if (service.slug === 'gmail-integration') {
                          setSelectedGoogleService('gmail');
                          setShowGoogleSettings(true);
                        } else if (service.slug === 'website-development') {
                          setShowWebsiteSettings(true);
                        } else if (service.slug === 'mobile-app-development') {
                          setShowMobileAppSettings(true);
                        }
                      };

                      return (
                        <div key={service.id} className="bg-gray-900/50 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all">
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color || 'from-blue-500 to-cyan-600'} flex items-center justify-center`}>
                                <span className="text-2xl">📱</span>
                              </div>
                              <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-500 font-medium">
                                Active
                              </span>
                            </div>
                          </div>

                          <h3 className="text-white font-semibold text-lg mb-2">{service.name_en}</h3>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description_en}</p>

                          <button
                            onClick={handleConfigureClick}
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
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Pending Service Requests</h2>
                  <span className="text-sm text-gray-400">{pendingRequests.length} pending</span>
                </div>
                <div className="space-y-3">
                  {pendingRequests.map((request: any) => (
                    <div key={request.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{request.service_type?.name_en || 'Service'}</p>
                            <p className="text-sm text-gray-400">Package: {request.package?.toUpperCase()}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-xs text-orange-500">
                          Pending Approval
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Support Tickets</h2>
              <span className="text-sm text-gray-400">{supportTickets.length} tickets</span>
            </div>

            {supportTickets.length > 0 ? (
              <div className="space-y-3">
                {supportTickets.map((ticket: any) => (
                  <div key={ticket.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:bg-gray-900/70 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-white font-medium">{ticket.subject}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{ticket.ticket_number}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'open' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-500' :
                        ticket.status === 'in_progress' ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500' :
                        'bg-green-500/10 border border-green-500/30 text-green-500'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
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
                <p className="text-gray-400">No support tickets</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Invoices</h2>
            <div className="space-y-3">
              {companyInvoices.map((invoice: any) => (
                <div key={invoice.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-gray-400">{new Date(invoice.issue_date).toLocaleDateString()}</p>
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
          </div>
        )}

        {/* Modals ve diğer UI elementleri aynen kalacak... */}
        
        {/* Settings Modals */}
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
      </div>
    </div>
  );
}