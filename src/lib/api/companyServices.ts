import { supabase } from '../supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface CompanyService {
  id: string;
  company_id: string;
  service_type_id: string;
  package: 'basic' | 'pro' | 'premium' | 'custom';
  status: 'active' | 'suspended' | 'inactive' | 'maintenance';
  start_date: string;
  end_date: string | null;
  next_billing_date: string | null;
  usage_limits: any;
  current_usage: any;
  metadata: any;
  price_amount: number | null;
  price_currency: string;
  billing_cycle: 'monthly' | 'yearly' | 'one-time' | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyServiceWithDetails extends CompanyService {
  service_type: {
    id: string;
    name_en: string;
    name_tr: string;
    slug: string;
    category: string;
    icon: string | null;
    color: string | null;
  };
}

export interface AddServiceData {
  companyId: string;
  serviceTypeId: string;
  instanceName: string; // ✅ NEW: Unique name for this service instance
  package: 'basic' | 'pro' | 'premium' | 'custom';
  priceAmount?: number;
  billingCycle?: 'monthly' | 'yearly' | 'one-time';
  startDate?: string;
  endDate?: string;
  notes?: string;
}

// =====================================================
// GET COMPANY SERVICES
// =====================================================

// Get all services for a company
export async function getCompanyServices(companyId: string): Promise<CompanyServiceWithDetails[]> {
  console.log('📡 [getCompanyServices] Fetching services for company:', companyId);

  const { data, error } = await supabase
    .from('company_services')
    .select(`
      *,
      service_type:service_types(
        id,
        name_en,
        name_tr,
        slug,
        category,
        icon,
        color
      )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ [getCompanyServices] Error:', error);
    throw error;
  }

  console.log(`✅ [getCompanyServices] Found ${data?.length || 0} services`);
  return data as CompanyServiceWithDetails[];
}

// Get single company service by ID
export async function getCompanyServiceById(serviceId: string): Promise<CompanyServiceWithDetails> {
  console.log('📡 [getCompanyServiceById] Fetching service:', serviceId);

  const { data, error } = await supabase
    .from('company_services')
    .select(`
      *,
      service_type:service_types(
        id,
        name_en,
        name_tr,
        slug,
        category,
        icon,
        color
      )
    `)
    .eq('id', serviceId)
    .single();

  if (error) {
    console.error('❌ [getCompanyServiceById] Error:', error);
    throw error;
  }

  console.log('✅ [getCompanyServiceById] Service found');
  return data as CompanyServiceWithDetails;
}

// =====================================================
// ADD SERVICE TO COMPANY
// =====================================================

export async function addServiceToCompany(serviceData: AddServiceData): Promise<CompanyServiceWithDetails> {
  console.log('➕ [addServiceToCompany] Adding service:', serviceData);

  try {
    // Calculate next billing date based on start date and billing cycle
    let nextBillingDate = null;
    if (serviceData.billingCycle && serviceData.startDate) {
      const startDate = new Date(serviceData.startDate);
      if (serviceData.billingCycle === 'monthly') {
        nextBillingDate = new Date(startDate.setMonth(startDate.getMonth() + 1)).toISOString().split('T')[0];
      } else if (serviceData.billingCycle === 'yearly') {
        nextBillingDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1)).toISOString().split('T')[0];
      }
      // one-time doesn't have next billing date
    }

    // Prepare metadata with notes
    const metadata: any = {};
    if (serviceData.notes) {
      metadata.notes = serviceData.notes;
      metadata.added_by_admin = true;
      metadata.added_at = new Date().toISOString();
    }

    const insertData = {
      company_id: serviceData.companyId,
      service_type_id: serviceData.serviceTypeId,
      instance_name: serviceData.instanceName, // ✅ NEW: Instance name
      package: serviceData.package,
      status: 'active' as const,
      start_date: serviceData.startDate || new Date().toISOString().split('T')[0],
      end_date: serviceData.endDate || null,
      next_billing_date: nextBillingDate,
      price_amount: serviceData.priceAmount || null,
      price_currency: 'USD',
      billing_cycle: serviceData.billingCycle || null,
      usage_limits: {},
      current_usage: {},
      metadata: metadata,
    };

    console.log('📝 [addServiceToCompany] Insert data:', insertData);

    const { data, error } = await supabase
      .from('company_services')
      .insert([insertData])
      .select(`
        *,
        service_type:service_types(
          id,
          name_en,
          name_tr,
          slug,
          category,
          icon,
          color
        )
      `)
      .single();

    if (error) {
      console.error('❌ [addServiceToCompany] Error:', error);
      throw error;
    }

    console.log('✅ [addServiceToCompany] Service added successfully:', data.id);
    return data as CompanyServiceWithDetails;

  } catch (error) {
    console.error('❌ [addServiceToCompany] Error:', error);
    throw error;
  }
}

// =====================================================
// UPDATE COMPANY SERVICE
// =====================================================

export async function updateCompanyService(
  serviceId: string,
  updates: Partial<CompanyService>
): Promise<CompanyServiceWithDetails> {
  console.log('🔄 [updateCompanyService] Updating service:', serviceId);

  const { data, error } = await supabase
    .from('company_services')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', serviceId)
    .select(`
      *,
      service_type:service_types(
        id,
        name_en,
        name_tr,
        slug,
        category,
        icon,
        color
      )
    `)
    .single();

  if (error) {
    console.error('❌ [updateCompanyService] Error:', error);
    throw error;
  }

  console.log('✅ [updateCompanyService] Service updated successfully');
  return data as CompanyServiceWithDetails;
}

// =====================================================
// UPDATE SERVICE STATUS
// =====================================================

export async function updateServiceStatus(
  serviceId: string,
  status: 'active' | 'suspended' | 'inactive' | 'maintenance',
  reason?: string
): Promise<CompanyServiceWithDetails> {
  console.log('🔄 [updateServiceStatus] Updating status:', { serviceId, status, reason });

  // First, get the current service to get existing metadata
  const currentService = await getCompanyServiceById(serviceId);

  // Update metadata with reason if provided
  const updatedMetadata = { ...currentService.metadata };

  if (reason) {
    // Store reason based on status type
    if (status === 'maintenance') {
      updatedMetadata.maintenance_reason = reason;
      updatedMetadata.maintenance_set_at = new Date().toISOString();
    } else if (status === 'suspended') {
      updatedMetadata.suspension_reason = reason;
      updatedMetadata.suspended_at = new Date().toISOString();
    } else if (status === 'inactive') {
      updatedMetadata.inactive_reason = reason;
      updatedMetadata.inactive_set_at = new Date().toISOString();
    }
  } else {
    // Clear status-specific metadata when returning to active
    if (status === 'active') {
      delete updatedMetadata.maintenance_reason;
      delete updatedMetadata.maintenance_set_at;
      delete updatedMetadata.suspension_reason;
      delete updatedMetadata.suspended_at;
      delete updatedMetadata.inactive_reason;
      delete updatedMetadata.inactive_set_at;
      updatedMetadata.reactivated_at = new Date().toISOString();
    }
  }

  return await updateCompanyService(serviceId, {
    status,
    metadata: updatedMetadata
  });
}

// =====================================================
// SUSPEND SERVICE
// =====================================================

export async function suspendService(
  serviceId: string,
  reason: string
): Promise<CompanyServiceWithDetails> {
  console.log('⚠️ [suspendService] Suspending service:', serviceId);

  const { data, error } = await supabase
    .from('company_services')
    .update({
      status: 'suspended',
      metadata: supabase.rpc('jsonb_set', {
        target: 'metadata',
        path: '{suspension_reason}',
        new_value: JSON.stringify(reason)
      }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', serviceId)
    .select(`
      *,
      service_type:service_types(
        id,
        name_en,
        name_tr,
        slug,
        category,
        icon,
        color
      )
    `)
    .single();

  if (error) {
    console.error('❌ [suspendService] Error:', error);
    throw error;
  }

  console.log('✅ [suspendService] Service suspended successfully');
  return data as CompanyServiceWithDetails;
}

// =====================================================
// REACTIVATE SERVICE
// =====================================================

export async function reactivateService(serviceId: string): Promise<CompanyServiceWithDetails> {
  console.log('✅ [reactivateService] Reactivating service:', serviceId);

  return await updateCompanyService(serviceId, { status: 'active' });
}

// =====================================================
// DELETE SERVICE
// =====================================================

export async function deleteCompanyService(serviceId: string): Promise<void> {
  console.log('🗑️ [deleteCompanyService] Deleting service:', serviceId);

  // Note: In production, you might want to soft-delete by setting status to 'inactive'
  // instead of actually deleting the record
  const { error } = await supabase
    .from('company_services')
    .delete()
    .eq('id', serviceId);

  if (error) {
    console.error('❌ [deleteCompanyService] Error:', error);
    throw error;
  }

  console.log('✅ [deleteCompanyService] Service deleted successfully');
}