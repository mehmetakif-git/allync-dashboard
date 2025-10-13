import { Home, Zap, MessageCircle, Instagram, Video, Image, Mic, FileText, Play, Film, BarChart3, Sparkles, ShoppingCart, Monitor, Smartphone, Target, Wifi, Cloud, Palette, Wrench, Building2, Users, DollarSign, Settings, Activity, AlertTriangle, LogOut } from 'lucide-react';

interface MenuItem {
  id?: string;
  label: string;
  icon?: any;
  section?: string;
  type?: string;
}

export default function SuperAdminSidebar({ activePage, onPageChange }: { activePage: string; onPageChange: (page: string) => void }) {
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

    { id: 'companies-management', label: 'Companies', icon: Building2, section: 'management' },
    { id: 'users-management', label: 'Users', icon: Users, section: 'management' },
    { id: 'revenue-analytics', label: 'Revenue', icon: DollarSign, section: 'management' },
    { id: 'system-settings', label: 'System Settings', icon: Settings, section: 'management' },
    { id: 'maintenance-mode', label: 'Maintenance Mode', icon: AlertTriangle, section: 'management' },
    { id: 'activity-logs', label: 'Activity Logs', icon: Activity, section: 'management' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto z-30">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
            SA
          </div>
          <div>
            <p className="font-bold text-white">Super Admin</p>
            <p className="text-xs text-gray-400">Full System Access</p>
          </div>
        </div>
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
                  onClick={() => onPageChange(item.id!)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium truncate">{item.label}</span>
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
  );
}
