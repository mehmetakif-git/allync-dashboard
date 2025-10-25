export interface MobileAppMilestone {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  progress: number;
  notes?: string;
  completedDate?: string;
  displayOrder: number;
}

export interface MobileAppProject {
  id: string;
  companyId: string;
  projectName: string;
  platform: 'android' | 'ios' | 'both';
  appName: string;
  packageName: string;
  bundleId: string;
  playStoreStatus: 'pending' | 'submitted' | 'in-review' | 'approved' | 'published' | 'rejected';
  playStoreUrl?: string;
  appStoreStatus: 'pending' | 'submitted' | 'in-review' | 'approved' | 'published' | 'rejected';
  appStoreUrl?: string;
  estimatedCompletion: string;
  overallProgress: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  lastUpdate: string;
  milestones: MobileAppMilestone[];
  createdAt: string;
  updatedAt: string;
}

export const mockMobileAppProjects: MobileAppProject[] = [
  {
    id: '650e8400-e29b-41d4-a716-446655440001',
    companyId: '1',
    projectName: 'E-commerce Mobile App',
    platform: 'both',
    appName: 'TechCorp Store',
    packageName: 'com.techcorp.store',
    bundleId: 'com.techcorp.store',
    playStoreStatus: 'submitted',
    appStoreStatus: 'in-review',
    estimatedCompletion: '2025-12-20',
    overallProgress: 50,
    status: 'active',
    lastUpdate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    createdAt: '2025-10-05T08:00:00Z',
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    milestones: [
      {
        id: 'm1',
        title: 'Requirements & Planning',
        status: 'completed',
        progress: 100,
        completedDate: '2025-10-10',
        notes: 'All requirements documented and approved',
        displayOrder: 1
      },
      {
        id: 'm2',
        title: 'UI/UX Design',
        status: 'completed',
        progress: 100,
        completedDate: '2025-10-20',
        notes: 'Design mockups approved for both platforms',
        displayOrder: 2
      },
      {
        id: 'm3',
        title: 'Backend API Development',
        status: 'completed',
        progress: 100,
        completedDate: '2025-11-05',
        notes: 'REST API and authentication complete',
        displayOrder: 3
      },
      {
        id: 'm4',
        title: 'Frontend Development',
        status: 'in-progress',
        progress: 75,
        notes: 'Product catalog and cart features in progress',
        displayOrder: 4
      },
      {
        id: 'm5',
        title: 'Payment Integration',
        status: 'pending',
        progress: 0,
        notes: 'Stripe and Apple Pay integration pending',
        displayOrder: 5
      },
      {
        id: 'm6',
        title: 'Testing & QA',
        status: 'pending',
        progress: 0,
        displayOrder: 6
      },
      {
        id: 'm7',
        title: 'App Store Submission',
        status: 'pending',
        progress: 0,
        displayOrder: 7
      },
      {
        id: 'm8',
        title: 'Launch & Marketing',
        status: 'pending',
        progress: 0,
        displayOrder: 8
      }
    ]
  }
];

export const platformLabels = {
  'android': 'Android',
  'ios': 'iOS',
  'both': 'Android & iOS'
};

export const platformColors = {
  'android': 'from-green-500 to-green-600',
  'ios': 'from-blue-500 to-blue-600',
  'both': 'from-cyan-500 to-blue-600'
};

export const storeStatusLabels = {
  'pending': 'Pending',
  'submitted': 'Submitted',
  'in-review': 'In Review',
  'approved': 'Approved',
  'published': 'Published',
  'rejected': 'Rejected'
};

export const storeStatusColors = {
  'pending': 'text-muted bg-gray-500/10 border-secondary/30',
  'submitted': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  'in-review': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'approved': 'text-green-400 bg-green-500/10 border-green-500/30',
  'published': 'text-green-400 bg-green-500/10 border-green-500/30',
  'rejected': 'text-red-400 bg-red-500/10 border-red-500/30'
};

export const milestoneStatusLabels = {
  'completed': 'Completed',
  'in-progress': 'In Progress',
  'pending': 'Pending',
  'blocked': 'Blocked'
};

export const milestoneStatusColors = {
  'completed': 'text-green-400',
  'in-progress': 'text-blue-400',
  'pending': 'text-muted',
  'blocked': 'text-red-400'
};

export const milestoneStatusBgColors = {
  'completed': 'bg-green-500/10 border-green-500/20',
  'in-progress': 'bg-blue-500/10 border-blue-500/20',
  'pending': 'bg-gray-500/10 border-secondary/20',
  'blocked': 'bg-red-500/10 border-red-500/20'
};
