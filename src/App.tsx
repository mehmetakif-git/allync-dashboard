import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
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
import TextToImageAI from './pages/services/TextToImageAI';
import VoiceCloning from './pages/services/VoiceCloning';
import DocumentAI from './pages/services/DocumentAI';
import DataAnalysisAI from './pages/services/DataAnalysisAI';
import CustomAI from './pages/services/CustomAI';
import ECommerce from './pages/services/ECommerce';
import CorporateWebsite from './pages/services/CorporateWebsite';
import MobileApp from './pages/services/MobileApp';
import DigitalMarketing from './pages/services/DigitalMarketing';
import IoTSolutions from './pages/services/IoTSolutions';
import CloudSolutions from './pages/services/CloudSolutions';
import UIUXDesign from './pages/services/UIUXDesign';
import MaintenanceSupport from './pages/services/MaintenanceSupport';
import RevenueAnalytics from './pages/admin/RevenueAnalytics';
import InvoicesManagement from './pages/admin/InvoicesManagement';
import SupportTickets from './pages/admin/SupportTickets';
import UserInvite from './pages/admin/UserInvite';
import ServicesCatalog from './pages/admin/ServicesCatalog';
import NotificationsManagement from './pages/admin/NotificationsManagement';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serviceSlug, setServiceSlug] = useState<string>('');
  const [superAdminPage, setSuperAdminPage] = useState('admin-dashboard');

  console.log('Current user:', user);
  console.log('Is authenticated:', isAuthenticated);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isCompanyAdmin = user?.role === 'COMPANY_ADMIN';
  const isRegularUser = user?.role === 'USER';

  console.log('Role checks:', { isSuperAdmin, isCompanyAdmin, isRegularUser });

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
    console.log('Rendering Super Admin layout');
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
            {superAdminPage === 'services-catalog' && <ServicesCatalog />}
            {superAdminPage === 'service-whatsapp' && <WhatsApp />}
            {superAdminPage === 'service-instagram' && <Instagram />}
            {superAdminPage === 'service-text-to-video' && <TextToVideoAI />}
            {superAdminPage === 'service-text-to-image' && <TextToImageAI />}
            {superAdminPage === 'service-voice-cloning' && <VoiceCloning />}
            {superAdminPage === 'service-document-ai' && <DocumentAI />}
            {superAdminPage === 'service-image-to-video' && <ImageToVideoAI />}
            {superAdminPage === 'service-video-to-video' && <VideoToVideoAI />}
            {superAdminPage === 'service-data-analysis' && <DataAnalysisAI />}
            {superAdminPage === 'service-custom-ai' && <CustomAI />}
            {superAdminPage === 'service-ecommerce' && <ECommerce />}
            {superAdminPage === 'service-corporate-website' && <CorporateWebsite />}
            {superAdminPage === 'service-mobile-app' && <MobileApp />}
            {superAdminPage === 'service-digital-marketing' && <DigitalMarketing />}
            {superAdminPage === 'service-iot-solutions' && <IoTSolutions />}
            {superAdminPage === 'service-cloud-solutions' && <CloudSolutions />}
            {superAdminPage === 'service-ui-ux-design' && <UIUXDesign />}
            {superAdminPage === 'service-maintenance-support' && <MaintenanceSupport />}
            {superAdminPage === 'service-digital-marketing' && <ServiceDashboard slug="digital-marketing" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-iot-solutions' && <ServiceDashboard slug="iot-solutions" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-cloud-solutions' && <ServiceDashboard slug="cloud-solutions" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-ui-ux-design' && <ServiceDashboard slug="ui-ux-design" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'service-maintenance-support' && <ServiceDashboard slug="maintenance-support" onBack={() => setSuperAdminPage('services-catalog')} />}
            {superAdminPage === 'companies-management' && <CompaniesManagement />}
            {superAdminPage === 'users-management' && <UsersManagement />}
            {superAdminPage === 'user-invite' && <UserInvite />}
            {superAdminPage === 'notifications-management' && <NotificationsManagement />}
            {superAdminPage === 'revenue-analytics' && <RevenueAnalytics />}
            {superAdminPage === 'invoices-management' && <InvoicesManagement />}
            {superAdminPage === 'support-tickets' && <SupportTickets />}
            {superAdminPage === 'system-settings' && <SystemSettings />}
            {superAdminPage === 'maintenance-mode' && <MaintenanceMode />}
            {superAdminPage === 'activity-logs' && <ActivityLogs />}
          </main>
        </div>
      </div>
    );
  }

  if (isCompanyAdmin) {
    console.log('Rendering Company Admin layout');
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
    console.log('Rendering Regular User layout');
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

  console.error('No role matched! User:', user);
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center p-8 bg-gray-900 border border-gray-800 rounded-xl max-w-md">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Error: Invalid Role</h1>
        <p className="text-gray-400 mb-2">User role: <span className="text-white font-mono">{user?.role || 'undefined'}</span></p>
        <p className="text-gray-400 mb-6">Email: <span className="text-white">{user?.email || 'undefined'}</span></p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Reload Page
        </button>
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
