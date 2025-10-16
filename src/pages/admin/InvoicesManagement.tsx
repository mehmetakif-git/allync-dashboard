import { useState } from 'react';
import { Search, Filter, Download, Plus, Calendar, DollarSign, CheckCircle, Clock, AlertCircle, Building2, Eye } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  company: string;
  companyId: string;
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
    company: 'Tech Corp',
    companyId: 'c1',
    date: '2024-12-01',
    dueDate: '2024-12-15',
    amount: 2147,
    status: 'pending',
    services: ['WhatsApp Automation - Pro', 'Instagram Automation - Basic'],
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-1246',
    company: 'Digital Solutions Inc',
    companyId: 'c2',
    date: '2024-12-01',
    dueDate: '2024-12-15',
    amount: 1499,
    status: 'paid',
    services: ['Text-to-Video AI - Enterprise'],
    paymentMethod: 'Stripe',
    paidDate: '2024-12-05',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-1245',
    company: 'Innovation Labs',
    companyId: 'c3',
    date: '2024-12-01',
    dueDate: '2024-12-08',
    amount: 3240,
    status: 'overdue',
    services: ['WhatsApp Automation - Enterprise', 'Voice Cloning - Pro'],
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-1198',
    company: 'Tech Corp',
    companyId: 'c1',
    date: '2024-11-01',
    dueDate: '2024-11-15',
    amount: 2147,
    status: 'paid',
    services: ['WhatsApp Automation - Pro', 'Instagram Automation - Basic'],
    paymentMethod: 'PayTR',
    paidDate: '2024-11-12',
  },
];

export default function InvoicesManagement() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredInvoices = mockInvoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
                         inv.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  const handleCreateInvoice = (data: any) => {
    console.log('Creating invoice:', data);
    alert(
      `✅ Invoice Created!\n\n` +
      `Company: ${data.company}\n` +
      `Amount: $${data.amount}\n` +
      `Due Date: ${data.dueDate}\n\n` +
      `The invoice has been sent to the company.`
    );
    setShowCreateModal(false);
  };

  const totalRevenue = mockInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPaid = mockInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = mockInvoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = mockInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Invoice Management</h1>
          <p className="text-gray-400 mt-1">Manage all company invoices and payments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-gray-400">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-gray-400">Paid</p>
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
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-sm text-gray-400">Overdue</p>
          </div>
          <p className="text-3xl font-bold text-white">${totalOverdue.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices or companies..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          {['all', 'paid', 'pending', 'overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filterStatus === status
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900/80 border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Company</th>
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
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{invoice.company}</span>
                  </div>
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
                      className="p-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => alert(`📥 Downloading ${invoice.invoiceNumber}.pdf`)}
                      className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
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
                  <p className="text-sm text-gray-400 mb-1">Company</p>
                  <p className="text-white">{selectedInvoice.company}</p>
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
              <button
                onClick={() => alert(`📥 Downloading ${selectedInvoice.invoiceNumber}.pdf`)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => {
                  if (confirm(`Send invoice ${selectedInvoice.invoiceNumber} to ${selectedInvoice.company}?`)) {
                    alert(`✅ Invoice sent to ${selectedInvoice.company}`);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Send to Company
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Invoice</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateInvoice({
                  company: formData.get('company'),
                  amount: formData.get('amount'),
                  dueDate: formData.get('dueDate'),
                  services: formData.get('services'),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Company</label>
                <select
                  name="company"
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500"
                >
                  <option value="">Select Company</option>
                  <option value="Tech Corp">Tech Corp</option>
                  <option value="Digital Solutions Inc">Digital Solutions Inc</option>
                  <option value="Innovation Labs">Innovation Labs</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Amount ($)</label>
                  <input
                    type="number"
                    name="amount"
                    required
                    placeholder="1499"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Services / Description</label>
                <textarea
                  name="services"
                  required
                  rows={4}
                  placeholder="WhatsApp Automation - Pro Plan ($499/mo)&#10;Instagram Automation - Basic Plan ($149/mo)"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
