import { useState } from 'react';
import { Search, Plus, Edit3, Trash2, Eye, Building2, Users, Zap, CheckCircle, XCircle } from 'lucide-react';
import { companies as initialCompanies } from '../../data/mockData';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CompaniesManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState(initialCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    address: '',
    city: '',
    postalCode: '',
    taxId: '',
    registrationNumber: '',
    billingEmail: '',
    website: '',
    adminName: '',
    adminEmail: '',
    status: 'Active',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: companies.length,
    active: companies.filter(c => c.status === 'Active').length,
    suspended: companies.filter(c => c.status === 'Suspended').length,
  };

  const handleAddClick = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      country: '',
      address: '',
      city: '',
      postalCode: '',
      taxId: '',
      registrationNumber: '',
      billingEmail: '',
      website: '',
      adminName: '',
      adminEmail: '',
      status: 'Active',
    });
    setShowAddModal(true);
  };


  const handleDeleteClick = (company: any) => {
    setSelectedCompany(company);
    setShowDeleteConfirm(true);
  };

  const handleAddCompany = async () => {
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const newCompany = {
      id: String(companies.length + 1),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      address: formData.address,
      status: formData.status as 'Active' | 'Suspended',
      createdAt: new Date().toISOString(),
      activeServicesCount: 0,
    };

    setCompanies([...companies, newCompany]);
    setIsProcessing(false);
    setShowAddModal(false);

    setSuccessMessage(`Company "${formData.name}" has been added successfully!`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    console.log('Company Added:', newCompany);
  };


  const handleDeleteCompany = async () => {
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setCompanies(companies.filter(c => c.id !== selectedCompany.id));
    setIsProcessing(false);
    setShowDeleteConfirm(false);

    setSuccessMessage(`Company "${selectedCompany.name}" has been deleted.`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    console.log('Company Deleted:', selectedCompany.id);
  };

  const handleViewDetails = (companyId: string) => {
    window.location.hash = `company-detail/${companyId}`;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Companies Management</h1>
            <p className="text-gray-400">Manage companies, users, and their services</p>
          </div>
          <button
            onClick={handleAddClick}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Company
          </button>
        </div>

        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-green-500 font-medium">Success!</p>
              <p className="text-green-400/70 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Companies</span>
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Active</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.active}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Suspended</span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.suspended}</p>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Country</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Services</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{company.name}</p>
                          <p className="text-sm text-gray-400">{company.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{company.phone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{company.country}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span className="text-white font-medium">{company.activeServicesCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        company.status === 'Active'
                          ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                          : 'bg-red-500/10 border border-red-500/30 text-red-500'
                      }`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(company.id)}
                          className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(company)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Company"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full p-6 my-8">
              <h2 className="text-2xl font-bold text-white mb-6">Add New Company</h2>

              <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2">
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Address</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Tax & Registration</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tax ID / VAT Number *
                      </label>
                      <input
                        type="text"
                        value={formData.taxId}
                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                        placeholder="e.g., TR1234567890"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company Registration Number *
                      </label>
                      <input
                        type="text"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        placeholder="e.g., 123456"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Billing Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.billingEmail}
                      onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                      placeholder="billing@company.com"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">If different from main email</p>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Initial Admin User</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Admin Name
                      </label>
                      <input
                        type="text"
                        value={formData.adminName}
                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Admin Email
                      </label>
                      <input
                        type="email"
                        value={formData.adminEmail}
                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCompany}
                  disabled={isProcessing || !formData.name || !formData.email || !formData.phone || !formData.country || !formData.address || !formData.city || !formData.postalCode || !formData.taxId || !formData.registrationNumber}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Adding...' : 'Add Company'}
                </button>
              </div>
            </div>
          </div>
        )}


        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteCompany}
          title="Delete Company"
          message={`Are you sure you want to delete "${selectedCompany?.name}"? This action cannot be undone and will remove all associated users, services, and data.`}
          confirmText="Delete Company"
          confirmColor="from-red-600 to-red-700"
          isLoading={isProcessing}
        />
      </div>
    </div>
  );
}
