import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  badge?: number;
  isActive?: boolean;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface ExpandableSidebarProps {
  logo: {
    icon: string;
    title: string;
    subtitle: string;
  };
  sections: SidebarSection[];
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function ExpandableSidebar({
  logo,
  sections,
  isOpen,
  onClose,
  onLogout,
}: ExpandableSidebarProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`fixed lg:sticky top-0 left-0 h-screen bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden transition-all duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isExpanded ? 'w-64' : 'w-20'}`}
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between min-h-[73px]">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={logo.icon}
              alt={logo.title}
              className="h-10 w-10 flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = '/logo-white.png';
              }}
            />
            <div className={`flex flex-col min-w-0 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
              <span className="text-white font-semibold whitespace-nowrap">
                {logo.title}
              </span>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {logo.subtitle}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {section.title && (
                <div className={`px-3 mb-2 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0'}`}>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 relative group ${
                        item.isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className={`whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                        {item.label}
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                          {item.badge}
                        </span>
                      )}

                      {!isExpanded && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user && getInitials(user.name)}
            </div>
            <div className={`flex flex-col min-w-0 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
              <span className="text-white text-sm font-medium truncate">
                {user?.name}
              </span>
              <span className="text-xs text-gray-400 capitalize truncate">
                {user?.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
