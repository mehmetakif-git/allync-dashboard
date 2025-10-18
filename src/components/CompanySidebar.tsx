import { Home, Zap, MessageCircle, Instagram, FileText, HelpCircle, Settings, LogOut, X, Package } from 'lucide-react';
import { useState } from 'react';
import { mockCompanyRequests, serviceTypes } from '../data/services';
import { useAuth } from '../context/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';

interface CompanySidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompanySidebar({ activePage, onPageChange, isOpen, onClose }: CompanySidebarProps) {
  const { user, logout } = useAuth();
  const isCompanyAdmin = user?.role === 'COMPANY_ADMIN';
  const isRegularUser = user?.role === 'USER';
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const activeServices = Object.keys(mockCompanyRequests)
    .filter(serviceId => mockCompanyRequests[serviceId].status === 'approved')
    .map(serviceId => serviceTypes.find(s => s.id === serviceId))
    .filter(Boolean);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'services', label: 'Services', icon: Package },
  ];

  const bottomItems = [
    ...(isCompanyAdmin ? [{ id: 'invoices', label: 'Invoices', icon: FileText }] : []),
    { id: 'support', label: 'Support', icon: HelpCircle },
    ...(isCompanyAdmin ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
  ];

  const handleNavClick = (pageId: string) => {
    onPageChange(pageId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const getUserInitials = () => {
    if (isCompanyAdmin) return 'CA';
    if (isRegularUser) return 'U';
    return 'U';
  };

  const getUserRole = () => {
    if (isCompanyAdmin) return 'Company Admin';
    if (isRegularUser) return 'User';
    return 'User';
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64`}
      >
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo-white.svg"
              alt="Allync"
              className="h-10 w-auto"
              onError={(e) => {
                e.currentTarget.src = '/logo-white.png';
              }}
            />
            <div>
              <h2 className="text-white font-bold text-xl">Allync</h2>
              <p className="text-xs text-blue-400">
                {isCompanyAdmin ? 'Company Admin' : 'User'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}

            {activeServices.length > 0 && (
              <>
                <li className="pt-4 pb-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase px-4">Active Services</div>
                </li>
                {activeServices.map((service: any) => {
                  const Icon = service.icon;
                  const pageId = service.id === 'whatsapp-automation' ? 'whatsapp-automation' : `service/${service.slug}`;
                  const isActive = activePage === pageId;
                  return (
                    <li key={service.id}>
                      <button
                        onClick={() => handleNavClick(pageId)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{service.name_en}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-500 text-xs font-medium rounded">
                          Active
                        </span>
                      </button>
                    </li>
                  );
                })}
              </>
            )}

            <li className="pt-6">
              <div className="border-t border-gray-800 mb-2"></div>
            </li>

            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

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
