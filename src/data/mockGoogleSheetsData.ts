export interface GoogleSheetsInstance {
  id: string;
  companyId: string;
  instanceName: string;
  googleAccountEmail: string;
  spreadsheetId?: string;
  spreadsheetName?: string;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export const mockGoogleSheetsInstances: GoogleSheetsInstance[] = [
  {
    id: '870e8400-e29b-41d4-a716-446655440001',
    companyId: '1',
    instanceName: 'Inventory Sheets',
    googleAccountEmail: 'inventory@techcorp.com',
    spreadsheetId: 'sheet_inv_123',
    spreadsheetName: 'Product Inventory 2025',
    connectionStatus: 'connected',
    lastSync: '2025-10-21T10:15:00Z',
    createdAt: '2024-07-15T08:00:00Z',
    updatedAt: '2025-10-21T10:15:00Z'
  },
  {
    id: '870e8400-e29b-41d4-a716-446655440002',
    companyId: '1',
    instanceName: 'Sales Reports',
    googleAccountEmail: 'sales@techcorp.com',
    spreadsheetId: 'sheet_sales_456',
    spreadsheetName: 'Sales Dashboard 2025',
    connectionStatus: 'connected',
    lastSync: '2025-10-21T09:45:00Z',
    createdAt: '2024-08-20T08:00:00Z',
    updatedAt: '2025-10-21T09:45:00Z'
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
