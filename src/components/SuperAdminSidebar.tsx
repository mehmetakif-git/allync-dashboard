import { useState } from 'react';
import { Home, Package, Building2, Users, Bell, DollarSign, FileText, HelpCircle, Settings, Wrench, Activity, LogOut } from 'lucide-react';
import ExpandableSidebar from './ExpandableSidebar';
import { useAuth } from '../context/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';

interface SuperAdminSidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SuperAdminSidebar({
  activePage,
  onPageChange,
  isOpen,
  onClose,
}: SuperAdminSidebarProps) {
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleNavClick = (pageId: string) => {
    window.location.hash = pageId;
    onPageChange(pageId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const sections = [
    {
      items: [
        {
          id: 'admin-dashboard',
          label: 'Dashboard',
          icon: Home,
          onClick: () => handleNavClick('admin-dashboard'),
          isActive: activePage === 'admin-dashboard',
        },
        {
          id: 'services-catalog',
          label: 'Services Catalog',
          icon: Package,
          onClick: () => handleNavClick('services-catalog'),
          isActive: activePage === 'services-catalog',
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          id: 'companies-management',
          label: 'Companies',
          icon: Building2,
          onClick: () => handleNavClick('companies-management'),
          isActive: activePage === 'companies-management',
        },
        {
          id: 'users-management',
          label: 'Users',
          icon: Users,
          onClick: () => handleNavClick('users-management'),
          isActive: activePage === 'users-management',
        },
        {
          id: 'notifications-management',
          label: 'Notifications',
          icon: Bell,
          onClick: () => handleNavClick('notifications-management'),
          isActive: activePage === 'notifications-management',
        },
      ],
    },
    {
      title: 'Finance',
      items: [
        {
          id: 'revenue-analytics',
          label: 'Revenue Analytics',
          icon: DollarSign,
          onClick: () => handleNavClick('revenue-analytics'),
          isActive: activePage === 'revenue-analytics',
        },
        {
          id: 'invoices-management',
          label: 'Invoices',
          icon: FileText,
          onClick: () => handleNavClick('invoices-management'),
          isActive: activePage === 'invoices-management',
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          id: 'support-tickets',
          label: 'Support Tickets',
          icon: HelpCircle,
          onClick: () => handleNavClick('support-tickets'),
          isActive: activePage === 'support-tickets',
        },
        {
          id: 'system-settings',
          label: 'System Settings',
          icon: Settings,
          onClick: () => handleNavClick('system-settings'),
          isActive: activePage === 'system-settings',
        },
        {
          id: 'maintenance-mode',
          label: 'Maintenance Mode',
          icon: Wrench,
          onClick: () => handleNavClick('maintenance-mode'),
          isActive: activePage === 'maintenance-mode',
        },
        {
          id: 'activity-logs',
          label: 'Activity Logs',
          icon: Activity,
          onClick: () => handleNavClick('activity-logs'),
          isActive: activePage === 'activity-logs',
        },
        {
          id: 'logout',
          label: 'Logout',
          icon: LogOut,
          onClick: () => setShowLogoutConfirm(true),
          isActive: false,
        },
      ],
    },
  ];

  return (
    <>
      <ExpandableSidebar
        logo={{
          icon: '/logo-white.svg',
          title: 'Allync',
          subtitle: 'Super Admin',
        }}
        sections={sections}
        isOpen={isOpen}
        onClose={onClose}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        confirmColor="from-red-600 to-red-700"
      />
    </>
  );
}
