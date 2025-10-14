import { Home, Zap, MessageCircle, Instagram, FileText, HelpCircle, Settings, LogOut, X } from 'lucide-react';
import { useState } from 'react';
import { mockCompanyRequests } from '../pages/Services';
import { serviceTypes } from '../data/services';

interface CompanyAdminSidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompanyAdminSidebar({ activePage, onPageChange, isOpen, onClose }: CompanyAdminSidebarProps) {
  const activeServices = Object.keys(mockCompanyRequests)
    .filter(serviceId => mockCompanyRequests[serviceId].status === 'approved')
    .map(serviceId => serviceTypes.find(s => s.id === serviceId))
    .filter(Boolean);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'services', label: 'Services Catalog', icon: Zap },
  ];

  const bottomItems = [
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
              ALLYNC
            </div>
            <span className="font-bold text-lg text-white">Allync</span>
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
                  const pageId = service.id === 'whatsapp-automation' ? 'whatsapp' : `service/${service.slug}`;
                  const isActive = activePage === pageId;
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

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-medium">
              CA
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Company Admin</div>
              <div className="text-xs text-gray-400">Tech Corp</div>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-medium">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
