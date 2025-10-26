import { supabase } from '../supabase';
import type {
  ActivityLog,
  CreateActivityLog,
  ActivityLogFilters,
  ActivityLogQueryOptions,
  ActivityStatistics,
  ActivityTimeline,
  TopActiveUser,
  ActivitySummary,
  PaginatedActivityLogs,
  ExportOptions,
} from './activityTypes';

// =====================================================
// CREATE ACTIVITY LOG
// =====================================================

export async function createActivityLog(log: CreateActivityLog): Promise<ActivityLog> {
  console.log('➕ [createActivityLog] Creating activity log');

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        ...log,
        status: log.status || 'success',
        severity_level: log.severity_level || 'info',
        details: log.details || {},
        metadata: log.metadata || {},
        changed_data: log.changed_data || {},
        location_data: log.location_data || {},
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ [createActivityLog] Created successfully');
    return data as ActivityLog;
  } catch (error) {
    console.error('❌ [createActivityLog] Error:', error);
    throw error;
  }
}

// =====================================================
// GET ALL ACTIVITY LOGS (with filters and pagination)
// =====================================================

export async function getActivityLogs(
  options: ActivityLogQueryOptions = {}
): Promise<PaginatedActivityLogs> {
  console.log('📋 [getActivityLogs] Fetching logs with options:', options);

  try {
    const {
      filters = {},
      sort_by = 'created_at',
      sort_order = 'desc',
      limit = 50,
      offset = 0,
      include_user = true,
      include_company = true,
    } = options;

    // Build query
    let query = supabase.from('activity_logs').select('*', { count: 'exact' });

    // Add relations
    if (include_user) {
      query = query.select(`
        *,
        user:profiles!user_id(id, full_name, email, avatar_url, role)
      `);
    }
    if (include_company) {
      query = query.select(`
        *,
        company:companies!company_id(id, name, email, country, status)
      `);
    }

    // Apply filters
    if (filters.company_id) {
      query = query.eq('company_id', filters.company_id);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.action_category) {
      query = query.eq('action_category', filters.action_category);
    }
    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.severity_level) {
      query = query.eq('severity_level', filters.severity_level);
    }
    if (filters.device_type) {
      query = query.eq('device_type', filters.device_type);
    }
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters.has_error) {
      query = query.not('error_message', 'is', null);
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    if (filters.search) {
      query = query.or(
        `action.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    // Apply sorting and pagination
    query = query
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const total = count || 0;
    const pages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;

    console.log(`✅ [getActivityLogs] Found ${total} logs, returning page ${page}`);

    return {
      data: (data as ActivityLog[]) || [],
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    };
  } catch (error) {
    console.error('❌ [getActivityLogs] Error:', error);
    throw error;
  }
}

// =====================================================
// GET ACTIVITY LOG BY ID
// =====================================================

export async function getActivityLogById(id: string): Promise<ActivityLog | null> {
  console.log('🔍 [getActivityLogById] Fetching log:', id);

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles!user_id(id, full_name, email, avatar_url, role),
        company:companies!company_id(id, name, email, country, status)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    console.log('✅ [getActivityLogById] Found:', data ? 'Yes' : 'No');
    return data as ActivityLog | null;
  } catch (error) {
    console.error('❌ [getActivityLogById] Error:', error);
    throw error;
  }
}

// =====================================================
// GET RECENT ACTIVITY LOGS
// =====================================================

export async function getRecentActivityLogs(
  limit: number = 10,
  filters?: ActivityLogFilters
): Promise<ActivityLog[]> {
  console.log('⏱️ [getRecentActivityLogs] Fetching recent logs');

  try {
    let query = supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles!user_id(id, full_name, email, avatar_url, role),
        company:companies!company_id(id, name, email, country, status)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (filters?.company_id) query = query.eq('company_id', filters.company_id);
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.severity_level) query = query.eq('severity_level', filters.severity_level);

    const { data, error } = await query;

    if (error) throw error;

    console.log(`✅ [getRecentActivityLogs] Found ${data?.length || 0} logs`);
    return (data as ActivityLog[]) || [];
  } catch (error) {
    console.error('❌ [getRecentActivityLogs] Error:', error);
    throw error;
  }
}

// =====================================================
// GET USER'S ACTIVITY LOGS
// =====================================================

export async function getUserActivityLogs(
  userId: string,
  limit: number = 50
): Promise<ActivityLog[]> {
  console.log('👤 [getUserActivityLogs] Fetching logs for user:', userId);

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        company:companies!company_id(id, name, email, country, status)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    console.log(`✅ [getUserActivityLogs] Found ${data?.length || 0} logs`);
    return (data as ActivityLog[]) || [];
  } catch (error) {
    console.error('❌ [getUserActivityLogs] Error:', error);
    throw error;
  }
}

// =====================================================
// GET COMPANY'S ACTIVITY LOGS
// =====================================================

export async function getCompanyActivityLogs(
  companyId: string,
  limit: number = 50
): Promise<ActivityLog[]> {
  console.log('🏢 [getCompanyActivityLogs] Fetching logs for company:', companyId);

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles!user_id(id, full_name, email, avatar_url, role)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    console.log(`✅ [getCompanyActivityLogs] Found ${data?.length || 0} logs`);
    return (data as ActivityLog[]) || [];
  } catch (error) {
    console.error('❌ [getCompanyActivityLogs] Error:', error);
    throw error;
  }
}

// =====================================================
// GET ACTIVITY LOGS BY CATEGORY
// =====================================================

export async function getActivityLogsByCategory(
  category: string,
  limit: number = 50
): Promise<ActivityLog[]> {
  console.log('📂 [getActivityLogsByCategory] Fetching logs for category:', category);

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles!user_id(id, full_name, email, avatar_url, role),
        company:companies!company_id(id, name, email, country, status)
      `)
      .eq('action_category', category)
      .order('created_at', { ascending: false})
      .limit(limit);

    if (error) throw error;

    console.log(`✅ [getActivityLogsByCategory] Found ${data?.length || 0} logs`);
    return (data as ActivityLog[]) || [];
  } catch (error) {
    console.error('❌ [getActivityLogsByCategory] Error:', error);
    throw error;
  }
}

// =====================================================
// GET FAILED ACTIVITY LOGS
// =====================================================

export async function getFailedActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
  console.log('❌ [getFailedActivityLogs] Fetching failed logs');

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles!user_id(id, full_name, email, avatar_url, role),
        company:companies!company_id(id, name, email, country, status)
      `)
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    console.log(`✅ [getFailedActivityLogs] Found ${data?.length || 0} logs`);
    return (data as ActivityLog[]) || [];
  } catch (error) {
    console.error('❌ [getFailedActivityLogs] Error:', error);
    throw error;
  }
}

// =====================================================
// GET CRITICAL ACTIVITY LOGS
// =====================================================

export async function getCriticalActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
  console.log('🚨 [getCriticalActivityLogs] Fetching critical logs');

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles!user_id(id, full_name, email, avatar_url, role),
        company:companies!company_id(id, name, email, country, status)
      `)
      .in('severity_level', ['critical', 'error'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    console.log(`✅ [getCriticalActivityLogs] Found ${data?.length || 0} logs`);
    return (data as ActivityLog[]) || [];
  } catch (error) {
    console.error('❌ [getCriticalActivityLogs] Error:', error);
    throw error;
  }
}

// =====================================================
// SEARCH ACTIVITY LOGS
// =====================================================

export async function searchActivityLogs(
  searchTerm: string,
  limit: number = 50
): Promise<ActivityLog[]> {
  console.log('🔍 [searchActivityLogs] Searching for:', searchTerm);

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles!user_id(id, full_name, email, avatar_url, role),
        company:companies!company_id(id, name, email, country, status)
      `)
      .or(
        `action.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,entity_type.ilike.%${searchTerm}%`
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    console.log(`✅ [searchActivityLogs] Found ${data?.length || 0} logs`);
    return (data as ActivityLog[]) || [];
  } catch (error) {
    console.error('❌ [searchActivityLogs] Error:', error);
    throw error;
  }
}

// =====================================================
// GET ACTIVITY STATISTICS
// =====================================================

export async function getActivityStatistics(
  companyId?: string,
  userId?: string,
  startDate?: string,
  endDate?: string
): Promise<ActivityStatistics> {
  console.log('📊 [getActivityStatistics] Fetching statistics');

  try {
    const { data, error } = await supabase.rpc('get_activity_statistics', {
      p_company_id: companyId || null,
      p_user_id: userId || null,
      p_start_date: startDate || null,
      p_end_date: endDate || null,
    });

    if (error) throw error;

    console.log('✅ [getActivityStatistics] Statistics retrieved');
    return data[0] as ActivityStatistics;
  } catch (error) {
    console.error('❌ [getActivityStatistics] Error:', error);
    throw error;
  }
}

// =====================================================
// GET ACTIVITY TIMELINE
// =====================================================

export async function getActivityTimeline(
  companyId?: string,
  hours: number = 24
): Promise<ActivityTimeline[]> {
  console.log('📈 [getActivityTimeline] Fetching timeline for last', hours, 'hours');

  try {
    const { data, error } = await supabase.rpc('get_activity_timeline', {
      p_company_id: companyId || null,
      p_hours: hours,
    });

    if (error) throw error;

    console.log(`✅ [getActivityTimeline] Retrieved ${data?.length || 0} data points`);
    return (data as ActivityTimeline[]) || [];
  } catch (error) {
    console.error('❌ [getActivityTimeline] Error:', error);
    throw error;
  }
}

// =====================================================
// GET TOP ACTIVE USERS
// =====================================================

export async function getTopActiveUsers(
  companyId?: string,
  limit: number = 10,
  days: number = 7
): Promise<TopActiveUser[]> {
  console.log('👥 [getTopActiveUsers] Fetching top users');

  try {
    const { data, error } = await supabase.rpc('get_top_active_users', {
      p_company_id: companyId || null,
      p_limit: limit,
      p_days: days,
    });

    if (error) throw error;

    console.log(`✅ [getTopActiveUsers] Retrieved ${data?.length || 0} users`);
    return (data as TopActiveUser[]) || [];
  } catch (error) {
    console.error('❌ [getTopActiveUsers] Error:', error);
    throw error;
  }
}

// =====================================================
// GET ACTIVITY SUMMARY
// =====================================================

export async function getActivitySummary(
  companyId?: string,
  hours: number = 24
): Promise<ActivitySummary> {
  console.log('📋 [getActivitySummary] Building comprehensive summary');

  try {
    const [stats, timeline, topUsers, recentErrors] = await Promise.all([
      getActivityStatistics(companyId),
      getActivityTimeline(companyId, hours),
      getTopActiveUsers(companyId, 10, 7),
      getFailedActivityLogs(10),
    ]);

    // Get counts by category
    const { data: categoryData } = await supabase
      .from('activity_logs')
      .select('action_category')
      .eq(companyId ? 'company_id' : 'id', companyId || '*');

    const by_category: Record<string, number> = {};
    categoryData?.forEach((log: any) => {
      const cat = log.action_category || 'unknown';
      by_category[cat] = (by_category[cat] || 0) + 1;
    });

    // Get counts by status
    const { data: statusData } = await supabase
      .from('activity_logs')
      .select('status')
      .eq(companyId ? 'company_id' : 'id', companyId || '*');

    const by_status: Record<string, number> = {};
    statusData?.forEach((log: any) => {
      const status = log.status || 'unknown';
      by_status[status] = (by_status[status] || 0) + 1;
    });

    // Get counts by severity
    const { data: severityData } = await supabase
      .from('activity_logs')
      .select('severity_level')
      .eq(companyId ? 'company_id' : 'id', companyId || '*');

    const by_severity: Record<string, number> = {};
    severityData?.forEach((log: any) => {
      const sev = log.severity_level || 'unknown';
      by_severity[sev] = (by_severity[sev] || 0) + 1;
    });

    // Get counts by device
    const { data: deviceData } = await supabase
      .from('activity_logs')
      .select('device_type')
      .eq(companyId ? 'company_id' : 'id', companyId || '*');

    const by_device: Record<string, number> = {};
    deviceData?.forEach((log: any) => {
      const dev = log.device_type || 'unknown';
      by_device[dev] = (by_device[dev] || 0) + 1;
    });

    // Get counts by browser
    const { data: browserData } = await supabase
      .from('activity_logs')
      .select('browser')
      .eq(companyId ? 'company_id' : 'id', companyId || '*');

    const by_browser: Record<string, number> = {};
    browserData?.forEach((log: any) => {
      const browser = log.browser || 'unknown';
      by_browser[browser] = (by_browser[browser] || 0) + 1;
    });

    console.log('✅ [getActivitySummary] Summary built successfully');

    return {
      by_category,
      by_status,
      by_severity,
      by_device,
      by_browser,
      by_hour: timeline,
      top_users: topUsers,
      recent_errors: recentErrors,
    };
  } catch (error) {
    console.error('❌ [getActivitySummary] Error:', error);
    throw error;
  }
}

// =====================================================
// DELETE OLD ACTIVITY LOGS (Cleanup)
// =====================================================

export async function deleteOldActivityLogs(daysToKeep: number = 90): Promise<number> {
  console.log(`🗑️ [deleteOldActivityLogs] Deleting logs older than ${daysToKeep} days`);

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error } = await supabase
      .from('activity_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) throw error;

    const deletedCount = data?.length || 0;
    console.log(`✅ [deleteOldActivityLogs] Deleted ${deletedCount} old logs`);
    return deletedCount;
  } catch (error) {
    console.error('❌ [deleteOldActivityLogs] Error:', error);
    throw error;
  }
}

// =====================================================
// GET ACTIVITY COUNT
// =====================================================

export async function getActivityCount(filters?: ActivityLogFilters): Promise<number> {
  console.log('🔢 [getActivityCount] Counting logs');

  try {
    let query = supabase.from('activity_logs').select('*', { count: 'exact', head: true });

    // Apply filters
    if (filters?.company_id) query = query.eq('company_id', filters.company_id);
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.action_category) query = query.eq('action_category', filters.action_category);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.severity_level) query = query.eq('severity_level', filters.severity_level);
    if (filters?.start_date) query = query.gte('created_at', filters.start_date);
    if (filters?.end_date) query = query.lte('created_at', filters.end_date);

    const { count, error } = await query;

    if (error) throw error;

    console.log(`✅ [getActivityCount] Count: ${count || 0}`);
    return count || 0;
  } catch (error) {
    console.error('❌ [getActivityCount] Error:', error);
    throw error;
  }
}

// =====================================================
// EXPORT ALL
// =====================================================

export default {
  createActivityLog,
  getActivityLogs,
  getActivityLogById,
  getRecentActivityLogs,
  getUserActivityLogs,
  getCompanyActivityLogs,
  getActivityLogsByCategory,
  getFailedActivityLogs,
  getCriticalActivityLogs,
  searchActivityLogs,
  getActivityStatistics,
  getActivityTimeline,
  getTopActiveUsers,
  getActivitySummary,
  deleteOldActivityLogs,
  getActivityCount,
};