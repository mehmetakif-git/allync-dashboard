import { useState } from 'react';
import { Search, Eye, Edit, Ban, Trash2, Plus } from 'lucide-react';

const mockCompanies = [
  { id: 1, name: 'Tech Corp', email: 'admin@techcorp.com', country: '🇺🇸 US', services: 3, users: 12, status: 'Active', revenue: '$599', created: 'Jan 15, 2025' },
  { id: 2, name: 'Beauty Salon TR', email: 'info@beautysalon.com', country: '🇹🇷 TR', services: 2, users: 5, status: 'Active', revenue: '$299', created: 'Jan 10, 2025' },
  { id: 3, name: 'Law Firm Qatar', email: 'contact@lawfirm.qa', country: '🇶🇦 QA', services: 1, users: 8, status: 'Active', revenue: '$599', created: 'Jan 5, 2025' },
  { id: 4, name: 'Startup Inc', email: 'hello@startup.io', country: '🇺🇸 US', services: 0, users: 3, status: 'Suspended', revenue: '$0', created: 'Dec 20, 2024' },
];

export default function AdminCompanies() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">All Companies</h2>
          <p className="text-gray-400 text-sm mt-1">Manage all companies in the system</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Company
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
          />
        </div>
        <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500">
          <option>All Countries</option>
          <option>🇺🇸 US</option>
          <option>🇹🇷 TR</option>
          <option>🇶🇦 QA</option>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Services</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Users</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {mockCompanies.map((company) => (
              <tr key={company.id} className="bg-gray-900/30 hover:bg-gray-800/70 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-white">{company.name}</p>
                    <p className="text-sm text-gray-400">{company.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-white">{company.country}</td>
                <td className="px-6 py-4 text-white">{company.services}</td>
                <td className="px-6 py-4 text-white">{company.users}</td>
                <td className="px-6 py-4 text-white font-medium">{company.revenue}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    company.status === 'Active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {company.status}
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
