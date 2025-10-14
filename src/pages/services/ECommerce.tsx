import { ShoppingCart, Package, TrendingUp, DollarSign, Plus, Settings as SettingsIcon, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { getCurrentMockUser } from '../../utils/mockAuth';

export default function ECommerce() {
  const mockUser = getCurrentMockUser();
  const isSuperAdmin = mockUser.role === 'super_admin';
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  const [settings, setSettings] = useState({
    serviceName: 'E-Commerce Solutions',
    description: 'Build and manage your online store with advanced features',
    status: 'active',
    pricing: {
      basic: { name: 'Starter', price: 299, features: ['Up to 100 products', 'Basic payment gateway', 'Email support', 'Mobile responsive'] },
      pro: { name: 'Business', price: 799, features: ['Unlimited products', 'Advanced analytics', 'Priority support', 'Multi-currency'] },
      enterprise: { name: 'Enterprise', price: 1999, features: ['Custom development', 'Dedicated server', '24/7 support', 'API access'] },
    },
  });

  const stats = [
    { label: 'Active Stores', value: '18', change: '+4 this month', icon: ShoppingCart, color: 'orange' },
    { label: 'Total Products', value: '2,847', change: '+124', icon: Package, color: 'blue' },
    { label: 'Monthly Sales', value: '$127K', change: '+18%', icon: DollarSign, color: 'green' },
    { label: 'Conversion Rate', value: '3.8%', change: '+0.5%', icon: TrendingUp, color: 'purple' },
  ];

  const salesData = [
    { month: 'Jul', sales: 82 },
    { month: 'Aug', sales: 95 },
    { month: 'Sep', sales: 108 },
    { month: 'Oct', sales: 115 },
    { month: 'Nov', sales: 122 },
    { month: 'Dec', sales: 127 },
  ];

  const recentStores = [
    { id: '1', name: 'Fashion Boutique', products: 245, orders: 1240, revenue: '$45.2K', status: 'Active' },
    { id: '2', name: 'Tech Gadgets Store', products: 180, orders: 890, revenue: '$32.8K', status: 'Active' },
    { id: '3', name: 'Home Decor Shop', products: 320, orders: 1560, revenue: '$28.5K', status: 'Active' },
    { id: '4', name: 'Sports Equipment', products: 156, orders: 670, revenue: '$20.7K', status: 'Maintenance' },
  ];

  const handleSaveSettings = () => {
    console.log('Saving E-Commerce settings:', settings);
    alert('✅ E-Commerce Solutions settings saved successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">E-Commerce Solutions</h1>
          <p className="text-gray-400 mt-1">Build and manage online stores</p>
        </div>
        {activeTab === 'overview' && (
          <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Store
          </button>
        )}
      </div>

      <div className="border-b border-gray-800">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'text-white border-orange-500'
                : 'text-gray-400 border-transparent hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'text-white border-orange-500'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              Settings
            </button>
          )}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                  <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Sales Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="sales" stroke="#F97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Active Stores</h3>
            <div className="space-y-3">
              {recentStores.map((store) => (
                <div key={store.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{store.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                        <span>{store.products} products</span>
                        <span>•</span>
                        <span>{store.orders} orders</span>
                        <span>•</span>
                        <span className="text-green-400 font-medium">{store.revenue}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    store.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {store.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'settings' && isSuperAdmin && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Service Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Service Name</label>
                <input
                  type="text"
                  value={settings.serviceName}
                  onChange={(e) => setSettings({ ...settings, serviceName: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={settings.status}
                  onChange={(e) => setSettings({ ...settings, status: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Pricing Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(settings.pricing).map(([key, plan]) => (
                <div key={key} className="border border-gray-700 rounded-lg p-4">
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => setSettings({
                      ...settings,
                      pricing: { ...settings.pricing, [key]: { ...plan, name: e.target.value } }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white font-bold mb-3"
                  />
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={plan.price}
                      onChange={(e) => setSettings({
                        ...settings,
                        pricing: { ...settings.pricing, [key]: { ...plan, price: parseInt(e.target.value) } }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-2xl font-bold"
                    />
                    <span className="text-gray-400">/mo</span>
                  </div>
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...plan.features];
                          newFeatures[idx] = e.target.value;
                          setSettings({
                            ...settings,
                            pricing: { ...settings.pricing, [key]: { ...plan, features: newFeatures } }
                          });
                        }}
                        className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
