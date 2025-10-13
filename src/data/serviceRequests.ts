export interface ServiceRequest {
  id: string;
  company_id: string;
  company_name: string;
  service_type_id: string;
  service_name: string;
  requested_by: string;
  requested_by_name: string;
  package: 'basic' | 'pro' | 'premium' | 'custom';
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  admin_notes?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export const mockServiceRequests: ServiceRequest[] = [
  {
    id: 'sr-001',
    company_id: 'company-1',
    company_name: 'Tech Corp',
    service_type_id: 'whatsapp-automation',
    service_name: 'WhatsApp Automation',
    requested_by: 'user-1',
    requested_by_name: 'John Doe',
    package: 'pro',
    status: 'pending',
    notes: 'Need this for customer support',
    created_at: '2025-01-15T10:30:00Z',
  },
  {
    id: 'sr-002',
    company_id: 'company-2',
    company_name: 'Beauty Salon TR',
    service_type_id: 'instagram-automation',
    service_name: 'Instagram Automation',
    requested_by: 'user-3',
    requested_by_name: 'Ahmet Yılmaz',
    package: 'basic',
    status: 'approved',
    notes: 'For social media management',
    admin_notes: 'Approved - good use case',
    created_at: '2025-01-14T09:00:00Z',
    reviewed_at: '2025-01-14T10:30:00Z',
    reviewed_by: 'Super Admin',
  },
  {
    id: 'sr-003',
    company_id: 'company-4',
    company_name: 'Digital Agency',
    service_type_id: 'voice-cloning',
    service_name: 'Voice Cloning',
    requested_by: 'user-7',
    requested_by_name: 'Sarah Smith',
    package: 'premium',
    status: 'pending',
    notes: 'For video production projects',
    created_at: '2025-01-15T08:00:00Z',
  },
  {
    id: 'sr-004',
    company_id: 'company-5',
    company_name: 'Law Firm Qatar',
    service_type_id: 'document-ai',
    service_name: 'Document AI',
    requested_by: 'user-9',
    requested_by_name: 'Ali Hassan',
    package: 'pro',
    status: 'pending',
    notes: 'For contract analysis',
    created_at: '2025-01-13T12:00:00Z',
  },
];
