import { useState } from 'react';
import { FileText, Search, Filter, Download, Eye, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  company: string;
  companyEmail: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  services: string[];
  issueDate: string;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    company: 'Tech Innovators Inc',
    companyEmail: 'contact@techinnovators.com',
    amount: 2450,
    status: 'paid',
    dueDate: '2024-03-15',
    paidDate: '2024-03-14',
    services: ['WhatsApp Business AI', 'Instagram DM Automation', 'Text to Video AI'],
    issueDate: '2024-03-01',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    company: 'Global Solutions Ltd',
    companyEmail: 'info@globalsolutions.com',
    amount: 1850,
    status: 'paid',
    dueDate: '2024-03-20',
    paidDate: '2024-03-18',
    services: ['WhatsApp Business AI', 'AI Customer Support'],
    issueDate: '2024-03-05',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    company: 'Digital Marketing Pro',
    companyEmail: 'contact@digitalmarketingpro.com',
    amount: 1620,
    status: 'pending',
    dueDate: '2024-03-25',
    services: ['Instagram DM Automation', 'Social Media Analytics'],
    issueDate: '2024-03-10',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    company: 'E-Commerce Plus',
    companyEmail: 'support@ecommerceplus.com',
    amount: 1540,
    status: 'overdue',
    dueDate: '2024-03-10',
    services: ['WhatsApp Business AI', 'AI Customer Support'],
    issueDate: '2024-02-25',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    company: 'Creative Studios',
    companyEmail: 'hello@creativestudios.com',
    amount: 1320,
    status: 'paid',
    dueDate: '2024-03-18',
    paidDate: '2024-03-17',
    services: ['Text to Video AI', 'Social Media Analytics'],
    issueDate: '2024-03-03',
  },
  {
    id: '6',
    invoiceNumber: 'INV-2024-006',
    company: 'Data Analytics Corp',
    companyEmail: 'info@dataanalytics.com',
    amount: 1180,
    status: 'pending',
    dueDate: '2024-03-28',
    services: ['AI Customer Support', 'Email Marketing Automation'],
    issueDate: '2024-03-13',
  },
];

export default function InvoicesManagement() {
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.companyEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');

  const handleExport = () => {
    if (confirm('Export all invoices to CSV?')) {
      alert('Invoices exported successfully');
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold text-white">Invoices Management</h1>
          <p className="text-gray-400 mt-1">Manage all invoices across all companies</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-2">${totalRevenue.toLocaleString()}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Paid Invoices</p>
              <p className="text-3xl font-bold text-white mt-2">{paidInvoices.length}</p>
              <p className="text-green-400 text-sm mt-1">${paidInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}</p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Invoices</p>
              <p className="text-3xl font-bold text-white mt-2">{pendingInvoices.length}</p>
              <p className="text-yellow-400 text-sm mt-1">${pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Overdue Invoices</p>
              <p className="text-3xl font-bold text-white mt-2">{overdueInvoices.length}</p>
              <p className="text-red-400 text-sm mt-1">${overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by company, invoice number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Invoice #</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Company</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Issue Date</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Due Date</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="py-4 px-4">
                    <p className="text-white font-medium">{invoice.invoiceNumber}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-medium">{invoice.company}</p>
                      <p className="text-gray-400 text-sm">{invoice.companyEmail}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white font-medium">${invoice.amount.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                      invoice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-300 text-sm">{invoice.issueDate}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-300 text-sm">{invoice.dueDate}</p>
                    {invoice.paidDate && (
                      <p className="text-green-400 text-xs mt-1">Paid: {invoice.paidDate}</p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert(`Download invoice ${invoice.invoiceNumber}`)}
                        className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600"
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
      </div>

      {showDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{selectedInvoice.invoiceNumber}</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${
                    selectedInvoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                    selectedInvoice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Amount</p>
                  <p className="text-2xl font-bold text-white mt-1">${selectedInvoice.amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Company</p>
                  <p className="text-white font-medium">{selectedInvoice.company}</p>
                  <p className="text-gray-400 text-sm">{selectedInvoice.companyEmail}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Invoice Number</p>
                  <p className="text-white">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Issue Date</p>
                  <p className="text-white">{selectedInvoice.issueDate}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Due Date</p>
                  <p className="text-white">{selectedInvoice.dueDate}</p>
                </div>
                {selectedInvoice.paidDate && (
                  <div>
                    <p className="text-gray-400 text-sm">Paid Date</p>
                    <p className="text-green-400">{selectedInvoice.paidDate}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-3">Services</p>
                <div className="space-y-2">
                  {selectedInvoice.services.map((service, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-3">
                      <p className="text-white">{service}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => alert(`Download invoice ${selectedInvoice.invoiceNumber}`)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
