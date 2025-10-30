import { supabase } from '../supabase';

// =====================================================
// SUPER ADMIN STATISTICS & BADGE COUNTS
// =====================================================

export interface SuperAdminStats {
  // Companies
  newCompaniesCount: number;          // Son 7 günde kayıt olan şirketler
  totalCompaniesCount: number;

  // Service Requests
  websitePendingCount: number;        // Website Development için pending request'ler
  mobileAppPendingCount: number;      // Mobile App Development için pending request'ler
  totalPendingRequestsCount: number;  // Tüm pending request'ler

  // Services
  maintenanceServicesCount: number;   // status='maintenance' olan servisler

  // Support Tickets
  openTicketsCount: number;           // status='open' olan ticketlar
  urgentTicketsCount: number;         // priority='urgent' olan ticketlar

  // Invoices
  unpaidInvoicesCount: number;        // status='unpaid' faturalar
  overdueInvoicesCount: number;       // Vadesi geçmiş faturalar

  // Notifications
  unreadNotificationsCount: number;   // Okunmamış bildirimler

  // Users
  pendingUsersCount: number;          // Onay bekleyen kullanıcılar (varsa)
}

/**
 * Get all statistics for Super Admin dashboard and sidebar badges
 */
export async function getSuperAdminStats(): Promise<SuperAdminStats> {
  console.log('📊 [getSuperAdminStats] Fetching all statistics...');

  try {
    // Parallel fetch for better performance
    const [
      newCompaniesResult,
      totalCompaniesResult,
      serviceRequestsResult,
      servicesResult,
      ticketsResult,
      invoicesResult,
    ] = await Promise.all([
      // New companies (last 7 days)
      supabase
        .from('companies')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

      // Total companies
      supabase
        .from('companies')
        .select('id', { count: 'exact', head: true }),

      // Service requests
      supabase
        .from('service_requests')
        .select('id, service_type_id, status')
        .eq('status', 'pending'),

      // Services in maintenance
      supabase
        .from('service_types')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'maintenance'),

      // Support tickets
      supabase
        .from('support_tickets')
        .select('id, status, priority'),

      // Invoices
      supabase
        .from('invoices')
        .select('id, status, due_date'),
    ]);

    // Get service type IDs for website and mobile app
    const { data: serviceTypes } = await supabase
      .from('service_types')
      .select('id, slug')
      .in('slug', ['website-development', 'mobile-app-development']);

    const websiteServiceId = serviceTypes?.find(s => s.slug === 'website-development')?.id;
    const mobileAppServiceId = serviceTypes?.find(s => s.slug === 'mobile-app-development')?.id;

    // Process service requests
    const serviceRequests = serviceRequestsResult.data || [];
    const websitePendingCount = serviceRequests.filter(r => r.service_type_id === websiteServiceId).length;
    const mobileAppPendingCount = serviceRequests.filter(r => r.service_type_id === mobileAppServiceId).length;

    // Process tickets
    const tickets = ticketsResult.data || [];
    const openTicketsCount = tickets.filter(t => t.status === 'open').length;
    const urgentTicketsCount = tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length;

    // Process invoices
    const invoices = invoicesResult.data || [];
    const unpaidInvoicesCount = invoices.filter(i => i.status === 'unpaid').length;
    const overdueInvoicesCount = invoices.filter(i => {
      if (i.status === 'paid') return false;
      const dueDate = new Date(i.due_date);
      return dueDate < new Date();
    }).length;

    const stats: SuperAdminStats = {
      newCompaniesCount: newCompaniesResult.count || 0,
      totalCompaniesCount: totalCompaniesResult.count || 0,
      websitePendingCount,
      mobileAppPendingCount,
      totalPendingRequestsCount: serviceRequests.length,
      maintenanceServicesCount: servicesResult.count || 0,
      openTicketsCount,
      urgentTicketsCount,
      unpaidInvoicesCount,
      overdueInvoicesCount,
      unreadNotificationsCount: 0, // TODO: Implement when notifications table is ready
      pendingUsersCount: 0, // TODO: Implement if needed
    };

    console.log('✅ [getSuperAdminStats] Stats fetched:', stats);
    return stats;

  } catch (error) {
    console.error('❌ [getSuperAdminStats] Error:', error);

    // Return zero stats on error (don't crash the app)
    return {
      newCompaniesCount: 0,
      totalCompaniesCount: 0,
      websitePendingCount: 0,
      mobileAppPendingCount: 0,
      totalPendingRequestsCount: 0,
      maintenanceServicesCount: 0,
      openTicketsCount: 0,
      urgentTicketsCount: 0,
      unpaidInvoicesCount: 0,
      overdueInvoicesCount: 0,
      unreadNotificationsCount: 0,
      pendingUsersCount: 0,
    };
  }
}

/**
 * Subscribe to real-time changes for automatic badge updates
 */
export function subscribeToStatsChanges(callback: () => void) {
  console.log('🔔 [subscribeToStatsChanges] Setting up realtime listeners...');

  // Subscribe to service_requests changes
  const serviceRequestsChannel = supabase
    .channel('service_requests_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'service_requests' },
      (payload) => {
        console.log('🔔 Service request changed:', payload.eventType);
        callback();
      }
    )
    .subscribe();

  // Subscribe to support_tickets changes
  const supportTicketsChannel = supabase
    .channel('support_tickets_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'support_tickets' },
      (payload) => {
        console.log('🔔 Support ticket changed:', payload.eventType);
        callback();
      }
    )
    .subscribe();

  // Subscribe to companies changes
  const companiesChannel = supabase
    .channel('companies_changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'companies' },
      (payload) => {
        console.log('🔔 New company registered:', payload.new);
        callback();
      }
    )
    .subscribe();

  // Subscribe to invoices changes
  const invoicesChannel = supabase
    .channel('invoices_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'invoices' },
      (payload) => {
        console.log('🔔 Invoice changed:', payload.eventType);
        callback();
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    console.log('🔕 [subscribeToStatsChanges] Cleaning up listeners...');
    supabase.removeChannel(serviceRequestsChannel);
    supabase.removeChannel(supportTicketsChannel);
    supabase.removeChannel(companiesChannel);
    supabase.removeChannel(invoicesChannel);
  };
}

export default {
  getSuperAdminStats,
  subscribeToStatsChanges,
};
