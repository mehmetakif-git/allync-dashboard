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
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import MaintenanceMode from './pages/admin/MaintenanceMode';
import CompaniesManagement from './pages/admin/CompaniesManagement';
import UsersManagement from './pages/admin/UsersManagement';
import CompanyAdminSidebar from './components/CompanyAdminSidebar';
import RegularUserSidebar from './components/RegularUserSidebar';
import CompanyAdminDashboard from './pages/CompanyAdminDashboard';
import SystemSettings from './pages/admin/SystemSettings';
import ActivityLogs from './pages/admin/ActivityLogs';
import TextToVideoAI from './pages/services/TextToVideoAI';
import ImageToVideoAI from './pages/services/ImageToVideoAI';
import VideoToVideoAI from './pages/services/VideoToVideoAI';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serviceSlug, setServiceSlug] = useState<string>('');
  const [superAdminPage, setSuperAdminPage] = useState('admin-dashboard');

  const mockUser = getCurrentMockUser();
  const isSuperAdmin = mockUser.role === 'super_admin';
  const isCompanyAdmin = mockUser.role === 'company_admin';
  const isRegularUser = mockUser.role === 'user';

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
            {superAdminPage === 'admin-dashboard' && <SuperAdminDashboard />}
            {superAdminPage === 'services-catalog' && <Services />}
            {superAdminPage === 'service-whatsapp' && <WhatsApp />}
            {superAdminPage === 'service-instagram' && <Instagram />}
            {superAdminPage === 'service-text-to-video' && <TextToVideoAI />}
            {superAdminPage === 'service-text-to-image' && <ServiceDashboard slug="text-to-image" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-voice-cloning' && <ServiceDashboard slug="voice-cloning" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-document-ai' && <ServiceDashboard slug="document-ai" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-image-to-video' && <ImageToVideoAI />}
            {superAdminPage === 'service-video-to-video' && <VideoToVideoAI />}
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
            {superAdminPage === 'companies-management' && <CompaniesManagement />}
            {superAdminPage === 'users-management' && <UsersManagement />}
            {superAdminPage === 'revenue-analytics' && <Admin />}
            {superAdminPage === 'system-settings' && <SystemSettings />}
            {superAdminPage === 'maintenance-mode' && <MaintenanceMode />}
            {superAdminPage === 'activity-logs' && <ActivityLogs />}
          </main>
        </div>
      </div>
    );
  }

  if (isCompanyAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
        <CompanyAdminSidebar
          activePage={activePage}
          onPageChange={handlePageChange}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1">
            {activePage === 'dashboard' && <CompanyAdminDashboard />}
            {activePage === 'services' && <Services />}
            {activePage === 'whatsapp' && <WhatsApp />}
            {activePage === 'service/instagram-automation' && <Instagram />}
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
          </main>
        </div>
      </div>
    );
  }

  if (isRegularUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
        <RegularUserSidebar
          activePage={activePage}
          onPageChange={handlePageChange}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1">
            {activePage === 'dashboard' && <Dashboard />}
            {activePage === 'whatsapp' && <WhatsApp />}
            {activePage === 'service/instagram-automation' && <Instagram />}
            {activePage === 'service-dashboard' && (
              <ServiceDashboard
                slug={serviceSlug}
                onBack={() => {
                  window.location.hash = 'dashboard';
                  setActivePage('dashboard');
                }}
              />
            )}
            {activePage === 'support' && <Support />}
            {activePage === 'settings' && <Settings />}
          </main>
        </div>
      </div>
    );
  }

  return null;
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
