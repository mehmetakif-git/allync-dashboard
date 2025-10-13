import { useState } from 'react';
import WhatsAppAnalytics from '../components/whatsapp/WhatsAppAnalytics';
import WhatsAppLiveChat from '../components/whatsapp/WhatsAppLiveChat';
import WhatsAppCustomers from '../components/whatsapp/WhatsAppCustomers';

export default function WhatsApp() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'chat' | 'customers'>('analytics');

  const tabs = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'chat', label: 'Live Chat' },
    { id: 'customers', label: 'Customers' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-950">
      <div>
        <h1 className="text-3xl font-bold text-white">WhatsApp Automation</h1>
        <p className="text-gray-400 mt-1">Monitor your WhatsApp conversations and analytics</p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800">
        <div className="border-b border-gray-800">
          <nav className="flex gap-2 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 bg-gray-900/30">
          {activeTab === 'analytics' && <WhatsAppAnalytics />}
          {activeTab === 'chat' && <WhatsAppLiveChat />}
          {activeTab === 'customers' && <WhatsAppCustomers />}
        </div>
      </div>
    </div>
  );
}
