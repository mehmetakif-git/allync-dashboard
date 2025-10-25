import { useState, useEffect } from 'react';
import { Download, Calendar, DollarSign, CreditCard, CheckCircle, Clock, AlertCircle, Filter, Eye, FileText } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import InvoicePreviewModal from '../../components/modals/InvoicePreviewModal';
import { useAuth } from '../../contexts/AuthContext';
import {
  getInvoicesByCompany,
  getPaymentGatewayForCompany,
  formatCurrency,
  getInvoiceStatusColor,
  type Invoice,
} from '../../lib/api/invoices';

// =====================================================
// COMPONENT
// =====================================================

export default function Invoices() {
  // ===== AUTH & CONTEXT =====
  const { user } = useAuth();
  console.log('🔐 [Invoices] User loaded:', { userId: user?.id, companyId: user?.company_id });

  // ===== STATES =====
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [availableGateway, setAvailableGateway] = useState<string>('stripe');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ===== LIFECYCLE =====
  useEffect(() => {
    if (user?.company_id) {
      console.log('📊 [Invoices] Fetching data for company:', user.company_id);
      fetchInvoices();
      fetchPaymentGateway();
    }
  }, [user?.company_id]);

  // ===== UTILITY FUNCTIONS =====
  const showSuccess = (message: string) => {
    console.log('✅ [Invoices] Success:', message);
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    console.error('❌ [Invoices] Error:', message);
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
    if (!user?.company_id) {
      console.warn('⚠️ [Invoices] No company_id found');
      return;
    }

    try {
      console.log('🔄 [Invoices] Fetching invoices...');
      setIsLoading(true);
      const data = await getInvoicesByCompany(user.company_id);
      console.log('📦 [Invoices] Invoices loaded:', { count: data?.length, data });
      setInvoices(data || []);
    } catch (error: any) {
      console.error('❌ [Invoices] Error fetching invoices:', error);
      showError(error.message || 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentGateway = async () => {
    if (!user?.company_id) return;

    try {
      console.log('🔄 [Invoices] Fetching payment gateway...');
      const gateway = await getPaymentGatewayForCompany(user.company_id);
      console.log('💳 [Invoices] Payment gateway:', gateway);
      setAvailableGateway(gateway);
    } catch (error: any) {
      console.error('❌ [Invoices] Error fetching gateway:', error);
      setAvailableGateway('stripe'); // Default fallback
    }
  };

  // ===== DATA CALCULATIONS =====
  const filteredInvoices = invoices.filter(inv => {
    const matches = filterStatus === 'all' || inv.status === filterStatus;
    console.log(`🔍 [Invoices] Filtering invoice ${inv.invoice_number}:`, { status: inv.status, filter: filterStatus, matches });
    return matches;
  });

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total_amount, 0);

  console.log('📊 [Invoices] Stats:', {
    total: invoices.length,
    filtered: filteredInvoices.length,
    totalPaid,
    totalPending,
    availableGateway,
  });

  // ===== HANDLERS =====
  const handlePayNow = (invoice: Invoice) => {
    console.log('💰 [Invoices] Pay Now clicked:', { invoiceId: invoice.id, invoice_number: invoice.invoice_number });
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handlePayment = (gateway: string) => {
    if (!selectedInvoice) return;

    console.log('💳 [Invoices] Gateway selected:', { gateway, invoice: selectedInvoice.invoice_number });
    setSelectedGateway(gateway);
    setShowPaymentConfirm(true);
  };

  const handlePaymentConfirm = async () => {
    if (!selectedInvoice) return;

    console.log('🔄 [Invoices] Processing payment:', {
      invoiceId: selectedInvoice.id,
      invoice_number: selectedInvoice.invoice_number,
      gateway: selectedGateway,
      amount: selectedInvoice.total_amount,
      currency: selectedInvoice.currency,
    });

    setPaymentLoading(true);
    setShowPaymentConfirm(false);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Integrate real payment gateway
      console.log('✅ [Invoices] Payment successful (DEMO)');
      
      showSuccess(`Payment successful! Invoice ${selectedInvoice.invoice_number} paid via ${selectedGateway}`);
      
      // Refresh invoices
      await fetchInvoices();
      
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setSelectedGateway('');
    } catch (error: any) {
      console.error('❌ [Invoices] Payment error:', error);
      showError(error.message || 'Payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    console.log('📥 [Invoices] Download PDF:', { invoiceId: invoice.id, pdf_url: invoice.pdf_url });
    
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
      showSuccess('Opening PDF...');
    } else {
      console.warn('⚠️ [Invoices] No PDF URL found for invoice:', invoice.invoice_number);
      showError('PDF not available for this invoice');
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    console.log('👁️ [Invoices] View invoice:', { invoiceId: invoice.id, invoice_number: invoice.invoice_number });
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handlePreviewInvoice = (invoice: Invoice) => {
    console.log('📄 [Invoices] Preview invoice:', { invoiceId: invoice.id, invoice_number: invoice.invoice_number });
    setSelectedInvoice(invoice);
    setShowPreviewModal(true);
  };

  const handleOpenInNewTab = (invoice: Invoice) => {
    console.log('🔗 [Invoices] Opening in new tab:', invoice.invoice_number);
    window.open(`/invoice-preview/${invoice.id}`, '_blank');
  };

  // ===== GATEWAY INFO =====
  const getGatewayInfo = (gateway: string) => {
    console.log('💳 [Invoices] Getting gateway info:', gateway);
    
    switch (gateway) {
      case 'paytr':
        return {
          name: 'PayTR',
          description: 'Turkey (Credit/Debit/Bank)',
          gradient: 'from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700',
        };
      case 'stripe':
        return {
          name: 'Stripe',
          description: 'Global payments (Credit/Debit)',
          gradient: 'from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
        };
      case 'qpay':
      case 'tappay':
        return {
          name: 'Tappay / QPay',
          description: 'Qatar (Credit/Debit)',
          gradient: 'from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700',
        };
      default:
        return {
          name: 'Stripe',
          description: 'Global payments',
          gradient: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
        };
    }
  };

  // ===== STATUS HELPERS =====
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  // ===== LOADING STATE =====
  if (isLoading) {
    console.log('⏳ [Invoices] Loading...');
    return <LoadingSpinner />;
  }

  // ===== RENDER =====
  console.log('🎨 [Invoices] Rendering with:', { invoiceCount: invoices.length, filteredCount: filteredInvoices.length });

  return (
    <div className="p-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Invoices</h1>
          <p className="text-muted mt-1">Manage your billing and payments</p>
        </div>
      </div>

      {/* ===== SUCCESS MESSAGE ===== */}
      {successMessage && (
        <div className="p-4 bg-accent-green/10 border border-accent-green/30 rounded-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0" />
          <p className="text-accent-green font-medium">{successMessage}</p>
        </div>
      )}

      {/* ===== ERROR MESSAGE ===== */}
      {errorMessage && (
        <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-accent-red flex-shrink-0" />
          <p className="text-accent-red font-medium">{errorMessage}</p>
        </div>
      )}

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-primary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-accent-green" />
            </div>
            <p className="text-sm text-muted">Total Paid</p>
          </div>
          <p className="text-3xl font-bold text-white">${totalPaid.toLocaleString()}</p>
        </div>

        <div className="bg-card border border-primary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent-yellow/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent-yellow" />
            </div>
            <p className="text-sm text-muted">Pending</p>
          </div>
          <p className="text-3xl font-bold text-white">${totalPending.toLocaleString()}</p>
        </div>

        <div className="bg-card border border-primary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-blue" />
            </div>
            <p className="text-sm text-muted">Total Invoices</p>
          </div>
          <p className="text-3xl font-bold text-white">{invoices.length}</p>
        </div>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-5 h-5 text-muted" />
        {['all', 'paid', 'pending', 'overdue'].map((status) => (
          <button
            key={status}
            onClick={() => {
              console.log('🔽 [Invoices] Filter changed:', status);
              setFilterStatus(status as any);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filterStatus === status
                ? 'bg-accent-blue text-white'
                : 'bg-secondary text-muted hover:bg-hover'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* ===== INVOICES TABLE ===== */}
      <div className="bg-card border border-primary rounded-xl overflow-hidden">
        {filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-secondary border-b border-primary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-hover transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-white text-sm">{invoice.invoice_number}</span>
                    </td>
                    <td className="px-6 py-4 text-secondary">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted" />
                        <span className="text-sm">{formatDate(invoice.issue_date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-secondary text-sm">
                        {invoice.due_date ? formatDate(invoice.due_date) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold text-lg">
                        {formatCurrency(invoice.total_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getInvoiceStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="px-3 py-1.5 bg-secondary hover:bg-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handlePreviewInvoice(invoice)}
                          className="p-1.5 bg-accent-purple/10 hover:bg-accent-purple/20 text-accent-purple rounded-lg transition-colors"
                          title="Preview Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {invoice.status === 'paid' && invoice.pdf_url && (
                          <button
                            onClick={() => handleDownloadPDF(invoice)}
                            className="p-1.5 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        {invoice.status === 'pending' && (
                          <button
                            onClick={() => handlePayNow(invoice)}
                            className="px-3 py-1.5 bg-accent-green hover:bg-accent-green/90 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Pay Now
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
            <DollarSign className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted text-lg mb-2">No invoices found</p>
            <p className="text-muted text-sm">
              {filterStatus !== 'all' ? 'Try adjusting your filter' : 'Invoices will appear here when created'}
            </p>
          </div>
        )}
      </div>

      {/* ===== INVOICE DETAIL MODAL ===== */}
      {selectedInvoice && showDetailsModal && !showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-primary border-2 border-accent-blue/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Invoice Details</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getInvoiceStatusColor(selectedInvoice.status)}`}>
                {selectedInvoice.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted mb-1">Invoice Number</p>
                  <p className="text-white font-mono">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-1">Invoice Date</p>
                  <p className="text-white">{formatDate(selectedInvoice.issue_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-1">Due Date</p>
                  <p className="text-white">{selectedInvoice.due_date ? formatDate(selectedInvoice.due_date) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-1">Amount</p>
                  <p className="text-white text-xl font-bold">{formatCurrency(selectedInvoice.total_amount)}</p>
                </div>
              </div>

              {selectedInvoice.status === 'paid' && selectedInvoice.paid_at && (
                <div className="bg-accent-green/10 border border-accent-green/30 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-accent-green/70 mb-1">Payment Method</p>
                      <p className="text-accent-green font-medium">{selectedInvoice.payment_gateway || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-accent-green/70 mb-1">Paid On</p>
                      <p className="text-accent-green font-medium">{formatDate(selectedInvoice.paid_at)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount Breakdown */}
              <div className="bg-card border border-primary rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-3">Amount Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-white">{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  {selectedInvoice.tax_rate && selectedInvoice.tax_amount && (
                    <div className="flex justify-between">
                      <span className="text-muted">Tax ({selectedInvoice.tax_rate}%)</span>
                      <span className="text-white">{formatCurrency(selectedInvoice.tax_amount)}</span>
                    </div>
                  )}
                  {selectedInvoice.discount_amount && selectedInvoice.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted">Discount</span>
                      <span className="text-accent-green">-{formatCurrency(selectedInvoice.discount_amount)}</span>
                    </div>
                  )}
                  <div className="border-t border-primary pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-white font-bold">Total</span>
                      <span className="text-white font-bold">{formatCurrency(selectedInvoice.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="bg-card border border-primary rounded-xl p-4">
                  <p className="text-sm text-muted mb-2">Notes</p>
                  <p className="text-white">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-primary">
              <button
                onClick={() => {
                  console.log('❌ [Invoices] Close detail modal');
                  setSelectedInvoice(null);
                  setShowDetailsModal(false);
                }}
                className="flex-1 px-4 py-2 bg-secondary hover:bg-hover text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              {selectedInvoice.status === 'paid' && selectedInvoice.pdf_url && (
                <button
                  onClick={() => handleDownloadPDF(selectedInvoice)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-cyan text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              )}
              {selectedInvoice.status === 'pending' && (
                <button
                  onClick={() => {
                    console.log('💰 [Invoices] Opening payment modal from detail');
                    setShowPaymentModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-accent-green hover:bg-accent-green/90 text-white rounded-lg font-medium transition-colors"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== PAYMENT MODAL ===== */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-primary border-2 border-accent-blue/20 rounded-2xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-white mb-2">Select Payment Method</h2>
            <p className="text-muted mb-6">
              Amount to pay: <span className="text-white font-bold text-xl">{formatCurrency(selectedInvoice.total_amount)}</span>
            </p>

            <div className="space-y-3 mb-6">
              {/* Show only the available gateway for this company */}
              <button
                onClick={() => handlePayment(availableGateway)}
                disabled={paymentLoading}
                className={`w-full p-4 bg-gradient-to-r ${getGatewayInfo(availableGateway).gradient} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all flex items-center justify-between group`}
              >
                <div className="flex items-center gap-3">
                  {paymentLoading ? <LoadingSpinner size="sm" /> : <CreditCard className="w-6 h-6 text-white" />}
                  <div className="text-left">
                    <p className="text-white font-bold">{getGatewayInfo(availableGateway).name}</p>
                    <p className="text-sm text-white/80">
                      {paymentLoading ? 'Processing...' : getGatewayInfo(availableGateway).description}
                    </p>
                  </div>
                </div>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl p-3 mb-4">
              <p className="text-sm text-accent-blue">
                💳 <strong>Secure Payment:</strong> No card details are saved. All payments are processed securely through {getGatewayInfo(availableGateway).name}.
              </p>
            </div>

            <button
              onClick={() => {
                console.log('❌ [Invoices] Cancel payment');
                setShowPaymentModal(false);
                setSelectedInvoice(null);
              }}
              disabled={paymentLoading}
              className="w-full px-4 py-2 bg-secondary hover:bg-hover disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== INVOICE PREVIEW MODAL ===== */}
      {selectedInvoice && showPreviewModal && (
        <InvoicePreviewModal
          invoice={selectedInvoice}
          onClose={() => {
            console.log('❌ [Invoices] Close preview modal');
            setShowPreviewModal(false);
            setSelectedInvoice(null);
          }}
        />
      )}

      {/* ===== PAYMENT CONFIRMATION DIALOG ===== */}
      <ConfirmationDialog
        isOpen={showPaymentConfirm}
        onClose={() => {
          console.log('❌ [Invoices] Cancel payment confirmation');
          setShowPaymentConfirm(false);
        }}
        onConfirm={handlePaymentConfirm}
        title="Confirm Payment"
        message={`Are you sure you want to pay ${formatCurrency(selectedInvoice?.total_amount || 0)} for invoice ${selectedInvoice?.invoice_number} via ${getGatewayInfo(selectedGateway).name}? You will be redirected to the payment page.`}
        confirmText="Pay Now"
        confirmColor="from-green-600 to-emerald-600"
        isLoading={paymentLoading}
      />
    </div>
  );
}