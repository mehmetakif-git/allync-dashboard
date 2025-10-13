import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { getCurrentMockUser } from './utils/mockAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import WhatsApp from './pages/WhatsApp';
import Instagram from './pages/Instagram';
import TextToVideo from './pages/TextToVideo';
import Invoices from './pages/Invoices';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import ServiceDashboard from './pages/ServiceDashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SuperAdminSidebar from './components/SuperAdminSidebar';
import RoleSwitcher from './components/RoleSwitcher';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serviceSlug, setServiceSlug] = useState<string>('');
  const [superAdminPage, setSuperAdminPage] = useState('admin-dashboard');

  const mockUser = getCurrentMockUser();
  const isSuperAdmin = mockUser.role === 'super_admin';

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('service/')) {
        const slug = hash.replace('service/', '');
        setServiceSlug(slug);
        setActivePage('service-dashboard');
      } else if (hash) {
        setActivePage(hash);
        setServiceSlug('');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handlePageChange = (page: string) => {
    if (page.startsWith('service/')) {
      window.location.hash = page;
    } else {
      setActivePage(page);
      window.location.hash = page;
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  if (isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex">
        <SuperAdminSidebar
          activePage={superAdminPage}
          onPageChange={setSuperAdminPage}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 p-6">
            <RoleSwitcher />
            {superAdminPage === 'admin-dashboard' && <SuperAdminDashboard />}
            {superAdminPage === 'services-catalog' && <Services />}
            {superAdminPage === 'service-whatsapp' && <WhatsApp />}
            {superAdminPage === 'service-instagram' && <Instagram />}
            {superAdminPage === 'service-text-to-video' && <TextToVideo />}
            {superAdminPage === 'service-text-to-image' && <ServiceDashboard slug="text-to-image" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-voice-cloning' && <ServiceDashboard slug="voice-cloning" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-document-ai' && <ServiceDashboard slug="document-ai" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-image-to-video' && <ServiceDashboard slug="image-to-video" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-video-to-video' && <ServiceDashboard slug="video-to-video" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-data-analysis' && <ServiceDashboard slug="data-analysis" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-custom-ai' && <ServiceDashboard slug="custom-ai" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-ecommerce' && <ServiceDashboard slug="ecommerce" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-corporate-website' && <ServiceDashboard slug="corporate-website" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-mobile-app' && <ServiceDashboard slug="mobile-app" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-digital-marketing' && <ServiceDashboard slug="digital-marketing" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-iot-solutions' && <ServiceDashboard slug="iot-solutions" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-cloud-solutions' && <ServiceDashboard slug="cloud-solutions" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-ui-ux-design' && <ServiceDashboard slug="ui-ux-design" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-maintenance-support' && <ServiceDashboard slug="maintenance-support" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'companies-management' && <Admin />}
            {superAdminPage === 'users-management' && <Admin />}
            {superAdminPage === 'revenue-analytics' && <Admin />}
            {superAdminPage === 'system-settings' && <Settings />}
            {superAdminPage === 'maintenance-mode' && (
              <div className="text-center py-16">
                <h1 className="text-3xl font-bold text-white mb-4">Maintenance Mode</h1>
                <p className="text-gray-400">Coming in next update</p>
              </div>
            )}
            {superAdminPage === 'activity-logs' && <Admin />}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
      <Sidebar
        activePage={activePage}
        onPageChange={handlePageChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1">
          <RoleSwitcher />
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'services' && <Services />}
          {activePage === 'whatsapp' && <WhatsApp />}
          {activePage === 'service/instagram-automation' && <Instagram />}
          {activePage === 'service/text-to-video' && <TextToVideo />}
          {activePage === 'service-dashboard' && (
            <ServiceDashboard
              slug={serviceSlug}
              onBack={() => {
                window.location.hash = 'services';
                setActivePage('services');
              }}
            />
          )}
          {activePage === 'invoices' && <Invoices />}
          {activePage === 'support' && <Support />}
          {activePage === 'settings' && <Settings />}
          {activePage === 'admin' && <Admin />}
          {activePage === 'maintenance' && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto text-center py-16">
                <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🔧</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Maintenance Mode</h1>
                <p className="text-gray-400 mb-8">
                  Configure and schedule system maintenance windows from this page.
                </p>
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-sm border border-gray-700 p-8 text-left">
                  <h2 className="text-xl font-bold text-white mb-4">No Active Maintenance</h2>
                  <p className="text-gray-400 mb-6">There is currently no scheduled maintenance.</p>
                  <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all transition-colors font-medium">
                    Schedule Maintenance
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
