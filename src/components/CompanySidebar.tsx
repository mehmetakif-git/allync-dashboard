import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Package, FileText, HelpCircle, Settings, LogOut, X,
  MessageCircle, Instagram, Calendar, Sheet, Mail,
  FolderOpen, Image, Mic, Heart, Globe, Smartphone, AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';
import { getCompanyServices } from '../lib/api/companyServices';

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
  const [companyServices, setCompanyServices] = useState<any[]>([]);

  const isCompanyAdmin = user?.role === 'company_admin';

  // Fetch company service instances
  useEffect(() => {
    const fetchServices = async () => {
      if (!user?.company_id) return;

      try {
        const services = await getCompanyServices(user.company_id);
        // Filter only active services for sidebar display
        const activeServices = services.filter((s: any) => s.status === 'active');
        setCompanyServices(activeServices);
        console.log('🔍 [CompanySidebar] Company Services:', activeServices);
      } catch (err) {
        console.error('❌ [CompanySidebar] Error fetching services:', err);
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
    const slugMap: Record<string, string> = {
      'whatsapp-automation': 'whatsapp',
      'instagram-automation': 'instagram',
      'google-calendar-integration': 'calendar',
      'google-sheets-integration': 'sheets',
      'gmail-integration': 'gmail',
      'google-docs-integration': 'docs',
      'google-drive-integration': 'drive',
      'google-photos-integration': 'photos',
      'website-development': 'website',
      'mobile-app-development': 'mobile-app'
    };

    return `/dashboard/services/${slugMap[slug] || slug}`;
  };

  // Map service slug to icon
  const getServiceIcon = (slug: string) => {
    const iconMap: Record<string, any> = {
      'whatsapp-automation': MessageCircle,
      'instagram-automation': Instagram,
      'google-calendar-integration': Calendar,
      'google-calendar': Calendar,
      'google-sheets-integration': Sheet,
      'google-sheets': Sheet,
      'gmail-integration': Mail,
      'gmail': Mail,
      'google-docs-integration': FileText,
      'google-docs': FileText,
      'google-drive-integration': FolderOpen,
      'google-drive': FolderOpen,
      'google-photos-integration': Image,
      'google-photos': Image,
      'voice-cloning': Mic,
      'sentiment-analysis': Heart,
      'website-development': Globe,
      'mobile-app-development': Smartphone
    };

    return iconMap[slug] || Package;
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
        className={`fixed lg:sticky top-0 left-0 h-screen bg-primary border-r border-primary flex flex-col overflow-y-auto custom-scrollbar transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } w-72`}
      >
        {/* Header */}
        <div className="p-6 border-b border-primary flex items-center justify-between">
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
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5 text-muted" />
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-muted hover:bg-secondary hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}

            {/* Active Service Instances */}
            {companyServices.length > 0 && (
              <>
                <li className="pt-4 pb-2">
                  <div className="text-xs font-semibold text-muted uppercase px-4">
                    ACTIVE SERVICES
                  </div>
                </li>
                {companyServices.map((companyService: any) => {
                  const service = companyService.service_type;
                  if (!service) return null;

                  const path = getServicePath(service.slug);
                  const active = isActive(path);
                  const ServiceIcon = getServiceIcon(service.slug);
                  const instanceName = companyService.instance_name || service.name_en;

                  // Show instance count badge if there are multiple instances of same service type
                  const sameTypeCount = companyServices.filter(
                    (cs: any) => cs.service_type_id === companyService.service_type_id
                  ).length;

                  return (
                    <li key={companyService.id}>
                      <button
                        onClick={() => handleNavClick(path)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 border-l-4 ${active
                            ? 'bg-blue-600 text-white shadow-lg border-l-blue-400'
                            : 'text-muted hover:bg-secondary/80 hover:text-white hover:border-l-green-400 border-l-green-500/50'
                          }`}
                        title={`${instanceName}${sameTypeCount > 1 ? ` (${sameTypeCount} instances)` : ''}`}
                      >
                        <ServiceIcon className="w-5 h-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium block truncate">{instanceName}</span>
                          {sameTypeCount > 1 && (
                            <span className="text-xs text-blue-300 block truncate">{service.name_en}</span>
                          )}
                        </div>
                        {sameTypeCount > 1 && (
                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full flex-shrink-0">
                            {companyServices.filter((cs: any) => cs.service_type_id === companyService.service_type_id).indexOf(companyService) + 1}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </>
            )}

            {/* Bottom Menu */}
            <li className="pt-6">
              <div className="border-t border-primary mb-2"></div>
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-muted hover:bg-secondary hover:text-white'
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
        <div className="p-4 border-t border-primary bg-primary/50">
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