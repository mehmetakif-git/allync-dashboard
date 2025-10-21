export interface WebsiteMilestone {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  progress: number;
  completedDate?: string;
  notes?: string;
  displayOrder: number;
}

export interface WebsiteProject {
  id: string;
  companyId: string;
  projectName: string;
  projectType: 'e-commerce' | 'corporate' | 'personal';
  domain: string;
  email: string;
  estimatedCompletion: string;
  lastUpdate: string;
  overallProgress: number;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  milestones: WebsiteMilestone[];
  createdAt: string;
  updatedAt: string;
}

export const mockWebsiteProjects: WebsiteProject[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    companyId: '1',
    projectName: 'Main E-commerce Store',
    projectType: 'e-commerce',
    domain: 'www.techcorp-store.com',
    email: 'admin@techcorp-store.com',
    estimatedCompletion: '2025-12-15',
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    overallProgress: 65,
    status: 'active',
    createdAt: '2025-10-01T08:00:00Z',
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    milestones: [
      {
        id: 'm1',
        title: 'Domain Setup',
        status: 'completed',
        progress: 100,
        completedDate: '2025-10-01',
        notes: 'Domain registered and DNS configured',
        displayOrder: 1
      },
      {
        id: 'm2',
        title: 'Email Configuration',
        status: 'completed',
        progress: 100,
        completedDate: '2025-10-05',
        notes: 'Google Workspace configured with 5 email accounts',
        displayOrder: 2
      },
      {
        id: 'm3',
        title: 'Homepage Design',
        status: 'in-progress',
        progress: 80,
        notes: 'Final revisions in progress',
        displayOrder: 3
      },
      {
        id: 'm4',
        title: 'Product Pages',
        status: 'pending',
        progress: 0,
        notes: 'Waiting for product images and descriptions',
        displayOrder: 4
      },
      {
        id: 'm5',
        title: 'Shopping Cart Integration',
        status: 'pending',
        progress: 0,
        displayOrder: 5
      },
      {
        id: 'm6',
        title: 'Payment Gateway Setup',
        status: 'pending',
        progress: 0,
        displayOrder: 6
      },
      {
        id: 'm7',
        title: 'Testing & QA',
        status: 'pending',
        progress: 0,
        displayOrder: 7
      },
      {
        id: 'm8',
        title: 'Launch & Deployment',
        status: 'pending',
        progress: 0,
        displayOrder: 8
      }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    companyId: '1',
    projectName: 'Corporate Landing Page',
    projectType: 'corporate',
    domain: 'www.techcorp.com',
    email: 'info@techcorp.com',
    estimatedCompletion: '2025-11-30',
    lastUpdate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    overallProgress: 85,
    status: 'active',
    createdAt: '2025-09-15T08:00:00Z',
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    milestones: [
      {
        id: 'm9',
        title: 'Domain Setup',
        status: 'completed',
        progress: 100,
        completedDate: '2025-09-16',
        displayOrder: 1
      },
      {
        id: 'm10',
        title: 'Design Mockups',
        status: 'completed',
        progress: 100,
        completedDate: '2025-09-25',
        displayOrder: 2
      },
      {
        id: 'm11',
        title: 'Content Creation',
        status: 'completed',
        progress: 100,
        completedDate: '2025-10-10',
        displayOrder: 3
      },
      {
        id: 'm12',
        title: 'Development',
        status: 'in-progress',
        progress: 90,
        notes: 'Final touches on responsive design',
        displayOrder: 4
      },
      {
        id: 'm13',
        title: 'Testing & Launch',
        status: 'pending',
        progress: 0,
        displayOrder: 5
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
