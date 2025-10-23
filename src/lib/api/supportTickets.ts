import { supabase } from '../supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface SupportTicket {
  id: string;
  ticket_number: string; // TKT-2025-001
  company_id: string;
  created_by: string;
  assigned_to: string | null;
  
  // Ticket content
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'waiting_customer';
  
  // Service relation
  service_type_id: string | null;
  
  // Resolution
  resolution_notes: string | null;
  satisfaction_rating: number | null; // 1-5
  
  // Meta
  metadata: any; // jsonb
  tags: string[] | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  first_response_at: string | null;
  response_time: number | null; // seconds
  resolution_time: number | null; // seconds
}

export interface SupportTicketSummary {
  company_id: string;
  company_name: string;
  open_count: number;
  in_progress_count: number;
  waiting_customer_count: number;
  resolved_count: number;
  closed_count: number;
  urgent_count: number;
  high_count: number;
  avg_response_time: number | null;
  avg_resolution_time: number | null;
  avg_satisfaction: number | null;
  last_ticket_update: string | null;
}

// =====================================================
// CRUD OPERATIONS
// =====================================================

// Get all tickets (for Super Admin)
export async function getAllTickets() {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      company:companies(
        id,
        name
      ),
      creator:profiles!created_by(
        id,
        full_name,
        email
      ),
      assignee:profiles!assigned_to(
        id,
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all tickets:', error);
    throw error;
  }

  return data;
}

// Get all tickets WITH service type (use after service_types table is created)
export async function getAllTicketsWithServiceType() {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      company:companies(
        id,
        name
      ),
      creator:profiles!created_by(
        id,
        full_name,
        email
      ),
      assignee:profiles!assigned_to(
        id,
        full_name,
        email
      ),
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all tickets with service type:', error);
    throw error;
  }

  return data;
}

// Get tickets by company
export async function getTicketsByCompany(companyId: string) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      company:companies(
        id,
        name
      ),
      creator:profiles!created_by(
        id,
        full_name,
        email
      ),
      assignee:profiles!assigned_to(
        id,
        full_name,
        email
      )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching company tickets:', error);
    throw error;
  }

  return data;
}

// Get ticket by ID
export async function getTicketById(ticketId: string) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      company:companies(
        id,
        name,
        email
      ),
      creator:profiles!created_by(
        id,
        full_name,
        email,
        avatar_url
      ),
      assignee:profiles!assigned_to(
        id,
        full_name,
        email,
        avatar_url
      ),
    `)
    .eq('id', ticketId)
    .single();

  if (error) {
    console.error('Error fetching ticket:', error);
    throw error;
  }

  return data;
}

// Create ticket
export async function createTicket(ticketData: {
  company_id: string;
  created_by: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  service_type_id?: string;
  tags?: string[];
}) {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert([{
      ...ticketData,
      status: 'open',
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }

  return data as SupportTicket;
}

// Update ticket
export async function updateTicket(ticketId: string, updates: Partial<SupportTicket>) {
  const { data, error } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }

  return data as SupportTicket;
}

// Delete ticket
export async function deleteTicket(ticketId: string) {
  const { error } = await supabase
    .from('support_tickets')
    .delete()
    .eq('id', ticketId);

  if (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
}

// =====================================================
// SPECIALIZED OPERATIONS
// =====================================================

// Update ticket status
export async function updateTicketStatus(
  ticketId: string,
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'waiting_customer'
) {
  const updates: any = { status };

  // Auto-set timestamps
  if (status === 'resolved' || status === 'closed') {
    const now = new Date().toISOString();
    if (status === 'resolved') {
      updates.resolved_at = now;
    }
    if (status === 'closed') {
      updates.closed_at = now;
    }
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }

  return data as SupportTicket;
}

// Assign ticket to user
export async function assignTicket(ticketId: string, assignedTo: string | null) {
  const updates: any = { assigned_to: assignedTo };

  // Set first_response_at if this is the first assignment
  const { data: currentTicket } = await supabase
    .from('support_tickets')
    .select('first_response_at')
    .eq('id', ticketId)
    .single();

  if (currentTicket && !currentTicket.first_response_at && assignedTo) {
    updates.first_response_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    console.error('Error assigning ticket:', error);
    throw error;
  }

  return data as SupportTicket;
}

// Add resolution note
export async function addResolutionNote(ticketId: string, resolutionNotes: string) {
  const { data, error } = await supabase
    .from('support_tickets')
    .update({
      resolution_notes: resolutionNotes,
      status: 'resolved',
      resolved_at: new Date().toISOString()
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    console.error('Error adding resolution note:', error);
    throw error;
  }

  return data as SupportTicket;
}

// Update satisfaction rating
export async function updateSatisfactionRating(ticketId: string, rating: number) {
  const { data, error } = await supabase
    .from('support_tickets')
    .update({ satisfaction_rating: rating })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    console.error('Error updating satisfaction rating:', error);
    throw error;
  }

  return data as SupportTicket;
}

// =====================================================
// STATISTICS & ANALYTICS
// =====================================================

// Get ticket summary (from view)
export async function getTicketsSummary() {
  const { data, error } = await supabase
    .from('support_ticket_summary')
    .select('*')
    .order('last_ticket_update', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Error fetching tickets summary:', error);
    throw error;
  }

  return data as SupportTicketSummary[];
}

// Get company ticket summary
export async function getCompanyTicketSummary(companyId: string) {
  const { data, error } = await supabase
    .from('support_ticket_summary')
    .select('*')
    .eq('company_id', companyId)
    .single();

  if (error) {
    console.error('Error fetching company ticket summary:', error);
    throw error;
  }

  return data as SupportTicketSummary;
}

// Get tickets by status
export async function getTicketsByStatus(
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'waiting_customer'
) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      company:companies(
        id,
        name
      ),
      creator:profiles!created_by(
        id,
        full_name,
        email
      ),
      assignee:profiles!assigned_to(
        id,
        full_name,
        email
      )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets by status:', error);
    throw error;
  }

  return data;
}

// Get tickets by priority
export async function getTicketsByPriority(
  priority: 'low' | 'medium' | 'high' | 'urgent'
) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      company:companies(
        id,
        name
      ),
      creator:profiles!created_by(
        id,
        full_name,
        email
      ),
      assignee:profiles!assigned_to(
        id,
        full_name,
        email
      )
    `)
    .eq('priority', priority)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets by priority:', error);
    throw error;
  }

  return data;
}

// Get tickets assigned to user
export async function getTicketsAssignedTo(userId: string) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      company:companies(
        id,
        name
      ),
      creator:profiles!created_by(
        id,
        full_name,
        email
      )
    `)
    .eq('assigned_to', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assigned tickets:', error);
    throw error;
  }

  return data;
}

// =====================================================
// TICKET MESSAGES / REPLIES
// =====================================================

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal: boolean;
  is_from_support: boolean;
  attachments: any[];
  metadata: any;
  created_at: string;
  updated_at: string;
}

// Get messages for a ticket
export async function getTicketMessages(ticketId: string, includeInternal: boolean = true) {
  let query = supabase
    .from('support_ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  // Filter out internal messages for non-support users
  if (!includeInternal) {
    query = query.eq('is_internal', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching ticket messages:', error);
    throw error;
  }

  return data;
}

// Create a new message/reply
export async function createTicketMessage(messageData: {
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal?: boolean;
  is_from_support?: boolean;
  attachments?: any[];
}) {
  const { data, error } = await supabase
    .from('support_ticket_messages')
    .insert([{
      ticket_id: messageData.ticket_id,
      sender_id: messageData.sender_id,
      message: messageData.message,
      is_internal: messageData.is_internal || false,
      is_from_support: messageData.is_from_support || false,
      attachments: messageData.attachments || [],
    }])
    .select('*')
    .single();

  if (error) {
    console.error('Error creating ticket message:', error);
    throw error;
  }

  return data;
}

// Update a message
export async function updateTicketMessage(messageId: string, updates: Partial<TicketMessage>) {
  const { data, error } = await supabase
    .from('support_ticket_messages')
    .update(updates)
    .eq('id', messageId)
    .select()
    .single();

  if (error) {
    console.error('Error updating ticket message:', error);
    throw error;
  }

  return data as TicketMessage;
}

// Delete a message
export async function deleteTicketMessage(messageId: string) {
  const { error } = await supabase
    .from('support_ticket_messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting ticket message:', error);
    throw error;
  }
}

// Get message count for a ticket
export async function getTicketMessageCount(ticketId: string) {
  const { count, error } = await supabase
    .from('support_ticket_messages')
    .select('*', { count: 'exact', head: true })
    .eq('ticket_id', ticketId)
    .eq('is_internal', false);

  if (error) {
    console.error('Error fetching message count:', error);
    throw error;
  }

  return count || 0;
}

// =====================================================
// TICKET CATEGORIES
// =====================================================

export interface TicketCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  sort_order: number;
  parent_id: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

// Get all active categories
export async function getTicketCategories() {
  const { data, error } = await supabase
    .from('support_ticket_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching ticket categories:', error);
    throw error;
  }

  return data as TicketCategory[];
}

// Get all categories (including inactive - for admin)
export async function getAllTicketCategories() {
  const { data, error } = await supabase
    .from('support_ticket_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching all ticket categories:', error);
    throw error;
  }

  return data as TicketCategory[];
}

// Get category by ID
export async function getTicketCategoryById(categoryId: string) {
  const { data, error } = await supabase
    .from('support_ticket_categories')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (error) {
    console.error('Error fetching ticket category:', error);
    throw error;
  }

  return data as TicketCategory;
}

// Create new category
export async function createTicketCategory(categoryData: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_id?: string;
  sort_order?: number;
}) {
  const { data, error } = await supabase
    .from('support_ticket_categories')
    .insert([categoryData])
    .select()
    .single();

  if (error) {
    console.error('Error creating ticket category:', error);
    throw error;
  }

  return data as TicketCategory;
}

// Update category
export async function updateTicketCategory(categoryId: string, updates: Partial<TicketCategory>) {
  const { data, error } = await supabase
    .from('support_ticket_categories')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating ticket category:', error);
    throw error;
  }

  return data as TicketCategory;
}

// Delete category
export async function deleteTicketCategory(categoryId: string) {
  const { error } = await supabase
    .from('support_ticket_categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting ticket category:', error);
    throw error;
  }
}

// Get category statistics
export async function getTicketCategoryStats() {
  const { data, error } = await supabase
    .from('ticket_category_stats')
    .select('*')
    .order('total_tickets', { ascending: false });

  if (error) {
    console.error('Error fetching ticket category stats:', error);
    throw error;
  }

  return data;
}

// =====================================================
// SLA TRACKING & MONITORING
// =====================================================

export interface SLAConfig {
  id: string;
  name: string;
  description: string | null;
  response_time_urgent: number;
  response_time_high: number;
  response_time_medium: number;
  response_time_low: number;
  resolution_time_urgent: number;
  resolution_time_high: number;
  resolution_time_medium: number;
  resolution_time_low: number;
  business_hours_start: string;
  business_hours_end: string;
  business_days: number[];
  timezone: string;
  warning_threshold: number;
  critical_threshold: number;
  is_active: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface TicketSLAStatus {
  ticket_id: string;
  ticket_number: string;
  subject: string;
  priority: string;
  status: string;
  company_id: string;
  company_name: string;
  created_at: string;
  first_response_at: string | null;
  resolved_at: string | null;
  current_response_time: number;
  current_resolution_time: number;
  response_time_target: number;
  resolution_time_target: number;
  response_sla_status: 'ok' | 'warning' | 'critical' | 'violated' | 'met';
  resolution_sla_status: 'ok' | 'warning' | 'critical' | 'violated' | 'met';
}

export interface SLAPerformanceSummary {
  total_tickets: number;
  response_met: number;
  response_violated: number;
  resolution_met: number;
  resolution_violated: number;
  response_sla_percentage: number;
  resolution_sla_percentage: number;
  avg_response_time: number;
  avg_resolution_time: number;
}

// Get active SLA configuration
export async function getActiveSLAConfig() {
  const { data, error } = await supabase
    .from('support_sla_config')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching SLA config:', error);
    throw error;
  }

  return data as SLAConfig;
}

// Get all SLA configurations
export async function getAllSLAConfigs() {
  const { data, error } = await supabase
    .from('support_sla_config')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching SLA configs:', error);
    throw error;
  }

  return data as SLAConfig[];
}

// Update SLA configuration
export async function updateSLAConfig(configId: string, updates: Partial<SLAConfig>) {
  const { data, error } = await supabase
    .from('support_sla_config')
    .update(updates)
    .eq('id', configId)
    .select()
    .single();

  if (error) {
    console.error('Error updating SLA config:', error);
    throw error;
  }

  return data as SLAConfig;
}

// Get SLA status for all tickets
export async function getTicketsSLAStatus() {
  const { data, error } = await supabase
    .from('ticket_sla_status')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets SLA status:', error);
    throw error;
  }

  return data as TicketSLAStatus[];
}

// Get SLA status for specific ticket
export async function getTicketSLAStatus(ticketId: string) {
  const { data, error } = await supabase
    .from('ticket_sla_status')
    .select('*')
    .eq('ticket_id', ticketId)
    .single();

  if (error) {
    console.error('Error fetching ticket SLA status:', error);
    throw error;
  }

  return data as TicketSLAStatus;
}

// Get tickets with SLA violations
export async function getTicketsWithSLAViolations(violationType?: 'response' | 'resolution') {
  let query = supabase
    .from('ticket_sla_status')
    .select('*');

  if (violationType === 'response') {
    query = query.in('response_sla_status', ['violated', 'critical', 'warning']);
  } else if (violationType === 'resolution') {
    query = query.in('resolution_sla_status', ['violated', 'critical', 'warning']);
  } else {
    query = query.or(
      'response_sla_status.in.(violated,critical,warning),resolution_sla_status.in.(violated,critical,warning)'
    );
  }

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching tickets with SLA violations:', error);
    throw error;
  }

  return data as TicketSLAStatus[];
}

// Get SLA performance summary
export async function getSLAPerformanceSummary() {
  const { data, error } = await supabase
    .from('sla_performance_summary')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching SLA performance summary:', error);
    throw error;
  }

  return data as SLAPerformanceSummary;
}

// Get SLA performance by company
export async function getSLAPerformanceByCompany() {
  const { data, error } = await supabase
    .from('ticket_sla_status')
    .select('company_id, company_name, response_sla_status, resolution_sla_status');

  if (error) {
    console.error('Error fetching SLA performance by company:', error);
    throw error;
  }

  // Group by company and calculate stats
  const companyStats = data.reduce((acc: any, ticket: any) => {
    const companyId = ticket.company_id;
    if (!acc[companyId]) {
      acc[companyId] = {
        company_id: companyId,
        company_name: ticket.company_name,
        total: 0,
        response_met: 0,
        response_violated: 0,
        resolution_met: 0,
        resolution_violated: 0,
      };
    }
    acc[companyId].total++;
    if (ticket.response_sla_status === 'met') acc[companyId].response_met++;
    if (ticket.response_sla_status === 'violated') acc[companyId].response_violated++;
    if (ticket.resolution_sla_status === 'met') acc[companyId].resolution_met++;
    if (ticket.resolution_sla_status === 'violated') acc[companyId].resolution_violated++;
    return acc;
  }, {});

  return Object.values(companyStats);
}

// Format time duration for display
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

// Get SLA badge color
export function getSLABadgeColor(status: string): string {
  switch (status) {
    case 'met': return 'bg-green-500/10 text-green-500 border-green-500/30';
    case 'ok': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
    case 'critical': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
    case 'violated': return 'bg-red-500/10 text-red-500 border-red-500/30';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
  }
}