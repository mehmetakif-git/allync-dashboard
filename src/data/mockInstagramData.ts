export interface InstagramInstance {
  id: string;
  companyId: string;
  instanceName: string;
  username: string;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastSync?: string;
  createdAt: string;
  settings: {
    autoReplyDMs: boolean;
    autoReplyComments: boolean;
    businessHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    welcomeMessage: string;
    awayMessage: string;
  };
}

export const mockInstagramInstances: InstagramInstance[] = [
  {
    id: 'ig-inst-1',
    companyId: '1',
    instanceName: 'Main Account',
    username: '@techcorp_official',
    connectionStatus: 'connected',
    lastSync: '2025-10-21T10:00:00Z',
    createdAt: '2024-05-22T08:00:00Z',
    settings: {
      autoReplyDMs: true,
      autoReplyComments: true,
      businessHours: {
        enabled: true,
        start: '09:00',
        end: '18:00'
      },
      welcomeMessage: 'Thanks for reaching out to Tech Corp! How can we help you today? 😊',
      awayMessage: 'We are currently away. Our team will respond during business hours (9 AM - 6 PM).'
    }
  },
  {
    id: 'ig-inst-2',
    companyId: '1',
    instanceName: 'Support Account',
    username: '@techcorp_support',
    connectionStatus: 'connected',
    lastSync: '2025-10-21T09:45:00Z',
    createdAt: '2024-08-15T08:00:00Z',
    settings: {
      autoReplyDMs: true,
      autoReplyComments: false,
      businessHours: {
        enabled: true,
        start: '08:00',
        end: '20:00'
      },
      welcomeMessage: 'Hi! You have reached Tech Corp Support. Please describe your issue.',
      awayMessage: 'Support team is currently offline. We will respond during business hours.'
    }
  }
];

export const connectionStatusColors = {
  'connected': 'text-green-400 bg-green-500/10 border-green-500/30',
  'disconnected': 'text-red-400 bg-red-500/10 border-red-500/30',
  'connecting': 'text-orange-400 bg-orange-500/10 border-orange-500/30'
};

export const connectionStatusLabels = {
  'connected': 'Connected',
  'disconnected': 'Disconnected',
  'connecting': 'Connecting'
};
