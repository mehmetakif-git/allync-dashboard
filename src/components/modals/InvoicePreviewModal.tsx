import { X, Download, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createInvoiceTemplate, InvoiceTemplateData } from '../../lib/email/invoiceTemplates';
import { Invoice } from '../../lib/api/invoices';

interface InvoicePreviewModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export default function InvoicePreviewModal({ invoice, onClose }: InvoicePreviewModalProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('📄 [InvoicePreviewModal] Generating preview for:', invoice.invoice_number);
    generatePreview();
  }, [invoice]);

  const generatePreview = () => {
    try {
      // Transform Invoice to InvoiceTemplateData
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
        
        // Auto-detect language
        language: invoice.company?.country === 'TR' ? 'tr' : 'en',
      };

      const html = createInvoiceTemplate(templateData);
      setHtmlContent(html);
      console.log('✅ [InvoicePreviewModal] Preview generated');
    } catch (error) {
      console.error('❌ [InvoicePreviewModal] Error generating preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInNewTab = () => {
    console.log('🔗 [InvoicePreviewModal] Opening in new tab');
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  const handlePrint = () => {
    console.log('🖨️ [InvoicePreviewModal] Opening print dialog');
    const iframe = document.getElementById('invoice-preview-iframe') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-primary border-2 border-accent-blue/20 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary">
          <div>
            <h2 className="text-2xl font-bold text-white">Invoice Preview</h2>
            <p className="text-sm text-muted mt-1">{invoice.invoice_number}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-hover rounded-lg transition-colors group"
              title="Print"
            >
              <Download className="w-5 h-5 text-muted group-hover:text-white" />
            </button>
            
            <button
              onClick={handleOpenInNewTab}
              className="p-2 hover:bg-hover rounded-lg transition-colors group"
              title="Open in New Tab"
            >
              <ExternalLink className="w-5 h-5 text-muted group-hover:text-white" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-hover rounded-lg transition-colors group"
              title="Close"
            >
              <X className="w-6 h-6 text-muted group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted">Generating preview...</p>
              </div>
            </div>
          ) : (
            <iframe
              id="invoice-preview-iframe"
              srcDoc={htmlContent}
              className="w-full h-full border-none"
              title="Invoice Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}