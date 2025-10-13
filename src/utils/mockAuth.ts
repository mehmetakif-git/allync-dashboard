export type UserRole = 'super_admin' | 'company_admin' | 'user';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  companyName: string;
}

export const mockUsers: Record<UserRole, MockUser> = {
  super_admin: {
    id: '1',
    name: 'Super Admin (You)',
    email: 'admin@allync.com',
    role: 'super_admin',
    companyId: 'system',
    companyName: 'Allync System',
  },
  company_admin: {
    id: '2',
    name: 'Company Admin Demo',
    email: 'admin@techcorp.com',
    role: 'company_admin',
    companyId: 'company-1',
    companyName: 'Tech Corp',
  },
  user: {
    id: '3',
    name: 'Regular User Demo',
    email: 'user@techcorp.com',
    role: 'user',
    companyId: 'company-1',
    companyName: 'Tech Corp',
  },
};

export function getCurrentMockUser(): MockUser {
  if (typeof window === 'undefined') return mockUsers.super_admin;

  const savedRole = localStorage.getItem('mockUserRole') as UserRole;
  return mockUsers[savedRole] || mockUsers.super_admin;
}

export function setMockUserRole(role: UserRole) {
  localStorage.setItem('mockUserRole', role);
  window.location.reload();
}
