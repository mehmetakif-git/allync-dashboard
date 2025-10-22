import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Users, Zap, DollarSign, Calendar, Mail, Phone, MessageCircle, MapPin, Instagram, CheckCircle, Smartphone, XCircle, Sheet, Globe, FolderOpen, FileText, Edit3, Trash2, Plus, Settings } from 'lucide-react';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { getCompanyById, getServiceRequests, getSupportTickets, getInvoices, getServiceTypes } from '../../lib/api/companies';
import { getCompanyUsers, createUser, updateUser, deleteUser } from '../../lib/api/users';
import WhatsAppSettingsModal from '../../components/modals/WhatsAppSettingsModal';
import InstagramSettingsModal from '../../components/modals/InstagramSettingsModal';
import GoogleServiceSettingsModal from '../../components/modals/GoogleServiceSettingsModal';
import WebsiteSettingsModal from '../../components/modals/WebsiteSettingsModal';
import MobileAppSettingsModal from '../../components/modals/MobileAppSettingsModal';
import EditCompanyModal, { CompanyFormData } from '../../components/modals/EditCompanyModal';
import AddUserModal, { UserFormData as AddUserFormData } from '../../components/modals/AddUserModal';
import EditUserModal, { UserFormData as EditUserFormData } from '../../components/modals/EditUserModal';

export default function CompanyDetail() {
  const { id: companyId } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  const [showWhatsAppSettings, setShowWhatsAppSettings] = useState(false);
  const [showInstagramSettings, setShowInstagramSettings] = useState(false);
  const [showGoogleSettings, setShowGoogleSettings] = useState(false);
  const [selectedGoogleService, setSelectedGoogleService] = useState<string | null>(null);
  const [showWebsiteSettings, setShowWebsiteSettings] = useState(false);
  const [showMobileAppSettings, setShowMobileAppSettings] = useState(false);

  // User management states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Company edit state
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);

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

        // Fetch all data in parallel
        const [companyData, servicesData, ticketsData, invoicesData, serviceTypesData, usersData] = await Promise.all([
          getCompanyById(companyId),
          getServiceRequests(companyId),
          getSupportTickets(companyId),
          getInvoices(companyId),
          getServiceTypes(),
          getCompanyUsers(companyId)
        ]);

        console.log('✅ All data fetched:', {
          company: companyData,
          services: servicesData,
          tickets: ticketsData,
          invoices: invoicesData,
          serviceTypes: serviceTypesData,
          users: usersData
        });

        setCompany(companyData);
        setServiceRequests(servicesData || []);
        setSupportTickets(ticketsData || []);
        setCompanyInvoices(invoicesData || []);
        setServiceTypes(serviceTypesData || []);
        setCompanyUsers(usersData || []);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId, navigate]);

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

  // Filter service requests
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

  const handleAddUser = async (data: AddUserFormData) => {
    try {
      console.log('📡 Creating user:', data);

      const newUser = await createUser({
        email: data.email,
        password: data.password,
        full_name: data.name,
        company_id: companyId!,
        role: data.role,
        language: 'en',
      });

      console.log('✅ User created:', newUser);

      const updatedUsers = await getCompanyUsers(companyId!);
      setCompanyUsers(updatedUsers);

      setUserSuccessMessage(`User "${data.name}" has been added successfully!`);
      setShowUserSuccessMessage(true);
      setTimeout(() => setShowUserSuccessMessage(false), 3000);
    } catch (err: any) {
      console.error('❌ Error creating user:', err);
      setUserSuccessMessage(`Failed to create user: ${err.message}`);
      setShowUserSuccessMessage(true);
      setTimeout(() => setShowUserSuccessMessage(false), 5000);
      throw err;
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.full_name,
      email: user.email,
      role: user.role,
      password: '',
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    setIsProcessingUser(true);

    try {
      console.log('📡 Updating user:', selectedUser.id);

      await updateUser(selectedUser.id, {
        full_name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role as 'company_admin' | 'user',
      });

      console.log('✅ User updated');

      // Refresh users list
      const updatedUsers = await getCompanyUsers(companyId!);
      setCompanyUsers(updatedUsers);

      setShowEditUserModal(false);

      setUserSuccessMessage(`User "${userFormData.name}" has been updated successfully!`);
      setShowUserSuccessMessage(true);
      setTimeout(() => setShowUserSuccessMessage(false), 3000);
    } catch (err: any) {
      console.error('❌ Error updating user:', err);
      setUserSuccessMessage(`Failed to update user: ${err.message}`);
      setShowUserSuccessMessage(true);
      setTimeout(() => setShowUserSuccessMessage(false), 5000);
    } finally {
      setIsProcessingUser(false);
    }
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setShowDeleteUserConfirm(true);
  };

  const handleDeleteUserConfirm = async () => {
    setIsProcessingUser(true);

    try {
      console.log('🗑️ Deleting user:', selectedUser.id);

      await deleteUser(selectedUser.id);

      console.log('✅ User deleted');

      // Refresh users list
      const updatedUsers = await getCompanyUsers(companyId!);
      setCompanyUsers(updatedUsers);

      setShowDeleteUserConfirm(false);

      setUserSuccessMessage(`User "${selectedUser.full_name}" has been removed from the company.`);
      setShowUserSuccessMessage(true);
      setTimeout(() => setShowUserSuccessMessage(false), 3000);
    } catch (err: any) {
      console.error('❌ Error deleting user:', err);
      setUserSuccessMessage(`Failed to delete user: ${err.message}`);
      setShowUserSuccessMessage(true);
      setTimeout(() => setShowUserSuccessMessage(false), 5000);
    } finally {
      setIsProcessingUser(false);
    }
  };

  const handleToggleUserStatus = (user: any) => {
    setSelectedUser(user);
    setShowSuspendConfirm(true);
  };

  const handleToggleUserStatusConfirm = async () => {
    setIsProcessingUser(true);

    try {
      const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';

      console.log('🔄 Updating user status:', selectedUser.id, newStatus);

      await updateUser(selectedUser.id, { status: newStatus });

      console.log('✅ User status updated');

      // Refresh users list
      const updatedUsers = await getCompanyUsers(companyId!);
      setCompanyUsers(updatedUsers);

      setShowSuspendConfirm(false);

      setUserSuccessMessage(`User "${selectedUser.full_name}" has been ${newStatus}.`);
      setShowUserSuccessMessage(true);
      setTimeout(() => setShowUserSuccessMessage(false), 3000);
    } catch (err: any) {
      console.error('❌ Error updating user status:', err);
      setUserSuccessMessage(`Failed to update status: ${err.message}`);
      setShowUserSuccessMessage(true);
      setTimeout(() => setShowUserSuccessMessage(false), 5000);
    } finally {
      setIsProcessingUser(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/admin/companies')}
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${company.status === 'active'
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
              <p className="text-2xl font-bold text-white">{companyUsers.length}</p>
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
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap relative ${activeTab === tab.id
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

        {activeTab === 'users' && (
          <div className="space-y-6">
            {showUserSuccessMessage && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-green-500 font-medium">Success!</p>
                  <p className="text-green-400/70 text-sm">{userSuccessMessage}</p>
                </div>
              </div>
            )}

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Company Users</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {companyUsers.length} user{companyUsers.length !== 1 ? 's' : ''} in this company
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUserFormData({ name: '', email: '', role: 'user', password: '' });
                    setShowAddUserModal(true);
                  }}
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
                  <p className="text-gray-400 text-sm mb-6">Add the first user to this company</p>
                  <button
                    onClick={() => {
                      setUserFormData({ name: '', email: '', role: 'user', password: '' });
                      setShowAddUserModal(true);
                    }}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add First User
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50 border-b border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Joined Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {companyUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-900/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.full_name}</p>
                                <p className="text-sm text-gray-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'company_admin'
                              ? 'bg-purple-500/10 border border-purple-500/30 text-purple-500'
                              : 'bg-blue-500/10 border border-blue-500/30 text-blue-500'
                              }`}>
                              {user.role === 'company_admin' ? 'Company Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                              ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                              : 'bg-red-500/10 border border-red-500/30 text-red-500'
                              }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-400 text-sm">
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="Edit User"
                              >
                                <Edit3 className="w-4 h-4 text-blue-500" />
                              </button>
                              <button
                                onClick={() => handleToggleUserStatus(user)}
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
                                onClick={() => handleDeleteUser(user)}
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
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Active Services</h2>
                <p className="text-sm text-gray-400 mt-1">Configure service settings for this company</p>
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
                      <p className="text-gray-400 text-sm mt-1">This company doesn't have any active services yet.</p>
                    </div>
                  );
                }

                // ✅ SERVICE ICON MAPPING
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

                // ✅ SERVICE COLOR MAPPING
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

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeServices.map((service: any) => {
                      const ServiceIcon = getServiceIcon(service.slug);  // ✅ Icon component al
                      const serviceColor = getServiceColor(service.slug);  // ✅ Color al

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
                              {/* ✅ LUCIDE ICON KULLAN */}
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${serviceColor} flex items-center justify-center shadow-lg`}>
                                <ServiceIcon className="w-6 h-6 text-white" />
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ticket.status === 'open' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-500' :
                        ticket.status === 'in_progress' ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500' :
                          'bg-green-500/10 border border-green-500/30 text-green-500'
                        }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded ${ticket.priority === 'high' || ticket.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
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
                      <span className={`px-2 py-1 rounded text-xs ${invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' :
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

        {/* ADD USER MODAL */}
        {showAddUserModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop - DÜZELTME: Sadece blur, siyah değil */}
            <div
              className="absolute inset-0 backdrop-blur-sm"
              onClick={() => setShowAddUserModal(false)}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Add New User</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="company_admin">Company Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
                  <input
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={isProcessingUser || !userFormData.name || !userFormData.email || !userFormData.password}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                >
                  {isProcessingUser ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT USER MODAL */}
        {showEditUserModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div
              className="absolute inset-0 backdrop-blur-sm"
              onClick={() => setShowEditUserModal(false)}
            ></div>

            <div className="relative bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Edit User</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="company_admin">Company Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditUserModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={isProcessingUser || !userFormData.name || !userFormData.email}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                >
                  {isProcessingUser ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE USER CONFIRMATION */}
        <ConfirmationDialog
          isOpen={showDeleteUserConfirm}
          onClose={() => setShowDeleteUserConfirm(false)}
          onConfirm={handleDeleteUserConfirm}
          title="Delete User"
          message={`Are you sure you want to delete "${selectedUser?.full_name}"? This action cannot be undone.`}
          confirmText="Delete User"
          confirmColor="from-red-600 to-red-700"
          isLoading={isProcessingUser}
        />

        {/* SUSPEND/ACTIVATE USER CONFIRMATION */}
        <ConfirmationDialog
          isOpen={showSuspendConfirm}
          onClose={() => setShowSuspendConfirm(false)}
          onConfirm={handleToggleUserStatusConfirm}
          title={selectedUser?.status === 'active' ? 'Suspend User' : 'Activate User'}
          message={`Are you sure you want to ${selectedUser?.status === 'active' ? 'suspend' : 'activate'} "${selectedUser?.full_name}"?`}
          confirmText={selectedUser?.status === 'active' ? 'Suspend' : 'Activate'}
          confirmColor={selectedUser?.status === 'active' ? 'from-yellow-600 to-orange-600' : 'from-green-600 to-emerald-600'}
          isLoading={isProcessingUser}
        />

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