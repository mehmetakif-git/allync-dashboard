import { useState } from 'react';
import AdminOverview from '../components/admin/AdminOverview';
import AdminCompanies from '../components/admin/AdminCompanies';
import AdminUsers from '../components/admin/AdminUsers';
import AdminSystemSettings from '../components/admin/AdminSystemSettings';
import AdminActivityLogs from '../components/admin/AdminActivityLogs';
import AdminRevenue from '../components/admin/AdminRevenue';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'users' | 'revenue' | 'settings' | 'logs'>('overview');

  const tabs = [
    { id: 'overview', label: '📊 Overview', desc: 'System overview' },
    { id: 'companies', label: '🏢 Companies', desc: 'Manage all companies' },
    { id: 'users', label: '👥 Users', desc: 'Manage all users' },
    { id: 'revenue', label: '💰 Revenue', desc: 'Financial analytics' },
    { id: 'settings', label: '⚙️ Settings', desc: 'System configuration' },
    { id: 'logs', label: '📋 Activity Logs', desc: 'System activity' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-950">
      <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-800/50 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Super Admin Panel</h1>
            <p className="text-red-300 text-sm">Full system access and control</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl">
        <div className="border-b border-gray-800">
          <nav className="flex gap-2 p-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-white border-b-2 border-red-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <div className="text-sm">{tab.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{tab.desc}</div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'companies' && <AdminCompanies />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'revenue' && <AdminRevenue />}
          {activeTab === 'settings' && <AdminSystemSettings />}
          {activeTab === 'logs' && <AdminActivityLogs />}
        </div>
      </div>
    </div>
  );
}
