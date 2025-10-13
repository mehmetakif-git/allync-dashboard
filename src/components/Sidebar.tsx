import {
  Home,
  Zap,
  MessageCircle,
  FileText,
  HelpCircle,
  Settings,
  Crown,
  Wrench,
  LogOut,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getCurrentMockUser } from '../utils/mockAuth';
import { serviceTypes } from '../data/services';
import { mockCompanyRequests } from '../pages/Services';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activePage, onPageChange, isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const mockUser = getCurrentMockUser();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const activeServices = Object.keys(mockCompanyRequests)
    .filter(serviceId => mockCompanyRequests[serviceId].status === 'approved')
    .map(serviceId => serviceTypes.find(s => s.id === serviceId))
    .filter(Boolean);

  const navigationItems = [
    { id: 'dashboard', icon: Home, labelKey: 'nav.dashboard', roles: ['super_admin', 'company_admin', 'user'] },
    { id: 'services', icon: Zap, labelKey: 'nav.services', roles: ['super_admin', 'company_admin', 'user'] },
  ];

  const bottomNavigationItems = [
    { id: 'invoices', icon: FileText, labelKey: 'nav.invoices', roles: ['super_admin', 'company_admin'] },
    { id: 'support', icon: HelpCircle, labelKey: 'nav.support', roles: ['super_admin', 'company_admin', 'user'] },
    { id: 'settings', icon: Settings, labelKey: 'nav.settings', roles: ['super_admin', 'company_admin', 'user'] },
    { id: 'maintenance', icon: Wrench, labelKey: 'nav.maintenance', roles: ['super_admin'] },
  ];

  const visibleItems = navigationItems.filter((item) =>
    item.roles.includes(mockUser.role)
  );

  const visibleBottomItems = bottomNavigationItems.filter((item) =>
    item.roles.includes(mockUser.role)
  );

  const handleNavClick = (pageId: string) => {
    onPageChange(pageId);
    if (window.innerWidth < 1024) {
      onClose();
    }
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
        className={`fixed lg:sticky top-0 left-0 h-screen bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64`}
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
              ALLYNC
            </div>
            <span className="font-bold text-lg text-white">Allync</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {visibleItems.map((item) => {
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
                    <span className="font-medium">{t(item.labelKey)}</span>
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
                  const pageId = service.id === 'whatsapp-automation' ? 'whatsapp' : `service/${service.slug}`;
                  const isActive = activePage === pageId || activePage === service.id;
                  return (
                    <li key={service.id}>
                      <button
                        onClick={() => handleNavClick(pageId)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{service.name_en}</span>
                      </button>
                    </li>
                  );
                })}
              </>
            )}

            <li className="pt-6">
              <div className="border-t border-gray-800 mb-2"></div>
            </li>

            {visibleBottomItems.map((item) => {
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
                    <span className="font-medium">{t(item.labelKey)}</span>
                  </button>
                </li>
              );
            })}

            {mockUser.role === 'super_admin' && (
              <li>
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activePage === 'admin'
                      ? 'bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-800/50 text-red-300'
                      : 'bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-800/50 text-red-300 hover:from-red-900/50 hover:to-orange-900/50'
                  }`}
                >
                  <Shield className="w-5 h-5 text-red-400" />
                  <span className="font-medium">Admin Panel</span>
                </button>
              </li>
            )}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-medium">
              {getInitials(mockUser.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{mockUser.name}</div>
              <div className="text-xs text-gray-400">
                {mockUser.role === 'super_admin' ? 'Super Admin' : mockUser.role === 'company_admin' ? 'Company Admin' : 'User'}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            {t('nav.logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
