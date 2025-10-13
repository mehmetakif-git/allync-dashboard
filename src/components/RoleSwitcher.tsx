import { useState, useEffect } from 'react';
import { Shield, User, Building2, X } from 'lucide-react';
import { getCurrentMockUser, setMockUserRole, UserRole } from '../utils/mockAuth';

export default function RoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentMockUser());

  useEffect(() => {
    setCurrentUser(getCurrentMockUser());
  }, []);

  const roles = [
    {
      id: 'super_admin' as UserRole,
      label: 'Super Admin',
      icon: Shield,
      description: 'Full system access',
      color: 'red',
    },
    {
      id: 'company_admin' as UserRole,
      label: 'Company Admin',
      icon: Building2,
      description: 'Company management',
      color: 'purple',
    },
    {
      id: 'user' as UserRole,
      label: 'Regular User',
      icon: User,
      description: 'View-only access',
      color: 'blue',
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
        title="Switch Role (Testing)"
      >
        <Shield className="w-6 h-6 text-white" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-[70] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Role Switcher</h2>
                  <p className="text-blue-100 text-sm">Testing Mode - Switch between roles</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 border-b border-gray-800">
              <p className="text-sm text-gray-400 mb-2">Current Role:</p>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-white">{currentUser.name}</p>
                  <p className="text-sm text-gray-400">{currentUser.email}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-sm text-gray-400 mb-4">Switch to:</p>
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setMockUserRole(role.id);
                    setIsOpen(false);
                  }}
                  disabled={currentUser.role === role.id}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    currentUser.role === role.id
                      ? 'border-blue-500 bg-blue-500/10 cursor-not-allowed opacity-50'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800 cursor-pointer'
                  }`}
                >
                  <div className={`w-12 h-12 bg-${role.color}-500/20 rounded-lg flex items-center justify-center`}>
                    <role.icon className={`w-6 h-6 text-${role.color}-400`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-white">{role.label}</p>
                    <p className="text-sm text-gray-400">{role.description}</p>
                  </div>
                  {currentUser.role === role.id && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="px-6 pb-6">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-400">
                  ⚠️ This is for testing only. Page will reload when switching roles.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
