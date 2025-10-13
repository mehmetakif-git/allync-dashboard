import { useState } from 'react';
import { Search, Plus, Eye, Edit, Ban, Trash2, Building2, ArrowLeft, Mail, Phone, Globe, Calendar, Users, Zap } from 'lucide-react';

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
            <p className="text-gray-400 mt-1">Company details and statistics</p>
          </div>
          <button
            onClick={() => handleEdit(selectedCompany)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Company
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <p className="text-sm text-gray-400">Active Services</p>
            </div>
            <p className="text-3xl font-bold text-white">{selectedCompany.activeServicesCount}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-green-400" />
              <p className="text-sm text-gray-400">Total Users</p>
            </div>
            <p className="text-3xl font-bold text-white">{selectedCompany.usersCount}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <p className="text-sm text-gray-400">Member Since</p>
            </div>
            <p className="text-xl font-bold text-white">{selectedCompany.createdAt}</p>
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
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                selectedCompany.status === 'Active'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {selectedCompany.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
