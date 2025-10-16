import { useState } from 'react';
import { Users, Search, Filter, MoreVertical, Shield, UserCircle, Building2, Mail, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'super_admin' | 'company_admin' | 'user';
  company: string;
  status: 'active' | 'suspended' | 'blocked';
  lastLogin: string;
  joinedDate: string;
  servicesAccess: string[];
}

const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Allync',
    lastName: 'Admin',
    email: 'info@allyncai.com',
    role: 'super_admin',
    company: 'Allync',
    status: 'active',
    lastLogin: '2 hours ago',
    joinedDate: '2024-01-01',
    servicesAccess: ['All Services'],
  },
  {
    id: '2',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@techinnovators.com',
    role: 'company_admin',
    company: 'Tech Innovators Inc',
    status: 'active',
    lastLogin: '5 hours ago',
    joinedDate: '2024-01-15',
    servicesAccess: ['WhatsApp Business AI', 'Instagram DM Automation', 'Text to Video AI'],
  },
  {
    id: '3',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@techinnovators.com',
    role: 'user',
    company: 'Tech Innovators Inc',
    status: 'active',
    lastLogin: '1 day ago',
    joinedDate: '2024-01-20',
    servicesAccess: ['WhatsApp Business AI', 'Instagram DM Automation'],
  },
  {
    id: '4',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael@globalsolutions.com',
    role: 'company_admin',
    company: 'Global Solutions Ltd',
    status: 'active',
    lastLogin: '3 hours ago',
    joinedDate: '2024-02-10',
    servicesAccess: ['WhatsApp Business AI', 'AI Customer Support'],
  },
  {
    id: '5',
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.davis@digitalmarketingpro.com',
    role: 'user',
    company: 'Digital Marketing Pro',
    status: 'suspended',
    lastLogin: '2 weeks ago',
    joinedDate: '2024-03-05',
    servicesAccess: ['Instagram DM Automation'],
  },
  {
    id: '6',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.w@ecommerceplus.com',
    role: 'company_admin',
    company: 'E-Commerce Plus',
    status: 'active',
    lastLogin: '1 hour ago',
    joinedDate: '2024-03-20',
    servicesAccess: [],
  },
];

export default function UsersManagement() {
  const [users] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const companies = Array.from(new Set(users.map(u => u.company)));

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesCompany = companyFilter === 'all' || user.company === companyFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesCompany;
  });

  const handleBlockUser = async (user: User) => {
    if (confirm(`Are you sure you want to ${user.status === 'blocked' ? 'unblock' : 'block'} ${user.firstName} ${user.lastName}?`)) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
      alert(`${user.firstName} ${user.lastName} has been ${user.status === 'blocked' ? 'unblocked' : 'blocked'}`);
    }
  };

  const handleSuspendUser = async (user: User) => {
    if (confirm(`Are you sure you want to ${user.status === 'suspended' ? 'activate' : 'suspend'} ${user.firstName} ${user.lastName}?`)) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
      alert(`${user.firstName} ${user.lastName} has been ${user.status === 'suspended' ? 'activated' : 'suspended'}`);
    }
  };

  const handleDeleteUser = async (user: User) => {
    const confirmation = prompt(`This is a destructive action. Type "${user.email}" to confirm deletion:`);
    if (confirmation === user.email) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      alert(`${user.firstName} ${user.lastName} has been deleted`);
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
        return 'bg-red-500/20 text-red-400';
      case 'company_admin':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Users Management</h1>
        <p className="text-gray-400 mt-1">Manage all users across all companies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white mt-2">{users.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
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
        <div className="bg-gray-800 rounded-lg p-6">
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
        <div className="bg-gray-800 rounded-lg p-6">
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

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="blocked">Blocked</option>
            </select>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Companies</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>

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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-gray-400 text-sm">Joined {user.joinedDate}</p>
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
                    <span className="text-white">{user.company}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      user.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white text-sm">{user.lastLogin}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <div className="relative group">
                        <button className="p-1 hover:bg-gray-700 rounded">
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <button
                            onClick={() => handleSuspendUser(user)}
                            className="w-full text-left px-4 py-2 text-white hover:bg-gray-600 rounded-t-lg"
                            disabled={isLoading}
                          >
                            {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => handleBlockUser(user)}
                            className="w-full text-left px-4 py-2 text-white hover:bg-gray-600"
                            disabled={isLoading}
                          >
                            {user.status === 'blocked' ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600 rounded-b-lg"
                            disabled={isLoading}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Edit User</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">First Name</label>
                  <input
                    type="text"
                    defaultValue={selectedUser.firstName}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Last Name</label>
                  <input
                    type="text"
                    defaultValue={selectedUser.lastName}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={selectedUser.email}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Role</label>
                <select
                  defaultValue={selectedUser.role}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="company_admin">Company Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Status</label>
                <select
                  defaultValue={selectedUser.status}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Services Access</label>
                <div className="text-gray-400 text-sm">
                  {selectedUser.servicesAccess.join(', ') || 'No services assigned'}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    if (confirm('Save changes to this user?')) {
                      setShowEditModal(false);
                      alert('User updated successfully');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
