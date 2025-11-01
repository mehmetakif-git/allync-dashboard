import { supabase } from '../supabase';

export interface SheetsInstance {
  id: string;
  company_id: string;
  google_sheet_id: string;
  google_sheet_name: string | null;
  google_sheet_url: string | null;
  google_service_account_email: string | null;
  active_worksheets: any;
  data_mapping: any;
  auto_sync_enabled: boolean;
  sync_interval_minutes: number;
  last_sync_at: string | null;
  next_sync_at: string | null;
  whatsapp_integration_enabled: boolean;
  n8n_workflow_id: string | null;
  n8n_webhook_url: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get all sheets instances for a company
 */
export async function getSheetsInstances(companyId: string): Promise<SheetsInstance[]> {
  const { data, error } = await supabase
    .from('sheets_instances')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get sheets instance by ID
 */
export async function getSheetsInstanceById(instanceId: string): Promise<SheetsInstance | null> {
  const { data, error } = await supabase
    .from('sheets_instances')
    .select('*')
    .eq('id', instanceId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Get active sheets instances
 */
export async function getActiveSheetsInstances(companyId: string): Promise<SheetsInstance[]> {
  const { data, error } = await supabase
    .from('sheets_instances')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get sheets instances with WhatsApp integration enabled
 */
export async function getSheetsWithWhatsAppIntegration(
  companyId: string
): Promise<SheetsInstance[]> {
  const { data, error } = await supabase
    .from('sheets_instances')
    .select('*')
    .eq('company_id', companyId)
    .eq('whatsapp_integration_enabled', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
