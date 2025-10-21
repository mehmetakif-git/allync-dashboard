export interface GoogleDriveInstance {
  id: string;
  companyId: string;
  instanceName: string;
  googleAccountEmail: string;
  rootFolderId?: string;
  rootFolderName?: string;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  storageUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export const mockGoogleDriveInstances: GoogleDriveInstance[] = [
  {
    id: '910e8400-e29b-41d4-a716-446655440001',
    companyId: '1',
    instanceName: 'Sales Files',
    googleAccountEmail: 'sales@techcorp.com',
    rootFolderId: 'drive_sales_root',
    rootFolderName: 'Sales Department',
    connectionStatus: 'connected',
    lastSync: '2025-10-21T10:10:00Z',
    storageUsed: '2.4 GB',
    createdAt: '2024-10-15T08:00:00Z',
    updatedAt: '2025-10-21T10:10:00Z'
  },
  {
    id: '910e8400-e29b-41d4-a716-446655440002',
    companyId: '1',
    instanceName: 'Marketing Assets',
    googleAccountEmail: 'marketing@techcorp.com',
    rootFolderId: 'drive_marketing_root',
    rootFolderName: 'Marketing Department',
    connectionStatus: 'connected',
    lastSync: '2025-10-21T09:40:00Z',
    storageUsed: '5.8 GB',
    createdAt: '2024-11-01T08:00:00Z',
    updatedAt: '2025-10-21T09:40:00Z'
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
