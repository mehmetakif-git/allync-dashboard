import { supabase } from '../supabase';

export interface CalendarInstance {
  id: string;
  company_id: string;
  google_calendar_id: string | null;
  calendar_name: string | null;
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
