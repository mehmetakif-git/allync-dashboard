import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, Zap, DollarSign, CheckCircle, XCircle, 
  Search, Eye, Trash2, Plus 
} from 'lucide-react';
import { getAllCompanies, createCompany, deleteCompany } from '../../lib/api/companies';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import AddCompanyModal, { CompanyFormData } from '../../components/modals/AddCompanyModal';

export default function CompaniesManagement() {
  const navigate = useNavigate();

  // Data States
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

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

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      console.log('📡 Fetching all companies...');
      const data = await getAllCompanies();
      console.log('✅ Companies fetched:', data?.length || 0, 'companies');
      setCompanies(data || []);
    } catch (err: any) {
      console.error('❌ Error fetching companies:', err);
      showError(err.message || 'Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== LIFECYCLE =====

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ===== DATA CALCULATIONS =====

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: companies.length,
    active: companies.filter(c => c.status === 'active').length,
    suspended: companies.filter(c => c.status === 'suspended').length,
  };

  // ===== COMPANY MANAGEMENT HANDLERS =====

  const handleAddCompany = async (data: CompanyFormData) => {
    setIsProcessing(true);
    try {
      console.log('📡 Creating company:', data.name);

      const newCompany = await createCompany({
        name: data.name,
        email: data.email,
        phone: data.phone,
        country: data.country,
        address: data.address,
        city: data.city,
        postal_code: data.postalCode,
        tax_id: data.taxId,
        registration_number: data.registrationNumber,
        billing_email: data.billingEmail || data.email,
        website: data.website,
        status: data.status,
      });

      console.log('✅ Company created:', newCompany.id);

      // Refresh companies list
      await fetchCompanies();

      setShowAddModal(false);
      showSuccess(`Company "${data.name}" has been added successfully!`);

      // TODO: Create admin user if provided
      if (data.adminName && data.adminEmail) {
        console.log('📧 Admin user creation needed:', {
          name: data.adminName,
          email: data.adminEmail,
          companyId: newCompany.id,
        });
        // Will be implemented when user creation is ready
      }
    } catch (err: any) {
      console.error('❌ Error creating company:', err);
      showError(err.message || 'Failed to add company');
      throw err; // Re-throw to let modal handle it
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (company: any) => {
    setSelectedCompany(company);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCompany) return;

    setIsProcessing(true);
    try {
      console.log('🗑️ Deleting company:', selectedCompany.id);

      await deleteCompany(selectedCompany.id);

      console.log('✅ Company deleted successfully');

      // Refresh companies list
      await fetchCompanies();

      setShowDeleteConfirm(false);
      setSelectedCompany(null);
      showSuccess(`Company "${selectedCompany.name}" has been deleted.`);
    } catch (err: any) {
      console.error('❌ Error deleting company:', err);
      showError(err.message || 'Failed to delete company');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (companyId: string) => {
    console.log('👁️ Viewing company details:', companyId);
    navigate(`/admin/companies/${companyId}`);
  };

  // ===== LOADING STATE =====

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Companies Management</h1>
            <p className="text-muted">Manage companies, users, and their services</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Company
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
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
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-red-500 font-medium">Error!</p>
              <p className="text-red-400/70 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted">Total Companies</span>
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted">Active</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.active}</p>
          </div>

          <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted">Suspended</span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.suspended}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-primary border border-secondary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-primary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl overflow-hidden">
          {filteredCompanies.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No companies found' : 'No companies yet'}
              </p>
              <p className="text-muted text-sm mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Add your first company to get started'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add First Company
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary/50 border-b border-secondary">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Country</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-primary/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{company.name}</p>
                            <p className="text-sm text-muted">{company.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-secondary">{company.phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-secondary">{company.country}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          company.status === 'active'
                            ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                            : company.status === 'suspended'
                            ? 'bg-red-500/10 border border-red-500/30 text-red-500'
                            : 'bg-gray-500/10 border border-secondary/30 text-muted'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-muted text-sm">
                          {new Date(company.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
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
          )}
        </div>

        {/* Results Summary */}
        {filteredCompanies.length > 0 && (
          <div className="mt-4 text-center text-sm text-muted">
            Showing {filteredCompanies.length} of {companies.length} companies
          </div>
        )}
      </div>

      {/* ===== MODALS ===== */}

      {/* Add Company Modal */}
      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCompany}
        isLoading={isProcessing}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedCompany(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Company"
        message={`Are you sure you want to delete "${selectedCompany?.name}"? This action cannot be undone and will remove all associated users, services, and data.`}
        confirmText="Delete Company"
        confirmColor="from-red-600 to-red-700"
        isLoading={isProcessing}
      />
    </div>
  );
}