import { XCircle, Download, CheckCircle, Calendar, Building2, Mail, DollarSign, CreditCard } from 'lucide-react';
import { Invoice, formatCurrency, getInvoiceStatusColor, getPaymentGatewayName } from '../../lib/api/invoices';

interface InvoiceDetailModalProps {
  invoice: Invoice;
  onClose: () => void;
  onDownload: (invoice: Invoice) => void;
}

export default function InvoiceDetailModal({ invoice, onClose, onDownload }: InvoiceDetailModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-primary border-2 border-accent-blue/20 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border-b border-primary p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{invoice.invoice_number}</h2>
              <p className="text-sm text-muted mt-1">Invoice Details</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-hover rounded-lg transition-colors"
            >
              <XCircle className="w-6 h-6 text-muted hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Amount */}
          <div className="flex items-center justify-between p-4 bg-card border border-primary rounded-xl">
            <div>
              <p className="text-sm text-muted mb-2">Status</p>
              <span className={`px-4 py-2 rounded-full text-sm font-medium border inline-flex items-center gap-2 ${getInvoiceStatusColor(invoice.status)}`}>
                {invoice.status === 'paid' && <CheckCircle className="w-4 h-4" />}
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted mb-2">Total Amount</p>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(invoice.total_amount, invoice.currency)}
              </p>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-card border border-primary rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-accent-blue" />
              <h3 className="text-lg font-semibold text-white">Company Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted mb-1">Company Name</p>
                <p className="text-white font-medium">{invoice.company?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-accent-cyan" />
                  <p className="text-white">{invoice.company?.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Country</p>
                <p className="text-white">{invoice.company?.country || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Tax ID</p>
                <p className="text-white">{invoice.company?.tax_id || '-'}</p>
              </div>
              {invoice.company?.address && (
                <div className="col-span-2">
                  <p className="text-sm text-muted mb-1">Address</p>
                  <p className="text-white">
                    {invoice.company.address}
                    {invoice.company.city && `, ${invoice.company.city}`}
                    {invoice.company.postal_code && ` ${invoice.company.postal_code}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-card border border-primary rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-accent-purple" />
              <h3 className="text-lg font-semibold text-white">Invoice Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted mb-1">Invoice Number</p>
                <p className="text-white font-mono">{invoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Payment Gateway</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-accent-green" />
                  <p className="text-white">{invoice.payment_gateway ? getPaymentGatewayName(invoice.payment_gateway) : '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Issue Date</p>
                <p className="text-white">{formatDate(invoice.issue_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Due Date</p>
                <p className="text-white">{invoice.due_date ? formatDate(invoice.due_date) : '-'}</p>
              </div>
              {invoice.paid_at && (
                <div className="col-span-2">
                  <p className="text-sm text-muted mb-1">Paid Date</p>
                  <p className="text-accent-green font-medium">{formatDate(invoice.paid_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="bg-card border border-primary rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-accent-yellow" />
              <h3 className="text-lg font-semibold text-white">Amount Breakdown</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="text-white font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              {invoice.tax_rate && invoice.tax_amount && (
                <div className="flex justify-between">
                  <span className="text-muted">Tax ({invoice.tax_rate}%)</span>
                  <span className="text-white font-medium">{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
                </div>
              )}
              {invoice.discount_amount && invoice.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Discount</span>
                  <span className="text-accent-green font-medium">-{formatCurrency(invoice.discount_amount, invoice.currency)}</span>
                </div>
              )}
              <div className="border-t border-primary pt-3">
                <div className="flex justify-between">
                  <span className="text-white font-semibold text-lg">Total</span>
                  <span className="text-white font-bold text-lg">{formatCurrency(invoice.total_amount, invoice.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-card border border-primary rounded-xl p-4">
              <p className="text-sm text-muted mb-2">Notes</p>
              <p className="text-white">{invoice.notes}</p>
            </div>
          )}

          {/* Internal Notes (if any) */}
          {invoice.internal_notes && (
            <div className="bg-accent-orange/10 border border-accent-orange/30 rounded-xl p-4">
              <p className="text-sm text-accent-orange mb-2">Internal Notes</p>
              <p className="text-secondary">{invoice.internal_notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {invoice.pdf_url && (
              <button
                onClick={() => onDownload(invoice)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-blue/20 hover:shadow-accent-blue/40 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 bg-secondary border border-primary text-white rounded-xl font-medium transition-all hover:bg-hover"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}