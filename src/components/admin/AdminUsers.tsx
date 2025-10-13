import { useState } from 'react';
import { Search, Eye, Edit, Ban, Trash2, Plus, Shield } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'John Smith', email: 'john@techcorp.com', company: 'Tech Corp', role: 'Admin', status: 'Active', lastActive: '2 hours ago' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@techcorp.com', company: 'Tech Corp', role: 'User', status: 'Active', lastActive: '1 day ago' },
  { id: 3, name: 'Ayşe Demir', email: 'ayse@beautysalon.com', company: 'Beauty Salon TR', role: 'Admin', status: 'Active', lastActive: '30 min ago' },
  { id: 4, name: 'Mohammed Ali', email: 'mohammed@lawfirm.qa', company: 'Law Firm Qatar', role: 'User', status: 'Suspended', lastActive: '2 weeks ago' },
];

export default function AdminUsers() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">All Users</h2>
          <p className="text-gray-400 text-sm mt-1">Manage all users across all companies</p>
        </div>
        <button
          onClick={() => {
            const name = prompt('User full name:');
            if (!name) return;

            const email = prompt('User email:');
            if (!email) return;

            const company = prompt('Company name:');
            if (!company) return;

            const role = prompt('Role (company_admin / user):');
            if (!role) return;

            alert(`✅ User created successfully!\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\nRole: ${role}\n\nInvitation email sent!`);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Invite User
        </button>
      </div>

      <div className="flex items-center gap-3">
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
        <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500">
          <option>All Companies</option>
          <option>Tech Corp</option>
          <option>Beauty Salon TR</option>
          <option>Law Firm Qatar</option>
        </select>
        <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500">
          <option>All Roles</option>
          <option>Admin</option>
          <option>User</option>
        </select>
        <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500">
          <option>All Status</option>
          <option>Active</option>
          <option>Suspended</option>
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
            {mockUsers.map((user) => (
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
                    {user.role === 'Admin' && <Shield className="w-4 h-4 text-orange-400" />}
                    {user.role}
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
                    <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="View">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Edit">
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Suspend">
                      <Ban className="w-4 h-4 text-orange-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Delete">
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
