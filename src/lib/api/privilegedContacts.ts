import { supabase } from '../supabase';

export interface PrivilegedContact {
  id: string;
  company_id: string;
  contact_phone: string;
  contact_name: string;
  privilege_level: 'owner' | 'manager' | 'employee' | 'vip_customer';
  allowed_features: {
    view_stock: boolean;
    export_data: boolean;
    view_reports: boolean;
    modify_appointments: boolean;
    access_customer_data: boolean;
    view_all_appointments: boolean;
  };
  greeting_name: string | null;
  response_style: string; // 'formal' | 'casual' | 'friendly'
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Populated fields (for super admin queries)
  company?: {
    id: string;
    name: string;
    email?: string;
  };
}

/**
 * Get all privileged contacts for a company (max 2)
 */
export async function getPrivilegedContacts(companyId: string): Promise<PrivilegedContact[]> {
  const { data, error } = await supabase
    .from('privileged_contacts')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get active privileged contacts only
 */
export async function getActivePrivilegedContacts(companyId: string): Promise<PrivilegedContact[]> {
  const { data, error } = await supabase
    .from('privileged_contacts')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get privileged contact by ID
 */
export async function getPrivilegedContactById(contactId: string): Promise<PrivilegedContact | null> {
  const { data, error } = await supabase
    .from('privileged_contacts')
    .select('*')
    .eq('id', contactId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Create a new privileged contact (enforces 2-contact limit per company)
 */
export async function createPrivilegedContact(
  contact: Omit<PrivilegedContact, 'id' | 'created_at' | 'updated_at'>
): Promise<PrivilegedContact> {
  // First, check if company already has 2 privileged contacts
  const existing = await getPrivilegedContacts(contact.company_id);

  if (existing.length >= 2) {
    throw new Error('Maksimum 2 yetkili kişi ekleyebilirsiniz. Limit aşıldı.');
  }

  const { data, error } = await supabase
    .from('privileged_contacts')
    .insert([contact])
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new Error('Bu telefon numarası zaten kayıtlı.');
    }
    throw error;
  }

  return data;
}

/**
 * Update an existing privileged contact
 */
export async function updatePrivilegedContact(
  contactId: string,
  updates: Partial<Omit<PrivilegedContact, 'id' | 'company_id' | 'created_at' | 'updated_at'>>
): Promise<PrivilegedContact> {
  const { data, error } = await supabase
    .from('privileged_contacts')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contactId)
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new Error('Bu telefon numarası zaten kayıtlı.');
    }
    throw error;
  }

  return data;
}

/**
 * Delete a privileged contact
 */
export async function deletePrivilegedContact(contactId: string): Promise<void> {
  const { error } = await supabase
    .from('privileged_contacts')
    .delete()
    .eq('id', contactId);

  if (error) throw error;
}

/**
 * Toggle contact active status
 */
export async function togglePrivilegedContactStatus(contactId: string): Promise<PrivilegedContact> {
  // First get current status
  const contact = await getPrivilegedContactById(contactId);
  if (!contact) {
    throw new Error('Contact not found');
  }

  // Toggle status
  const newStatus = !contact.is_active;

  const { data, error } = await supabase
    .from('privileged_contacts')
    .update({
      is_active: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contactId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all privileged contacts across all companies (for super admin)
 */
export async function getAllPrivilegedContacts(): Promise<PrivilegedContact[]> {
  const { data, error } = await supabase
    .from('privileged_contacts')
    .select(`
      *,
      company:companies(id, name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get privileged contacts count for a company
 */
export async function getPrivilegedContactsCount(companyId: string): Promise<number> {
  const { count, error } = await supabase
    .from('privileged_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  if (error) throw error;
  return count || 0;
}

/**
 * Check if company can add more privileged contacts (max 2)
 */
export async function canAddPrivilegedContact(companyId: string): Promise<boolean> {
  const count = await getPrivilegedContactsCount(companyId);
  return count < 2;
}

/**
 * Get privileged contact by phone number (for checking duplicates)
 */
export async function getPrivilegedContactByPhone(
  companyId: string,
  phone: string
): Promise<PrivilegedContact | null> {
  const { data, error } = await supabase
    .from('privileged_contacts')
    .select('*')
    .eq('company_id', companyId)
    .eq('contact_phone', phone)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}
