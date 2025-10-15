import { useState } from 'react';
import { Search, Bell, Menu, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationsPanel from './NotificationsPanel';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-500/20 text-purple-700';
      case 'COMPANY_ADMIN':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-800/50 text-gray-400';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 h-16 flex items-center px-4 lg:px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-400" />
          </button>

          <div className="hidden lg:flex items-center gap-3">
            <img
              src="/logo-white.svg"
              alt="Allync Logo"
              className="h-8 w-auto"
              onError={(e) => {
                e.currentTarget.src = '/logo-white.png';
              }}
            />
            <div className="hidden md:block">
              <h1 className="text-white font-bold text-lg">Allync</h1>
              <p className="text-gray-400 text-xs">Control Panel</p>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-2xl hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 mr-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded ${
                language === 'en' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              🇬🇧
            </button>
            <button
              onClick={() => setLanguage('tr')}
              className={`px-2 py-1 rounded ${
                language === 'tr' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              🇹🇷
            </button>
          </div>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-medium">
                {user && getInitials(user.name)}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-white">{user?.name}</div>
                <div className="text-xs text-gray-400">{user?.role.replace('_', ' ')}</div>
              </div>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <div className="font-medium text-white">{user?.name}</div>
                    <div className="text-sm text-gray-400">{user?.email}</div>
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(
                        user?.role || ''
                      )}`}
                    >
                      {user?.role.replace('_', ' ')}
                    </span>
                  </div>
                  <a
                    href="#profile"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700/50 text-gray-300"
                  >
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </a>
                  <a
                    href="#settings"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700/50 text-gray-300"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </a>
                  <div className="border-t border-gray-700 my-2"></div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-500/10 text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
