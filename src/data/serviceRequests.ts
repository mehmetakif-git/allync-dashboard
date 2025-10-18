export interface ServiceRequest {
  id: string;
  company_id: string;
  company_name: string;
  service_name: string;
  package: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  approved_at?: string;
}

export const mockServiceRequests: ServiceRequest[] = [
  {
    id: '1',
    company_id: '1',
    company_name: 'Tech Corp',
    service_name: 'WhatsApp Automation',
    package: 'professional',
    status: 'approved',
    requested_at: '2024-03-15T10:00:00Z',
    approved_at: '2024-03-15T14:30:00Z',
  },
  {
    id: '2',
    company_id: '1',
    company_name: 'Tech Corp',
    service_name: 'Instagram Automation',
    package: 'professional',
    status: 'approved',
    requested_at: '2024-04-20T09:00:00Z',
    approved_at: '2024-04-20T11:00:00Z',
  },
  {
    id: '3',
    company_id: '2',
    company_name: 'Digital Solutions Ltd',
    service_name: 'WhatsApp Automation',
    package: 'starter',
    status: 'pending',
    requested_at: '2025-01-18T14:00:00Z',
  },
  {
    id: '4',
    company_id: '3',
    company_name: 'Innovation Hub',
    service_name: 'Instagram Automation',
    package: 'enterprise',
    status: 'approved',
    requested_at: '2024-05-10T10:00:00Z',
    approved_at: '2024-05-10T15:00:00Z',
  },
];
