// src/lib/services/suspensionHandler.ts
// Automatic Service Suspension/Reactivation Handler

import { supabase } from '../supabase';
import { ServiceManager } from './serviceManager';
import type {
  OverdueInvoiceWithService,
  AutoSuspendCheckResult,
} from './types';

// =====================================================
// AUTO-SUSPEND ON OVERDUE INVOICES
// =====================================================

export async function checkAndSuspendOverdueServices(): Promise<AutoSuspendCheckResult> {
  console.log('🔍 [SuspensionHandler] Checking overdue invoices...');

  const result: AutoSuspendCheckResult = {
    checked: 0,
    suspended: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // 1. Get all overdue invoices with linked services
    const { data: overdueInvoices, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        company_services!inner(*),
        companies!inner(id, name, email)
      `)
      .eq('status', 'overdue')
      .eq('auto_suspend_on_overdue', true)
      .not('service_id', 'is', null);

    if (fetchError) {
      console.error('❌ [SuspensionHandler] Fetch error:', fetchError);
      result.errors.push(fetchError.message);
      return result;
    }

    if (!overdueInvoices || overdueInvoices.length === 0) {
      console.log('✅ [SuspensionHandler] No overdue invoices found');
      return result;
    }

    console.log(`📋 [SuspensionHandler] Found ${overdueInvoices.length} overdue invoices`);
    result.checked = overdueInvoices.length;

    // 2. Process each overdue invoice
    for (const invoice of overdueInvoices) {
      const service = invoice.company_services;
      const company = invoice.companies;

      // Skip if service not found
      if (!service || !company) {
        console.log(`⏭️ [SuspensionHandler] Missing data for invoice ${invoice.invoice_number}`);
        result.skipped++;
        continue;
      }

      // Skip if already suspended for this invoice
      if (service.last_suspension_invoice_id === invoice.id) {
        console.log(`⏭️ [SuspensionHandler] Already suspended: ${service.service_name}`);
        result.skipped++;
        continue;
      }

      // Skip if service already suspended (by different invoice or manual)
      if (service.status === 'suspended') {
        console.log(`⏭️ [SuspensionHandler] Already suspended (other reason): ${service.service_name}`);
        result.skipped++;
        continue;
      }

      // 3. Suspend the service
      console.log(`🚫 [SuspensionHandler] Suspending ${service.service_name} for ${company.name}`);

      const suspendResult = await ServiceManager.suspend({
        serviceId: service.id,
        companyId: invoice.company_id,
        reason: `Payment overdue for invoice ${invoice.invoice_number}. Due date: ${invoice.due_date}. Amount: $${invoice.total_amount}`,
        invoiceId: invoice.id,
        suspendedBy: null, // Auto suspension
      });

      if (suspendResult.success) {
        result.suspended++;
        console.log(`✅ [SuspensionHandler] Suspended: ${service.service_name}`);

        // 4. Send notification (you can implement this)
        await sendSuspensionNotification({
          companyName: company.name,
          companyEmail: company.email,
          serviceName: service.service_name,
          reason: `Payment overdue`,
          invoiceNumber: invoice.invoice_number,
          invoiceAmount: invoice.total_amount,
          invoiceDueDate: invoice.due_date,
        });
      } else {
        result.errors.push(`Failed to suspend ${service.service_name}: ${suspendResult.error}`);
      }
    }

    console.log(`✅ [SuspensionHandler] Check complete:`, result);
    return result;

  } catch (error) {
    console.error('❌ [SuspensionHandler] Error:', error);
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return result;
  }
}

// =====================================================
// AUTO-REACTIVATE ON PAYMENT
// =====================================================

export async function reactivateServiceOnPayment(invoiceId: string): Promise<boolean> {
  console.log('💳 [SuspensionHandler] Payment received for invoice:', invoiceId);

  try {
    // 1. Get invoice with service
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        company_services(*),
        companies(id, name, email)
      `)
      .eq('id', invoiceId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Check if invoice has linked service
    if (!invoice.service_id) {
      console.log('⏭️ [SuspensionHandler] No service linked to this invoice');
      return true;
    }

    const service = invoice.company_services;
    const company = invoice.companies;

    if (!service || !company) {
      console.log('⏭️ [SuspensionHandler] Missing service or company data');
      return false;
    }

    // 3. Check if service is suspended because of this invoice
    if (service.status !== 'suspended') {
      console.log(`⏭️ [SuspensionHandler] Service not suspended: ${service.service_name}`);
      return true;
    }

    if (service.last_suspension_invoice_id !== invoiceId) {
      console.log(`⏭️ [SuspensionHandler] Service suspended for different reason`);
      return true;
    }

    // 4. Reactivate service
    console.log(`✅ [SuspensionHandler] Reactivating ${service.service_name}`);

    const reactivateResult = await ServiceManager.reactivate({
      serviceId: service.id,
      companyId: invoice.company_id,
      reason: `Payment received for invoice ${invoice.invoice_number}`,
      reactivatedBy: null, // Auto reactivation
    });

    if (reactivateResult.success) {
      console.log(`✅ [SuspensionHandler] Reactivated: ${service.service_name}`);

      // 5. Send reactivation notification
      await sendReactivationNotification({
        companyName: company.name,
        companyEmail: company.email,
        serviceName: service.service_name,
        reason: 'Payment received',
        invoiceNumber: invoice.invoice_number,
      });

      return true;
    } else {
      console.error(`❌ [SuspensionHandler] Reactivation failed:`, reactivateResult.error);
      return false;
    }

  } catch (error) {
    console.error('❌ [SuspensionHandler] Error:', error);
    return false;
  }
}

// =====================================================
// REACTIVATE ALL SERVICES FOR COMPANY (Admin Action)
// =====================================================

export async function reactivateAllCompanyServices(
  companyId: string,
  reason: string,
  reactivatedBy: string
): Promise<number> {
  console.log('✅ [SuspensionHandler] Reactivating all services for company:', companyId);

  try {
    // Get all suspended services for company
    const { data: services, error: fetchError } = await supabase
      .from('company_services')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'suspended');

    if (fetchError) throw fetchError;

    if (!services || services.length === 0) {
      console.log('⏭️ [SuspensionHandler] No suspended services found');
      return 0;
    }

    // Reactivate each service
    const results = await Promise.all(
      services.map((service) =>
        ServiceManager.reactivate({
          serviceId: service.id,
          companyId,
          reason,
          reactivatedBy,
        })
      )
    );

    const reactivated = results.filter((r) => r.success).length;
    console.log(`✅ [SuspensionHandler] Reactivated ${reactivated}/${services.length} services`);

    return reactivated;

  } catch (error) {
    console.error('❌ [SuspensionHandler] Error:', error);
    return 0;
  }
}

// =====================================================
// NOTIFICATION FUNCTIONS (Placeholders)
// =====================================================

async function sendSuspensionNotification(data: {
  companyName: string;
  companyEmail: string;
  serviceName: string;
  reason: string;
  invoiceNumber?: string;
  invoiceAmount?: number;
  invoiceDueDate?: string;
}): Promise<void> {
  console.log('📧 [SuspensionHandler] Sending suspension notification:', {
    to: data.companyEmail,
    service: data.serviceName,
  });

  // TODO: Implement email notification
  // Example with Resend API:
  /*
  await resend.emails.send({
    from: 'info@allyncai.com',
    to: data.companyEmail,
    subject: `Service Suspended: ${data.serviceName}`,
    html: `
      <h2>Service Suspended</h2>
      <p>Dear ${data.companyName},</p>
      <p>Your <strong>${data.serviceName}</strong> service has been suspended.</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      ${data.invoiceNumber ? `<p><strong>Invoice:</strong> ${data.invoiceNumber}</p>` : ''}
      ${data.invoiceAmount ? `<p><strong>Amount Due:</strong> $${data.invoiceAmount}</p>` : ''}
      <p>Please pay your outstanding invoice to reactivate the service.</p>
    `,
  });
  */
}

async function sendReactivationNotification(data: {
  companyName: string;
  companyEmail: string;
  serviceName: string;
  reason: string;
  invoiceNumber?: string;
}): Promise<void> {
  console.log('📧 [SuspensionHandler] Sending reactivation notification:', {
    to: data.companyEmail,
    service: data.serviceName,
  });

  // TODO: Implement email notification
  // Example with Resend API:
  /*
  await resend.emails.send({
    from: 'info@allyncai.com',
    to: data.companyEmail,
    subject: `Service Reactivated: ${data.serviceName}`,
    html: `
      <h2>Service Reactivated! 🎉</h2>
      <p>Dear ${data.companyName},</p>
      <p>Great news! Your <strong>${data.serviceName}</strong> service is now active again.</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      ${data.invoiceNumber ? `<p>Invoice <strong>${data.invoiceNumber}</strong> has been paid.</p>` : ''}
      <p>You can now use the service normally.</p>
    `,
  });
  */
}

// =====================================================
// EXPORTS
// =====================================================

export const SuspensionHandler = {
  checkAndSuspendOverdue: checkAndSuspendOverdueServices,
  reactivateOnPayment: reactivateServiceOnPayment,
  reactivateAllForCompany: reactivateAllCompanyServices,
};