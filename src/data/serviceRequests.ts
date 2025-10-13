export interface ServiceRequest {
  id: string;
  companyId: string;
  companyName: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  requestedBy: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export const mockServiceRequests: ServiceRequest[] = [
  {
    id: 'REQ-001',
    companyId: 'company-1',
    companyName: 'Tech Corp',
    serviceId: 'whatsapp',
    serviceName: 'WhatsApp Automation',
    status: 'pending',
    requestedAt: '2025-01-15T10:30:00Z',
    requestedBy: 'John Doe',
  },
  {
    id: 'REQ-002',
    companyId: 'company-2',
    companyName: 'Beauty Salon TR',
    serviceId: 'instagram',
    serviceName: 'Instagram Automation',
    status: 'approved',
    requestedAt: '2025-01-14T09:00:00Z',
    requestedBy: 'Ahmet Yılmaz',
    reviewedAt: '2025-01-14T10:30:00Z',
    reviewedBy: 'Super Admin',
  },
  {
    id: 'REQ-003',
    companyId: 'company-3',
    companyName: 'Digital Agency',
    serviceId: 'voice-cloning',
    serviceName: 'Voice Cloning',
    status: 'pending',
    requestedAt: '2025-01-14T15:00:00Z',
    requestedBy: 'Sarah Smith',
  },
  {
    id: 'REQ-004',
    companyId: 'company-4',
    companyName: 'Law Firm Qatar',
    serviceId: 'document-ai',
    serviceName: 'Document AI',
    status: 'pending',
    requestedAt: '2025-01-13T12:00:00Z',
    requestedBy: 'Ali Hassan',
  },
];
