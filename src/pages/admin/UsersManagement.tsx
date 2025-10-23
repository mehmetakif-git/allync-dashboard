import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, MoreVertical, Shield, UserCircle, 
  Building2, Mail, XCircle, CheckCircle, Edit3, Trash2, Plus 
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAllUsers, updateUserStatus, deleteUser, updateUser, createUser } from '../../lib/api/users';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import EditUserModal from '../../components/modals/EditUserModal';
import AddUserModal from '../../components/modals/AddUserModal';
import { EmailService } from '../../lib/email';

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
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // UI States
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ===== UTILITY FUNCTIONS =====

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('📡 Fetching all users...');
      const data = await getAllUsers();
      console.log('✅ Users fetched:', data?.length || 0, 'users');
      setUsers(data || []);
    } catch (err: any) {
      console.error('❌ Error fetching users:', err);
      showError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
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

  // ===== LIFECYCLE =====

  useEffect(() => {
    fetchUsers();
  }, []);

  // ===== DATA CALCULATIONS =====

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

  const stats = {
    total: users.length,
    superAdmins: users.filter(u => u.role === 'super_admin').length,
    companyAdmins: users.filter(u => u.role === 'company_admin').length,
    active: users.filter(u => u.status === 'active').length,
  };

  // ===== USER MANAGEMENT HANDLERS =====

  const handleAddUser = async (data: any) => {
    setIsProcessing(true);
    try {
      console.log('📡 Creating user:', data);

      // Create user in database and auth
      await createUser({
        email: data.email,
        password: data.password,
        full_name: data.name,
        company_id: data.companyId || null,
        role: data.role,
        language: 'en',
      });

      console.log('✅ User created successfully');

      // Send welcome email if requested
      if (data.sendEmail) {
        try {
          const company = data.companyId 
            ? users.find(u => u.company_id === data.companyId)?.company?.name || 'Allync AI'
            : 'Allync AI';

          await EmailService.sendWelcomeEmail({
            userName: data.name,
            userEmail: data.email,
            companyName: company,
            temporaryPassword: data.password,
          });
          console.log('📧 Welcome email sent');
        } catch (emailError) {
          console.error('⚠️ Failed to send welcome email:', emailError);
          // Don't fail user creation if email fails
        }
      }

      // Refresh users list
      await fetchUsers();

      setShowAddModal(false);
      showSuccess(`User "${data.name}" has been created successfully!`);
    } catch (err: any) {
      console.error('❌ Error creating user:', err);
      showError(err.message || 'Failed to create user');
      throw err; // Re-throw to let modal handle it
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (data: any) => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      console.log('📡 Updating user:', selectedUser.id);

      await updateUser(selectedUser.id, {
        full_name: data.name,
        email: data.email,
        role: data.role,
      });

      console.log('✅ User updated successfully');

      // Refresh users list
      await fetchUsers();

      setShowEditModal(false);
      showSuccess(`User "${data.name}" has been updated successfully!`);
    } catch (err: any) {
      console.error('❌ Error updating user:', err);
      showError(err.message || 'Failed to update user');
      throw err; // Re-throw to let modal handle it
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuspendClick = (user: User) => {
    setSelectedUser(user);
    setShowSuspendConfirm(true);
  };

  const handleSuspendConfirm = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      const newStatus = selectedUser.status === 'suspended' ? 'active' : 'suspended';
      
      console.log('🔄 Updating user status:', selectedUser.id, newStatus);

      await updateUserStatus(selectedUser.id, newStatus);

      console.log('✅ User status updated successfully');

      // Refresh users list
      await fetchUsers();

      setShowSuspendConfirm(false);
      setSelectedUser(null);
      showSuccess(
        `User "${selectedUser.full_name}" has been ${newStatus === 'suspended' ? 'suspended' : 'activated'}.`
      );
    } catch (err: any) {
      console.error('❌ Error updating user status:', err);
      showError(err.message || 'Failed to update user status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBlockClick = (user: User) => {
    setSelectedUser(user);
    setShowBlockConfirm(true);
  };

  const handleBlockConfirm = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      const newStatus = selectedUser.status === 'blocked' ? 'active' : 'blocked';
      
      console.log('🚫 Blocking/Unblocking user:', selectedUser.id, newStatus);

      await updateUserStatus(selectedUser.id, newStatus);

      console.log('✅ User blocked/unblocked successfully');

      // Refresh users list
      await fetchUsers();

      setShowBlockConfirm(false);
      setSelectedUser(null);
      showSuccess(
        `User "${selectedUser.full_name}" has been ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}.`
      );
    } catch (err: any) {
      console.error('❌ Error blocking user:', err);
      showError(err.message || 'Failed to block user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      console.log('🗑️ Deleting user:', selectedUser.id);

      await deleteUser(selectedUser.id);

      console.log('✅ User deleted successfully');

      // Refresh users list
      await fetchUsers();

      setShowDeleteConfirm(false);
      setSelectedUser(null);
      showSuccess(`User "${selectedUser.full_name}" has been deleted.`);
    } catch (err: any) {
      console.error('❌ Error deleting user:', err);
      showError(err.message || 'Failed to delete user');
    } finally {
      setIsProcessing(false);
    }
  };

  // ===== LOADING STATE =====

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Users Management</h1>
            <p className="text-gray-400 mt-1">Manage all users across all companies</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New User
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
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
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-red-500 font-medium">Error!</p>
              <p className="text-red-400/70 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Super Admins</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.superAdmins}</p>
              </div>
              <Shield className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Company Admins</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.companyAdmins}</p>
              </div>
              <Building2 className="w-12 h-12 text-purple-500" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.active}</p>
              </div>
              <UserCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters & Users Table */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
          {/* Filters */}
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
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || companyFilter !== 'all' 
                  ? 'No users found' 
                  : 'No users yet'}
              </p>
              <p className="text-gray-400 text-sm">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || companyFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Users will appear here once they are created'}
              </p>
            </div>
          ) : (
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
                                  onClick={() => handleSuspendClick(user)}
                                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-600 rounded-t-lg transition-colors"
                                  disabled={isProcessing}
                                >
                                  {user.status === 'suspended' ? '✅ Activate' : '⏸️ Suspend'}
                                </button>
                                <button
                                  onClick={() => handleBlockClick(user)}
                                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-600 transition-colors"
                                  disabled={isProcessing}
                                >
                                  {user.status === 'blocked' ? '🔓 Unblock' : '🚫 Block'}
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(user)}
                                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600 rounded-b-lg transition-colors"
                                  disabled={isProcessing}
                                >
                                  🗑️ Delete
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
          )}

          {/* Results Summary */}
          {filteredUsers.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-400">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          )}
        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        isLoading={isProcessing}
        showRoleSuperAdmin={true} // Allow super_admin role in UsersManagement
      />

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateUser}
          initialData={{
            name: selectedUser.full_name,
            email: selectedUser.email,
            role: selectedUser.role,
          }}
          isLoading={isProcessing}
          showRoleSuperAdmin={true} // Allow super_admin role selection
          userInfo={{
            company: selectedUser.company?.name || 'Allync (Super Admin)',
            joinedDate: new Date(selectedUser.created_at).toLocaleDateString(),
          }}
        />
      )}

      {/* Suspend/Activate Confirmation */}
      <ConfirmationDialog
        isOpen={showSuspendConfirm}
        onClose={() => {
          setShowSuspendConfirm(false);
          setSelectedUser(null);
        }}
        onConfirm={handleSuspendConfirm}
        title={selectedUser?.status === 'suspended' ? 'Activate User' : 'Suspend User'}
        message={`Are you sure you want to ${selectedUser?.status === 'suspended' ? 'activate' : 'suspend'} "${selectedUser?.full_name}"?`}
        confirmText={selectedUser?.status === 'suspended' ? 'Activate' : 'Suspend'}
        confirmColor={selectedUser?.status === 'suspended' ? 'from-green-600 to-green-700' : 'from-yellow-600 to-yellow-700'}
        isLoading={isProcessing}
      />

      {/* Block/Unblock Confirmation */}
      <ConfirmationDialog
        isOpen={showBlockConfirm}
        onClose={() => {
          setShowBlockConfirm(false);
          setSelectedUser(null);
        }}
        onConfirm={handleBlockConfirm}
        title={selectedUser?.status === 'blocked' ? 'Unblock User' : 'Block User'}
        message={`Are you sure you want to ${selectedUser?.status === 'blocked' ? 'unblock' : 'block'} "${selectedUser?.full_name}"?`}
        confirmText={selectedUser?.status === 'blocked' ? 'Unblock' : 'Block'}
        confirmColor={selectedUser?.status === 'blocked' ? 'from-green-600 to-green-700' : 'from-red-600 to-red-700'}
        isLoading={isProcessing}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.full_name}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete User"
        confirmColor="from-red-600 to-red-700"
        isLoading={isProcessing}
      />
    </div>
  );
}