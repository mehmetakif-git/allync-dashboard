// src/lib/api/manualInvoice.ts
// Manual Invoice Creation API (Super Admin Only)

import { supabase } from '../supabase';
import type {
  CreateManualInvoiceParams,
  ManualInvoiceResponse,
} from '../services/types';

// =====================================================
// GENERATE INVOICE NUMBER
// =====================================================

async function generateManualInvoiceNumber(): Promise<string> {
  // Get current year and month
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Get count of manual invoices this month
  const startOfMonth = new Date(year, now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('is_manual', true)
    .gte('created_at', startOfMonth)
    .lte('created_at', endOfMonth);

  const sequence = (count || 0) + 1;
  
  return `INV-${year}-${month}-M${String(sequence).padStart(3, '0')}`;
}

// =====================================================
// CREATE MANUAL INVOICE
// =====================================================

export async function createManualInvoice(
  params: CreateManualInvoiceParams
): Promise<ManualInvoiceResponse> {
  console.log('📝 [ManualInvoice] Creating manual invoice:', params);

  try {
    // 1. Validate super admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', params.createdBy)
      .single();

    if (profileError) throw profileError;
    if (profile.role !== 'super_admin') {
      throw new Error('Only super admins can create manual invoices');
    }

    // 2. Validate company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', params.companyId)
      .single();

    if (companyError) throw companyError;
    if (!company) throw new Error('Company not found');

    // 3. Validate service if provided
    if (params.serviceId) {
      const { data: service, error: serviceError } = await supabase
        .from('company_services')
        .select('*')
        .eq('id', params.serviceId)
        .eq('company_id', params.companyId)
        .single();

      if (serviceError) throw serviceError;
      if (!service) throw new Error('Service not found or not owned by company');
    }

    // 4. Generate invoice number
    const invoiceNumber = await generateManualInvoiceNumber();

    // 5. Calculate dates
    const issueDate = new Date().toISOString();
    const dueDate = params.dueDate || 
      new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(); // 15 days default

    // 6. Create invoice
    const { data: invoice, error: createError } = await supabase
      .from('invoices')
      .insert({
        company_id: params.companyId,
        invoice_number: invoiceNumber,
        issue_date: issueDate,
        due_date: dueDate,
        status: 'pending',
        
        // Manual invoice fields
        is_manual: true,
        created_by: params.createdBy,
        service_id: params.serviceId || null,
        custom_description: params.customDescription || null,
        
        // Amounts
        subtotal: params.amount,
        tax_rate: null,
        tax_amount: null,
        discount_amount: null,
        total_amount: params.amount,
        
        // Auto-suspend setting
        auto_suspend_on_overdue: params.autoSuspendOnOverdue ?? true,
        
        // Notes
        notes: params.notes || null,
      })
      .select(`
        *,
        companies(*)
      `)
      .single();

    if (createError) throw createError;

    console.log('✅ [ManualInvoice] Invoice created:', invoice.invoice_number);

    return {
      success: true,
      invoice,
    };

  } catch (error) {
    console.error('❌ [ManualInvoice] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// UPDATE MANUAL INVOICE
// =====================================================

export async function updateManualInvoice(
  invoiceId: string,
  updates: {
    amount?: number;
    description?: string;
    customDescription?: string;
    notes?: string;
    dueDate?: string;
    autoSuspendOnOverdue?: boolean;
  },
  updatedBy: string
): Promise<ManualInvoiceResponse> {
  console.log('📝 [ManualInvoice] Updating invoice:', invoiceId);

  try {
    // 1. Validate super admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', updatedBy)
      .single();

    if (profileError) throw profileError;
    if (profile.role !== 'super_admin') {
      throw new Error('Only super admins can update manual invoices');
    }

    // 2. Check if invoice is manual
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchError) throw fetchError;
    if (!existingInvoice.is_manual) {
      throw new Error('Cannot update non-manual invoice');
    }

    if (existingInvoice.status === 'paid') {
      throw new Error('Cannot update paid invoice');
    }

    // 3. Prepare updates
    const updateData: any = {};

    if (updates.amount !== undefined) {
      updateData.subtotal = updates.amount;
      updateData.total_amount = updates.amount;
    }

    if (updates.customDescription !== undefined) {
      updateData.custom_description = updates.customDescription;
    }

    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }

    if (updates.dueDate !== undefined) {
      updateData.due_date = updates.dueDate;
    }

    if (updates.autoSuspendOnOverdue !== undefined) {
      updateData.auto_suspend_on_overdue = updates.autoSuspendOnOverdue;
    }

    // 4. Update invoice
    const { data: invoice, error: updateError } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)
      .select(`
        *,
        companies(*)
      `)
      .single();

    if (updateError) throw updateError;

    console.log('✅ [ManualInvoice] Invoice updated:', invoice.invoice_number);

    return {
      success: true,
      invoice,
    };

  } catch (error) {
    console.error('❌ [ManualInvoice] Update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// DELETE MANUAL INVOICE (Before Payment)
// =====================================================

export async function deleteManualInvoice(
  invoiceId: string,
  deletedBy: string
): Promise<{ success: boolean; error?: string }> {
  console.log('🗑️ [ManualInvoice] Deleting invoice:', invoiceId);

  try {
    // 1. Validate super admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', deletedBy)
      .single();

    if (profileError) throw profileError;
    if (profile.role !== 'super_admin') {
      throw new Error('Only super admins can delete manual invoices');
    }

    // 2. Check if invoice can be deleted
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchError) throw fetchError;

    if (!existingInvoice.is_manual) {
      throw new Error('Cannot delete non-manual invoice');
    }

    if (existingInvoice.status === 'paid') {
      throw new Error('Cannot delete paid invoice');
    }

    // 3. Delete invoice
    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);

    if (deleteError) throw deleteError;

    console.log('✅ [ManualInvoice] Invoice deleted');

    return { success: true };

  } catch (error) {
    console.error('❌ [ManualInvoice] Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// GET MANUAL INVOICES
// =====================================================

export async function getManualInvoices(filters?: {
  companyId?: string;
  status?: string;
  createdBy?: string;
}) {
  try {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        companies(*),
        company_services(*),
        profiles:created_by(id, full_name, email)
      `)
      .eq('is_manual', true)
      .order('created_at', { ascending: false });

    if (filters?.companyId) {
      query = query.eq('company_id', filters.companyId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.createdBy) {
      query = query.eq('created_by', filters.createdBy);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };

  } catch (error) {
    console.error('❌ [ManualInvoice] Fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// EXPORTS
// =====================================================

export const ManualInvoiceAPI = {
  create: createManualInvoice,
  update: updateManualInvoice,
  delete: deleteManualInvoice,
  getAll: getManualInvoices,
};