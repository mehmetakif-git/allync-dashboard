import { supabase } from '../supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface ServiceRequest {
  id: string;
  company_id: string;
  service_type_id: string;
  package: 'basic' | 'standard' | 'premium';
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string | null;
  notes: string | null;
  admin_notes: string | null; // Rejection reason or admin comments
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface ServiceRequestWithDetails extends ServiceRequest {
  company: {
    id: string;
    name: string;
    email: string;
  };
  service_type: {
    id: string;
    name_en: string;
    name_tr: string;
    slug: string;
    pricing_basic: any;
    pricing_standard: any;
    pricing_premium: any;
  };
  requester?: {
    id: string;
    full_name: string;
    email: string;
  };
}

// =====================================================
// GET SERVICE REQUESTS
// =====================================================

// Get all service requests (for Super Admin)
export async function getAllServiceRequests(filters?: {
  status?: 'pending' | 'approved' | 'rejected';
  companyId?: string;
}) {
  console.log('📡 [getAllServiceRequests] Fetching with filters:', filters);

  let query = supabase
    .from('service_requests')
    .select(`
      *,
      company:companies(id, name, email),
      service_type:service_types(
        id, 
        name_en, 
        name_tr, 
        slug,
        pricing_basic,
        pricing_standard,
        pricing_premium
      ),
      requester:profiles!requested_by(id, full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.companyId) {
    query = query.eq('company_id', filters.companyId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ [getAllServiceRequests] Error:', error);
    throw error;
  }

  console.log(`✅ [getAllServiceRequests] Found ${data?.length || 0} requests`);
  return data as ServiceRequestWithDetails[];
}

// Get service requests for a specific company
export async function getCompanyServiceRequests(companyId: string) {
  console.log('📡 [getCompanyServiceRequests] Fetching for company:', companyId);

  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      service_type:service_types(
        id,
        name_en,
        name_tr,
        slug,
        pricing_basic,
        pricing_standard,
        pricing_premium
      ),
      requester:profiles!requested_by(id, full_name, email)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ [getCompanyServiceRequests] Error:', error);
    throw error;
  }

  console.log(`✅ [getCompanyServiceRequests] Found ${data?.length || 0} requests`);
  return data as ServiceRequestWithDetails[];
}

// Get service requests for a specific service type (for service management pages)
export async function getServiceRequestsByServiceType(serviceTypeId: string, status?: 'pending' | 'approved' | 'rejected') {
  console.log('📡 [getServiceRequestsByServiceType] Fetching for service:', serviceTypeId);

  let query = supabase
    .from('service_requests')
    .select(`
      *,
      company:companies(id, name, email),
      requester:profiles!requested_by(id, full_name, email)
    `)
    .eq('service_type_id', serviceTypeId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ [getServiceRequestsByServiceType] Error:', error);
    throw error;
  }

  console.log(`✅ [getServiceRequestsByServiceType] Found ${data?.length || 0} requests`);
  return data as ServiceRequestWithDetails[];
}

// Get single service request by ID
export async function getServiceRequestById(requestId: string) {
  console.log('📡 [getServiceRequestById] Fetching request:', requestId);

  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      company:companies(id, name, email),
      service_type:service_types(
        id, 
        name_en, 
        name_tr, 
        slug,
        pricing_basic,
        pricing_standard,
        pricing_premium
      ),
      requester:profiles!requested_by(id, full_name, email),
      approver:profiles!approved_by(id, full_name, email)
    `)
    .eq('id', requestId)
    .single();

  if (error) {
    console.error('❌ [getServiceRequestById] Error:', error);
    throw error;
  }

  console.log('✅ [getServiceRequestById] Request found');
  return data as ServiceRequestWithDetails;
}

// =====================================================
// APPROVE SERVICE REQUEST
// =====================================================

export async function approveServiceRequest(
  requestId: string,
  approvedBy: string
) {
  console.log('✅ [approveServiceRequest] Approving request:', requestId);

  try {
    // 1. Update service_request status
    const { data, error } = await supabase
      .from('service_requests')
      .update({
        status: 'approved',
        reviewed_by: approvedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select(`
        *,
        company:companies(id, name, email),
        service_type:service_types(id, name_en, name_tr, slug)
      `)
      .single();

    if (error) {
      console.error('❌ [approveServiceRequest] Error:', error);
      throw error;
    }

    console.log('✅ [approveServiceRequest] Request approved successfully');
    console.log('🔔 [approveServiceRequest] Trigger will auto-create company_service');

    // Note: Trigger (auto_create_company_service) will automatically
    // create the company_services record

    return data;

  } catch (error) {
    console.error('❌ [approveServiceRequest] Error:', error);
    throw error;
  }
}

// =====================================================
// REJECT SERVICE REQUEST
// =====================================================

export async function rejectServiceRequest(
  requestId: string,
  rejectionReason: string,
  rejectedBy: string
) {
  console.log('❌ [rejectServiceRequest] Rejecting request:', requestId);
  console.log('📝 [rejectServiceRequest] Reason:', rejectionReason);

  try {
    const { data, error } = await supabase
      .from('service_requests')
      .update({
        status: 'rejected',
        admin_notes: rejectionReason, // FIX: Use admin_notes instead of rejection_reason
        reviewed_by: rejectedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select(`
        *,
        company:companies(id, name, email),
        service_type:service_types(id, name_en, name_tr, slug)
      `)
      .single();

    if (error) {
      console.error('❌ [rejectServiceRequest] Error:', error);
      throw error;
    }

    console.log('✅ [rejectServiceRequest] Request rejected successfully');

    return data;

  } catch (error) {
    console.error('❌ [rejectServiceRequest] Error:', error);
    throw error;
  }
}

// =====================================================
// CREATE SERVICE REQUEST (for Company Admin/User)
// =====================================================

export async function createServiceRequest(requestData: {
  company_id: string;
  service_type_id: string;
  package: 'basic' | 'standard' | 'premium';
  requested_by: string;
  notes?: string;
}) {
  console.log('📡 [createServiceRequest] Creating request:', requestData);

  const { data, error } = await supabase
    .from('service_requests')
    .insert([{
      company_id: requestData.company_id,
      service_type_id: requestData.service_type_id,
      package: requestData.package,
      requested_by: requestData.requested_by,
      notes: requestData.notes || null,
      status: 'pending',
    }])
    .select(`
      *,
      service_type:service_types(id, name_en, name_tr, slug)
    `)
    .single();

  if (error) {
    console.error('❌ [createServiceRequest] Error:', error);
    throw error;
  }

  console.log('✅ [createServiceRequest] Request created successfully');
  return data;
}

// =====================================================
// DELETE SERVICE REQUEST
// =====================================================

export async function deleteServiceRequest(requestId: string) {
  console.log('🗑️ [deleteServiceRequest] Deleting request:', requestId);

  const { error } = await supabase
    .from('service_requests')
    .delete()
    .eq('id', requestId);

  if (error) {
    console.error('❌ [deleteServiceRequest] Error:', error);
    throw error;
  }

  console.log('✅ [deleteServiceRequest] Request deleted successfully');
}

// =====================================================
// BULK OPERATIONS
// =====================================================

// Bulk approve multiple requests
export async function bulkApproveServiceRequests(
  requestIds: string[],
  approvedBy: string
) {
  console.log(`📡 [bulkApproveServiceRequests] Approving ${requestIds.length} requests`);

  const results = await Promise.all(
    requestIds.map(id => approveServiceRequest(id, approvedBy))
  );

  console.log(`✅ [bulkApproveServiceRequests] Approved ${results.length} requests`);
  return results;
}

// Bulk reject multiple requests
export async function bulkRejectServiceRequests(
  requestIds: string[],
  rejectionReason: string,
  rejectedBy: string
) {
  console.log(`📡 [bulkRejectServiceRequests] Rejecting ${requestIds.length} requests`);

  const results = await Promise.all(
    requestIds.map(id => rejectServiceRequest(id, rejectionReason, rejectedBy))
  );

  console.log(`✅ [bulkRejectServiceRequests] Rejected ${results.length} requests`);
  return results;
}

// =====================================================
// STATISTICS
// =====================================================

// Get request statistics
export async function getServiceRequestStats() {
  console.log('📊 [getServiceRequestStats] Fetching stats...');

  const { data, error } = await supabase
    .from('service_requests')
    .select('id, status, created_at');

  if (error) {
    console.error('❌ [getServiceRequestStats] Error:', error);
    throw error;
  }

  const stats = {
    total: data.length,
    pending: data.filter(r => r.status === 'pending').length,
    approved: data.filter(r => r.status === 'approved').length,
    rejected: data.filter(r => r.status === 'rejected').length,
  };

  console.log('✅ [getServiceRequestStats] Stats:', stats);
  return stats;
}

// =====================================================
// EXPORT
// =====================================================

export default {
  // Get
  getAllServiceRequests,
  getCompanyServiceRequests,
  getServiceRequestsByServiceType,
  getServiceRequestById,
  
  // Actions
  approveServiceRequest,
  rejectServiceRequest,
  createServiceRequest,
  deleteServiceRequest,
  
  // Bulk
  bulkApproveServiceRequests,
  bulkRejectServiceRequests,
  
  // Stats
  getServiceRequestStats,
};