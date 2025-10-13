import { Search, Eye, Edit, Trash2 } from 'lucide-react';

const mockCustomers = [
  { id: 1, name: 'John Doe', phone: '+1 555 0001', tags: ['VIP', 'Regular'], lastSeen: '2m ago', messages: 45, status: 'Active' },
  { id: 2, name: 'Sarah Smith', phone: '+1 555 0002', tags: ['New'], lastSeen: '15m ago', messages: 8, status: 'Active' },
  { id: 3, name: 'Mike Johnson', phone: '+1 555 0003', tags: ['Regular'], lastSeen: '1h ago', messages: 23, status: 'Inactive' },
];

export default function WhatsAppCustomers() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
          />
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          Export CSV
        </button>
      </div>

      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900/50 border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tags</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Seen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Messages</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {mockCustomers.map((customer) => (
              <tr key={customer.id} className="bg-gray-900/30 hover:bg-gray-800/70 transition-colors">
                <td className="px-6 py-4 text-white">{customer.name}</td>
                <td className="px-6 py-4 text-gray-400">{customer.phone}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {customer.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">{customer.lastSeen}</td>
                <td className="px-6 py-4 text-white">{customer.messages}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    customer.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
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
