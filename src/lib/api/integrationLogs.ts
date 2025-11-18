import { supabase } from '../supabase';

export interface IntegrationLog {
  id: string;
  company_id: string;
  user_id: string | null;
  action: string; // 'create', 'update', 'delete'
  action_category: string; // 'service'
  entity_type: string; // 'calendar_instance' | 'sheets_instance'
  entity_id: string;
  description: string;
  details: any;
  metadata: any;
  created_at: string;
  status: string; // 'success' | 'failed'
  severity_level: string; // 'info' | 'warning' | 'error'
  changed_data: any;
  error_message: string | null;

  // Populated fields
  company?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

/**
 * Get all integration logs (calendar + sheets)
 */
export async function getAllIntegrationLogs(
  limit: number = 100,
  offset: number = 0
): Promise<IntegrationLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      company:companies(id, name),
      user:users(id, full_name, email)
    `)
    .in('entity_type', ['calendar_instance', 'sheets_instance'])
    .eq('action_category', 'service')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

/**
 * Get integration logs for a specific company
 */
export async function getIntegrationLogsByCompany(
  companyId: string,
  limit: number = 50
): Promise<IntegrationLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      company:companies(id, name),
      user:users(id, full_name, email)
    `)
    .eq('company_id', companyId)
    .in('entity_type', ['calendar_instance', 'sheets_instance'])
    .eq('action_category', 'service')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Get logs for a specific integration instance
 */
export async function getIntegrationLogsByInstance(
  entityType: 'calendar_instance' | 'sheets_instance',
  entityId: string,
  limit: number = 20
): Promise<IntegrationLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      company:companies(id, name),
      user:users(id, full_name, email)
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('action_category', 'service')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Get calendar integration logs only
 */
export async function getCalendarIntegrationLogs(
  limit: number = 100
): Promise<IntegrationLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      company:companies(id, name),
      user:users(id, full_name, email)
    `)
    .eq('entity_type', 'calendar_instance')
    .eq('action_category', 'service')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Get sheets integration logs only
 */
export async function getSheetsIntegrationLogs(
  limit: number = 100
): Promise<IntegrationLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      company:companies(id, name),
      user:users(id, full_name, email)
    `)
    .eq('entity_type', 'sheets_instance')
    .eq('action_category', 'service')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Create an integration log entry
 */
export async function createIntegrationLog(log: {
  company_id: string;
  user_id: string | null;
  action: 'create' | 'update' | 'delete';
  entity_type: 'calendar_instance' | 'sheets_instance';
  entity_id: string;
  description: string;
  details?: any;
  metadata?: any;
  status?: 'success' | 'failed';
  severity_level?: 'info' | 'warning' | 'error';
  changed_data?: any;
  error_message?: string | null;
}): Promise<IntegrationLog> {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      ...log,
      action_category: 'service',
      status: log.status || 'success',
      severity_level: log.severity_level || 'info',
      details: log.details || {},
      metadata: log.metadata || {},
      changed_data: log.changed_data || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get integration stats (for dashboard)
 */
export async function getIntegrationLogStats(): Promise<{
  total_logs: number;
  calendar_logs: number;
  sheets_logs: number;
  recent_activity: number; // last 24h
  failed_operations: number;
}> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Total logs
  const { count: totalCount } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true })
    .in('entity_type', ['calendar_instance', 'sheets_instance'])
    .eq('action_category', 'service');

  // Calendar logs
  const { count: calendarCount } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true })
    .eq('entity_type', 'calendar_instance')
    .eq('action_category', 'service');

  // Sheets logs
  const { count: sheetsCount } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true })
    .eq('entity_type', 'sheets_instance')
    .eq('action_category', 'service');

  // Recent activity (last 24h)
  const { count: recentCount } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true })
    .in('entity_type', ['calendar_instance', 'sheets_instance'])
    .eq('action_category', 'service')
    .gte('created_at', yesterday.toISOString());

  // Failed operations
  const { count: failedCount } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true })
    .in('entity_type', ['calendar_instance', 'sheets_instance'])
    .eq('action_category', 'service')
    .eq('status', 'failed');

  return {
    total_logs: totalCount || 0,
    calendar_logs: calendarCount || 0,
    sheets_logs: sheetsCount || 0,
    recent_activity: recentCount || 0,
    failed_operations: failedCount || 0,
  };
}
