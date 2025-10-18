import { Home, Zap, MessageCircle, Instagram, Video, Image, Mic, FileText, Play, Film, BarChart3, Sparkles, ShoppingCart, Monitor, Smartphone, Target, Wifi, Cloud, Palette, Wrench, Building2, Users, DollarSign, Receipt, UserPlus, Bell, Settings, Activity, AlertTriangle, LogOut, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';

interface MenuItem {
  id?: string;
  label: string;
  icon?: any;
  section?: string;
  type?: string;
  badge?: number;
}

interface SuperAdminSidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SuperAdminSidebar({ activePage, onPageChange, isOpen, onClose }: SuperAdminSidebarProps) {
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuItems: MenuItem[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: Home, section: 'main' },

    { type: 'divider', label: 'SERVICES' },
    { id: 'services-catalog', label: 'Services Catalog', icon: Zap, section: 'services' },

    { type: 'divider', label: 'SERVICE MANAGEMENT' },
    { id: 'whatsapp-service-management', label: 'WhatsApp Automation', icon: MessageCircle, section: 'service-mgmt' },

    { type: 'divider', label: 'USER MANAGEMENT' },
    { id: 'users-management', label: 'All Users', icon: Users, section: 'users' },
    { id: 'user-invite', label: 'Invite Users', icon: UserPlus, section: 'users' },

    { type: 'divider', label: 'COMPANY MANAGEMENT' },
    { id: 'companies-management', label: 'Companies', icon: Building2, section: 'companies', badge: 2 },

    { type: 'divider', label: 'BILLING' },
    { id: 'invoices-management', label: 'Invoices', icon: Receipt, section: 'billing' },
    { id: 'revenue-analytics', label: 'Revenue', icon: DollarSign, section: 'billing' },

    { type: 'divider', label: 'SUPPORT' },
    { id: 'support-tickets', label: 'Support Tickets', icon: MessageCircle, section: 'support', badge: 3 },

    { type: 'divider', label: 'COMMUNICATION' },
    { id: 'notifications-management', label: 'Notifications', icon: Bell, section: 'communication' },

    { type: 'divider', label: 'SYSTEM' },
    { id: 'system-settings', label: 'System Settings', icon: Settings, section: 'system' },
    { id: 'maintenance-mode', label: 'Maintenance Mode', icon: AlertTriangle, section: 'system' },
    { id: 'activity-logs', label: 'Activity Logs', icon: Activity, section: 'system' },

    { type: 'divider', label: 'SERVICE DASHBOARDS (PREVIEW)' },
    { id: 'service-whatsapp', label: 'WhatsApp', icon: MessageCircle, section: 'service-dashboards' },
    { id: 'service-instagram', label: 'Instagram', icon: Instagram, section: 'service-dashboards' },
    { id: 'service-text-to-video', label: 'Text-to-Video', icon: Video, section: 'service-dashboards' },
    { id: 'service-text-to-image', label: 'Text-to-Image', icon: Image, section: 'service-dashboards' },
    { id: 'service-voice-cloning', label: 'Voice Cloning', icon: Mic, section: 'service-dashboards' },
    { id: 'service-document-ai', label: 'Document AI', icon: FileText, section: 'service-dashboards' },
    { id: 'service-image-to-video', label: 'Image-to-Video', icon: Play, section: 'service-dashboards' },
    { id: 'service-video-to-video', label: 'Video-to-Video', icon: Film, section: 'service-dashboards' },
    { id: 'service-data-analysis', label: 'Data Analysis', icon: BarChart3, section: 'service-dashboards' },
    { id: 'service-custom-ai', label: 'Custom AI', icon: Sparkles, section: 'service-dashboards' },
    { id: 'service-ecommerce', label: 'E-Commerce', icon: ShoppingCart, section: 'service-dashboards' },
    { id: 'service-corporate-website', label: 'Corporate Website', icon: Monitor, section: 'service-dashboards' },
    { id: 'service-mobile-app', label: 'Mobile App', icon: Smartphone, section: 'service-dashboards' },
    { id: 'service-digital-marketing', label: 'Digital Marketing', icon: Target, section: 'service-dashboards' },
    { id: 'service-iot-solutions', label: 'IoT Solutions', icon: Wifi, section: 'service-dashboards' },
    { id: 'service-cloud-solutions', label: 'Cloud Solutions', icon: Cloud, section: 'service-dashboards' },
    { id: 'service-ui-ux-design', label: 'UI/UX Design', icon: Palette, section: 'service-dashboards' },
    { id: 'service-maintenance-support', label: 'Maintenance', icon: Wrench, section: 'service-dashboards' },
  ];

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
              <p className="text-xs text-red-400">Super Admin</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item, idx) => {
            if (item.type === 'divider') {
              return (
                <li key={idx} className="pt-4 pb-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase px-4">{item.label}</div>
                </li>
              );
            }

            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id!)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium truncate">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
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
