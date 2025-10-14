import { Home, Zap, MessageCircle, Instagram, Video, Image, Mic, FileText, Play, Film, BarChart3, Sparkles, ShoppingCart, Monitor, Smartphone, Target, Wifi, Cloud, Palette, Wrench, Building2, Users, DollarSign, Settings, Activity, AlertTriangle, LogOut, X } from 'lucide-react';

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
  const menuItems: MenuItem[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: Home, section: 'main' },
    { id: 'services-catalog', label: 'Services Catalog', icon: Zap, section: 'main' },

    { type: 'divider', label: 'SERVICE DASHBOARDS' },

    { id: 'service-whatsapp', label: 'WhatsApp Automation', icon: MessageCircle, section: 'services' },
    { id: 'service-instagram', label: 'Instagram Automation', icon: Instagram, section: 'services' },
    { id: 'service-text-to-video', label: 'Text-to-Video AI', icon: Video, section: 'services' },
    { id: 'service-text-to-image', label: 'Text-to-Image AI', icon: Image, section: 'services' },
    { id: 'service-voice-cloning', label: 'Voice Cloning', icon: Mic, section: 'services' },
    { id: 'service-document-ai', label: 'Document AI', icon: FileText, section: 'services' },
    { id: 'service-image-to-video', label: 'Image-to-Video AI', icon: Play, section: 'services' },
    { id: 'service-video-to-video', label: 'Video-to-Video AI', icon: Film, section: 'services' },
    { id: 'service-data-analysis', label: 'Data Analysis AI', icon: BarChart3, section: 'services' },
    { id: 'service-custom-ai', label: 'Custom AI Solutions', icon: Sparkles, section: 'services' },

    { id: 'service-ecommerce', label: 'E-Commerce', icon: ShoppingCart, section: 'services' },
    { id: 'service-corporate-website', label: 'Corporate Website', icon: Monitor, section: 'services' },
    { id: 'service-mobile-app', label: 'Mobile App', icon: Smartphone, section: 'services' },
    { id: 'service-digital-marketing', label: 'Digital Marketing', icon: Target, section: 'services' },
    { id: 'service-iot-solutions', label: 'IoT Solutions', icon: Wifi, section: 'services' },
    { id: 'service-cloud-solutions', label: 'Cloud Solutions', icon: Cloud, section: 'services' },
    { id: 'service-ui-ux-design', label: 'UI/UX Design', icon: Palette, section: 'services' },
    { id: 'service-maintenance-support', label: 'Maintenance & Support', icon: Wrench, section: 'services' },

    { type: 'divider', label: 'SYSTEM MANAGEMENT' },

    { id: 'companies-management', label: 'Companies', icon: Building2, section: 'management', badge: 2 },
    { id: 'users-management', label: 'Users', icon: Users, section: 'management' },
    { id: 'revenue-analytics', label: 'Revenue', icon: DollarSign, section: 'management' },
    { id: 'system-settings', label: 'System Settings', icon: Settings, section: 'management' },
    { id: 'maintenance-mode', label: 'Maintenance Mode', icon: AlertTriangle, section: 'management' },
    { id: 'activity-logs', label: 'Activity Logs', icon: Activity, section: 'management' },
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
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
            SA
          </div>
            <div>
              <p className="font-bold text-white">Super Admin</p>
              <p className="text-xs text-gray-400">Full System Access</p>
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

      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-medium">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
        </div>
      </aside>
    </>
  );
}
