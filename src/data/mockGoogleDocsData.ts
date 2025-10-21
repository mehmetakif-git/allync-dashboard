export interface GoogleDocsInstance {
  id: string;
  companyId: string;
  instanceName: string;
  googleAccountEmail: string;
  folderId?: string;
  folderName?: string;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export const mockGoogleDocsInstances: GoogleDocsInstance[] = [
  {
    id: '890e8400-e29b-41d4-a716-446655440001',
    companyId: '1',
    instanceName: 'Contract Templates',
    googleAccountEmail: 'legal@techcorp.com',
    folderId: 'folder_contracts_123',
    folderName: 'Legal Contracts 2025',
    connectionStatus: 'connected',
    lastSync: '2025-10-21T10:05:00Z',
    createdAt: '2024-09-05T08:00:00Z',
    updatedAt: '2025-10-21T10:05:00Z'
  },
  {
    id: '890e8400-e29b-41d4-a716-446655440002',
    companyId: '1',
    instanceName: 'Marketing Documents',
    googleAccountEmail: 'marketing@techcorp.com',
    folderId: 'folder_marketing_456',
    folderName: 'Marketing Materials',
    connectionStatus: 'connected',
    lastSync: '2025-10-21T09:30:00Z',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2025-10-21T09:30:00Z'
  }
];

export const connectionStatusColors = {
  'connected': 'text-green-400 bg-green-500/10 border-green-500/30',
  'disconnected': 'text-red-400 bg-red-500/10 border-red-500/30',
  'error': 'text-orange-400 bg-orange-500/10 border-orange-500/30'
};

export const connectionStatusLabels = {
  'connected': 'Connected',
  'disconnected': 'Disconnected',
  'error': 'Error'
};
