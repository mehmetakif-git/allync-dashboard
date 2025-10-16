import { useState } from 'react';
import { Search, Plus, Eye, Edit, Ban, Trash2, Shield, Mail, Phone, Building2, ArrowLeft, Send, Calendar, Activity } from 'lucide-react';

type ViewMode = 'list' | 'invite' | 'edit' | 'view';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'COMPANY_ADMIN' | 'USER';
  company: string;
  companyId: string;
  status: 'Active' | 'Suspended';
  lastActive: string;
  createdAt: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'John Smith', email: 'john@techcorp.com', phone: '+1 555 100 2000', role: 'COMPANY_ADMIN', company: 'Tech Corp', companyId: '1', status: 'Active', lastActive: '2 hours ago', createdAt: '2024-03-15' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@techcorp.com', phone: '+1 555 100 2001', role: 'USER', company: 'Tech Corp', companyId: '1', status: 'Active', lastActive: '1 day ago', createdAt: '2024-03-20' },
  { id: '3', name: 'Ayşe Demir', email: 'ayse@beautysalon.com', phone: '+90 555 200 3000', role: 'COMPANY_ADMIN', company: 'Beauty Salon TR', companyId: '2', status: 'Active', lastActive: '30 min ago', createdAt: '2024-05-22' },
  { id: '4', name: 'Mohammed Ali', email: 'mohammed@lawfirm.qa', phone: '+974 555 300 4000', role: 'USER', company: 'Law Firm Qatar', companyId: '3', status: 'Suspended', lastActive: '2 weeks ago', createdAt: '2024-01-10' },
];

const mockCompanies = [
  { id: '1', name: 'Tech Corp' },
  { id: '2', name: 'Beauty Salon TR' },
  { id: '3', name: 'Law Firm Qatar' },
  { id: '4', name: 'Startup Inc' },
];

export default function UsersManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'COMPANY_ADMIN' | 'USER'>('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Suspended'>('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'USER' as 'COMPANY_ADMIN' | 'USER',
    companyId: '',
    position: '',
    department: '',
    inviteMessage: 'Welcome to Allync! You have been invited to join our platform. Please click the link below to set up your account and get started.',
  });

  const handleInviteUser = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'USER',
      companyId: '',
      position: '',
      department: '',
      inviteMessage: 'Welcome to Allync! You have been invited to join our platform. Please click the link below to set up your account and get started.',
    });
    setViewMode('invite');
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      companyId: user.companyId,
      position: '',
      department: '',
      inviteMessage: '',
    });
    setViewMode('edit');
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewMode('view');
  };

  const handleSendInvitation = () => {
    const company = mockCompanies.find(c => c.id === formData.companyId);

    console.log('📧 EMAIL SENDING (Mock):', {
      service: 'Resend.com',
      to: formData.email,
      subject: 'You\'re invited to Allync Platform',
      template: 'user-invitation',
      data: {
        name: formData.name,
        role: formData.role,
        company: company?.name,
        message: formData.inviteMessage,
        inviteLink: `https://allync.com/invite/${Math.random().toString(36).substring(7)}`,
      }
    });

    alert(
      `✅ Invitation sent successfully!\n\n` +
      `📧 Email Details:\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `To: ${formData.email}\n` +
      `Name: ${formData.name}\n` +
      `Role: ${formData.role}\n` +
      `Company: ${company?.name}\n\n` +
      `📨 Message Preview:\n` +
      `${formData.inviteMessage}\n\n` +
      `🔗 Invite Link: https://allync.com/invite/abc123\n\n` +
      `⚠️ Note: This is a mock email. In production, this will use Resend.com API to send real emails.`
    );

    setViewMode('list');
  };

  const handleSaveEdit = () => {
    alert(
      `✅ User updated successfully!\n\n` +
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Role: ${formData.role}`
    );
    setViewMode('list');
  };

  const handleDelete = (user: User) => {
    if (!confirm(
      `⚠️ DELETE USER?\n\n` +
      `Are you ABSOLUTELY SURE you want to delete:\n\n` +
      `User: ${user.name}\n` +
      `Email: ${user.email}\n\n` +
      `This action CANNOT be undone!\n` +
      `- User will lose all access immediately\n` +
      `- All user data will be deleted\n` +
      `- Activity history will be lost\n\n` +
      `Type "DELETE" in the next prompt to confirm.`
    )) {
      return;
    }

    const confirmation = prompt('Type "DELETE" to confirm:');
    if (confirmation !== 'DELETE') {
      alert('❌ Deletion cancelled. User was not deleted.');
      return;
    }

    alert(`✅ User ${user.name} has been deleted.`);
  };

  const handleToggleStatus = (user: User) => {
    if (user.status === 'Active') {
      const reason = prompt(
        `⏸️ Suspend User: ${user.name}\n\n` +
        `Please enter suspension reason (required):`
      );

      if (!reason) {
        alert('❌ Suspension cancelled. Reason is required.');
        return;
      }

      if (!confirm(
        `⏸️ Confirm Suspension?\n\n` +
        `User: ${user.name}\n` +
        `Reason: ${reason}\n\n` +
        `User will see this reason when trying to login.`
      )) {
        return;
      }

      alert(`✅ User ${user.name} has been suspended.\nReason: ${reason}`);
    } else {
      if (!confirm(
        `✅ Activate User?\n\n` +
        `User: ${user.name}\n\n` +
        `This will restore full access for this user.`
      )) {
        return;
      }
      alert(`✅ ${user.name} is now active.`);
    }
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesCompany = filterCompany === 'all' || user.companyId === filterCompany;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesCompany && matchesStatus;
  });

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Users Management</h1>
            <p className="text-gray-400 mt-1">Manage all users across all companies</p>
          </div>
          <button
            onClick={handleInviteUser}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Invite User
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
          >
            <option value="all">All Companies</option>
            {mockCompanies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="COMPANY_ADMIN">Company Admin</option>
            <option value="USER">User</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <div className="border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="bg-gray-900/30 hover:bg-gray-800/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{user.company}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-white">
                      {user.role === 'COMPANY_ADMIN' && <Shield className="w-4 h-4 text-orange-400" />}
                      {user.role === 'COMPANY_ADMIN' ? 'Company Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{user.lastActive}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'Active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(user)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        title={user.status === 'Active' ? 'Suspend' : 'Activate'}
                      >
                        <Ban className="w-4 h-4 text-orange-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (viewMode === 'invite') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('list')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Invite New User</h1>
            <p className="text-gray-400 mt-1">Send an email invitation to a new user</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">User Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555 100 2000"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Company *
              </label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
                required
              >
                <option value="">Select Company</option>
                {mockCompanies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
                required
              >
                <option value="USER">User</option>
                <option value="COMPANY_ADMIN">Company Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Position (Optional)
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Marketing Manager"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Department (Optional)
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Marketing"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Invitation Email</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Welcome Message
              </label>
              <textarea
                rows={8}
                value={formData.inviteMessage}
                onChange={(e) => setFormData({ ...formData, inviteMessage: e.target.value })}
                placeholder="Write a welcome message for the new user..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                This message will be included in the invitation email along with the setup link.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-3">EMAIL PREVIEW</p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400">To:</p>
                  <p className="text-white">{formData.email || 'user@example.com'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Subject:</p>
                  <p className="text-white">You're invited to Allync Platform</p>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <p className="text-gray-300 mb-2">Hi {formData.name || 'there'},</p>
                  <p className="text-gray-300 mb-3">{formData.inviteMessage}</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium">
                    Accept Invitation
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Send className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300 font-medium">Email Service: Resend.com</p>
                  <p className="text-xs text-blue-300 mt-1">
                    Currently in mock mode. In production, emails will be sent via Resend.com API.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setViewMode('list')}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendInvitation}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send Invitation
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'edit' && selectedUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('list')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Edit User</h1>
            <p className="text-gray-400 mt-1">Update user information and permissions</p>
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
            >
              <option value="USER">User</option>
              <option value="COMPANY_ADMIN">Company Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setViewMode('list')}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'view' && selectedUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('list')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{selectedUser.name}</h1>
            <p className="text-gray-400 mt-1">User details and activity</p>
          </div>
          <button
            onClick={() => handleEdit(selectedUser)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit User
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <p className="text-sm text-gray-400">Company</p>
            </div>
            <p className="text-xl font-bold text-white">{selectedUser.company}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-orange-400" />
              <p className="text-sm text-gray-400">Role</p>
            </div>
            <p className="text-xl font-bold text-white">{selectedUser.role === 'COMPANY_ADMIN' ? 'Company Admin' : 'User'}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-green-400" />
              <p className="text-sm text-gray-400">Last Active</p>
            </div>
            <p className="text-xl font-bold text-white">{selectedUser.lastActive}</p>
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">User Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-white">{selectedUser.email}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Phone</p>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-white">{selectedUser.phone}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                selectedUser.status === 'Active'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {selectedUser.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Member Since</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-white">{selectedUser.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
