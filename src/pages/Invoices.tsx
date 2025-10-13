import { useState } from 'react';
import { Search, Download, Eye, X } from 'lucide-react';
import { invoices } from '../data/mockData';
import { Invoice } from '../types';

export default function Invoices() {
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<'paytr' | 'stripe' | 'qpay' | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500/20 text-green-400';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Overdue':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-800/50 text-gray-400';
    }
  };

  const filteredInvoices =
    activeTab === 'all'
      ? invoices
      : invoices.filter((inv) => inv.status.toLowerCase() === activeTab);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const handlePayNow = (invoice: Invoice) => {
    setPaymentInvoice(invoice);
    setShowPaymentModal(true);
    setSelectedGateway(null);
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Invoices</h1>
          <p className="text-gray-400 mt-1">Manage and view your invoices</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All', count: invoices.length },
                { id: 'paid', label: 'Paid', count: invoices.filter((i) => i.status === 'Paid').length },
                { id: 'pending', label: 'Pending', count: invoices.filter((i) => i.status === 'Pending').length },
                { id: 'overdue', label: 'Overdue', count: invoices.filter((i) => i.status === 'Overdue').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  className="pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          <div className="border border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-white">{invoice.number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(invoice.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-white">
                        ${invoice.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-blue-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                        {invoice.status !== 'Paid' && (
                          <button
                            onClick={() => handlePayNow(invoice)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
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
        </div>
      </div>

      {showDetailModal && selectedInvoice && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => setShowDetailModal(false)}
          ></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedInvoice.number}</h2>
                <span
                  className={`inline-block mt-2 px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(
                    selectedInvoice.status
                  )}`}
                >
                  {selectedInvoice.status}
                </span>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">From</h3>
                  <div className="text-white">
                    <p className="font-bold">Allync Platform</p>
                    <p className="text-gray-400">123 AI Street</p>
                    <p className="text-gray-400">San Francisco, CA 94102</p>
                    <p className="text-gray-400">contact@allync.com</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Bill To</h3>
                  <div className="text-white">
                    <p className="font-bold">Tech Corp</p>
                    <p className="text-gray-400">456 Business Ave</p>
                    <p className="text-gray-400">New York, NY 10001</p>
                    <p className="text-gray-400">billing@techcorp.com</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Invoice Date</p>
                  <p className="font-medium text-white">
                    {new Date(selectedInvoice.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Due Date</p>
                  <p className="font-medium text-white">
                    {new Date(
                      new Date(selectedInvoice.date).setDate(
                        new Date(selectedInvoice.date).getDate() + 30
                      )
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Payment Method</p>
                  <p className="font-medium text-white">Credit Card</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Items</h3>
                <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm text-white">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-white text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-white text-right">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-white text-right">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Tax (18%)</span>
                    <span>${(selectedInvoice.amount * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-gray-700">
                    <span>Total</span>
                    <span>${(selectedInvoice.amount * 1.18).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedInvoice.status === 'Paid' && (
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Payment History</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-white">Payment Received</p>
                          <p className="text-sm text-gray-400">Via Stripe</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">${(selectedInvoice.amount * 1.18).toFixed(2)}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(selectedInvoice.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
                {selectedInvoice.status !== 'Paid' && (
                  <button
                    onClick={() => handlePayNow(selectedInvoice)}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                  >
                    Pay ${(selectedInvoice.amount * 1.18).toFixed(2)} Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showPaymentModal && paymentInvoice && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setShowPaymentModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Complete Payment</h2>
              <p className="text-blue-300 mt-1">Invoice: {paymentInvoice.number}</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Total Amount</p>
                    <p className="text-4xl font-bold text-white mt-1">
                      ${(paymentInvoice.amount * 1.18).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      (Subtotal: ${paymentInvoice.amount.toFixed(2)} + Tax: ${(paymentInvoice.amount * 0.18).toFixed(2)})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Due Date</p>
                    <p className="text-white font-medium">
                      {new Date(new Date(paymentInvoice.date).setDate(new Date(paymentInvoice.date).getDate() + 30)).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm font-medium text-gray-400 mb-2">Items:</p>
                  <div className="space-y-1">
                    {paymentInvoice.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-300">{item.description}</span>
                        <span className="text-white font-medium">${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setSelectedGateway('paytr')}
                    className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedGateway === 'paytr'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      TR
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-white">PayTR</p>
                      <p className="text-sm text-gray-400">Turkish Credit/Debit Cards</p>
                      <p className="text-xs text-gray-400 mt-1">Recommended for Turkey 🇹🇷</p>
                    </div>
                    {selectedGateway === 'paytr' && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedGateway('stripe')}
                    className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedGateway === 'stripe'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      $
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-white">Stripe</p>
                      <p className="text-sm text-gray-400">International Cards & Payment Methods</p>
                      <p className="text-xs text-gray-400 mt-1">Global payments 🌍</p>
                    </div>
                    {selectedGateway === 'stripe' && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedGateway('qpay')}
                    className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedGateway === 'qpay'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      QA
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-white">QPay / TapPay</p>
                      <p className="text-sm text-gray-400">Qatar Payment Gateway</p>
                      <p className="text-xs text-gray-400 mt-1">For Qatar region 🇶🇦</p>
                    </div>
                    {selectedGateway === 'qpay' && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-300">Secure Payment</p>
                    <p className="text-xs text-blue-300 mt-1">
                      Your payment is processed securely through our trusted payment partners. We never store your card details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!selectedGateway) {
                      alert('Please select a payment method');
                      return;
                    }
                    alert(`Redirecting to ${selectedGateway.toUpperCase()} payment page...\n\nThis will be implemented with real payment integration.`);
                  }}
                  disabled={!selectedGateway}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedGateway
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {selectedGateway ? `Pay with ${selectedGateway.toUpperCase()}` : 'Select Payment Method'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
