import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Upload, Camera, Bell } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'notifications' | 'billing' | 'security'>('profile');

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'COMPANY_ADMIN';

  const tabs = [
    { id: 'profile', label: 'Profile', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'USER'] },
    { id: 'company', label: 'Company', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
    { id: 'notifications', label: 'Notifications', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'USER'] },
    { id: 'billing', label: 'Billing', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
    { id: 'security', label: 'Security', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'USER'] },
  ];

  const visibleTabs = tabs.filter((tab) => tab.roles.includes(user?.role || ''));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-sm border border-gray-700">
        <div className="border-b border-gray-800">
          <nav className="flex gap-2 p-4">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Profile Picture</h3>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-3xl font-medium">
                    {user && getInitials(user.name)}
                  </div>
                  <div className="space-y-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors font-medium">
                      <Upload className="w-4 h-4" />
                      Upload Avatar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  readOnly
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                <input
                  type="tel"
                  defaultValue={user?.phone}
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg font-medium">
                    🇬🇧 English
                  </button>
                  <button className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg font-medium">
                    🇹🇷 Türkçe
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors transition-all transition-colors font-medium">
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'company' && isAdmin && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Company Logo</h3>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xl font-bold">
                    ALLYNC
                  </div>
                  <div className="space-y-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors font-medium">
                      <Camera className="w-4 h-4" />
                      Upload Logo
                    </button>
                    <p className="text-xs text-gray-400">Recommended size: 200x200px</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Company Name</label>
                <input
                  type="text"
                  defaultValue={user?.companyName}
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Company Email</label>
                <input
                  type="email"
                  defaultValue="contact@techcorp.com"
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+1 555 100 2000"
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Country</label>
                <select className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>United States</option>
                  <option>Turkey</option>
                  <option>United Kingdom</option>
                  <option>Germany</option>
                </select>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-400">Account Status: Active</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors transition-all transition-colors font-medium">
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-blue-300 mb-1">System Notifications</h3>
                    <p className="text-sm text-blue-300">
                      System notifications are <strong>mandatory</strong> and cannot be disabled.
                      They contain important updates about services, maintenance, and system announcements.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Email Notifications</h3>
                <div className="space-y-3">
                  {[
                    { label: 'New invoice created', description: 'Get notified when a new invoice is generated' },
                    { label: 'Payment received', description: 'Receive confirmation when payment is processed' },
                    { label: 'Support ticket updated', description: 'Get updates on your support tickets' },
                    { label: 'Service usage alert', description: 'Alerts when approaching usage limits' },
                    { label: 'Weekly report', description: 'Receive weekly analytics reports' },
                  ].map((notif, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3 border border-gray-800 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                      <input type="checkbox" defaultChecked={idx < 3} className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="font-medium text-white">{notif.label}</p>
                        <p className="text-sm text-gray-400">{notif.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors transition-all transition-colors font-medium">
                  <Save className="w-5 h-5" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && isAdmin && (
            <div className="max-w-2xl space-y-6">
              <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl">
                <h3 className="text-2xl font-bold mb-2">Total Monthly Cost</h3>
                <p className="text-4xl font-bold">$1,247.00</p>
                <p className="text-blue-300 mt-2">Next billing date: March 15, 2025</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Active Services</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-white">WhatsApp Automation - Pro Plan</p>
                      <p className="text-sm text-gray-400">Renewed monthly</p>
                    </div>
                    <span className="font-bold text-white">$299.00</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Text to Video AI - Basic Plan</p>
                      <p className="text-sm text-gray-400">Renewed monthly</p>
                    </div>
                    <span className="font-bold text-white">$499.00</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Text to Image AI - Pro Plan</p>
                      <p className="text-sm text-gray-400">Renewed monthly</p>
                    </div>
                    <span className="font-bold text-white">$449.00</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Payment Information</h3>
                <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-gray-400 mb-2">Payments are processed securely through Stripe/PayTR</p>
                  <p className="text-sm text-gray-400">All payments in USD</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Recent Invoices</h3>
                <div className="space-y-2">
                  {[
                    { number: 'INV-2025-0023', date: 'Feb 15, 2025', amount: 599.00, status: 'Pending' },
                    { number: 'INV-2025-0001', date: 'Jan 15, 2025', amount: 352.82, status: 'Paid' },
                  ].map((invoice) => (
                    <div key={invoice.number} className="flex items-center justify-between p-3 border border-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{invoice.number}</p>
                        <p className="text-sm text-gray-400">{invoice.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">${invoice.amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${invoice.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 px-4 py-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors font-medium">
                  View All Invoices
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl space-y-6">
              <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <h3 className="font-bold text-yellow-400 mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-yellow-400 mb-4">Add an extra layer of security to your account</p>
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium">
                  Coming Soon
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Login History</h3>
                <div className="space-y-3">
                  {[
                    { date: 'Feb 13, 2025 2:30 PM', device: 'Chrome on Windows', location: 'New York, USA', ip: '192.168.1.100' },
                    { date: 'Feb 12, 2025 9:15 AM', device: 'Safari on iPhone', location: 'New York, USA', ip: '192.168.1.101' },
                    { date: 'Feb 10, 2025 4:45 PM', device: 'Chrome on Windows', location: 'New York, USA', ip: '192.168.1.100' },
                  ].map((login, idx) => (
                    <div key={idx} className="p-4 border border-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{login.device}</p>
                          <p className="text-sm text-gray-400">{login.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white">{login.date}</p>
                          <p className="text-xs text-gray-400">{login.ip}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Active Sessions</h3>
                <div className="p-4 border border-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400 mb-4">You are currently signed in on 2 devices</p>
                  <button className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-medium">
                    Sign Out All Devices
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
