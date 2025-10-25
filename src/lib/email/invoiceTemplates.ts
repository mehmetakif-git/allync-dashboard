// src/lib/email/invoiceTemplates.ts
// Invoice Email/PDF Templates for Allync AI
// Supports both Email and PDF generation with bilingual (EN/TR) support

import { EMAIL_CONFIG } from './emailTemplates';

// =====================================================
// INTERFACES
// =====================================================

export interface InvoiceTemplateData {
  // Invoice Info
  invoiceNumber: string;
  issueDate: string;
  dueDate: string | null;
  paidDate: string | null;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  
  // Company Info (Bill To)
  companyName: string;
  companyEmail: string;
  companyAddress: string | null;
  companyCity: string | null;
  companyPostalCode: string | null;
  companyCountry: string;
  companyTaxId: string | null;
  companyPhone: string | null;
  
  // Amounts
  subtotal: number;
  taxRate: number | null;
  taxAmount: number | null;
  discountAmount: number | null;
  totalAmount: number;
  // Currency is always USD
  
  // Payment Info
  paymentGateway: string | null;
  gatewayPaymentId: string | null;
  
  // Items (optional for simple invoices)
  items?: InvoiceItem[];
  
  // Notes
  notes: string | null;
  
  // Language
  language?: 'en' | 'tr';
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// =====================================================
// TRANSLATIONS
// =====================================================

const translations = {
  en: {
    invoice: 'INVOICE',
    invoiceNumber: 'Invoice Number',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    paidDate: 'Paid Date',
    status: 'Status',
    billTo: 'Bill To',
    company: 'Company',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    taxId: 'Tax ID',
    description: 'Description',
    quantity: 'Qty',
    unitPrice: 'Unit Price',
    amount: 'Amount',
    subtotal: 'Subtotal',
    tax: 'Tax',
    discount: 'Discount',
    total: 'TOTAL',
    paymentMethod: 'Payment Method',
    paymentId: 'Payment ID',
    notes: 'Notes',
    thankYou: 'Thank you for your business!',
    questions: 'If you have any questions about this invoice, please contact us',
    statuses: {
      paid: 'PAID',
      pending: 'PENDING',
      overdue: 'OVERDUE',
      cancelled: 'CANCELLED',
    },
  },
  tr: {
    invoice: 'FATURA',
    invoiceNumber: 'Fatura No',
    issueDate: 'Düzenlenme Tarihi',
    dueDate: 'Son Ödeme Tarihi',
    paidDate: 'Ödeme Tarihi',
    status: 'Durum',
    billTo: 'Fatura Edilen',
    company: 'Şirket',
    email: 'E-posta',
    phone: 'Telefon',
    address: 'Adres',
    taxId: 'Vergi No',
    description: 'Açıklama',
    quantity: 'Adet',
    unitPrice: 'Birim Fiyat',
    amount: 'Tutar',
    subtotal: 'Ara Toplam',
    tax: 'KDV',
    discount: 'İndirim',
    total: 'TOPLAM',
    paymentMethod: 'Ödeme Yöntemi',
    paymentId: 'Ödeme ID',
    notes: 'Notlar',
    thankYou: 'İşiniz için teşekkür ederiz!',
    questions: 'Bu fatura hakkında sorularınız varsa lütfen bizimle iletişime geçin',
    statuses: {
      paid: 'ÖDENDİ',
      pending: 'BEKLİYOR',
      overdue: 'GECİKMİŞ',
      cancelled: 'İPTAL',
    },
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function formatCurrency(amount: number): string {
  const formatted = amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatted;
}

function formatDate(dateString: string, language: 'en' | 'tr'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case 'paid':
      return { bg: '#d1fae5', text: '#065f46' };
    case 'pending':
      return { bg: '#fef3c7', text: '#92400e' };
    case 'overdue':
      return { bg: '#fee2e2', text: '#991b1b' };
    case 'cancelled':
      return { bg: '#f3f4f6', text: '#4b5563' };
    default:
      return { bg: '#f3f4f6', text: '#4b5563' };
  }
}

function getPaymentGatewayName(gateway: string | null): string {
  if (!gateway) return 'N/A';
  const gateways: Record<string, string> = {
    paytr: 'PayTR',
    stripe: 'Stripe',
    qpay: 'QPay',
    tappay: 'Tappay',
  };
  return gateways[gateway] || gateway;
}

// =====================================================
// MAIN INVOICE TEMPLATE
// =====================================================

export function createInvoiceTemplate(data: InvoiceTemplateData): string {
  const lang = data.language || (data.companyCountry === 'TR' ? 'tr' : 'en');
  const t = translations[lang];
  const statusColor = getStatusColor(data.status);

  // Build items table
  let itemsHtml = '';
  if (data.items && data.items.length > 0) {
    const itemsRows = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">
          ${item.description}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; text-align: right;">
          ${formatCurrency(item.unitPrice)}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 600; text-align: right;">
          ${formatCurrency(item.amount)}
        </td>
      </tr>
    `).join('');

    itemsHtml = `
      <!-- Items Table -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: linear-gradient(135deg, #00d9ff 0%, #00b8e6 100%);">
            <th style="padding: 14px; text-align: left; color: #ffffff; font-weight: 600; font-size: 14px;">
              ${t.description}
            </th>
            <th style="padding: 14px; text-align: center; color: #ffffff; font-weight: 600; font-size: 14px; width: 80px;">
              ${t.quantity}
            </th>
            <th style="padding: 14px; text-align: right; color: #ffffff; font-weight: 600; font-size: 14px; width: 120px;">
              ${t.unitPrice}
            </th>
            <th style="padding: 14px; text-align: right; color: #ffffff; font-weight: 600; font-size: 14px; width: 120px;">
              ${t.amount}
            </th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
    `;
  }

  // Build full address
  const fullAddress = [
    data.companyAddress,
    data.companyCity,
    data.companyPostalCode,
  ].filter(Boolean).join(', ');

  const content = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.invoice} - ${data.invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
  
  <!-- Email Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Main Invoice Card -->
        <table width="700" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header Image -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${EMAIL_CONFIG.logoUrl}" 
                   width="700" 
                   alt="Allync AI - AI-Powered Business Automation" 
                   style="display: block; width: 100%; max-width: 700px; height: auto; border-radius: 16px 16px 0 0;">
            </td>
          </tr>
          
          <!-- Invoice Header -->
          <tr>
            <td style="padding: 40px 50px 20px 50px;">
              
              <!-- INVOICE Title & Status -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" valign="top">
                    <h1 style="margin: 0; font-size: 36px; font-weight: 700; background: linear-gradient(135deg, #00d9ff, #b537f2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                      ${t.invoice}
                    </h1>
                  </td>
                  <td width="50%" valign="top" align="right">
                    <span style="display: inline-block; padding: 10px 20px; background-color: ${statusColor.bg}; color: ${statusColor.text}; font-weight: 700; font-size: 14px; border-radius: 20px; text-transform: uppercase;">
                      ${t.statuses[data.status]}
                    </span>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Invoice Details & Company Info -->
          <tr>
            <td style="padding: 0 50px 30px 50px;">
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Left: Invoice Details -->
                  <td width="50%" valign="top" style="padding-right: 20px;">
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #e8f9ff 0%, #f3e8ff 100%); padding: 20px; border-radius: 12px; border-left: 4px solid #00d9ff;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 500;">
                            ${t.invoiceNumber}
                          </p>
                          <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 700; font-family: monospace;">
                            ${data.invoiceNumber}
                          </p>
                          
                          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px; font-weight: 500;">
                            ${t.issueDate}
                          </p>
                          <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px;">
                            ${formatDate(data.issueDate, lang)}
                          </p>
                          
                          ${data.dueDate ? `
                          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px; font-weight: 500;">
                            ${t.dueDate}
                          </p>
                          <p style="margin: 0; color: #1f2937; font-size: 14px;">
                            ${formatDate(data.dueDate, lang)}
                          </p>
                          ` : ''}
                          
                          ${data.paidDate ? `
                          <p style="margin: 12px 0 4px 0; color: #6b7280; font-size: 13px; font-weight: 500;">
                            ${t.paidDate}
                          </p>
                          <p style="margin: 0; color: #059669; font-size: 14px; font-weight: 600;">
                            ${formatDate(data.paidDate, lang)}
                          </p>
                          ` : ''}
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                  
                  <!-- Right: Bill To -->
                  <td width="50%" valign="top" style="padding-left: 20px;">
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px; border-radius: 12px; border: 2px solid #e5e7eb;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            ${t.billTo}
                          </p>
                          
                          <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; font-weight: 700;">
                            ${data.companyName}
                          </p>
                          
                          <p style="margin: 0 0 6px 0; color: #4b5563; font-size: 14px;">
                            📧 ${data.companyEmail}
                          </p>
                          
                          ${data.companyPhone ? `
                          <p style="margin: 0 0 6px 0; color: #4b5563; font-size: 14px;">
                            📱 ${data.companyPhone}
                          </p>
                          ` : ''}
                          
                          ${fullAddress ? `
                          <p style="margin: 0 0 6px 0; color: #4b5563; font-size: 14px;">
                            📍 ${fullAddress}
                          </p>
                          ` : ''}
                          
                          ${data.companyTaxId ? `
                          <p style="margin: 0; color: #4b5563; font-size: 14px;">
                            ${t.taxId}: <strong>${data.companyTaxId}</strong>
                          </p>
                          ` : ''}
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Items Section -->
          ${itemsHtml ? `
          <tr>
            <td style="padding: 0 50px;">
              ${itemsHtml}
            </td>
          </tr>
          ` : ''}
          
          <!-- Amount Breakdown -->
          <tr>
            <td style="padding: 20px 50px;">
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="60%"></td>
                  <td width="40%">
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px; border-radius: 12px; border: 2px solid #e5e7eb;">
                      
                      <!-- Subtotal -->
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">
                          ${t.subtotal}
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 15px; font-weight: 600; text-align: right;">
                          ${formatCurrency(data.subtotal)}
                        </td>
                      </tr>
                      
                      <!-- Tax -->
                      ${data.taxRate && data.taxAmount ? `
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">
                          ${t.tax} (${data.taxRate}%)
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 15px; font-weight: 600; text-align: right;">
                          ${formatCurrency(data.taxAmount)}
                        </td>
                      </tr>
                      ` : ''}
                      
                      <!-- Discount -->
                      ${data.discountAmount && data.discountAmount > 0 ? `
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">
                          ${t.discount}
                        </td>
                        <td style="padding: 8px 0; color: #059669; font-size: 15px; font-weight: 600; text-align: right;">
                          -${formatCurrency(data.discountAmount)}
                        </td>
                      </tr>
                      ` : ''}
                      
                      <!-- Divider -->
                      <tr>
                        <td colspan="2" style="padding: 12px 0;">
                          <div style="border-top: 2px solid #00d9ff;"></div>
                        </td>
                      </tr>
                      
                      <!-- Total -->
                      <tr>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: 700;">
                          ${t.total}
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 24px; font-weight: 700; text-align: right; background: linear-gradient(135deg, #00d9ff, #b537f2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                          ${formatCurrency(data.totalAmount)}
                        </td>
                      </tr>
                      
                    </table>
                    
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Payment Information (if paid) -->
          ${data.status === 'paid' && data.paymentGateway ? `
          <tr>
            <td style="padding: 20px 50px;">
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 20px; border-radius: 12px; border-left: 4px solid #10b981;">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px 0; color: #065f46; font-size: 16px; font-weight: 700;">
                      ✅ ${t.statuses.paid}
                    </p>
                    <p style="margin: 0 0 6px 0; color: #065f46; font-size: 14px;">
                      <strong>${t.paymentMethod}:</strong> ${getPaymentGatewayName(data.paymentGateway)}
                    </p>
                    ${data.gatewayPaymentId ? `
                    <p style="margin: 0; color: #065f46; font-size: 14px;">
                      <strong>${t.paymentId}:</strong> ${data.gatewayPaymentId}
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          ` : ''}
          
          <!-- Notes -->
          ${data.notes ? `
          <tr>
            <td style="padding: 20px 50px;">
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 700;">
                      📝 ${t.notes}
                    </p>
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                      ${data.notes}
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          ` : ''}
          
          <!-- Thank You Message -->
          <tr>
            <td style="padding: 30px 50px;">
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #1f2937;">
                      ${t.thankYou}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                      ${t.questions}
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer / Signature -->
          <tr>
            <td style="background-color: #fafafa; padding: 40px 50px; text-align: center; border-top: 1px solid #e5e5e5;">
              
              <!-- Closing -->
              <p style="margin: 0 0 8px 0; font-size: 16px; color: #666666;">
                ${lang === 'tr' ? 'Saygılarımızla,' : 'Best regards,'}
              </p>
              <p style="margin: 0 0 25px 0; font-size: 22px; font-weight: 700; background: linear-gradient(135deg, #00d9ff, #b537f2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Allync AI Team
              </p>
              
              <!-- Contact Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                <tr>
                  <td style="background-color: #ffffff; padding: 25px; border-radius: 12px; border: 2px solid #00d9ff; box-shadow: 0 2px 8px rgba(0, 217, 255, 0.15);">
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <!-- Left Column -->
                        <td width="50%" valign="top" style="padding-right: 15px;">
                          
                          <p style="margin: 0 0 15px 0; font-size: 14px; color: #4a4a4a;">
                            <span style="font-size: 16px; margin-right: 6px;">📧</span>
                            <a href="mailto:${EMAIL_CONFIG.supportEmail}" style="color: #00d9ff; text-decoration: none; font-weight: 500;">
                              ${EMAIL_CONFIG.supportEmail}
                            </a>
                          </p>
                          
                          <p style="margin: 0 0 15px 0; font-size: 14px; color: #4a4a4a;">
                            <span style="font-size: 16px; margin-right: 6px;">🌐</span>
                            <a href="${EMAIL_CONFIG.websiteUrl}" style="color: #00d9ff; text-decoration: none; font-weight: 500;">
                              allyncai.com
                            </a>
                          </p>
                          
                          <p style="margin: 0; font-size: 14px; color: #4a4a4a;">
                            <span style="font-size: 16px; margin-right: 6px;">🌐</span>
                            <a href="${EMAIL_CONFIG.websiteUrlTR}" style="color: #00d9ff; text-decoration: none; font-weight: 500;">
                              allyncai.com.tr
                            </a>
                          </p>
                          
                        </td>
                        
                        <!-- Right Column -->
                        <td width="50%" valign="top" style="padding-left: 15px; border-left: 1px solid #e5e7eb;">
                          
                          <p style="margin: 0 0 15px 0; font-size: 14px; color: #4a4a4a;">
                            <span style="font-size: 16px; margin-right: 6px;">🇹🇷</span>
                            <a href="tel:${EMAIL_CONFIG.phoneTR.replace(/\s/g, '')}" style="color: #00d9ff; text-decoration: none; font-weight: 500;">
                              ${EMAIL_CONFIG.phoneTR}
                            </a>
                          </p>
                          
                          <p style="margin: 0; font-size: 14px; color: #4a4a4a;">
                            <span style="font-size: 16px; margin-right: 6px;">🇶🇦</span>
                            <a href="tel:${EMAIL_CONFIG.phoneQA.replace(/\s/g, '')}" style="color: #00d9ff; text-decoration: none; font-weight: 500;">
                              ${EMAIL_CONFIG.phoneQA}
                            </a>
                          </p>
                          
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
              <!-- Copyright -->
              <p style="margin: 25px 0 0 0; color: #999999; font-size: 13px;">
                © 2025 Allync AI. All rights reserved.
              </p>
              
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `;

  return content;
}

// =====================================================
// EXPORT
// =====================================================

export const invoiceEmailTemplates = {
  create: createInvoiceTemplate,
};