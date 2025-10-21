export interface WebsiteMilestone {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  progress: number;
  completedDate?: string;
  notes?: string;
}

export interface WebsiteProject {
  id: string;
  companyId: string;
  projectType: 'e-commerce' | 'corporate' | 'personal';
  domain: string;
  email: string;
  estimatedCompletion: string;
  lastUpdate: string;
  overallProgress: number;
  milestones: WebsiteMilestone[];
}

export const mockWebsiteProjects: WebsiteProject[] = [
  {
    id: 'wp-1',
    companyId: '1',
    projectType: 'e-commerce',
    domain: 'www.techcorp-store.com',
    email: 'admin@techcorp-store.com',
    estimatedCompletion: '2025-12-15',
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    overallProgress: 65,
    milestones: [
      {
        id: 'm1',
        title: 'Domain Setup',
        status: 'completed',
        progress: 100,
        completedDate: '2025-10-01',
        notes: 'Domain registered and DNS configured'
      },
      {
        id: 'm2',
        title: 'Email Configuration',
        status: 'completed',
        progress: 100,
        completedDate: '2025-10-05',
        notes: 'Google Workspace configured with 5 email accounts'
      },
      {
        id: 'm3',
        title: 'Homepage Design',
        status: 'in-progress',
        progress: 80,
        notes: 'Final revisions in progress'
      },
      {
        id: 'm4',
        title: 'Product Pages',
        status: 'pending',
        progress: 0,
        notes: 'Waiting for product images and descriptions'
      },
      {
        id: 'm5',
        title: 'Shopping Cart Integration',
        status: 'pending',
        progress: 0
      },
      {
        id: 'm6',
        title: 'Payment Gateway Setup',
        status: 'pending',
        progress: 0
      },
      {
        id: 'm7',
        title: 'Testing & QA',
        status: 'pending',
        progress: 0
      },
      {
        id: 'm8',
        title: 'Launch & Deployment',
        status: 'pending',
        progress: 0
      }
    ]
  }
];

export const projectTypeLabels = {
  'e-commerce': 'E-commerce Website',
  'corporate': 'Corporate Website',
  'personal': 'Personal Website'
};

export const statusLabels = {
  'completed': 'Completed',
  'in-progress': 'In Progress',
  'pending': 'Pending',
  'blocked': 'Blocked'
};

export const statusColors = {
  'completed': 'text-green-400',
  'in-progress': 'text-blue-400',
  'pending': 'text-gray-400',
  'blocked': 'text-red-400'
};

export const statusBgColors = {
  'completed': 'bg-green-500/10 border-green-500/20',
  'in-progress': 'bg-blue-500/10 border-blue-500/20',
  'pending': 'bg-gray-500/10 border-gray-500/20',
  'blocked': 'bg-red-500/10 border-red-500/20'
};

export const statusIcons = {
  'completed': 'CheckCircle2',
  'in-progress': 'Clock',
  'pending': 'Circle',
  'blocked': 'XCircle'
};
