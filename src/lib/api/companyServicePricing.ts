import { supabase } from '../supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface CompanyServicePricing {
  id: string;
  company_id: string;
  service_type_id: string;
  package: 'basic' | 'standard' | 'premium';
  price: number;
  currency: string;
  period: 'month' | 'year' | 'one-time';
  custom_features_en: string[] | null;
  custom_features_tr: string[] | null;
  custom_limits: Record<string, any> | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyServicePricingInput {
  company_id: string;
  service_type_id: string;
  package: 'basic' | 'standard' | 'premium';
  price: number;
  currency?: string;
  period?: 'month' | 'year' | 'one-time';
  custom_features_en?: string[];
  custom_features_tr?: string[];
  custom_limits?: Record<string, any>;
  notes?: string;
}

export interface UpdateCompanyServicePricingInput {
  price?: number;
  currency?: string;
  period?: 'month' | 'year' | 'one-time';
  custom_features_en?: string[];
  custom_features_tr?: string[];
  custom_limits?: Record<string, any>;
  notes?: string;
  is_active?: boolean;
}

// =====================================================
// CRUD OPERATIONS
// =====================================================

/**
 * Get all custom pricing for a specific company
 */
export async function getCompanyServicePricing(companyId: string): Promise<CompanyServicePricing[]> {
  console.log('🔍 [API] getCompanyServicePricing called with companyId:', companyId);

  const { data, error } = await supabase
    .from('company_service_pricing')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ [API] Error fetching company service pricing:', error);
    throw error;
  }

  console.log('✅ [API] Company service pricing fetched:', {
    companyId,
    count: data?.length || 0,
    pricing: data
  });

  return data || [];
}

/**
 * Get custom pricing for a specific service and company
 */
export async function getServicePricingForCompany(
  companyId: string,
  serviceTypeId: string
): Promise<CompanyServicePricing[]> {
  console.log('🔍 [API] getServicePricingForCompany:', { companyId, serviceTypeId });

  const { data, error } = await supabase
    .from('company_service_pricing')
    .select('*')
    .eq('company_id', companyId)
    .eq('service_type_id', serviceTypeId)
    .eq('is_active', true)
    .order('package');

  if (error) {
    console.error('❌ [API] Error fetching service pricing:', error);
    throw error;
  }

  console.log('✅ [API] Service pricing fetched:', {
    companyId,
    serviceTypeId,
    packages: data?.map(p => p.package) || []
  });

  return data || [];
}

/**
 * Get all companies using a specific service (with custom pricing)
 */
export async function getCompaniesByService(serviceTypeId: string): Promise<CompanyServicePricing[]> {
  console.log('🔍 [API] getCompaniesByService:', serviceTypeId);

  const { data, error } = await supabase
    .from('company_service_pricing')
    .select(`
      *,
      company:companies(id, name, email, country)
    `)
    .eq('service_type_id', serviceTypeId)
    .eq('is_active', true);

  if (error) {
    console.error('❌ [API] Error fetching companies by service:', error);
    throw error;
  }

  console.log('✅ [API] Companies using service:', {
    serviceTypeId,
    count: data?.length || 0
  });

  return data || [];
}

/**
 * Create custom pricing for a company
 */
export async function createCompanyServicePricing(
  input: CreateCompanyServicePricingInput
): Promise<CompanyServicePricing> {
  console.log('📝 [API] createCompanyServicePricing:', input);

  const { data, error } = await supabase
    .from('company_service_pricing')
    .insert([{
      company_id: input.company_id,
      service_type_id: input.service_type_id,
      package: input.package,
      price: input.price,
      currency: input.currency || 'USD',
      period: input.period || 'month',
      custom_features_en: input.custom_features_en || null,
      custom_features_tr: input.custom_features_tr || null,
      custom_limits: input.custom_limits || null,
      notes: input.notes || null,
    }])
    .select()
    .single();

  if (error) {
    console.error('❌ [API] Error creating company service pricing:', error);
    throw error;
  }

  console.log('✅ [API] Company service pricing created:', data);
  return data;
}

/**
 * Update custom pricing
 */
export async function updateCompanyServicePricing(
  pricingId: string,
  updates: UpdateCompanyServicePricingInput
): Promise<CompanyServicePricing> {
  console.log('📝 [API] updateCompanyServicePricing:', { pricingId, updates });

  const { data, error } = await supabase
    .from('company_service_pricing')
    .update(updates)
    .eq('id', pricingId)
    .select()
    .single();

  if (error) {
    console.error('❌ [API] Error updating company service pricing:', error);
    throw error;
  }

  console.log('✅ [API] Company service pricing updated:', data);
  return data;
}

/**
 * Delete (deactivate) custom pricing
 */
export async function deleteCompanyServicePricing(pricingId: string): Promise<void> {
  console.log('🗑️ [API] deleteCompanyServicePricing:', pricingId);

  const { error } = await supabase
    .from('company_service_pricing')
    .update({ is_active: false })
    .eq('id', pricingId);

  if (error) {
    console.error('❌ [API] Error deleting company service pricing:', error);
    throw error;
  }

  console.log('✅ [API] Company service pricing deleted (deactivated)');
}

/**
 * Bulk create pricing for all packages
 */
export async function createBulkServicePricing(
  companyId: string,
  serviceTypeId: string,
  pricing: {
    basic: { price: number; features_en?: string[]; features_tr?: string[] };
    standard: { price: number; features_en?: string[]; features_tr?: string[] };
    premium: { price: number; features_en?: string[]; features_tr?: string[] };
  },
  period: 'month' | 'year' | 'one-time' = 'month',
  currency: string = 'USD'
): Promise<CompanyServicePricing[]> {
  console.log('📦 [API] createBulkServicePricing:', { companyId, serviceTypeId, pricing });

  const packages: CreateCompanyServicePricingInput[] = [
    {
      company_id: companyId,
      service_type_id: serviceTypeId,
      package: 'basic',
      price: pricing.basic.price,
      currency,
      period,
      custom_features_en: pricing.basic.features_en,
      custom_features_tr: pricing.basic.features_tr,
    },
    {
      company_id: companyId,
      service_type_id: serviceTypeId,
      package: 'standard',
      price: pricing.standard.price,
      currency,
      period,
      custom_features_en: pricing.standard.features_en,
      custom_features_tr: pricing.standard.features_tr,
    },
    {
      company_id: companyId,
      service_type_id: serviceTypeId,
      package: 'premium',
      price: pricing.premium.price,
      currency,
      period,
      custom_features_en: pricing.premium.features_en,
      custom_features_tr: pricing.premium.features_tr,
    },
  ];

  const { data, error } = await supabase
    .from('company_service_pricing')
    .insert(packages)
    .select();

  if (error) {
    console.error('❌ [API] Error creating bulk service pricing:', error);
    throw error;
  }

  console.log('✅ [API] Bulk service pricing created:', { count: data?.length || 0 });
  return data || [];
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Check if company has custom pricing for a service
 */
export async function hasCustomPricing(
  companyId: string,
  serviceTypeId: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from('company_service_pricing')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('service_type_id', serviceTypeId)
    .eq('is_active', true);

  if (error) {
    console.error('Error checking custom pricing:', error);
    return false;
  }

  return (count || 0) > 0;
}

/**
 * Get pricing to display for company admin
 * Returns custom pricing if exists, otherwise returns null (show "Contact for pricing")
 */
export async function getPricingForDisplay(
  companyId: string,
  serviceTypeId: string
): Promise<CompanyServicePricing[] | null> {
  const customPricing = await getServicePricingForCompany(companyId, serviceTypeId);

  if (customPricing.length > 0) {
    return customPricing;
  }

  // No custom pricing - should show "Contact for pricing"
  return null;
}

export default {
  getCompanyServicePricing,
  getServicePricingForCompany,
  getCompaniesByService,
  createCompanyServicePricing,
  updateCompanyServicePricing,
  deleteCompanyServicePricing,
  createBulkServicePricing,
  hasCustomPricing,
  getPricingForDisplay,
};