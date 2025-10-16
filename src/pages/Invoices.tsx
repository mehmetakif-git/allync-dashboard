import { useState } from 'react';
import { Download, Calendar, DollarSign, CreditCard, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  services: string[];
  paymentMethod?: string;
  paidDate?: string;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-1247',
    date: '2024-12-01',
    dueDate: '2024-12-15',
    amount: 2147,
    status: 'pending',
    services: ['WhatsApp Automation - Pro', 'Instagram Automation - Basic', 'Text-to-Video AI - Enterprise'],
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-1198',
    date: '2024-11-01',
    dueDate: '2024-11-15',
    amount: 2147,
    status: 'paid',
    services: ['WhatsApp Automation - Pro', 'Instagram Automation - Basic', 'Text-to-Video AI - Enterprise'],
    paymentMethod: 'Stripe',
    paidDate: '2024-11-12',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-1156',
    date: '2024-10-01',
    dueDate: '2024-10-15',
    amount: 1648,
    status: 'paid',
    services: ['WhatsApp Automation - Pro', 'Instagram Automation - Basic'],
    paymentMethod: 'Stripe',
    paidDate: '2024-10-14',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-1089',
    date: '2024-09-01',
    dueDate: '2024-09-15',
    amount: 1648,
    status: 'paid',
    services: ['WhatsApp Automation - Pro', 'Instagram Automation - Basic'],
    paymentMethod: 'PayTR',
    paidDate: '2024-09-10',
  },
];

export default function Invoices() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const filteredInvoices = mockInvoices.filter(inv =>
    filterStatus === 'all' || inv.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'overdue': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const handlePayNow = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handlePayment = (gateway: string) => {
    if (!confirm(
      `💳 Confirm Payment\n\n` +
      `Are you sure you want to proceed with payment?\n\n` +
      `Invoice: ${selectedInvoice?.invoiceNumber}\n` +
      `Amount: $${selectedInvoice?.amount}\n` +
      `Gateway: ${gateway}\n\n` +
      `You will be redirected to the payment page.`
    )) {
      return;
    }

    console.log('Processing payment:', { invoice: selectedInvoice?.invoiceNumber, gateway });
    alert(
      `💳 Payment Processing\n\n` +
      `Invoice: ${selectedInvoice?.invoiceNumber}\n` +
      `Amount: $${selectedInvoice?.amount}\n` +
      `Gateway: ${gateway}\n\n` +
      `Redirecting to ${gateway} payment page...\n\n` +
      `⚠️ This is a demo. In production, this will redirect to the actual payment gateway.`
    );
    setShowPaymentModal(false);
    setSelectedInvoice(null);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    alert(`📥 Downloading invoice ${invoice.invoiceNumber}.pdf\n\nThis is a demo. In production, a PDF will be generated and downloaded.`);
  };

  const totalPaid = mockInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = mockInvoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Invoices</h1>
          <p className="text-gray-400 mt-1">Manage your billing and payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-gray-400">Total Paid</p>
          </div>
          <p className="text-3xl font-bold text-white">${totalPaid.toLocaleString()}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-400">Pending</p>
          </div>
          <p className="text-3xl font-bold text-white">${totalPending.toLocaleString()}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-gray-400">Total Invoices</p>
          </div>
          <p className="text-3xl font-bold text-white">{mockInvoices.length}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-gray-400" />
        {['all', 'paid', 'pending', 'overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900/80 border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-white">{invoice.invoiceNumber}</span>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {invoice.date}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">{invoice.dueDate}</td>
                <td className="px-6 py-4">
                  <span className="text-white font-bold text-lg">${invoice.amount.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {getStatusIcon(invoice.status)}
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      View
                    </button>
                    {invoice.status === 'paid' && (
                      <button
                        onClick={() => handleDownloadPDF(invoice)}
                        className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    {invoice.status === 'pending' && (
                      <button
                        onClick={() => handlePayNow(invoice)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
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

      {selectedInvoice && !showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Invoice Details</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInvoice.status)}`}>
                {selectedInvoice.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Invoice Number</p>
                  <p className="text-white font-mono">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Invoice Date</p>
                  <p className="text-white">{selectedInvoice.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Due Date</p>
                  <p className="text-white">{selectedInvoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Amount</p>
                  <p className="text-white text-xl font-bold">${selectedInvoice.amount.toLocaleString()}</p>
                </div>
              </div>

              {selectedInvoice.status === 'paid' && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-green-300 mb-1">Payment Method</p>
                      <p className="text-green-400 font-medium">{selectedInvoice.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-300 mb-1">Paid On</p>
                      <p className="text-green-400 font-medium">{selectedInvoice.paidDate}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white mb-3">Services</h3>
                <div className="space-y-2">
                  {selectedInvoice.services.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-white">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              {selectedInvoice.status === 'paid' && (
                <button
                  onClick={() => handleDownloadPDF(selectedInvoice)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              )}
              {selectedInvoice.status === 'pending' && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-white mb-2">Select Payment Method</h2>
            <p className="text-gray-400 mb-6">Amount to pay: <span className="text-white font-bold text-xl">${selectedInvoice.amount.toLocaleString()}</span></p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handlePayment('Stripe')}
                className="w-full p-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-white" />
                  <div className="text-left">
                    <p className="text-white font-bold">Stripe</p>
                    <p className="text-sm text-purple-200">Global payments (Credit/Debit)</p>
                  </div>
                </div>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button
                onClick={() => handlePayment('PayTR')}
                className="w-full p-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-white" />
                  <div className="text-left">
                    <p className="text-white font-bold">PayTR</p>
                    <p className="text-sm text-red-200">Turkey (Credit/Debit/Bank)</p>
                  </div>
                </div>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button
                onClick={() => handlePayment('Tappay/Qpay')}
                className="w-full p-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-white" />
                  <div className="text-left">
                    <p className="text-white font-bold">Tappay / Qpay</p>
                    <p className="text-sm text-green-200">Qatar (Credit/Debit)</p>
                  </div>
                </div>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-300">
                💳 <strong>Secure Payment:</strong> No card details are saved. All payments are processed securely through the selected gateway.
              </p>
            </div>

            <button
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedInvoice(null);
              }}
              className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
