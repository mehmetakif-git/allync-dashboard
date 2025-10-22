import { useState, useEffect } from 'react';
import { Users, Search, Filter, MoreVertical, Shield, UserCircle, Building2, Mail, XCircle, CheckCircle, Edit3 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAllUsers, updateUserStatus, deleteUser, updateUser } from '../../lib/api/users';
import ConfirmationDialog from '../../components/ConfirmationDialog';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'company_admin' | 'user';
  company_id: string | null;
  company?: {
    id: string;
    name: string;
  };
  status: 'active' | 'suspended' | 'blocked';
  last_login?: string | null;
  created_at: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Confirmation dialogs
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Edit form data
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    role: 'user' as 'super_admin' | 'company_admin' | 'user',
    status: 'active' as 'active' | 'suspended' | 'blocked',
  });

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('📡 Fetching all users...');
      const data = await getAllUsers();
      console.log('✅ Users fetched:', data);
      setUsers(data || []);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const companies = Array.from(
    new Set(users.map(u => u.company?.name).filter(Boolean))
  ) as string[];

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesCompany = companyFilter === 'all' || user.company?.name === companyFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesCompany;
  });

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      const updatedUser = await updateUser(selectedUser.id, {
        full_name: editFormData.full_name,
        email: editFormData.email,
        role: editFormData.role,
        status: editFormData.status,
      });
      
      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, ...updatedUser } : u
      ));
      
      setSuccessMessage(`User "${editFormData.full_name}" has been updated successfully.`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      const newStatus = selectedUser.status === 'suspended' ? 'active' : 'suspended';
      await updateUserStatus(selectedUser.id, newStatus);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, status: newStatus } : u
      ));
      
      setSuccessMessage(
        `User "${selectedUser.full_name}" has been ${newStatus === 'suspended' ? 'suspended' : 'activated'}.`
      );
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Failed to update user status. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowSuspendConfirm(false);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      const newStatus = selectedUser.status === 'blocked' ? 'active' : 'blocked';
      await updateUserStatus(selectedUser.id, newStatus);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, status: newStatus } : u
      ));
      
      setSuccessMessage(
        `User "${selectedUser.full_name}" has been ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}.`
      );
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      console.error('Error blocking user:', err);
      alert('Failed to block user. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowBlockConfirm(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      await deleteUser(selectedUser.id);
      
      // Remove from local state
      setUsers(users.filter(u => u.id !== selectedUser.id));
      
      setSuccessMessage(`User "${selectedUser.full_name}" has been deleted.`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="w-4 h-4" />;
      case 'company_admin':
        return <Building2 className="w-4 h-4" />;
      default:
        return <UserCircle className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'company_admin':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const formatLastLogin = (lastLogin?: string | null) => {
    if (!lastLogin) return 'Never';
    
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Users Management</h1>
          <p className="text-gray-400 mt-1">Manage all users across all companies</p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-green-500 font-medium">Success!</p>
              <p className="text-green-400/70 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white mt-2">{users.length}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Super Admins</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {users.filter(u => u.role === 'super_admin').length}
                </p>
              </div>
              <Shield className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Company Admins</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {users.filter(u => u.role === 'company_admin').length}
                </p>
              </div>
              <Building2 className="w-12 h-12 text-purple-500" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <UserCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="company_admin">Company Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="blocked">Blocked</option>
              </select>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Companies</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Company</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Login</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const initials = user.full_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-900/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {initials}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.full_name}</p>
                            <p className="text-gray-400 text-sm">
                              Joined {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-white text-sm">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 w-fit ${getRoleBadgeColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white">
                          {user.company?.name || 'Allync (Super Admin)'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          user.status === 'active' ? 'bg-green-500/10 border border-green-500/30 text-green-500' :
                          user.status === 'suspended' ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500' :
                          'bg-red-500/10 border border-red-500/30 text-red-500'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white text-sm">
                          {formatLastLogin(user.last_login)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit3 className="w-4 h-4 text-blue-500" />
                          </button>
                          <div className="relative group">
                            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                              <MoreVertical className="w-5 h-5 text-gray-400" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 border border-gray-600">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowSuspendConfirm(true);
                                }}
                                className="w-full text-left px-4 py-2 text-white hover:bg-gray-600 rounded-t-lg"
                                disabled={isProcessing}
                              >
                                {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowBlockConfirm(true);
                                }}
                                className="w-full text-left px-4 py-2 text-white hover:bg-gray-600"
                                disabled={isProcessing}
                              >
                                {user.status === 'blocked' ? 'Unblock' : 'Block'}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteConfirm(true);
                                }}
                                className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600 rounded-b-lg"
                                disabled={isProcessing}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit User</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.full_name}
                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="company_admin">Company Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">
                    <strong className="text-white">Company:</strong> {selectedUser.company?.name || 'Allync (Super Admin)'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    <strong className="text-white">Joined:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    disabled={isProcessing || !editFormData.full_name || !editFormData.email}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialogs */}
        <ConfirmationDialog
          isOpen={showSuspendConfirm}
          onClose={() => setShowSuspendConfirm(false)}
          onConfirm={handleSuspendUser}
          title={selectedUser?.status === 'suspended' ? 'Activate User' : 'Suspend User'}
          message={`Are you sure you want to ${selectedUser?.status === 'suspended' ? 'activate' : 'suspend'} "${selectedUser?.full_name}"?`}
          confirmText={selectedUser?.status === 'suspended' ? 'Activate' : 'Suspend'}
          confirmColor={selectedUser?.status === 'suspended' ? 'from-green-600 to-green-700' : 'from-yellow-600 to-yellow-700'}
          isLoading={isProcessing}
        />

        <ConfirmationDialog
          isOpen={showBlockConfirm}
          onClose={() => setShowBlockConfirm(false)}
          onConfirm={handleBlockUser}
          title={selectedUser?.status === 'blocked' ? 'Unblock User' : 'Block User'}
          message={`Are you sure you want to ${selectedUser?.status === 'blocked' ? 'unblock' : 'block'} "${selectedUser?.full_name}"?`}
          confirmText={selectedUser?.status === 'blocked' ? 'Unblock' : 'Block'}
          confirmColor={selectedUser?.status === 'blocked' ? 'from-green-600 to-green-700' : 'from-red-600 to-red-700'}
          isLoading={isProcessing}
        />

        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteUser}
          title="Delete User"
          message={`Are you sure you want to delete "${selectedUser?.full_name}"? This action cannot be undone and will remove all associated data.`}
          confirmText="Delete User"
          confirmColor="from-red-600 to-red-700"
          isLoading={isProcessing}
        />
      </div>
    </div>
  );
}