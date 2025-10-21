export interface GooglePhotosInstance {
  id: string;
  companyId: string;
  instanceName: string;
  googleAccountEmail: string;
  albumId?: string;
  albumName?: string;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  photoCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const mockGooglePhotosInstances: GooglePhotosInstance[] = [
  {
    id: '920e8400-e29b-41d4-a716-446655440001',
    companyId: '1',
    instanceName: 'Product Photos',
    googleAccountEmail: 'products@techcorp.com',
    albumId: 'album_products_123',
    albumName: 'Product Catalog 2025',
    connectionStatus: 'connected',
    lastSync: '2025-10-21T10:25:00Z',
    photoCount: 1247,
    createdAt: '2024-11-25T08:00:00Z',
    updatedAt: '2025-10-21T10:25:00Z'
  },
  {
    id: '920e8400-e29b-41d4-a716-446655440002',
    companyId: '1',
    instanceName: 'Event Gallery',
    googleAccountEmail: 'events@techcorp.com',
    albumId: 'album_events_456',
    albumName: 'Company Events',
    connectionStatus: 'connected',
    lastSync: '2025-10-21T08:50:00Z',
    photoCount: 583,
    createdAt: '2024-12-10T08:00:00Z',
    updatedAt: '2025-10-21T08:50:00Z'
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
