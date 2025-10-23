import { supabase } from '../supabase';

// =====================================================
// INTERFACES - MATCHING EXISTING DATABASE STRUCTURE
// =====================================================

export interface ServiceType {
  id: string;
  
  // Multi-language names
  name_tr: string;
  name_en: string;
  
  // Multi-language descriptions
  description_tr: string | null;
  description_en: string | null;
  short_description_tr: string | null;
  short_description_en: string | null;
  
  // Core fields
  slug: string;
  category: string;
  icon: string | null;
  color: string | null;
  image_url: string | null;
  
  // Pricing tiers (JSONB)
  pricing_basic: PricingTier | null;
  pricing_standard: PricingTier | null;
  pricing_premium: PricingTier | null;
  
  // Features & Requirements (JSONB arrays)
  features: any; // Can be string[] or object with TR/EN
  requirements_tr: string[] | null;
  requirements_en: string[] | null;
  
  // Status
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  
  // SEO (multi-language)
  meta_title_tr: string | null;
  meta_title_en: string | null;
  meta_description_tr: string | null;
  meta_description_en: string | null;
  meta_keywords: string[] | null;
  
  // Metadata
  metadata: any;
  
  // Timestamps
  created_at: string;
  updated_at: string | null;
}

export interface PricingTier {
  price: number;
  currency: string;
  period: 'month' | 'year' | 'one-time';
  features_tr?: string[];
  features_en?: string[];
  limits?: Record<string, any>;
}

export interface ServiceTypeWithStats extends ServiceType {
  total_requests?: number;
  active_subscriptions?: number;
  total_companies?: number;
}

// =====================================================
// CRUD OPERATIONS
// =====================================================

// Get all active services
export async function getActiveServices(language: 'tr' | 'en' = 'en') {
  const { data, error } = await supabase
    .from('service_types')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching active services:', error);
    throw error;
  }

  return data as ServiceType[];
}

// Get all services (including inactive - for admin)
export async function getAllServices() {
  const { data, error } = await supabase
    .from('service_types')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching all services:', error);
    throw error;
  }

  return data as ServiceType[];
}

// Get service by ID
export async function getServiceById(serviceId: string) {
  const { data, error } = await supabase
    .from('service_types')
    .select('*')
    .eq('id', serviceId)
    .single();

  if (error) {
    console.error('Error fetching service:', error);
    throw error;
  }

  return data as ServiceType;
}

// Get service by slug
export async function getServiceBySlug(slug: string) {
  const { data, error } = await supabase
    .from('service_types')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching service by slug:', error);
    throw error;
  }

  return data as ServiceType;
}

// Create new service
export async function createService(serviceData: Partial<ServiceType>) {
  // Generate slug if not provided
  if (!serviceData.slug && serviceData.name_en) {
    serviceData.slug = generateSlug(serviceData.name_en);
  }

  const { data, error } = await supabase
    .from('service_types')
    .insert([serviceData])
    .select()
    .single();

  if (error) {
    console.error('Error creating service:', error);
    throw error;
  }

  return data as ServiceType;
}

// Update service (SUPER ADMIN ONLY)
export async function updateService(serviceId: string, updates: Partial<ServiceType>) {
  const { data, error } = await supabase
    .from('service_types')
    .update(updates)
    .eq('id', serviceId)
    .select()
    .single();

  if (error) {
    console.error('Error updating service:', error);
    throw error;
  }

  return data as ServiceType;
}

// Delete service (SUPER ADMIN ONLY)
export async function deleteService(serviceId: string) {
  const { error } = await supabase
    .from('service_types')
    .delete()
    .eq('id', serviceId);

  if (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
}

// =====================================================
// FILTERING & SEARCH
// =====================================================

// Get services by category
export async function getServicesByCategory(category: string) {
  const { data, error } = await supabase
    .from('service_types')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching services by category:', error);
    throw error;
  }

  return data as ServiceType[];
}

// Get featured services
export async function getFeaturedServices() {
  const { data, error } = await supabase
    .from('service_types')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching featured services:', error);
    throw error;
  }

  return data as ServiceType[];
}

// Search services (multi-language)
export async function searchServices(query: string, language: 'tr' | 'en' = 'en') {
  const nameField = language === 'tr' ? 'name_tr' : 'name_en';
  const descField = language === 'tr' ? 'description_tr' : 'description_en';

  const { data, error } = await supabase
    .from('service_types')
    .select('*')
    .or(`${nameField}.ilike.%${query}%,${descField}.ilike.%${query}%,slug.ilike.%${query}%`)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error searching services:', error);
    throw error;
  }

  return data as ServiceType[];
}

// =====================================================
// STATISTICS & ANALYTICS
// =====================================================

// Get service usage stats
export async function getServiceUsageStats(serviceId: string) {
  const { data, error } = await supabase
    .from('service_requests')
    .select('id, status, created_at, company:companies(id, name)')
    .eq('service_type_id', serviceId);

  if (error) {
    console.error('Error fetching service usage stats:', error);
    throw error;
  }

  const stats = {
    total: data.length,
    active: data.filter((r: any) => r.status === 'active').length,
    pending: data.filter((r: any) => r.status === 'pending').length,
    completed: data.filter((r: any) => r.status === 'completed').length,
    cancelled: data.filter((r: any) => r.status === 'cancelled').length,
    companies: [...new Set(data.map((r: any) => r.company?.id))].length,
  };

  return { stats, requests: data };
}

// Get all services with usage stats
export async function getServicesWithStats() {
  const services = await getAllServices();
  
  const servicesWithStats = await Promise.all(
    services.map(async (service) => {
      try {
        const { stats } = await getServiceUsageStats(service.id);
        return {
          ...service,
          total_requests: stats.total,
          active_subscriptions: stats.active,
          total_companies: stats.companies,
        } as ServiceTypeWithStats;
      } catch (error) {
        // If no service_requests data, return service without stats
        return {
          ...service,
          total_requests: 0,
          active_subscriptions: 0,
          total_companies: 0,
        } as ServiceTypeWithStats;
      }
    })
  );

  return servicesWithStats;
}

// Get category statistics
export async function getCategoryStats() {
  const { data, error } = await supabase
    .from('service_types')
    .select('category')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching category stats:', error);
    throw error;
  }

  const categoryCount = data.reduce((acc: any, service: any) => {
    acc[service.category] = (acc[service.category] || 0) + 1;
    return acc;
  }, {});

  return categoryCount;
}

// =====================================================
// PRICING HELPERS
// =====================================================

// Get pricing for specific tier
export function getPricingTier(
  service: ServiceType,
  tier: 'basic' | 'standard' | 'premium'
): PricingTier | null {
  switch (tier) {
    case 'basic':
      return service.pricing_basic;
    case 'standard':
      return service.pricing_standard;
    case 'premium':
      return service.pricing_premium;
  }
}

// Get pricing features (language-aware)
export function getPricingFeatures(
  pricing: PricingTier | null,
  language: 'tr' | 'en' = 'en'
): string[] {
  if (!pricing) return [];
  
  const features = language === 'tr' 
    ? pricing.features_tr 
    : pricing.features_en;
  
  return features || [];
}

// Calculate total price (considering discounts)
export function calculateServicePrice(
  pricing: PricingTier | null,
  quantity: number = 1,
  discountPercent: number = 0
): number {
  if (!pricing) return 0;
  
  const subtotal = pricing.price * quantity;
  const discount = subtotal * (discountPercent / 100);
  return subtotal - discount;
}

// Format price for display
export function formatPrice(pricing: PricingTier | null, language: 'tr' | 'en' = 'en'): string {
  if (!pricing) return '-';
  
  const formatter = new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
    style: 'currency',
    currency: pricing.currency || 'USD',
  });

  const price = formatter.format(pricing.price);
  
  if (pricing.period === 'one-time') {
    return price;
  }
  
  const periodText = language === 'tr' 
    ? (pricing.period === 'month' ? 'ay' : 'yıl')
    : pricing.period;
  
  return `${price}/${periodText}`;
}

// =====================================================
// LOCALIZATION HELPERS
// =====================================================

// Get localized name
export function getLocalizedName(service: ServiceType, language: 'tr' | 'en' = 'en'): string {
  return language === 'tr' ? service.name_tr : service.name_en;
}

// Get localized description
export function getLocalizedDescription(service: ServiceType, language: 'tr' | 'en' = 'en'): string {
  const desc = language === 'tr' ? service.description_tr : service.description_en;
  return desc || '';
}

// Get localized short description
export function getLocalizedShortDescription(service: ServiceType, language: 'tr' | 'en' = 'en'): string {
  const desc = language === 'tr' ? service.short_description_tr : service.short_description_en;
  return desc || '';
}

// Get localized meta title
export function getLocalizedMetaTitle(service: ServiceType, language: 'tr' | 'en' = 'en'): string {
  const title = language === 'tr' ? service.meta_title_tr : service.meta_title_en;
  return title || getLocalizedName(service, language);
}

// Get localized meta description
export function getLocalizedMetaDescription(service: ServiceType, language: 'tr' | 'en' = 'en'): string {
  const desc = language === 'tr' ? service.meta_description_tr : service.meta_description_en;
  return desc || getLocalizedShortDescription(service, language);
}

// =====================================================
// BULK OPERATIONS (SUPER ADMIN)
// =====================================================

// Update multiple services
export async function bulkUpdateServices(
  serviceIds: string[],
  updates: Partial<ServiceType>
) {
  const { data, error } = await supabase
    .from('service_types')
    .update(updates)
    .in('id', serviceIds)
    .select();

  if (error) {
    console.error('Error bulk updating services:', error);
    throw error;
  }

  return data as ServiceType[];
}

// Toggle service active status
export async function toggleServiceStatus(serviceId: string) {
  const service = await getServiceById(serviceId);
  return updateService(serviceId, {
    is_active: !service.is_active,
  });
}

// Toggle featured status
export async function toggleFeaturedStatus(serviceId: string) {
  const service = await getServiceById(serviceId);
  return updateService(serviceId, {
    is_featured: !service.is_featured,
  });
}

// Reorder services
export async function reorderServices(serviceIds: string[]) {
  const updates = serviceIds.map((id, index) => ({
    id,
    sort_order: index,
  }));

  const promises = updates.map(({ id, sort_order }) =>
    updateService(id, { sort_order })
  );

  return Promise.all(promises);
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

// Validate service data
export function validateServiceData(data: Partial<ServiceType>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Name validation (both languages)
  if (!data.name_en || data.name_en.trim().length === 0) {
    errors.push('English name is required');
  }
  if (!data.name_tr || data.name_tr.trim().length === 0) {
    errors.push('Turkish name is required');
  }

  // Slug validation
  if (!data.slug || data.slug.trim().length === 0) {
    errors.push('Service slug is required');
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  // Category validation
  if (!data.category) {
    errors.push('Service category is required');
  }

  // Pricing validation
  if (data.pricing_basic && typeof data.pricing_basic.price !== 'number') {
    errors.push('Basic pricing must include a valid price');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// =====================================================
// EXPORT ALL
// =====================================================

export default {
  // CRUD
  getActiveServices,
  getAllServices,
  getServiceById,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  
  // Filtering
  getServicesByCategory,
  getFeaturedServices,
  searchServices,
  
  // Stats
  getServiceUsageStats,
  getServicesWithStats,
  getCategoryStats,
  
  // Pricing
  getPricingTier,
  getPricingFeatures,
  calculateServicePrice,
  formatPrice,
  
  // Localization
  getLocalizedName,
  getLocalizedDescription,
  getLocalizedShortDescription,
  getLocalizedMetaTitle,
  getLocalizedMetaDescription,
  
  // Bulk
  bulkUpdateServices,
  toggleServiceStatus,
  toggleFeaturedStatus,
  reorderServices,
  
  // Validation
  validateServiceData,
  generateSlug,
};