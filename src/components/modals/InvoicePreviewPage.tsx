import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getInvoiceById } from '../../lib/api/invoices';
import { createInvoiceTemplate, InvoiceTemplateData } from '../../lib/email/invoiceTemplates';

export default function InvoicePreviewPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoiceId) {
      console.log('📄 [InvoicePreviewPage] Loading invoice:', invoiceId);
      loadAndGenerateInvoice();
    }
  }, [invoiceId]);

  const loadAndGenerateInvoice = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 [InvoicePreviewPage] Fetching invoice data...');
      
      // Fetch invoice
      const invoice = await getInvoiceById(invoiceId!);
      console.log('✅ [InvoicePreviewPage] Invoice loaded:', invoice.invoice_number);

      // Transform to template data
      const templateData: InvoiceTemplateData = {
        invoiceNumber: invoice.invoice_number,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        paidDate: invoice.paid_at,
        status: invoice.status as 'paid' | 'pending' | 'overdue' | 'cancelled',
        
        companyName: invoice.company?.name || 'N/A',
        companyEmail: invoice.company?.email || 'N/A',
        companyAddress: invoice.company?.address || null,
        companyCity: invoice.company?.city || null,
        companyPostalCode: invoice.company?.postal_code || null,
        companyCountry: invoice.company?.country || 'US',
        companyTaxId: invoice.company?.tax_id || null,
        companyPhone: invoice.company?.phone || null,
        
        subtotal: invoice.subtotal,
        taxRate: invoice.tax_rate,
        taxAmount: invoice.tax_amount,
        discountAmount: invoice.discount_amount,
        totalAmount: invoice.total_amount,
        
        paymentGateway: invoice.payment_gateway,
        gatewayPaymentId: invoice.gateway_payment_id,
        
        notes: invoice.notes,
        
        language: invoice.company?.country === 'TR' ? 'tr' : 'en',
      };

      // Generate HTML
      const html = createInvoiceTemplate(templateData);
      setHtmlContent(html);
      console.log('✅ [InvoicePreviewPage] Preview generated');

    } catch (error: any) {
      console.error('❌ [InvoicePreviewPage] Error:', error);
      setError(error.message || 'Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    console.log('🖨️ [InvoicePreviewPage] Printing...');
    window.print();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Error Loading Invoice</h1>
          <p className="text-muted mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-accent-blue text-white rounded-xl font-medium hover:bg-accent-blue/90 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
        }
      `}</style>

      {/* Header (hidden on print) */}
      <div className="no-print sticky top-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-hover text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Download className="w-5 h-5" />
              Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div 
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  );
}