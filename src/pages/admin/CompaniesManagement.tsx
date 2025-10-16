import { useState } from 'react';
import { Building2, Search, Filter, MoreVertical, CheckCircle2, XCircle, AlertCircle, Users, DollarSign, Activity } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'pending';
  plan: string;
  activeServices: number;
  totalUsers: number;
  monthlySpend: number;
  joinedDate: string;
  lastActive: string;
  services: {
    id: string;
    name: string;
    status: 'active' | 'pending' | 'cancelled';
    startDate: string;
    monthlyPrice: number;
  }[];
}

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Tech Innovators Inc',
    email: 'contact@techinnovators.com',
    phone: '+1 234 567 8900',
    status: 'active',
    plan: 'Enterprise',
    activeServices: 5,
    totalUsers: 24,
    monthlySpend: 2450,
    joinedDate: '2024-01-15',
    lastActive: '2 hours ago',
    services: [
      { id: 's1', name: 'WhatsApp Business AI', status: 'active', startDate: '2024-01-15', monthlyPrice: 499 },
      { id: 's2', name: 'Instagram DM Automation', status: 'active', startDate: '2024-02-01', monthlyPrice: 399 },
      { id: 's3', name: 'Text to Video AI', status: 'active', startDate: '2024-02-15', monthlyPrice: 599 },
      { id: 's4', name: 'AI Customer Support', status: 'active', startDate: '2024-03-01', monthlyPrice: 449 },
      { id: 's5', name: 'Social Media Analytics', status: 'pending', startDate: '2024-03-10', monthlyPrice: 299 },
    ],
  },
  {
    id: '2',
    name: 'Global Solutions Ltd',
    email: 'info@globalsolutions.com',
    phone: '+1 234 567 8901',
    status: 'active',
    plan: 'Professional',
    activeServices: 3,
    totalUsers: 12,
    monthlySpend: 1200,
    joinedDate: '2024-02-10',
    lastActive: '1 day ago',
    services: [
      { id: 's6', name: 'WhatsApp Business AI', status: 'active', startDate: '2024-02-10', monthlyPrice: 499 },
      { id: 's7', name: 'AI Customer Support', status: 'active', startDate: '2024-02-20', monthlyPrice: 449 },
      { id: 's8', name: 'Email Marketing Automation', status: 'active', startDate: '2024-03-01', monthlyPrice: 299 },
    ],
  },
  {
    id: '3',
    name: 'Digital Marketing Pro',
    email: 'contact@digitalmarketingpro.com',
    phone: '+1 234 567 8902',
    status: 'suspended',
    plan: 'Starter',
    activeServices: 1,
    totalUsers: 5,
    monthlySpend: 299,
    joinedDate: '2024-03-05',
    lastActive: '2 weeks ago',
    services: [
      { id: 's9', name: 'Instagram DM Automation', status: 'active', startDate: '2024-03-05', monthlyPrice: 399 },
    ],
  },
  {
    id: '4',
    name: 'E-Commerce Plus',
    email: 'support@ecommerceplus.com',
    phone: '+1 234 567 8903',
    status: 'pending',
    plan: 'Professional',
    activeServices: 0,
    totalUsers: 8,
    monthlySpend: 0,
    joinedDate: '2024-03-20',
    lastActive: '5 hours ago',
    services: [
      { id: 's10', name: 'WhatsApp Business AI', status: 'pending', startDate: '2024-03-20', monthlyPrice: 499 },
      { id: 's11', name: 'AI Customer Support', status: 'pending', startDate: '2024-03-20', monthlyPrice: 449 },
    ],
  },
];

export default function CompaniesManagement() {
  const [companies] = useState<Company[]>(mockCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'services'>('info');

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSuspend = (company: Company) => {
    if (confirm(`Are you sure you want to ${company.status === 'suspended' ? 'activate' : 'suspend'} ${company.name}?`)) {
      alert(`${company.name} has been ${company.status === 'suspended' ? 'activated' : 'suspended'}`);
    }
  };

  const handleDelete = (company: Company) => {
    const confirmation = prompt(`This is a destructive action. Type "${company.name}" to confirm deletion:`);
    if (confirmation === company.name) {
      alert(`${company.name} has been deleted`);
    }
  };

  const handleApproveService = (companyId: string, serviceId: string) => {
    if (confirm('Approve this service request?')) {
      alert('Service request approved');
    }
  };

  const handleRejectService = (companyId: string, serviceId: string) => {
    if (confirm('Reject this service request?')) {
      alert('Service request rejected');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Companies Management</h1>
        <p className="text-gray-400 mt-1">Manage all registered companies and their services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Companies</p>
              <p className="text-3xl font-bold text-white mt-2">{companies.length}</p>
            </div>
            <Building2 className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Companies</p>
              <p className="text-3xl font-bold text-white mt-2">
                {companies.filter(c => c.status === 'active').length}
              </p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white mt-2">
                {companies.reduce((sum, c) => sum + c.totalUsers, 0)}
              </p>
            </div>
            <Users className="w-12 h-12 text-purple-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Monthly Revenue</p>
              <p className="text-3xl font-bold text-white mt-2">
                ${companies.reduce((sum, c) => sum + c.monthlySpend, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Company</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Contact</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Plan</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Services</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Users</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Monthly Spend</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-medium">{company.name}</p>
                      <p className="text-gray-400 text-sm">Joined {company.joinedDate}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white text-sm">{company.email}</p>
                      <p className="text-gray-400 text-sm">{company.phone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-400">
                      {company.plan}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      company.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      company.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white">{company.activeServices}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white">{company.totalUsers}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white font-medium">${company.monthlySpend}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowDetailsModal(true);
                          setActiveTab('info');
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        View
                      </button>
                      <div className="relative group">
                        <button className="p-1 hover:bg-gray-700 rounded">
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <button
                            onClick={() => handleSuspend(company)}
                            className="w-full text-left px-4 py-2 text-white hover:bg-gray-600 rounded-t-lg"
                          >
                            {company.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => handleDelete(company)}
                            className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600 rounded-b-lg"
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

      {showDetailsModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{selectedCompany.name}</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-2 rounded-lg ${activeTab === 'info' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Company Info
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-4 py-2 rounded-lg ${activeTab === 'services' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Services ({selectedCompany.services.length})
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white">{selectedCompany.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Phone</p>
                      <p className="text-white">{selectedCompany.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Plan</p>
                      <p className="text-white">{selectedCompany.plan}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        selectedCompany.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        selectedCompany.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {selectedCompany.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Joined Date</p>
                      <p className="text-white">{selectedCompany.joinedDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Last Active</p>
                      <p className="text-white">{selectedCompany.lastActive}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-white">{selectedCompany.totalUsers}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Monthly Spend</p>
                      <p className="text-white font-medium">${selectedCompany.monthlySpend}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'services' && (
                <div className="space-y-4">
                  {selectedCompany.services.map((service) => (
                    <div key={service.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{service.name}</h3>
                          <p className="text-gray-400 text-sm mt-1">Started: {service.startDate}</p>
                          <p className="text-gray-400 text-sm">Monthly: ${service.monthlyPrice}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            service.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            service.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {service.status}
                          </span>
                          {service.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveService(selectedCompany.id, service.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectService(selectedCompany.id, service.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
