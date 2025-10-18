import { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Users, Zap, DollarSign, Calendar, Mail, Phone, MapPin, CheckCircle, XCircle, Edit3, Trash2 } from 'lucide-react';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { companies } from '../../data/mockData';
import { mockServiceRequests } from '../../data/serviceRequests';
import { tickets } from '../../data/mockData';
import { invoices } from '../../data/mockData';

interface CompanyDetailProps {
  companyId: string;
  onBack: () => void;
}

export default function CompanyDetail({ companyId, onBack }: CompanyDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'services' | 'tickets' | 'invoices'>('overview');

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
  const companyTickets = tickets.filter(t => t.createdBy.includes('Tech Corp'));
  const companyInvoices = invoices;

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
    <div className="p-6">
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
              onClick={() => window.location.hash = 'companies-management'}
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
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Member Since</span>
                  </div>
                  <p className="text-white font-medium">
                    {new Date(company.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Company ID</span>
                  </div>
                  <p className="text-white font-medium font-mono">{company.id}</p>
                </div>
              </div>
            </div>

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
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Active Services</h2>
            <div className="space-y-3">
              {companyServices.map((service) => (
                <div key={service.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{service.service_name}</p>
                      <p className="text-sm text-gray-400">Package: {service.package.toUpperCase()}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-500">
                      Active
                    </span>
                  </div>
                </div>
              ))}
              {pendingRequests.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-white mt-6 mb-3">Pending Requests</h3>
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{request.service_name}</p>
                          <p className="text-sm text-gray-400">Package: {request.package.toUpperCase()}</p>
                        </div>
                        <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-xs text-orange-500">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Support Tickets</h2>
            <div className="space-y-3">
              {companyTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{ticket.subject}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      ticket.status === 'Open' ? 'bg-blue-500/10 text-blue-500' :
                      ticket.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{ticket.number} • {ticket.priority} Priority</p>
                </div>
              ))}
            </div>
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
      </div>
    </div>
  );
}
