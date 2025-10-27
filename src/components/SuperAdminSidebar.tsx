import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Zap, MessageCircle, Instagram, Calendar, Sheet, Mail, FileText, FolderOpen, Image, Globe, Smartphone, Building2, Users, UserPlus, Receipt, DollarSign, Bell, Settings, Activity, AlertTriangle, LogOut, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: number;
  type?: 'item' | 'divider';
  dividerLabel?: string;
}

interface SuperAdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuperAdminSidebar({ isOpen, onClose }: SuperAdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems: MenuItem[] = [
    // Main
    { type: 'divider', dividerLabel: 'MAIN', id: 'divider-main', label: '', icon: null, path: '' },
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin' },
    
    // Services
    { type: 'divider', dividerLabel: 'SERVICES', id: 'divider-services', label: '', icon: null, path: '' },
    { id: 'services', label: 'Services Catalog', icon: Zap, path: '/admin/services' },
    
    // Service Management
    { type: 'divider', dividerLabel: 'SERVICE MANAGEMENT', id: 'divider-service-mgmt', label: '', icon: null, path: '' },
    { id: 'whatsapp', label: 'WhatsApp Automation', icon: MessageCircle, path: '/admin/services/whatsapp' },
    { id: 'instagram', label: 'Instagram Automation', icon: Instagram, path: '/admin/services/instagram' },
    { id: 'calendar', label: 'Google Calendar', icon: Calendar, path: '/admin/services/calendar' },
    { id: 'sheets', label: 'Google Sheets', icon: Sheet, path: '/admin/services/sheets' },
    { id: 'gmail', label: 'Gmail Integration', icon: Mail, path: '/admin/services/gmail' },
    { id: 'docs', label: 'Google Docs', icon: FileText, path: '/admin/services/docs' },
    { id: 'drive', label: 'Google Drive', icon: FolderOpen, path: '/admin/services/drive' },
    { id: 'photos', label: 'Google Photos', icon: Image, path: '/admin/services/photos' },
    { id: 'website', label: 'Website Development', icon: Globe, path: '/admin/services/website' },
    { id: 'mobile-app', label: 'Mobile App Development', icon: Smartphone, path: '/admin/services/mobile-app' },
    
    // User Management
    { type: 'divider', dividerLabel: 'USER MANAGEMENT', id: 'divider-users', label: '', icon: null, path: '' },
    { id: 'users', label: 'All Users', icon: Users, path: '/admin/users' },
    { id: 'user-invite', label: 'Invite Users', icon: UserPlus, path: '/admin/users/invite' },
    
    // Company Management
    { type: 'divider', dividerLabel: 'COMPANY MANAGEMENT', id: 'divider-companies', label: '', icon: null, path: '' },
    { id: 'companies', label: 'Companies', icon: Building2, path: '/admin/companies', badge: 2 },
    
    // Billing
    { type: 'divider', dividerLabel: 'BILLING', id: 'divider-billing', label: '', icon: null, path: '' },
    { id: 'invoices', label: 'Invoices', icon: Receipt, path: '/admin/invoices' },
    { id: 'revenue', label: 'Revenue Analytics', icon: DollarSign, path: '/admin/revenue' },
    
    // Support
    { type: 'divider', dividerLabel: 'SUPPORT', id: 'divider-support', label: '', icon: null, path: '' },
    { id: 'support', label: 'Support Tickets', icon: MessageCircle, path: '/admin/support-tickets', badge: 3 },
    
    // Communication
    { type: 'divider', dividerLabel: 'COMMUNICATION', id: 'divider-communication', label: '', icon: null, path: '' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications' },
    
    // System
    { type: 'divider', dividerLabel: 'SYSTEM', id: 'divider-system', label: '', icon: null, path: '' },
    { id: 'settings', label: 'System Settings', icon: Settings, path: '/admin/settings' },
    { id: 'maintenance', label: 'Maintenance Mode', icon: AlertTriangle, path: '/admin/maintenance' },
    { id: 'logs', label: 'Activity Logs', icon: Activity, path: '/admin/logs' },
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

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-primary border-r border-primary flex flex-col overflow-y-auto custom-scrollbar transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64`}
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
              <p className="text-xs text-red-400">Super Admin</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              if (item.type === 'divider') {
                return (
                  <li key={item.id} className="pt-4 pb-2">
                    <div className="text-xs font-semibold text-muted uppercase px-4">
                      {item.dividerLabel}
                    </div>
                  </li>
                );
              }

              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      active
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'text-muted hover:bg-secondary hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
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