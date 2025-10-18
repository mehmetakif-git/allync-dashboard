import { useState } from 'react';
import { Home, Package, FileText, HelpCircle, Settings, LogOut } from 'lucide-react';
import ExpandableSidebar from './ExpandableSidebar';
import { useAuth } from '../context/AuthContext';
import { mockCompanyRequests, serviceTypes } from '../data/services';
import ConfirmationDialog from './ConfirmationDialog';

interface CompanySidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompanySidebar({
  activePage,
  onPageChange,
  isOpen,
  onClose,
}: CompanySidebarProps) {
  const { user, logout } = useAuth();
  const isCompanyAdmin = user?.role === 'COMPANY_ADMIN';
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const activeServices = Object.keys(mockCompanyRequests)
    .filter((serviceSlug) => mockCompanyRequests[serviceSlug].status === 'approved')
    .map((serviceSlug) => serviceTypes.find((s) => s.slug === serviceSlug))
    .filter(Boolean);

  const handleNavClick = (pageId: string) => {
    onPageChange(pageId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const mainItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      onClick: () => handleNavClick('dashboard'),
      isActive: activePage === 'dashboard',
    },
    {
      id: 'services',
      label: 'Services',
      icon: Package,
      onClick: () => handleNavClick('services'),
      isActive: activePage === 'services',
    },
  ];

  const activeServiceItems = activeServices.map((service: any) => {
    const Icon = service.icon;
    const pageId = service.slug;
    return {
      id: service.id,
      label: service.name_en,
      icon: Icon,
      onClick: () => handleNavClick(pageId),
      isActive: activePage === pageId,
      badge: undefined,
    };
  });

  const bottomItems = [
    ...(isCompanyAdmin
      ? [
          {
            id: 'invoices',
            label: 'Invoices',
            icon: FileText,
            onClick: () => handleNavClick('invoices'),
            isActive: activePage === 'invoices',
          },
        ]
      : []),
    {
      id: 'support',
      label: 'Support',
      icon: HelpCircle,
      onClick: () => handleNavClick('support'),
      isActive: activePage === 'support',
    },
    ...(isCompanyAdmin
      ? [
          {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            onClick: () => handleNavClick('settings'),
            isActive: activePage === 'settings',
          },
        ]
      : []),
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      onClick: () => setShowLogoutConfirm(true),
      isActive: false,
    },
  ];

  const sections = [
    {
      items: mainItems,
    },
    ...(activeServiceItems.length > 0
      ? [
          {
            title: 'Active Services',
            items: activeServiceItems,
          },
        ]
      : []),
    {
      items: bottomItems,
    },
  ];

  return (
    <>
      <ExpandableSidebar
        logo={{
          icon: '/logo-white.svg',
          title: 'Allync',
          subtitle: isCompanyAdmin ? 'Company Admin' : 'User',
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
