// src/lib/services/serviceManager.ts
// Main Service Management Module

import { supabase } from '../supabase';
import type {
  ServiceStatus,
  SuspendServiceParams,
  ReactivateServiceParams,
  ServiceControlResult,
  ServiceSuspensionHistory,
  ServiceWithSuspensionInfo,
} from './types';

// =====================================================
// SERVICE SUSPENSION
// =====================================================

export async function suspendService(
  params: SuspendServiceParams
): Promise<ServiceControlResult> {
  console.log('🔒 [ServiceManager] Suspending service:', params);

  try {
    // 1. Get current service status
    const { data: service, error: fetchError } = await supabase
      .from('company_services')
      .select('*')
      .eq('id', params.serviceId)
      .single();

    if (fetchError) throw fetchError;
    if (!service) throw new Error('Service not found');

    const previousStatus = service.status as ServiceStatus;

    // 2. Don't suspend if already suspended
    if (previousStatus === 'suspended') {
      console.log('⏭️ [ServiceManager] Already suspended');
      return {
        success: true,
        serviceId: params.serviceId,
        previousStatus,
        newStatus: 'suspended',
      };
    }

    // 3. Update service status
    const { error: updateError } = await supabase
      .from('company_services')
      .update({
        status: 'suspended',
        suspended_at: new Date().toISOString(),
        suspension_reason: params.reason,
        last_suspension_invoice_id: params.invoiceId || null,
      })
      .eq('id', params.serviceId);

    if (updateError) throw updateError;

    // 4. Deactivate any previous active suspension
    await supabase
      .from('service_suspension_history')
      .update({ is_active: false })
      .eq('service_id', params.serviceId)
      .eq('is_active', true);

    // 5. Create suspension history record
    const { data: historyRecord, error: historyError } = await supabase
      .from('service_suspension_history')
      .insert({
        company_id: params.companyId,
        service_id: params.serviceId,
        suspended_by: params.suspendedBy || null,
        suspension_reason: params.reason,
        invoice_id: params.invoiceId || null,
        is_active: true,
      })
      .select()
      .single();

    if (historyError) throw historyError;

    console.log('✅ [ServiceManager] Service suspended successfully');

    return {
      success: true,
      serviceId: params.serviceId,
      previousStatus,
      newStatus: 'suspended',
      historyId: historyRecord?.id,
    };
  } catch (error) {
    console.error('❌ [ServiceManager] Suspension error:', error);
    return {
      success: false,
      serviceId: params.serviceId,
      previousStatus: 'active',
      newStatus: 'suspended',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// SERVICE REACTIVATION
// =====================================================

export async function reactivateService(
  params: ReactivateServiceParams
): Promise<ServiceControlResult> {
  console.log('✅ [ServiceManager] Reactivating service:', params);

  try {
    // 1. Get current service status
    const { data: service, error: fetchError } = await supabase
      .from('company_services')
      .select('*')
      .eq('id', params.serviceId)
      .single();

    if (fetchError) throw fetchError;
    if (!service) throw new Error('Service not found');

    const previousStatus = service.status as ServiceStatus;

    // 2. Don't reactivate if not suspended
    if (previousStatus !== 'suspended') {
      console.log('⏭️ [ServiceManager] Not suspended, skipping');
      return {
        success: true,
        serviceId: params.serviceId,
        previousStatus,
        newStatus: previousStatus,
      };
    }

    // 3. Update service status
    const { error: updateError } = await supabase
      .from('company_services')
      .update({
        status: 'active',
        suspended_at: null,
        suspension_reason: null,
        last_suspension_invoice_id: null,
        reactivated_at: new Date().toISOString(),
      })
      .eq('id', params.serviceId);

    if (updateError) throw updateError;

    // 4. Update active suspension history
    const { data: activeSuspension, error: getHistoryError } = await supabase
      .from('service_suspension_history')
      .select('*')
      .eq('service_id', params.serviceId)
      .eq('is_active', true)
      .maybeSingle();

    if (getHistoryError) throw getHistoryError;

    if (activeSuspension) {
      const { error: historyError } = await supabase
        .from('service_suspension_history')
        .update({
          reactivated_at: new Date().toISOString(),
          reactivated_by: params.reactivatedBy || null,
          reactivation_reason: params.reason,
          is_active: false,
        })
        .eq('id', activeSuspension.id);

      if (historyError) throw historyError;
    }

    console.log('✅ [ServiceManager] Service reactivated successfully');

    return {
      success: true,
      serviceId: params.serviceId,
      previousStatus,
      newStatus: 'active',
      historyId: activeSuspension?.id,
    };
  } catch (error) {
    console.error('❌ [ServiceManager] Reactivation error:', error);
    return {
      success: false,
      serviceId: params.serviceId,
      previousStatus: 'suspended',
      newStatus: 'active',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// SERVICE DEACTIVATION (Permanent)
// =====================================================

export async function deactivateService(
  serviceId: string,
  reason: string,
  deactivatedBy: string
): Promise<ServiceControlResult> {
  console.log('🔴 [ServiceManager] Deactivating service:', serviceId);

  try {
    const { data: service, error: fetchError } = await supabase
      .from('company_services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (fetchError) throw fetchError;
    if (!service) throw new Error('Service not found');

    const previousStatus = service.status as ServiceStatus;

    // Update to inactive
    const { error: updateError } = await supabase
      .from('company_services')
      .update({
        status: 'inactive',
        suspended_at: null,
        suspension_reason: null,
        last_suspension_invoice_id: null,
      })
      .eq('id', serviceId);

    if (updateError) throw updateError;

    // Close any active suspension
    await supabase
      .from('service_suspension_history')
      .update({
        reactivated_at: new Date().toISOString(),
        reactivated_by: deactivatedBy,
        reactivation_reason: `Service deactivated: ${reason}`,
        is_active: false,
      })
      .eq('service_id', serviceId)
      .eq('is_active', true);

    console.log('✅ [ServiceManager] Service deactivated');

    return {
      success: true,
      serviceId,
      previousStatus,
      newStatus: 'inactive',
    };
  } catch (error) {
    console.error('❌ [ServiceManager] Deactivation error:', error);
    return {
      success: false,
      serviceId,
      previousStatus: 'active',
      newStatus: 'inactive',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// GET SERVICE WITH SUSPENSION INFO
// =====================================================

export async function getServiceWithSuspensionInfo(
  serviceId: string
): Promise<ServiceWithSuspensionInfo | null> {
  try {
    const { data: service, error: serviceError } = await supabase
      .from('company_services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (serviceError) throw serviceError;

    // Get suspension history
    const { data: history, error: historyError } = await supabase
      .from('service_suspension_history')
      .select('*')
      .eq('service_id', serviceId)
      .order('suspended_at', { ascending: false });

    if (historyError) throw historyError;

    // Get active suspension
    const activeSuspension = history?.find((h) => h.is_active) || null;

    // Get last related invoice
    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      ...service,
      suspension_history: history || [],
      active_suspension: activeSuspension,
      last_invoice: lastInvoice || undefined,
    };
  } catch (error) {
    console.error('❌ [ServiceManager] Error fetching service info:', error);
    return null;
  }
}

// =====================================================
// GET COMPANY SERVICES STATUS
// =====================================================

export async function getCompanyServicesStatus(companyId: string) {
  try {
    // Get all services
    const { data: services, error: servicesError } = await supabase
      .from('company_services')
      .select('*')
      .eq('company_id', companyId);

    if (servicesError) throw servicesError;

    // Count by status
    const statusCounts = {
      total: services?.length || 0,
      active: services?.filter((s) => s.status === 'active').length || 0,
      suspended: services?.filter((s) => s.status === 'suspended').length || 0,
      inactive: services?.filter((s) => s.status === 'inactive').length || 0,
    };

    // Get suspension history
    const { data: suspensions, error: suspensionError } = await supabase
      .from('service_suspension_history')
      .select('*')
      .eq('company_id', companyId)
      .order('suspended_at', { ascending: false });

    if (suspensionError) throw suspensionError;

    // Get overdue invoices
    const { data: overdueInvoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'overdue')
      .not('service_id', 'is', null);

    if (invoicesError) throw invoicesError;

    // Get company info
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single();

    return {
      companyId,
      companyName: company?.name || 'Unknown',
      services: statusCounts,
      suspensions: suspensions || [],
      overdueInvoices: overdueInvoices || [],
    };
  } catch (error) {
    console.error('❌ [ServiceManager] Error fetching company status:', error);
    return null;
  }
}

// =====================================================
// BULK OPERATIONS
// =====================================================

export async function bulkSuspendServices(
  services: SuspendServiceParams[]
): Promise<ServiceControlResult[]> {
  console.log(`🔒 [ServiceManager] Bulk suspending ${services.length} services`);

  const results = await Promise.all(
    services.map((params) => suspendService(params))
  );

  const successful = results.filter((r) => r.success).length;
  console.log(`✅ [ServiceManager] Suspended ${successful}/${services.length} services`);

  return results;
}

export async function bulkReactivateServices(
  services: ReactivateServiceParams[]
): Promise<ServiceControlResult[]> {
  console.log(`✅ [ServiceManager] Bulk reactivating ${services.length} services`);

  const results = await Promise.all(
    services.map((params) => reactivateService(params))
  );

  const successful = results.filter((r) => r.success).length;
  console.log(`✅ [ServiceManager] Reactivated ${successful}/${services.length} services`);

  return results;
}

// =====================================================
// EXPORTS
// =====================================================

export const ServiceManager = {
  suspend: suspendService,
  reactivate: reactivateService,
  deactivate: deactivateService,
  getWithSuspensionInfo: getServiceWithSuspensionInfo,
  getCompanyStatus: getCompanyServicesStatus,
  bulkSuspend: bulkSuspendServices,
  bulkReactivate: bulkReactivateServices,
};