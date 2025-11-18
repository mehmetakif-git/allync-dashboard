import { supabase } from '../supabase';

export interface SheetsInstance {
  id: string;
  company_id: string;
  google_sheet_id: string;
  google_sheet_name: string | null;
  google_sheet_url: string | null;
  google_service_account_email: string | null;
  worksheet_name?: string;
  purpose?: string; // 'price_list' | 'product_catalog' | 'stock_tracking' | 'general'
  supported_intents?: string[]; // ['price_query', 'stock_check', 'product_info']
  is_primary?: boolean;
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
    .order('created_at', { ascending: false});

  if (error) throw error;
  return data || [];
}

/**
 * Get primary sheet for a specific intent/purpose
 */
export async function getPrimarySheetForIntent(
  companyId: string,
  intent: string
): Promise<SheetsInstance | null> {
  const { data, error } = await supabase
    .from('sheets_instances')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_primary', true)
    .contains('supported_intents', [intent])
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Get sheets by purpose
 */
export async function getSheetsByPurpose(
  companyId: string,
  purpose: string
): Promise<SheetsInstance[]> {
  const { data, error } = await supabase
    .from('sheets_instances')
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
 * Set a sheet as primary for its purpose (unsets other primary sheets)
 */
export async function setPrimarySheet(
  sheetId: string,
  companyId: string,
  purpose: string
): Promise<void> {
  // First, unset all primary sheets for this purpose
  const { error: unsetError } = await supabase
    .from('sheets_instances')
    .update({ is_primary: false })
    .eq('company_id', companyId)
    .eq('purpose', purpose);

  if (unsetError) throw unsetError;

  // Then, set the specified sheet as primary
  const { error: setPrimaryError } = await supabase
    .from('sheets_instances')
    .update({ is_primary: true })
    .eq('id', sheetId);

  if (setPrimaryError) throw setPrimaryError;
}

/**
 * Get all sheets instances across all companies (for super admin)
 */
export async function getAllSheetsInstances(): Promise<SheetsInstance[]> {
  const { data, error } = await supabase
    .from('sheets_instances')
    .select(`
      *,
      company:companies(id, name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Update sheet status (for super admin)
 */
export async function updateSheetStatus(
  sheetId: string,
  status: 'active' | 'inactive'
): Promise<void> {
  const { error } = await supabase
    .from('sheets_instances')
    .update({ status })
    .eq('id', sheetId);

  if (error) throw error;
}
