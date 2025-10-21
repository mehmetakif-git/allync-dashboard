export interface WhatsAppInstance {
  id: string;
  companyId: string;
  phoneNumber: string;
  instanceName: string;
  qrCode?: string;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastConnected?: string;
  createdAt: string;
  settings: {
    autoReply: boolean;
    businessHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    welcomeMessage: string;
    awayMessage: string;
  };
}

export const mockWhatsAppInstances: WhatsAppInstance[] = [
  {
    id: 'wa-inst-1',
    companyId: '1',
    phoneNumber: '+974-5555-1234',
    instanceName: 'Customer Support',
    connectionStatus: 'connected',
    lastConnected: '2025-10-21T10:30:00Z',
    createdAt: '2024-03-15T08:00:00Z',
    settings: {
      autoReply: true,
      businessHours: {
        enabled: true,
        start: '09:00',
        end: '18:00'
      },
      welcomeMessage: 'Welcome to Tech Corp Customer Support! How can we help you today?',
      awayMessage: 'We are currently away. Our business hours are 9 AM - 6 PM.'
    }
  },
  {
    id: 'wa-inst-2',
    companyId: '1',
    phoneNumber: '+974-5555-5678',
    instanceName: 'Sales Team',
    connectionStatus: 'connected',
    lastConnected: '2025-10-21T09:15:00Z',
    createdAt: '2024-06-20T08:00:00Z',
    settings: {
      autoReply: true,
      businessHours: {
        enabled: true,
        start: '08:00',
        end: '20:00'
      },
      welcomeMessage: 'Hi! Welcome to Tech Corp Sales. How can we assist you with your purchase?',
      awayMessage: 'Our sales team is currently unavailable. We will respond during business hours.'
    }
  },
  {
    id: 'wa-inst-3',
    companyId: '1',
    phoneNumber: '+974-5555-9999',
    instanceName: 'Technical Support',
    connectionStatus: 'disconnected',
    lastConnected: '2025-10-20T15:45:00Z',
    createdAt: '2024-09-10T08:00:00Z',
    settings: {
      autoReply: false,
      businessHours: {
        enabled: false,
        start: '00:00',
        end: '23:59'
      },
      welcomeMessage: 'Tech Corp Technical Support - Please describe your issue.',
      awayMessage: 'Technical support is available 24/7.'
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
