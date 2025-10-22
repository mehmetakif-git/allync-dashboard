import { supabase } from '../supabase';

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  country: string;
  logo_url?: string | null;
  status: string; // 'active' | 'inactive' | 'suspended'
  created_at: string;
  updated_at: string;
}

// Get all companies
export async function getAllCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Company[];
}
// Create company
export async function createCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('companies')
    .insert([company])
    .select()
    .single();

  if (error) throw error;
  return data as Company;
}

// Update company
export async function updateCompany(id: string, updates: Partial<Company>) {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Company;
}

// Delete company
export async function deleteCompany(id: string) {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
// Get all companies (for Super Admin)
export async function getAllCompaniesWithProjects() {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      website_projects:website_projects(
        id,
        project_name,
        project_type,
        overall_progress,
        status,
        estimated_completion
      ),
      mobile_app_projects:mobile_app_projects(
        id,
        project_name,
        platform,
        app_name,
        overall_progress,
        status,
        estimated_completion
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching companies with projects:', error);
    throw error;
  }
  
  return data;
}
// Get company by ID
export async function getCompanyById(companyId: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) {
    console.error('Error fetching company:', error);
    throw error;
  }
  
  return data;
}

// Get service requests for a company
export async function getServiceRequests(companyId: string) {
  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      service_type:service_types(*)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching service requests:', error);
    throw error;
  }
  
  return data;
}

// Get support tickets for a company
export async function getSupportTickets(companyId: string) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching support tickets:', error);
    throw error;
  }
  
  return data;
}

// Get invoices for a company
export async function getInvoices(companyId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('company_id', companyId)
    .order('issue_date', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
  
  return data;
}

// Get all service types (catalog)
export async function getServiceTypes() {
  const { data, error } = await supabase
    .from('service_types')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching service types:', error);
    throw error;
  }
  
  return data;
}