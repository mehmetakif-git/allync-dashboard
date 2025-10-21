export interface GoogleGmailInstance {
  id: string;
  companyId: string;
  instanceName: string;
  googleAccountEmail: string;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    autoReply: boolean;
    signature?: string;
  };
}

export const mockGoogleGmailInstances: GoogleGmailInstance[] = [
  {
    id: '980e8400-e29b-41d4-a716-446655440001',
    companyId: '1',
    instanceName: 'Sales Inbox',
    googleAccountEmail: 'sales@techcorp.com',
    connectionStatus: 'connected',
    lastSync: '2025-10-21T10:20:00Z',
    createdAt: '2024-08-01T08:00:00Z',
    updatedAt: '2025-10-21T10:20:00Z',
    settings: {
      autoReply: true,
      signature: 'Best regards,\nTech Corp Sales Team'
    }
  },
  {
    id: '980e8400-e29b-41d4-a716-446655440002',
    companyId: '1',
    instanceName: 'Support Inbox',
    googleAccountEmail: 'support@techcorp.com',
    connectionStatus: 'connected',
    lastSync: '2025-10-21T09:55:00Z',
    createdAt: '2024-09-10T08:00:00Z',
    updatedAt: '2025-10-21T09:55:00Z',
    settings: {
      autoReply: true,
      signature: 'Tech Corp Support\nAvailable 24/7'
    }
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
