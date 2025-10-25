// src/lib/services/types.ts
// TypeScript Types for Service Suspension System

import type { CompanyService, Invoice } from '../api/types';

// =====================================================
// SERVICE SUSPENSION TYPES
// =====================================================

export type ServiceStatus = 'active' | 'suspended' | 'inactive' | 'maintenance';

export interface ServiceSuspensionHistory {
  id: string;
  company_id: string;
  service_id: string;
  
  // Suspension info
  suspended_at: string;
  suspended_by: string | null; // NULL = auto, UUID = admin
  suspension_reason: string;
  invoice_id: string | null;
  
  // Reactivation info
  reactivated_at: string | null;
  reactivated_by: string | null;
  reactivation_reason: string | null;
  
  // Status
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuspendServiceParams {
  serviceId: string;
  companyId: string;
  reason: string;
  invoiceId?: string | null;
  suspendedBy?: string | null; // NULL = auto, UUID = admin
}

export interface ReactivateServiceParams {
  serviceId: string;
  companyId: string;
  reason: string;
  reactivatedBy?: string | null; // NULL = auto, UUID = admin
}

// =====================================================
// MANUAL INVOICE TYPES
// =====================================================

export interface CreateManualInvoiceParams {
  companyId: string;
  serviceId?: string | null; // NULL for custom invoices
  amount: number;
  description: string;
  customDescription?: string;
  notes?: string;
  dueDate?: string;
  autoSuspendOnOverdue?: boolean;
  createdBy: string; // Super admin UUID
}

export interface ManualInvoiceResponse {
  success: boolean;
  invoice?: Invoice;
  error?: string;
}

// =====================================================
// AUTO-SUSPEND CHECK TYPES
// =====================================================

export interface OverdueInvoiceWithService extends Invoice {
  company_services: CompanyService;
  companies: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AutoSuspendCheckResult {
  checked: number;
  suspended: number;
  skipped: number;
  errors: string[];
}

// =====================================================
// SERVICE CONTROL TYPES
// =====================================================

export interface ServiceControlAction {
  action: 'suspend' | 'reactivate' | 'deactivate';
  serviceId: string;
  companyId: string;
  reason: string;
  performedBy: string; // Admin UUID
}

export interface ServiceControlResult {
  success: boolean;
  serviceId: string;
  previousStatus: ServiceStatus;
  newStatus: ServiceStatus;
  historyId?: string;
  error?: string;
}

// =====================================================
// NOTIFICATION TYPES
// =====================================================

export interface SuspensionNotificationData {
  companyName: string;
  companyEmail: string;
  serviceName: string;
  reason: string;
  invoiceNumber?: string;
  invoiceAmount?: number;
  invoiceDueDate?: string;
}

export interface ReactivationNotificationData {
  companyName: string;
  companyEmail: string;
  serviceName: string;
  reason: string;
  invoiceNumber?: string;
}

// =====================================================
// WEBHOOK TYPES
// =====================================================

export interface PaymentWebhookData {
  invoiceId: string;
  status: 'success' | 'failed';
  amount: number;
  paymentGateway: string;
  gatewayPaymentId: string;
  paidAt: string;
}

// =====================================================
// QUERY RESULT TYPES
// =====================================================

export interface ServiceWithSuspensionInfo extends CompanyService {
  suspension_history?: ServiceSuspensionHistory[];
  active_suspension?: ServiceSuspensionHistory;
  last_invoice?: Invoice;
}

export interface CompanyServicesStatus {
  companyId: string;
  companyName: string;
  services: {
    total: number;
    active: number;
    suspended: number;
    inactive: number;
  };
  suspensions: ServiceSuspensionHistory[];
  overdueInvoices: Invoice[];
}