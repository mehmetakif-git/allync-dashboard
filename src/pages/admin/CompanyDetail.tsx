import { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Users, Zap, DollarSign, Calendar, Mail, Phone, MapPin, CheckCircle, XCircle, Edit3, Trash2, Plus, FileText, Settings, MessageCircle, Instagram, Sheet, FolderOpen, Image, Globe } from 'lucide-react';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { companies } from '../../data/mockData';
import { mockServiceRequests } from '../../data/serviceRequests';
import { tickets } from '../../data/mockData';
import { invoices } from '../../data/mockData';
import { serviceTypes } from '../../data/services';
import WhatsAppSettingsModal from '../../components/modals/WhatsAppSettingsModal';
import InstagramSettingsModal from '../../components/modals/InstagramSettingsModal';
import GoogleServiceSettingsModal from '../../components/modals/GoogleServiceSettingsModal';
import WebsiteSettingsModal from '../../components/modals/WebsiteSettingsModal';
import { mockWebsiteProjects } from '../../data/mockWebsiteData';

interface CompanyDetailProps {
  companyId: string;
  onBack: () => void;
}

export default function CompanyDetail({ companyId, onBack }: CompanyDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'services' | 'tickets' | 'invoices'>('overview');
  const [showWhatsAppSettings, setShowWhatsAppSettings] = useState(false);
  const [showInstagramSettings, setShowInstagramSettings] = useState(false);
  const [showGoogleSettings, setShowGoogleSettings] = useState(false);
  const [selectedGoogleService, setSelectedGoogleService] = useState<string | null>(null);
  const [showWebsiteSettings, setShowWebsiteSettings] = useState(false);

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
    status: 'Active',
  });

  const company = companies.find(c => c.id === companyId);

  if (!company) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Company Not Found</h2>
            <p className="text-gray-400 mb-6">The company you're looking for doesn't exist.</p>
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

  const companyServices = mockServiceRequests.filter(
    req => req.company_id === companyId && req.status === 'approved'
  );
  const pendingRequests = mockServiceRequests.filter(
    req => req.company_id === companyId && req.status === 'pending'
  );
  const companyTickets = tickets.filter(t => t.company_id === companyId);
  const companyInvoices = invoices.filter(inv => inv.company_id === companyId);

  const totalRevenue = companyInvoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users, badge: 5 },
    { id: 'services', label: 'Services', icon: Zap, badge: companyServices.length },
    { id: 'tickets', label: 'Support Tickets', icon: Mail, badge: companyTickets.length },
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
                    company.status === 'Active'
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
                  postalCode: company.postalCode || '',
                  taxId: company.taxId || '',
                  registrationNumber: company.registrationNumber || '',
                  billingEmail: company.billingEmail || '',
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
              <p className="text-2xl font-bold text-white">{companyTickets.filter(t => t.status === 'Open').length}</p>
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
            {/* Company Details */}
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
                    <p className="text-white">{company.city || 'N/A'}, {company.postalCode || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Member Since</p>
                    <p className="text-white">
                      {new Date(company.createdAt).toLocaleDateString('en-US', {
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
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Tax & Billing Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Tax ID / VAT Number</p>
                  <p className="text-white font-mono">{company.taxId || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Registration Number</p>
                  <p className="text-white font-mono">{company.registrationNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Billing Email</p>
                  <p className="text-white">{company.billingEmail || company.email}</p>
                </div>
              </div>
            </div>

            {/* Company Status */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Status & Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Account Status</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    company.status === 'Active'
                      ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                      : 'bg-red-500/10 border border-red-500/30 text-red-500'
                  }`}>
                    {company.status}
                  </span>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Company ID</span>
                  </div>
                  <p className="text-white font-medium font-mono">{company.id}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Service Request Approved</span>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <p className="text-sm text-gray-400">WhatsApp Automation service activated</p>
                </div>
                <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Invoice Paid</span>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                  <p className="text-sm text-gray-400">Invoice #INV-2025-0023 - $599.00</p>
                </div>
                <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">New User Added</span>
                    <span className="text-xs text-gray-500">3 days ago</span>
                  </div>
                  <p className="text-sm text-gray-400">John Doe joined the company</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Add User Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Company Users</h2>
                <p className="text-gray-400 text-sm">Manage users for {company.name}</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Add User
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Joined</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {companyUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-white font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-300">{user.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'Company Admin'
                              ? 'bg-purple-500/10 border border-purple-500/30 text-purple-500'
                              : 'bg-blue-500/10 border border-blue-500/30 text-blue-500'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.status === 'Active'
                              ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                              : 'bg-red-500/10 border border-red-500/30 text-red-500'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 text-sm">{user.joinedDate}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <Edit3 className="w-4 h-4 text-purple-500" />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              className="p-2 hover:bg-orange-500/10 rounded-lg transition-colors"
                              title={user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                            >
                              {user.status === 'Active' ? (
                                <XCircle className="w-4 h-4 text-orange-500" />
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
                const activeServiceSlugs = [
                  'whatsapp-automation',
                  'instagram-automation',
                  'google-calendar',
                  'google-sheets',
                  'gmail-integration',
                  'google-docs',
                  'google-drive',
                  'google-photos',
                  'website-development'
                ];

                const activeServices = serviceTypes.filter(service =>
                  activeServiceSlugs.includes(service.slug)
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
                    {activeServices.map((service) => {
                      const Icon = service.icon;
                      const handleConfigureClick = () => {
                        if (service.slug === 'whatsapp-automation') {
                          setShowWhatsAppSettings(true);
                        } else if (service.slug === 'instagram-automation') {
                          setShowInstagramSettings(true);
                        } else if (service.slug === 'google-calendar') {
                          setSelectedGoogleService('calendar');
                          setShowGoogleSettings(true);
                        } else if (service.slug === 'google-sheets') {
                          setSelectedGoogleService('sheets');
                          setShowGoogleSettings(true);
                        } else if (service.slug === 'gmail-integration') {
                          setSelectedGoogleService('gmail');
                          setShowGoogleSettings(true);
                        } else if (service.slug === 'google-docs') {
                          setSelectedGoogleService('docs');
                          setShowGoogleSettings(true);
                        } else if (service.slug === 'google-drive') {
                          setSelectedGoogleService('drive');
                          setShowGoogleSettings(true);
                        } else if (service.slug === 'google-photos') {
                          setSelectedGoogleService('photos');
                          setShowGoogleSettings(true);
                        } else if (service.slug === 'website-development') {
                          setShowWebsiteSettings(true);
                        }
                      };

                      return (
                        <div key={service.id} className="bg-gray-900/50 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all">
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-500 font-medium">
                                Active
                              </span>
                            </div>
                          </div>

                          <h3 className="text-white font-semibold text-lg mb-2">{service.name_en}</h3>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description_en}</p>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <div>
                              <span className="text-gray-400">Package</span>
                              <p className="text-white font-medium">Professional</p>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-400">Status</span>
                              <p className="text-green-500 font-medium">Connected</p>
                            </div>
                          </div>

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
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{request.service_name}</p>
                            <p className="text-sm text-gray-400">Package: {request.package.toUpperCase()}</p>
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
              <span className="text-sm text-gray-400">{companyTickets.length} tickets</span>
            </div>

            {companyTickets.length > 0 ? (
              <div className="space-y-3">
                {companyTickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:bg-gray-900/70 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-white font-medium">{ticket.subject}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{ticket.number}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'Open' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-500' :
                        ticket.status === 'In Progress' ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500' :
                        'bg-green-500/10 border border-green-500/30 text-green-500'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded ${
                        ticket.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                        ticket.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {ticket.priority} Priority
                      </span>
                      <span>Created: {ticket.createdAt}</span>
                      <span>Updated: {ticket.updatedAt}</span>
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
              {companyInvoices.map((invoice) => (
                <div key={invoice.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{invoice.number}</p>
                      <p className="text-sm text-gray-400">{invoice.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${invoice.amount.toFixed(2)}</p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        invoice.status === 'Paid' ? 'bg-green-500/10 text-green-500' :
                        invoice.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
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

        {/* User Success Message */}
        {showUserSuccessMessage && (
          <div className="fixed top-6 right-6 z-50 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-green-500 font-medium">Success!</p>
              <p className="text-green-400/70 text-sm">{userSuccessMessage}</p>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6">
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
                    <option value="User">Regular User</option>
                    <option value="Company Admin">Company Admin</option>
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

        {/* Edit User Modal */}
        {showEditUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Edit User</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="User">Regular User</option>
                    <option value="Company Admin">Company Admin</option>
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
                  disabled={isProcessingUser}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                >
                  {isProcessingUser ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete User Confirmation */}
        <ConfirmationDialog
          isOpen={showDeleteUserConfirm}
          onClose={() => setShowDeleteUserConfirm(false)}
          onConfirm={handleDeleteUserConfirm}
          title="Remove User"
          message={`Are you sure you want to remove "${selectedUser?.name}" from ${company.name}? This action cannot be undone.`}
          confirmText="Remove User"
          confirmColor="from-red-600 to-red-700"
          isLoading={isProcessingUser}
        />

        {/* Suspend/Activate User Confirmation */}
        <ConfirmationDialog
          isOpen={showSuspendConfirm}
          onClose={() => setShowSuspendConfirm(false)}
          onConfirm={handleToggleUserStatusConfirm}
          title={selectedUser?.status === 'Active' ? 'Suspend User' : 'Activate User'}
          message={`Are you sure you want to ${selectedUser?.status === 'Active' ? 'suspend' : 'activate'} "${selectedUser?.name}"?`}
          confirmText={selectedUser?.status === 'Active' ? 'Suspend User' : 'Activate User'}
          confirmColor={selectedUser?.status === 'Active' ? 'from-orange-600 to-orange-700' : 'from-green-600 to-emerald-600'}
          isLoading={isProcessingUser}
        />

        {/* Settings Modals */}
        <WhatsAppSettingsModal
          isOpen={showWhatsAppSettings}
          onClose={() => setShowWhatsAppSettings(false)}
          onSave={(settings) => {
            console.log('WhatsApp settings saved:', settings);
          }}
          companyName={company.name}
          companyId={company.id}
          initialSettings={{
            bot_name: 'Tech Support Bot',
            greeting_message: 'Hello! Welcome to our support. How can I help you today?',
            phone_number: '+974 5555 0000',
            instance_id: `wa_instance_${company.id}`,
            connection_status: 'connected',
            is_active: true,
          }}
        />

        <InstagramSettingsModal
          isOpen={showInstagramSettings}
          onClose={() => setShowInstagramSettings(false)}
          onSave={(settings) => {
            console.log('Instagram settings saved:', settings);
          }}
          companyName={company.name}
          companyId={company.id}
          initialSettings={{
            connected_account: '@your_business_account',
            ai_model: 'GPT-4 (OpenRouter)',
            comment_auto_reply: true,
            dm_auto_reply: true,
            connection_status: 'connected',
            is_active: true,
          }}
        />

        {selectedGoogleService && (
          <GoogleServiceSettingsModal
            isOpen={showGoogleSettings}
            onClose={() => {
              setShowGoogleSettings(false);
              setSelectedGoogleService(null);
            }}
            onSave={(settings) => {
              console.log(`${selectedGoogleService} settings saved:`, settings);
            }}
            serviceType={selectedGoogleService as any}
            companyName={company.name}
            companyId={company.id}
            initialSettings={{
              google_account_email: `${selectedGoogleService}@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
              google_account_name: company.name,
              calendar_id: 'primary',
              sheet_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
              drive_folder_id: 'folder_abc123',
              auto_sync_enabled: true,
              sync_interval_minutes: 15,
              ai_model: 'gpt-4',
              auto_organize_enabled: true,
              connection_status: 'connected',
              is_active: true,
            }}
          />
        )}

        {showWebsiteSettings && (() => {
          const websiteProject = mockWebsiteProjects.find(p => p.companyId === company.id);
          return (
            <WebsiteSettingsModal
              companyName={company.name}
              onClose={() => setShowWebsiteSettings(false)}
              onSave={(settings) => {
                console.log('Website settings saved:', settings);
                setShowWebsiteSettings(false);
              }}
              initialSettings={websiteProject ? {
                projectType: websiteProject.projectType,
                domain: websiteProject.domain,
                email: websiteProject.email,
                estimatedCompletion: websiteProject.estimatedCompletion.split('T')[0],
                milestones: websiteProject.milestones
              } : undefined}
            />
          );
        })()}

        {/* Edit Company Modal */}
        {showEditCompanyModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full p-6 my-8">
              <h2 className="text-2xl font-bold text-white mb-6">Edit Company Information</h2>

              <div className="space-y-4 mb-6 max-h-[70vh] overflow-y-auto pr-2">
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Company Name *</label>
                      <input
                        type="text"
                        value={companyFormData.name}
                        onChange={(e) => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                        <input
                          type="email"
                          value={companyFormData.email}
                          onChange={(e) => setCompanyFormData({ ...companyFormData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                        <input
                          type="tel"
                          value={companyFormData.phone}
                          onChange={(e) => setCompanyFormData({ ...companyFormData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                      <input
                        type="url"
                        value={companyFormData.website}
                        onChange={(e) => setCompanyFormData({ ...companyFormData, website: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Address</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Street Address *</label>
                      <input
                        type="text"
                        value={companyFormData.address}
                        onChange={(e) => setCompanyFormData({ ...companyFormData, address: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                        <input
                          type="text"
                          value={companyFormData.city}
                          onChange={(e) => setCompanyFormData({ ...companyFormData, city: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Postal Code *</label>
                        <input
                          type="text"
                          value={companyFormData.postalCode}
                          onChange={(e) => setCompanyFormData({ ...companyFormData, postalCode: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Country *</label>
                        <input
                          type="text"
                          value={companyFormData.country}
                          onChange={(e) => setCompanyFormData({ ...companyFormData, country: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Tax & Registration</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Tax ID / VAT Number *</label>
                      <input
                        type="text"
                        value={companyFormData.taxId}
                        onChange={(e) => setCompanyFormData({ ...companyFormData, taxId: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Registration Number *</label>
                      <input
                        type="text"
                        value={companyFormData.registrationNumber}
                        onChange={(e) => setCompanyFormData({ ...companyFormData, registrationNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Billing Email</label>
                    <input
                      type="email"
                      value={companyFormData.billingEmail}
                      onChange={(e) => setCompanyFormData({ ...companyFormData, billingEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
                  <select
                    value={companyFormData.status}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditCompanyModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsEditingCompany(true);
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    setIsEditingCompany(false);
                    setShowEditCompanyModal(false);
                    setUserSuccessMessage('Company information updated successfully!');
                    setShowUserSuccessMessage(true);
                    setTimeout(() => setShowUserSuccessMessage(false), 3000);
                    console.log('Company Updated:', companyFormData);
                  }}
                  disabled={isEditingCompany}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                >
                  {isEditingCompany ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
