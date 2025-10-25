import { supabase } from '../supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface Invoice {
  id: string;
  company_id: string;
  invoice_number: string; // INV-2025-001
  
  // Amounts
  subtotal: number;
  tax_rate: number | null;
  tax_amount: number | null;
  discount_amount: number | null;
  total_amount: number;
  currency: string; // USD, TRY, QAR
  
  // Status & Dates
  status: 'pending' | 'paid' | 'cancelled' | 'overdue';
  issue_date: string;
  due_date: string;
  paid_at: string | null;
  
  // Payment Gateway
  payment_gateway: string | null; // paytr, stripe, qpay, tappay
  gateway_customer_id: string | null;
  gateway_payment_id: string | null;
  
  // PDF & Notes
  pdf_url: string | null;
  notes: string | null;
  internal_notes: string | null;
  metadata: any;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relations (when joined)
  company?: {
    id: string;
    name: string;
    email: string;
    country: string;
    payment_gateway: string;
    tax_id: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
  };
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  service_type: string | null;
  metadata: any;
}

export interface InvoiceStats {
  total_invoices: number;
  total_revenue: number;
  pending_amount: number;
  paid_amount: number;
  overdue_count: number;
  currency: string;
}

// =====================================================
// PAYMENT GATEWAY HELPER
// =====================================================

export async function getPaymentGatewayForCompany(companyId: string): Promise<string> {
  const { data, error } = await supabase
    .from('companies')
    .select('payment_gateway, country')
    .eq('id', companyId)
    .single();

  if (error || !data) {
    throw new Error('Company not found');
  }

  return data.payment_gateway || (data.country === 'TR' ? 'paytr' : data.country === 'QA' ? 'qpay' : 'stripe');
}

export function getCurrencyByCountry(country: string): string {
  switch (country) {
    case 'TR': return 'TRY';
    case 'QA': return 'QAR';
    default: return 'USD';
  }
}

// =====================================================
// CRUD OPERATIONS
// =====================================================

// Get all invoices (Super Admin)
export async function getAllInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      company:companies(
        id,
        name,
        email,
        country,
        payment_gateway,
        tax_id,
        address,
        city,
        postal_code
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all invoices:', error);
    throw error;
  }

  return data;
}

// Get invoices by company (Company Admin)
export async function getInvoicesByCompany(companyId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      company:companies(
        id,
        name,
        email,
        country,
        payment_gateway
      )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching company invoices:', error);
    throw error;
  }

  return data;
}

// Get invoice by ID
export async function getInvoiceById(invoiceId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      company:companies(
        id,
        name,
        email,
        country,
        payment_gateway,
        tax_id,
        address,
        city,
        postal_code,
        phone,
        website
      )
    `)
    .eq('id', invoiceId)
    .single();

  if (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }

  return data;
}

// Create invoice
export async function createInvoice(invoiceData: {
  company_id: string;
  subtotal: number;
  tax_rate?: number;
  discount_amount?: number;
  currency?: string;
  due_date?: string;
  notes?: string;
  internal_notes?: string;
  metadata?: any;
}) {
  // Get company info for payment gateway
  const gateway = await getPaymentGatewayForCompany(invoiceData.company_id);
  
  // Calculate amounts
  const taxAmount = invoiceData.tax_rate ? invoiceData.subtotal * (invoiceData.tax_rate / 100) : 0;
  const totalAmount = invoiceData.subtotal + taxAmount - (invoiceData.discount_amount || 0);
  
  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();
  
  const { data, error } = await supabase
    .from('invoices')
    .insert([{
      company_id: invoiceData.company_id,
      invoice_number: invoiceNumber,
      subtotal: invoiceData.subtotal,
      tax_rate: invoiceData.tax_rate || null,
      tax_amount: taxAmount,
      discount_amount: invoiceData.discount_amount || null,
      total_amount: totalAmount,
      currency: invoiceData.currency || 'USD',
      status: 'pending',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: invoiceData.due_date || null,
      payment_gateway: gateway,
      notes: invoiceData.notes || null,
      internal_notes: invoiceData.internal_notes || null,
      metadata: invoiceData.metadata || {},
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }

  return data as Invoice;
}

// Update invoice
export async function updateInvoice(invoiceId: string, updates: Partial<Invoice>) {
  // Recalculate if amounts changed
  if (updates.subtotal !== undefined || updates.tax_rate !== undefined || updates.discount_amount !== undefined) {
    const { data: current } = await supabase
      .from('invoices')
      .select('subtotal, tax_rate, discount_amount')
      .eq('id', invoiceId)
      .single();
    
    if (current) {
      const subtotal = updates.subtotal ?? current.subtotal;
      const taxRate = updates.tax_rate ?? current.tax_rate ?? 0;
      const discountAmount = updates.discount_amount ?? current.discount_amount ?? 0;
      
      updates.tax_amount = subtotal * (taxRate / 100);
      updates.total_amount = subtotal + updates.tax_amount - discountAmount;
    }
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }

  return data as Invoice;
}

// Delete invoice
export async function deleteInvoice(invoiceId: string) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId);

  if (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
}

// =====================================================
// STATUS OPERATIONS
// =====================================================

// Mark invoice as paid
export async function markInvoiceAsPaid(
  invoiceId: string, 
  paymentData: {
    gateway_payment_id?: string;
    gateway_customer_id?: string;
    paid_at?: string;
  }
) {
  const { data, error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: paymentData.paid_at || new Date().toISOString(),
      gateway_payment_id: paymentData.gateway_payment_id || null,
      gateway_customer_id: paymentData.gateway_customer_id || null,
    })
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    console.error('Error marking invoice as paid:', error);
    throw error;
  }

  return data as Invoice;
}

// Cancel invoice
export async function cancelInvoice(invoiceId: string, reason?: string) {
  const { data, error } = await supabase
    .from('invoices')
    .update({
      status: 'cancelled',
      metadata: {
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      }
    })
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    console.error('Error cancelling invoice:', error);
    throw error;
  }

  return data as Invoice;
}

// Update overdue status (run this periodically)
export async function updateOverdueInvoices() {
  const today = new Date().toISOString().split('T')[0];
  
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'overdue' })
    .eq('status', 'pending')
    .lt('due_date', today);

  if (error) {
    console.error('Error updating overdue invoices:', error);
    throw error;
  }
}

// =====================================================
// STATISTICS
// =====================================================

// Get invoice stats for all companies (Super Admin)
export async function getAllInvoiceStats(): Promise<InvoiceStats[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('company_id, status, total_amount, currency');

  if (error) {
    console.error('Error fetching invoice stats:', error);
    throw error;
  }

  // Group by company
  const statsByCompany = data.reduce((acc: any, invoice: any) => {
    const key = `${invoice.company_id}_${invoice.currency}`;
    if (!acc[key]) {
      acc[key] = {
        total_invoices: 0,
        total_revenue: 0,
        pending_amount: 0,
        paid_amount: 0,
        overdue_count: 0,
        currency: invoice.currency,
      };
    }
    
    acc[key].total_invoices++;
    acc[key].total_revenue += invoice.total_amount;
    
    if (invoice.status === 'paid') {
      acc[key].paid_amount += invoice.total_amount;
    } else if (invoice.status === 'pending') {
      acc[key].pending_amount += invoice.total_amount;
    } else if (invoice.status === 'overdue') {
      acc[key].overdue_count++;
      acc[key].pending_amount += invoice.total_amount;
    }
    
    return acc;
  }, {});

  return Object.values(statsByCompany);
}

// Get invoice stats for specific company
export async function getCompanyInvoiceStats(companyId: string): Promise<InvoiceStats> {
  const { data, error } = await supabase
    .from('invoices')
    .select('status, total_amount, currency')
    .eq('company_id', companyId);

  if (error) {
    console.error('Error fetching company invoice stats:', error);
    throw error;
  }

  const stats: InvoiceStats = {
    total_invoices: data.length,
    total_revenue: 0,
    pending_amount: 0,
    paid_amount: 0,
    overdue_count: 0,
    currency: data[0]?.currency || 'USD',
  };

  data.forEach((invoice: any) => {
    stats.total_revenue += invoice.total_amount;
    
    if (invoice.status === 'paid') {
      stats.paid_amount += invoice.total_amount;
    } else if (invoice.status === 'pending') {
      stats.pending_amount += invoice.total_amount;
    } else if (invoice.status === 'overdue') {
      stats.overdue_count++;
      stats.pending_amount += invoice.total_amount;
    }
  });

  return stats;
}

// =====================================================
// INVOICE ITEMS
// =====================================================

// Get items for an invoice
export async function getInvoiceItems(invoiceId: string) {
  const { data, error } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching invoice items:', error);
    throw error;
  }

  return data as InvoiceItem[];
}

// Add item to invoice
export async function addInvoiceItem(itemData: Omit<InvoiceItem, 'id'>) {
  const { data, error } = await supabase
    .from('invoice_items')
    .insert([itemData])
    .select()
    .single();

  if (error) {
    console.error('Error adding invoice item:', error);
    throw error;
  }

  return data as InvoiceItem;
}

// =====================================================
// HELPERS
// =====================================================

// Generate invoice number
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .like('invoice_number', `INV-${year}-%`);

  const nextNumber = (count || 0) + 1;
  return `INV-${year}-${String(nextNumber).padStart(4, '0')}`;
}

// Format currency (always USD)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Get invoice status color
export function getInvoiceStatusColor(status: string): string {
  switch (status) {
    case 'paid': return 'bg-green-500/10 text-green-500 border-green-500/30';
    case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
    case 'overdue': return 'bg-red-500/10 text-red-500 border-red-500/30';
    case 'cancelled': return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
  }
}

// Get payment gateway name
export function getPaymentGatewayName(gateway: string): string {
  switch (gateway) {
    case 'paytr': return 'PayTR';
    case 'stripe': return 'Stripe';
    case 'qpay': return 'QPay';
    case 'tappay': return 'Tappay';
    default: return gateway;
  }
}