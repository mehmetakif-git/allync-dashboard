import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, FileText, HelpCircle, Settings, LogOut, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';
import { getServiceRequests, getServiceTypes } from '../lib/api/companies';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  adminOnly?: boolean;
}

interface CompanySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CompanySidebar({ isOpen, onClose }: CompanySidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeServices, setActiveServices] = useState<any[]>([]);
  
  const isCompanyAdmin = user?.role === 'company_admin';

  // Fetch active services
  useEffect(() => {
    const fetchServices = async () => {
      if (!user?.company_id) return;
      
      try {
        const [requests, types] = await Promise.all([
          getServiceRequests(user.company_id),
          getServiceTypes()
        ]);
        
        const approvedIds = requests
          .filter((r: any) => r.status === 'approved')
          .map((r: any) => r.service_type_id);
        
        const services = types.filter((t: any) => approvedIds.includes(t.id));
        setActiveServices(services);
      } catch (err) {
        console.error('Error fetching services:', err);
      }
    };

    fetchServices();
  }, [user?.company_id]);

  const mainMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'services', label: 'Services', icon: Package, path: '/dashboard/services' },
  ];

  const bottomMenuItems: MenuItem[] = [
    { id: 'invoices', label: 'Invoices', icon: FileText, path: '/dashboard/invoices', adminOnly: true },
    { id: 'support', label: 'Support', icon: HelpCircle, path: '/dashboard/support' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings', adminOnly: true },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Map service slug to path
  const getServicePath = (slug: string) => {
    return `/dashboard/services/${slug.replace('-automation', '').replace('-integration', '')}`;
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
        className={`fixed lg:sticky top-0 left-0 h-screen bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto custom-scrollbar transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64`}
      >
        {/* Header */}
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

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {/* Main Menu */}
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}

            {/* Active Services */}
            {activeServices.length > 0 && (
              <>
                <li className="pt-4 pb-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase px-4">
                    ACTIVE SERVICES
                  </div>
                </li>
                {activeServices.map((service: any) => {
                  const path = getServicePath(service.slug);
                  const active = isActive(path);
                  
                  return (
                    <li key={service.id}>
                      <button
                        onClick={() => handleNavClick(path)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                          active
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{service.icon}</span>
                          <span className="font-medium truncate">{service.name_en}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-500 text-xs font-medium rounded flex-shrink-0">
                          Active
                        </span>
                      </button>
                    </li>
                  );
                })}
              </>
            )}

            {/* Bottom Menu */}
            <li className="pt-6">
              <div className="border-t border-gray-800 mb-2"></div>
            </li>

            {bottomMenuItems.map((item) => {
              // Hide admin-only items for regular users
              if (item.adminOnly && !isCompanyAdmin) return null;
              
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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

        {/* Logout */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        confirmColor="from-red-600 to-red-700"
      />
    </>
  );
}