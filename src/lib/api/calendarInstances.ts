import { supabase } from '../supabase';

export interface CalendarInstance {
  id: string;
  company_id: string;
  google_calendar_id: string | null;
  calendar_name: string | null;
  purpose?: string; // 'appointment' | 'meeting' | 'support' | 'general'
  is_primary?: boolean;
  timezone: string;
  business_hours: any;
  auto_approve_appointments: boolean;
  status: string;
  settings: any;
  n8n_workflow_id: string | null;
  n8n_webhook_url: string | null;
  instance_name: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

/**
 * Get all calendar instances for a company
 */
export async function getCalendarInstances(companyId: string): Promise<CalendarInstance[]> {
  const { data, error } = await supabase
    .from('calendar_instances')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get calendar instance by ID
 */
export async function getCalendarInstanceById(
  instanceId: string
): Promise<CalendarInstance | null> {
  const { data, error } = await supabase
    .from('calendar_instances')
    .select('*')
    .eq('id', instanceId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Get active calendar instances
 */
export async function getActiveCalendarInstances(
  companyId: string
): Promise<CalendarInstance[]> {
  const { data, error } = await supabase
    .from('calendar_instances')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get primary calendar for a specific purpose
 */
export async function getPrimaryCalendarForPurpose(
  companyId: string,
  purpose: string
): Promise<CalendarInstance | null> {
  const { data, error } = await supabase
    .from('calendar_instances')
    .select('*')
    .eq('company_id', companyId)
    .eq('purpose', purpose)
    .eq('is_primary', true)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Get calendars by purpose
 */
export async function getCalendarsByPurpose(
  companyId: string,
  purpose: string
): Promise<CalendarInstance[]> {
  const { data, error } = await supabase
    .from('calendar_instances')
    .select('*')
    .eq('company_id', companyId)
    .eq('purpose', purpose)
    .eq('status', 'active')
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Set a calendar as primary for its purpose (unsets other primary calendars)
 */
export async function setPrimaryCalendar(
  calendarId: string,
  companyId: string,
  purpose: string
): Promise<void> {
  // First, unset all primary calendars for this purpose
  const { error: unsetError } = await supabase
    .from('calendar_instances')
    .update({ is_primary: false })
    .eq('company_id', companyId)
    .eq('purpose', purpose);

  if (unsetError) throw unsetError;

  // Then, set the specified calendar as primary
  const { error: setPrimaryError } = await supabase
    .from('calendar_instances')
    .update({ is_primary: true })
    .eq('id', calendarId);

  if (setPrimaryError) throw setPrimaryError;
}

/**
 * Get all calendar instances across all companies (for super admin)
 */
export async function getAllCalendarInstances(): Promise<CalendarInstance[]> {
  const { data, error } = await supabase
    .from('calendar_instances')
    .select(`
      *,
      company:companies(id, name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Update calendar status (for super admin)
 */
export async function updateCalendarStatus(
  calendarId: string,
  status: 'active' | 'inactive'
): Promise<void> {
  const { error } = await supabase
    .from('calendar_instances')
    .update({ status })
    .eq('id', calendarId);

  if (error) throw error;
}
