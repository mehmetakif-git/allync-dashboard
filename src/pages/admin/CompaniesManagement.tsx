import { useState } from 'react';
import { Search, Plus, Eye, Edit, Ban, Trash2, Building2, ArrowLeft, Mail, Phone, Globe, Calendar, Users, Zap, AlertCircle, DollarSign } from 'lucide-react';

type ViewMode = 'list' | 'add' | 'edit' | 'view';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  website?: string;
  status: 'Active' | 'Suspended';
  createdAt: string;
  activeServicesCount: number;
  usersCount: number;
}

const mockCompanies: Company[] = [
  { id: '1', name: 'Tech Corp', email: 'admin@techcorp.com', phone: '+1 555 100 2000', country: 'United States', website: 'techcorp.com', status: 'Active', createdAt: '2024-03-15', activeServicesCount: 3, usersCount: 12 },
  { id: '2', name: 'Beauty Salon TR', email: 'info@beautysalon.com', phone: '+90 555 200 3000', country: 'Turkey', website: 'beautysalon.tr', status: 'Active', createdAt: '2024-05-22', activeServicesCount: 2, usersCount: 5 },
  { id: '3', name: 'Law Firm Qatar', email: 'contact@lawfirm.qa', phone: '+974 555 300 4000', country: 'Qatar', status: 'Active', createdAt: '2024-01-10', activeServicesCount: 1, usersCount: 8 },
  { id: '4', name: 'Startup Inc', email: 'hello@startup.io', phone: '+1 555 400 5000', country: 'United States', status: 'Suspended', createdAt: '2023-12-20', activeServicesCount: 0, usersCount: 3 },
];

export default function CompaniesManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Suspended'>('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [detailTab, setDetailTab] = useState<'overview' | 'services' | 'tickets' | 'billing'>('overview');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    website: '',
    address: '',
    city: '',
    zipCode: '',
    taxId: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
  });

  const handleAddNew = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      country: '',
      website: '',
      address: '',
      city: '',
      zipCode: '',
      taxId: '',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
    });
    setViewMode('add');
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      email: company.email,
      phone: company.phone,
      country: company.country,
      website: company.website || '',
      address: '',
      city: '',
      zipCode: '',
      taxId: '',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
    });
    setViewMode('edit');
  };

  const handleView = (company: Company) => {
    setSelectedCompany(company);
    setViewMode('view');
  };

  const handleSave = () => {
    alert(
      `✅ Company ${viewMode === 'add' ? 'created' : 'updated'} successfully!\n\n` +
      `Company: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Country: ${formData.country}\n\n` +
      `${viewMode === 'add' ? 'Admin will receive setup instructions via email.' : 'Changes have been saved.'}`
    );
    setViewMode('list');
  };

  const handleDelete = (company: Company) => {
    if (confirm(`⚠️ Delete ${company.name}?\n\nThis will:\n- Remove all users\n- Cancel all services\n- Delete all data\n\nThis action cannot be undone!`)) {
      alert(`❌ ${company.name} has been permanently deleted.`);
    }
  };

  const handleToggleStatus = (company: Company) => {
    if (confirm(`${company.status === 'Active' ? 'Suspend' : 'Activate'} ${company.name}?`)) {
      alert(`✅ ${company.name} is now ${company.status === 'Active' ? 'suspended' : 'active'}.`);
    }
  };

  const filteredCompanies = mockCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(search.toLowerCase()) ||
                         company.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
    const matchesCountry = filterCountry === 'all' || company.country === filterCountry;
    return matchesSearch && matchesStatus && matchesCountry;
  });

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Companies Management</h1>
            <p className="text-gray-400 mt-1">Manage all companies in the system</p>
          </div>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
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
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
          >
            <option value="all">All Countries</option>
            <option value="United States">United States</option>
            <option value="Turkey">Turkey</option>
            <option value="Qatar">Qatar</option>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-800/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
                    {company.name.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{company.name}</h3>
                    <p className="text-sm text-gray-400">{company.email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  company.status === 'Active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {company.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Phone className="w-4 h-4" />
                  {company.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Globe className="w-4 h-4" />
                  {company.country}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Zap className="w-4 h-4" />
                  {company.activeServicesCount} services
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4" />
                  {company.usersCount} users
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
                <button
                  onClick={() => handleView(company)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleEdit(company)}
                  className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(company)}
                  className="px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium transition-colors"
                  title={company.status === 'Active' ? 'Suspend' : 'Activate'}
                >
                  <Ban className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(company)}
                  className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === 'add' || viewMode === 'edit') {
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
            <h1 className="text-3xl font-bold text-white">
              {viewMode === 'add' ? 'Add New Company' : 'Edit Company'}
            </h1>
            <p className="text-gray-400 mt-1">
              {viewMode === 'add' ? 'Create a new company account' : `Editing ${selectedCompany?.name}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Company Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tech Corp"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Company Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@company.com"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555 100 2000"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Country *
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
                required
              >
                <option value="">Select Country</option>
                <option value="United States">United States</option>
                <option value="Turkey">Turkey</option>
                <option value="Qatar">Qatar</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://company.com"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Address & Tax Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Business Street"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="10001"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Tax ID / VAT Number
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder="US123456789"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
              />
            </div>

            {viewMode === 'add' && (
              <>
                <div className="border-t border-gray-700 pt-4 mt-6">
                  <h4 className="font-bold text-white mb-4">Company Admin Account</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Admin Name *
                  </label>
                  <input
                    type="text"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="admin@company.com"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Admin Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.adminPhone}
                    onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                    placeholder="+1 555 100 2000"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-sm text-blue-300">
                    A welcome email with login instructions will be sent to the admin.
                  </p>
                </div>
              </>
            )}
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
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {viewMode === 'add' ? 'Create Company' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'view' && selectedCompany) {
    const companyServices = [
      {
        id: 'whatsapp-automation',
        name: 'WhatsApp Automation',
        plan: 'Pro',
        price: 499,
        startDate: '2024-03-15',
        status: 'Active',
        users: 8,
        usage: '8,420 messages',
      },
      {
        id: 'instagram-automation',
        name: 'Instagram Automation',
        plan: 'Basic',
        price: 149,
        startDate: '2024-05-22',
        status: 'Active',
        users: 3,
        usage: '245 posts',
      },
      {
        id: 'text-to-video',
        name: 'Text-to-Video AI',
        plan: '',
        price: 1499,
        startDate: '',
        status: 'Pending Request',
        requestDate: '2024-12-14 10:30',
        requestedPlan: 'Enterprise',
        requestMessage: 'We need this service for our marketing campaigns. Looking forward to generating video content from our blog posts.',
        users: 0,
        usage: 'N/A',
      },
      {
        id: 'voice-cloning',
        name: 'Voice Cloning',
        plan: '',
        price: 1199,
        startDate: '',
        status: 'Pending Request',
        requestDate: '2024-12-13 16:45',
        requestedPlan: 'Pro',
        requestMessage: 'Interested in voice cloning for our customer service automation.',
        users: 0,
        usage: 'N/A',
      },
    ];

    const supportTickets = [
      {
        id: 'T-001',
        subject: 'WhatsApp Integration Issue',
        status: 'open',
        priority: 'high',
        created: '2024-12-14 10:30',
        lastUpdate: '2024-12-14 15:45',
        messages: 3,
        assignedTo: 'Support Team',
        description: 'Having trouble connecting WhatsApp Business API. Error code 401 appears when trying to authenticate.',
      },
      {
        id: 'T-002',
        subject: 'Request for Instagram Analytics',
        status: 'in-progress',
        priority: 'medium',
        created: '2024-12-10 14:20',
        lastUpdate: '2024-12-12 09:15',
        messages: 7,
        assignedTo: 'Tech Support',
        description: 'Would like to access detailed analytics for Instagram engagement metrics.',
      },
      {
        id: 'T-003',
        subject: 'Billing Question',
        status: 'resolved',
        priority: 'low',
        created: '2024-12-05 08:45',
        lastUpdate: '2024-12-06 16:30',
        messages: 5,
        assignedTo: 'Billing Team',
        description: 'Question about invoice #INV-2024-1245 charges.',
      },
    ];

    const billingHistory = [
      { id: 'INV-2024-1247', date: '2024-12-01', amount: 2147, status: 'Paid', services: 3, dueDate: '2024-12-15' },
      { id: 'INV-2024-1198', date: '2024-11-01', amount: 2147, status: 'Paid', services: 3, dueDate: '2024-11-15' },
      { id: 'INV-2024-1156', date: '2024-10-01', amount: 1648, status: 'Paid', services: 2, dueDate: '2024-10-15' },
      { id: 'INV-2024-1089', date: '2024-09-01', amount: 1648, status: 'Paid', services: 2, dueDate: '2024-09-15' },
    ];

    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'active': return 'bg-green-500/20 text-green-400';
        case 'trial': return 'bg-blue-500/20 text-blue-400';
        case 'suspended': return 'bg-red-500/20 text-red-400';
        case 'pending request': return 'bg-yellow-500/20 text-yellow-400';
        case 'open': return 'bg-red-500/20 text-red-400';
        case 'in-progress': return 'bg-yellow-500/20 text-yellow-400';
        case 'resolved': return 'bg-green-500/20 text-green-400';
        case 'paid': return 'bg-green-500/20 text-green-400';
        case 'pending': return 'bg-yellow-500/20 text-yellow-400';
        case 'overdue': return 'bg-red-500/20 text-red-400';
        default: return 'bg-gray-500/20 text-gray-400';
      }
    };

    const getPriorityColor = (priority: string) => {
      switch (priority.toLowerCase()) {
        case 'high': return 'text-red-400';
        case 'medium': return 'text-yellow-400';
        case 'low': return 'text-green-400';
        default: return 'text-gray-400';
      }
    };

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
            <h1 className="text-3xl font-bold text-white">{selectedCompany.name}</h1>
            <p className="text-gray-400 mt-1">Complete company information and activity</p>
          </div>
          <button
            onClick={() => handleEdit(selectedCompany)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Company
          </button>
        </div>

        <div className="border-b border-gray-800">
          <div className="flex gap-4">
            <button
              onClick={() => setDetailTab('overview')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                detailTab === 'overview'
                  ? 'text-white border-blue-500'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setDetailTab('services')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                detailTab === 'services'
                  ? 'text-white border-blue-500'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              <Zap className="w-4 h-4" />
              Services ({companyServices.length})
            </button>
            <button
              onClick={() => setDetailTab('tickets')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                detailTab === 'tickets'
                  ? 'text-white border-blue-500'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Support Tickets ({supportTickets.filter(t => t.status !== 'resolved').length})
            </button>
            <button
              onClick={() => setDetailTab('billing')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                detailTab === 'billing'
                  ? 'text-white border-blue-500'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Billing
            </button>
          </div>
        </div>

        {detailTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <p className="text-sm text-gray-400">Active Services</p>
                </div>
                <p className="text-3xl font-bold text-white">{companyServices.filter(s => s.status === 'Active').length}</p>
                <p className="text-sm text-gray-400 mt-2">Total: {companyServices.length} services</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-gray-400">Total Users</p>
                </div>
                <p className="text-3xl font-bold text-white">{selectedCompany.usersCount}</p>
                <p className="text-sm text-gray-400 mt-2">Across all services</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <p className="text-sm text-gray-400">Member Since</p>
                </div>
                <p className="text-xl font-bold text-white">{selectedCompany.createdAt}</p>
                <p className="text-sm text-gray-400 mt-2">{Math.floor((new Date().getTime() - new Date(selectedCompany.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days</p>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-white">{selectedCompany.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-white">{selectedCompany.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Country</p>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <p className="text-white">{selectedCompany.country}</p>
                  </div>
                </div>
                {selectedCompany.website && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Website</p>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href={`https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {selectedCompany.website}
                      </a>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCompany.status)}`}>
                    {selectedCompany.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Monthly Spend</p>
                  <p className="text-white font-bold">${companyServices.reduce((sum, s) => sum + s.price, 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {detailTab === 'services' && (
          <div className="space-y-6">
            {companyServices.filter(s => s.status === 'Pending Request').length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    Pending Service Requests
                  </h3>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                    {companyServices.filter(s => s.status === 'Pending Request').length} pending
                  </span>
                </div>

                <div className="space-y-3">
                  {companyServices.filter(s => s.status === 'Pending Request').map((service: any) => (
                    <div key={service.id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{service.name}</h4>
                            <p className="text-sm text-gray-400">Requested: {service.requestDate}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Requested Plan</p>
                            <p className="text-white font-medium">{service.requestedPlan}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Price</p>
                            <p className="text-white font-medium">${service.price}/mo</p>
                          </div>
                        </div>
                        {service.requestMessage && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-gray-400 text-xs mb-1">Company Message:</p>
                            <p className="text-white text-sm">{service.requestMessage}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!confirm(
                              `✅ Approve Service Request?\n\n` +
                              `Company: ${selectedCompany?.name}\n` +
                              `Service: ${service.name}\n` +
                              `Plan: ${service.requestedPlan}\n` +
                              `Price: $${service.price}/month\n\n` +
                              `This will:\n` +
                              `- Activate the service immediately\n` +
                              `- Start billing from today\n` +
                              `- Notify the company via email\n\n` +
                              `Continue?`
                            )) {
                              return;
                            }
                            alert(`✅ Service Approved!\n\n${service.name} has been activated for ${selectedCompany?.name}.\n\nThe company will be notified via email.`);
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt(
                              `❌ Reject Service Request?\n\n` +
                              `Company: ${selectedCompany?.name}\n` +
                              `Service: ${service.name}\n\n` +
                              `Please enter rejection reason (will be sent to company):`
                            );

                            if (!reason) {
                              alert('❌ Rejection cancelled. Reason is required.');
                              return;
                            }

                            if (!confirm(
                              `❌ Confirm Rejection?\n\n` +
                              `Company will receive this message:\n"${reason}"\n\n` +
                              `Continue?`
                            )) {
                              return;
                            }

                            alert(`❌ Service Request Rejected\n\nCompany: ${selectedCompany?.name}\nService: ${service.name}\nReason: ${reason}\n\nThe company will be notified.`);
                          }}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Active Services</h3>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Total Monthly</p>
                  <p className="text-2xl font-bold text-white">
                    ${companyServices.filter(s => s.status === 'Active').reduce((sum: number, s: any) => sum + s.price, 0).toLocaleString()}/mo
                  </p>
                </div>
              </div>

              {companyServices.filter(s => s.status === 'Active').length === 0 ? (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400">No active services yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {companyServices.filter(s => s.status === 'Active').map((service: any) => (
                    <div key={service.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white">{service.name}</h4>
                            <p className="text-sm text-gray-400">Plan: {service.plan} • Started {service.startDate}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">${service.price}</p>
                          <p className="text-sm text-gray-400">per month</p>
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 bg-green-500/20 text-green-400">
                            Active
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                        <div>
                          <p className="text-sm text-gray-400">Active Users</p>
                          <p className="text-lg font-bold text-white">{service.users} users</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Usage This Month</p>
                          <p className="text-lg font-bold text-white">{service.usage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Duration</p>
                          <p className="text-lg font-bold text-white">
                            {Math.floor((new Date().getTime() - new Date(service.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                          View Analytics
                        </button>
                        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                          Change Plan
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Suspend ${service.name} for ${selectedCompany?.name}?\n\nThe service will be temporarily disabled. The company can request reactivation.`)) {
                              alert(`⏸️ Service Suspended\n\n${service.name} has been suspended for ${selectedCompany?.name}.`);
                            }
                          }}
                          className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium transition-colors"
                        >
                          Suspend
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`⚠️ Cancel ${service.name} for ${selectedCompany?.name}?\n\nThis will:\n- Stop the service immediately\n- Cancel future billing\n- Archive all data\n\nThis action cannot be undone!`)) {
                              alert(`❌ Service Cancelled\n\n${service.name} has been cancelled for ${selectedCompany?.name}.`);
                            }
                          }}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancel Service
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {detailTab === 'tickets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-400">All support tickets from this company</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium">
                  {supportTickets.filter(t => t.status === 'open').length} Open
                </span>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-medium">
                  {supportTickets.filter(t => t.status === 'in-progress').length} In Progress
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                  {supportTickets.filter(t => t.status === 'resolved').length} Resolved
                </span>
              </div>
            </div>

            {supportTickets.map((ticket) => (
              <div key={ticket.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-sm font-mono">
                        {ticket.id}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()} Priority
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{ticket.subject}</h4>
                    <p className="text-gray-400 text-sm mb-3">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Created: {ticket.created}</span>
                      <span>•</span>
                      <span>Last Update: {ticket.lastUpdate}</span>
                      <span>•</span>
                      <span>{ticket.messages} messages</span>
                      <span>•</span>
                      <span>Assigned to: {ticket.assignedTo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-800">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    View Conversation
                  </button>
                  {ticket.status !== 'resolved' && (
                    <>
                      <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Reply
                      </button>
                      <button className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-sm font-medium transition-colors">
                        Mark Resolved
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {detailTab === 'billing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-400">Complete billing history and invoices</p>
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">
                  ${billingHistory.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900/50 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Services</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {billingHistory.map((invoice) => (
                    <tr key={invoice.id} className="bg-gray-900/30 hover:bg-gray-800/70 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-white">{invoice.id}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{invoice.date}</td>
                      <td className="px-6 py-4">
                        <span className="text-white font-bold">${invoice.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{invoice.services} services</td>
                      <td className="px-6 py-4 text-gray-300">{invoice.dueDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
