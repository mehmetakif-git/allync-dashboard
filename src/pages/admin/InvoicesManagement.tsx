import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, Eye, CheckCircle2, Clock, XCircle, AlertCircle, DollarSign, Building2, ChevronDown } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import InvoiceDetailModal from '../../components/modals/InvoiceDetailModal';
import {
  getAllInvoices,
  markInvoiceAsPaid,
  cancelInvoice,
  formatCurrency,
  getInvoiceStatusColor,
  getPaymentGatewayName,
  type Invoice,
} from '../../lib/api/invoices';

// =====================================================
// COMPONENT
// =====================================================

export default function InvoicesManagement() {
  // ===== STATES =====
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ===== LIFECYCLE =====
  useEffect(() => {
    fetchInvoices();
  }, []);

  // ===== UTILITY FUNCTIONS =====
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ===== DATA FETCHING =====
  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await getAllInvoices();
      setInvoices(data || []);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      showError(error.message || 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== DATA CALCULATIONS =====
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.company?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesGateway = gatewayFilter === 'all' || invoice.payment_gateway === gatewayFilter;
    
    return matchesSearch && matchesStatus && matchesGateway;
  });

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');

  // ===== HANDLERS =====
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
    } else {
      showError('PDF not available for this invoice');
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    if (!confirm('Mark this invoice as paid?')) return;
    
    try {
      await markInvoiceAsPaid(invoiceId, {
        paid_at: new Date().toISOString(),
      });
      await fetchInvoices();
      showSuccess('Invoice marked as paid successfully!');
    } catch (error: any) {
      console.error('Error marking invoice as paid:', error);
      showError(error.message || 'Failed to update invoice');
    }
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    const reason = prompt('Cancellation reason (optional):');
    if (reason === null) return;
    
    try {
      await cancelInvoice(invoiceId, reason);
      await fetchInvoices();
      showSuccess('Invoice cancelled successfully!');
    } catch (error: any) {
      console.error('Error cancelling invoice:', error);
      showError(error.message || 'Failed to cancel invoice');
    }
  };

  // ===== EXPORT HANDLERS =====
  const exportToCSV = (data: Invoice[], filename: string) => {
    const headers = ['Invoice #', 'Company', 'Email', 'Amount', 'Currency', 'Status', 'Gateway', 'Issue Date', 'Due Date', 'Paid Date'];
    const rows = data.map(inv => [
      inv.invoice_number,
      inv.company?.name || '',
      inv.company?.email || '',
      inv.total_amount,
      inv.currency,
      inv.status,
      inv.payment_gateway || '',
      inv.issue_date,
      inv.due_date || '',
      inv.paid_at || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showSuccess(`Exported ${data.length} invoices successfully!`);
  };

  const handleExportAll = () => {
    exportToCSV(invoices, `all-invoices-${new Date().toISOString().split('T')[0]}.csv`);
    setShowExportMenu(false);
  };

  const handleExportFiltered = () => {
    exportToCSV(filteredInvoices, `filtered-invoices-${new Date().toISOString().split('T')[0]}.csv`);
    setShowExportMenu(false);
  };

  const handleExportByStatus = (status: string) => {
    const filtered = invoices.filter(inv => inv.status === status);
    exportToCSV(filtered, `${status}-invoices-${new Date().toISOString().split('T')[0]}.csv`);
    setShowExportMenu(false);
  };

  const handleExportByCompany = () => {
    const companyName = prompt('Enter company name to export:');
    if (!companyName) return;
    
    const filtered = invoices.filter(inv => 
      inv.company?.name.toLowerCase().includes(companyName.toLowerCase())
    );
    
    if (filtered.length === 0) {
      showError('No invoices found for this company');
      return;
    }
    
    exportToCSV(filtered, `${companyName.replace(/\s/g, '-')}-invoices-${new Date().toISOString().split('T')[0]}.csv`);
    setShowExportMenu(false);
  };

  // ===== LOADING STATE =====
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Invoices Management</h1>
            <p className="text-muted mt-1">Manage all invoices across all companies</p>
          </div>
          
          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-cyan text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export
              <ChevronDown className="w-4 h-4" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-primary rounded-xl shadow-xl z-50">
                <div className="p-2">
                  <button
                    onClick={handleExportAll}
                    className="w-full text-left px-4 py-2 text-white hover:bg-hover rounded-lg transition-colors"
                  >
                    Export All Invoices
                  </button>
                  <button
                    onClick={handleExportFiltered}
                    className="w-full text-left px-4 py-2 text-white hover:bg-hover rounded-lg transition-colors"
                  >
                    Export Filtered Results
                  </button>
                  <div className="border-t border-primary my-2"></div>
                  <button
                    onClick={() => handleExportByStatus('paid')}
                    className="w-full text-left px-4 py-2 text-white hover:bg-hover rounded-lg transition-colors"
                  >
                    Export Paid Only
                  </button>
                  <button
                    onClick={() => handleExportByStatus('pending')}
                    className="w-full text-left px-4 py-2 text-white hover:bg-hover rounded-lg transition-colors"
                  >
                    Export Pending Only
                  </button>
                  <button
                    onClick={() => handleExportByStatus('overdue')}
                    className="w-full text-left px-4 py-2 text-white hover:bg-hover rounded-lg transition-colors"
                  >
                    Export Overdue Only
                  </button>
                  <div className="border-t border-primary my-2"></div>
                  <button
                    onClick={handleExportByCompany}
                    className="w-full text-left px-4 py-2 text-white hover:bg-hover rounded-lg transition-colors"
                  >
                    Export by Company...
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== SUCCESS MESSAGE ===== */}
        {successMessage && (
          <div className="p-4 bg-accent-green/10 border border-accent-green/30 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0" />
            <p className="text-accent-green font-medium">{successMessage}</p>
          </div>
        )}

        {/* ===== ERROR MESSAGE ===== */}
        {errorMessage && (
          <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-accent-red flex-shrink-0" />
            <p className="text-accent-red font-medium">{errorMessage}</p>
          </div>
        )}

        {/* ===== STATS CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card border border-primary rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-2">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-12 h-12 text-accent-blue" />
            </div>
          </div>

          <div className="bg-card border border-primary rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Paid Invoices</p>
                <p className="text-3xl font-bold text-white mt-2">{paidInvoices.length}</p>
                <p className="text-accent-green text-sm mt-1">
                  ${paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0).toLocaleString()}
                </p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-accent-green" />
            </div>
          </div>

          <div className="bg-card border border-primary rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Pending Invoices</p>
                <p className="text-3xl font-bold text-white mt-2">{pendingInvoices.length}</p>
                <p className="text-accent-yellow text-sm mt-1">
                  ${pendingInvoices.reduce((sum, inv) => sum + inv.total_amount, 0).toLocaleString()}
                </p>
              </div>
              <Clock className="w-12 h-12 text-accent-yellow" />
            </div>
          </div>

          <div className="bg-card border border-primary rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Overdue Invoices</p>
                <p className="text-3xl font-bold text-white mt-2">{overdueInvoices.length}</p>
                <p className="text-accent-red text-sm mt-1">
                  ${overdueInvoices.reduce((sum, inv) => sum + inv.total_amount, 0).toLocaleString()}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-accent-red" />
            </div>
          </div>
        </div>

        {/* ===== FILTERS ===== */}
        <div className="bg-card border border-primary rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search by company, invoice number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary border border-secondary rounded-lg text-white placeholder-muted focus:outline-none focus:border-accent-blue"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-secondary border border-secondary rounded-lg text-white focus:outline-none focus:border-accent-blue"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <select
                value={gatewayFilter}
                onChange={(e) => setGatewayFilter(e.target.value)}
                className="px-4 py-2 bg-secondary border border-secondary rounded-lg text-white focus:outline-none focus:border-accent-blue"
              >
                <option value="all">All Gateways</option>
                <option value="paytr">PayTR</option>
                <option value="stripe">Stripe</option>
                <option value="qpay">QPay</option>
                <option value="tappay">Tappay</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-muted">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </p>
        </div>

        {/* ===== INVOICES TABLE ===== */}
        <div className="bg-card border border-primary rounded-xl overflow-hidden">
          {filteredInvoices.length > 0 ? (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary bg-secondary">
                    <th className="text-left py-3 px-4 text-secondary font-medium">Invoice #</th>
                    <th className="text-left py-3 px-4 text-secondary font-medium">Company</th>
                    <th className="text-left py-3 px-4 text-secondary font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-secondary font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-secondary font-medium">Gateway</th>
                    <th className="text-left py-3 px-4 text-secondary font-medium">Issue Date</th>
                    <th className="text-left py-3 px-4 text-secondary font-medium">Due Date</th>
                    <th className="text-left py-3 px-4 text-secondary font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-primary hover:bg-hover transition-colors">
                      <td className="py-4 px-4">
                        <p className="text-white font-medium font-mono text-sm">{invoice.invoice_number}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-accent-blue flex-shrink-0" />
                          <div>
                            <p className="text-white font-medium">{invoice.company?.name}</p>
                            <p className="text-muted text-sm">{invoice.company?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white font-semibold">
                          {formatCurrency(invoice.total_amount, invoice.currency)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getInvoiceStatusColor(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-secondary text-sm">
                          {invoice.payment_gateway ? getPaymentGatewayName(invoice.payment_gateway) : '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-secondary text-sm">{formatDate(invoice.issue_date)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-secondary text-sm">
                          {invoice.due_date ? formatDate(invoice.due_date) : '-'}
                        </p>
                        {invoice.paid_at && (
                          <p className="text-accent-green text-xs mt-1">Paid: {formatDate(invoice.paid_at)}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            className="p-2 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {invoice.pdf_url && (
                            <button
                              onClick={() => handleDownloadPDF(invoice)}
                              className="p-2 bg-accent-purple/10 hover:bg-accent-purple/20 text-accent-purple rounded-lg transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          {invoice.status === 'pending' && (
                            <button
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              className="p-2 bg-accent-green/10 hover:bg-accent-green/20 text-accent-green rounded-lg transition-colors"
                              title="Mark as Paid"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                            <button
                              onClick={() => handleCancelInvoice(invoice.id)}
                              className="p-2 bg-accent-red/10 hover:bg-accent-red/20 text-accent-red rounded-lg transition-colors"
                              title="Cancel Invoice"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
              <p className="text-muted text-lg mb-2">No invoices found</p>
              <p className="text-muted text-sm">
                {searchTerm || statusFilter !== 'all' || gatewayFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Invoices will appear here when created'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== INVOICE DETAIL MODAL ===== */}
      {showDetailsModal && selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setShowDetailsModal(false)}
          onDownload={handleDownloadPDF}
        />
      )}

      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
}