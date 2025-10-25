// src/lib/cron/cronJobs.ts
// Scheduled Tasks for Service Suspension System

import { SuspensionHandler } from '../services/suspensionHandler';
import { supabase } from '../supabase';

// =====================================================
// DAILY AUTO-SUSPEND CHECK
// =====================================================

export async function runDailyAutoSuspendCheck(): Promise<void> {
  console.log('⏰ [CronJob] Starting daily auto-suspend check...');
  
  const startTime = Date.now();

  try {
    // 1. Check and suspend overdue services
    const result = await SuspensionHandler.checkAndSuspendOverdue();

    // 2. Log the results
    console.log('📊 [CronJob] Auto-suspend check complete:', {
      checked: result.checked,
      suspended: result.suspended,
      skipped: result.skipped,
      errors: result.errors.length,
      duration: `${Date.now() - startTime}ms`,
    });

    // 3. Store metrics (optional)
    await storeCronMetrics({
      job_name: 'auto_suspend_check',
      checked: result.checked,
      suspended: result.suspended,
      skipped: result.skipped,
      errors: result.errors,
      duration_ms: Date.now() - startTime,
    });

    // 4. Send admin notification if there were errors
    if (result.errors.length > 0) {
      await notifyAdminOfErrors({
        jobName: 'auto_suspend_check',
        errors: result.errors,
      });
    }

  } catch (error) {
    console.error('❌ [CronJob] Error in auto-suspend check:', error);
    
    // Notify admins of critical failure
    await notifyAdminOfErrors({
      jobName: 'auto_suspend_check',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    });
  }
}

// =====================================================
// HOURLY INVOICE STATUS UPDATE
// =====================================================

export async function runHourlyInvoiceStatusUpdate(): Promise<void> {
  console.log('⏰ [CronJob] Updating invoice statuses...');

  try {
    const now = new Date().toISOString();

    // 1. Mark pending invoices as overdue if past due date
    const { data: overdueInvoices, error: updateError } = await supabase
      .from('invoices')
      .update({ status: 'overdue' })
      .eq('status', 'pending')
      .lt('due_date', now)
      .select('id, invoice_number, company_id');

    if (updateError) throw updateError;

    if (overdueInvoices && overdueInvoices.length > 0) {
      console.log(`📋 [CronJob] Marked ${overdueInvoices.length} invoices as overdue`);

      // Send notifications to companies with newly overdue invoices
      for (const invoice of overdueInvoices) {
        await sendOverdueNotification(invoice.id);
      }
    }

    console.log('✅ [CronJob] Invoice status update complete');

  } catch (error) {
    console.error('❌ [CronJob] Error updating invoice statuses:', error);
  }
}

// =====================================================
// WEEKLY SUSPENDED SERVICES REPORT
// =====================================================

export async function runWeeklySuspendedServicesReport(): Promise<void> {
  console.log('⏰ [CronJob] Generating weekly suspended services report...');

  try {
    // 1. Get all currently suspended services
    const { data: suspendedServices, error: fetchError } = await supabase
      .from('company_services')
      .select(`
        *,
        companies(id, name, email),
        service_suspension_history!inner(
          suspended_at,
          suspension_reason,
          invoice_id
        )
      `)
      .eq('status', 'suspended')
      .eq('service_suspension_history.is_active', true);

    if (fetchError) throw fetchError;

    if (!suspendedServices || suspendedServices.length === 0) {
      console.log('✅ [CronJob] No suspended services - all clear!');
      return;
    }

    console.log(`📊 [CronJob] Found ${suspendedServices.length} suspended services`);

    // 2. Group by company
    const companiesWithSuspensions = new Map<string, any[]>();
    
    suspendedServices.forEach((service) => {
      const companyId = service.companies.id;
      if (!companiesWithSuspensions.has(companyId)) {
        companiesWithSuspensions.set(companyId, []);
      }
      companiesWithSuspensions.get(companyId)!.push(service);
    });

    // 3. Send report to super admins
    await sendSuspendedServicesReport({
      totalSuspended: suspendedServices.length,
      affectedCompanies: companiesWithSuspensions.size,
      servicesByCompany: Array.from(companiesWithSuspensions.entries()).map(
        ([companyId, services]) => ({
          companyId,
          companyName: services[0].companies.name,
          services: services.map((s) => ({
            name: s.service_name,
            suspendedAt: s.service_suspension_history.suspended_at,
            reason: s.service_suspension_history.suspension_reason,
          })),
        })
      ),
    });

    console.log('✅ [CronJob] Weekly report sent');

  } catch (error) {
    console.error('❌ [CronJob] Error generating report:', error);
  }
}

// =====================================================
// MONTHLY CLEANUP (Close Old Suspension Records)
// =====================================================

export async function runMonthlyCleanup(): Promise<void> {
  console.log('⏰ [CronJob] Running monthly cleanup...');

  try {
    // Close suspension records that have been inactive for 6+ months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { count, error } = await supabase
      .from('service_suspension_history')
      .delete()
      .eq('is_active', false)
      .lt('reactivated_at', sixMonthsAgo.toISOString());

    if (error) throw error;

    console.log(`🗑️ [CronJob] Cleaned up ${count || 0} old suspension records`);

  } catch (error) {
    console.error('❌ [CronJob] Cleanup error:', error);
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function storeCronMetrics(metrics: {
  job_name: string;
  checked: number;
  suspended: number;
  skipped: number;
  errors: string[];
  duration_ms: number;
}): Promise<void> {
  // Store in a metrics table (create if needed)
  try {
    await supabase.from('cron_job_metrics').insert({
      job_name: metrics.job_name,
      checked_count: metrics.checked,
      suspended_count: metrics.suspended,
      skipped_count: metrics.skipped,
      error_count: metrics.errors.length,
      errors: metrics.errors,
      duration_ms: metrics.duration_ms,
      executed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('⚠️ [CronJob] Could not store metrics:', error);
  }
}

async function notifyAdminOfErrors(data: {
  jobName: string;
  errors: string[];
}): Promise<void> {
  console.log('📧 [CronJob] Notifying admins of errors');

  // TODO: Implement admin notification
  // Get super admins and send email
  /*
  const { data: superAdmins } = await supabase
    .from('profiles')
    .select('email')
    .eq('role', 'super_admin');

  for (const admin of superAdmins || []) {
    await resend.emails.send({
      from: 'alerts@allyncai.com',
      to: admin.email,
      subject: `Cron Job Error: ${data.jobName}`,
      html: `
        <h2>Cron Job Error Alert</h2>
        <p><strong>Job:</strong> ${data.jobName}</p>
        <p><strong>Errors:</strong></p>
        <ul>
          ${data.errors.map(e => `<li>${e}</li>`).join('')}
        </ul>
      `,
    });
  }
  */
}

async function sendOverdueNotification(invoiceId: string): Promise<void> {
  // TODO: Implement overdue notification
  console.log('📧 [CronJob] Sending overdue notification for:', invoiceId);
}

async function sendSuspendedServicesReport(data: {
  totalSuspended: number;
  affectedCompanies: number;
  servicesByCompany: any[];
}): Promise<void> {
  // TODO: Implement weekly report email to super admins
  console.log('📧 [CronJob] Sending weekly suspended services report:', data);
}

// =====================================================
// CRON SCHEDULE SETUP (Node-cron Example)
// =====================================================

export function setupCronJobs() {
  const cron = require('node-cron');

  // Every day at 2 AM - Auto-suspend check
  cron.schedule('0 2 * * *', async () => {
    await runDailyAutoSuspendCheck();
  });

  // Every hour - Invoice status update
  cron.schedule('0 * * * *', async () => {
    await runHourlyInvoiceStatusUpdate();
  });

  // Every Monday at 9 AM - Weekly report
  cron.schedule('0 9 * * 1', async () => {
    await runWeeklySuspendedServicesReport();
  });

  // First day of month at 3 AM - Cleanup
  cron.schedule('0 3 1 * *', async () => {
    await runMonthlyCleanup();
  });

  console.log('✅ [CronJob] Cron jobs scheduled');
}

// =====================================================
// MANUAL TRIGGER (For Testing)
// =====================================================

export async function triggerManualCheck(): Promise<void> {
  console.log('🔧 [CronJob] Manual trigger requested');
  await runDailyAutoSuspendCheck();
}

// =====================================================
// EXPORTS
// =====================================================

export const CronJobs = {
  daily: runDailyAutoSuspendCheck,
  hourly: runHourlyInvoiceStatusUpdate,
  weekly: runWeeklySuspendedServicesReport,
  monthly: runMonthlyCleanup,
  setup: setupCronJobs,
  manualTrigger: triggerManualCheck,
};