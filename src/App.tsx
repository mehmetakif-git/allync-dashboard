import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Login from './pages/Login';
import Services from './pages/Services';
import Invoices from './pages/Invoices';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Header from './components/Header';
import SuperAdminSidebar from './components/SuperAdminSidebar';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import CompanySidebar from './components/CompanySidebar';
import CompanyAdminDashboard from './pages/CompanyAdminDashboard';
import CompaniesManagement from './pages/admin/CompaniesManagement';
import UsersManagement from './pages/admin/UsersManagement';
import UserInvite from './pages/admin/UserInvite';
import NotificationsManagement from './pages/admin/NotificationsManagement';
import RevenueAnalytics from './pages/admin/RevenueAnalytics';
import InvoicesManagement from './pages/admin/InvoicesManagement';
import SupportTicketsManagement from './pages/admin/SupportTicketsManagement';
import SystemSettings from './pages/admin/SystemSettings';
import MaintenanceMode from './pages/admin/MaintenanceMode';
import ActivityLogs from './pages/admin/ActivityLogs';
import ServicesCatalog from './pages/admin/ServicesCatalog';
import CompanyDetail from './pages/admin/CompanyDetail';
import WhatsAppServiceManagement from './pages/admin/services/WhatsAppServiceManagement';
import InstagramServiceManagement from './pages/admin/services/InstagramServiceManagement';
import CalendarServiceManagement from './pages/admin/services/CalendarServiceManagement';
import SheetsServiceManagement from './pages/admin/services/SheetsServiceManagement';
import GmailServiceManagement from './pages/admin/services/GmailServiceManagement';
import DocsServiceManagement from './pages/admin/services/DocsServiceManagement';
import DriveServiceManagement from './pages/admin/services/DriveServiceManagement';
import PhotosServiceManagement from './pages/admin/services/PhotosServiceManagement';
import WhatsAppAutomation from './pages/services/WhatsAppAutomation';
import InstagramAutomation from './pages/services/InstagramAutomation';
import GoogleCalendar from './pages/services/GoogleCalendar';
import GoogleSheets from './pages/services/GoogleSheets';
import Gmail from './pages/services/Gmail';
import GoogleDocs from './pages/services/GoogleDocs';
import GoogleDrive from './pages/services/GoogleDrive';
import GooglePhotos from './pages/services/GooglePhotos';
import WebsiteDevelopment from './pages/services/WebsiteDevelopment';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serviceSlug, setServiceSlug] = useState<string>('');
  const [superAdminPage, setSuperAdminPage] = useState('admin-dashboard');
  const [companyDetailId, setCompanyDetailId] = useState<string>('');

  console.log('Current user:', user);
  console.log('Is authenticated:', isAuthenticated);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isCompanyAdmin = user?.role === 'COMPANY_ADMIN';
  const isRegularUser = user?.role === 'USER';

  console.log('Role checks:', { isSuperAdmin, isCompanyAdmin, isRegularUser });

  // Super Admin hash navigation
  useEffect(() => {
    if (isSuperAdmin) {
      const handleSuperAdminHash = () => {
        const hash = window.location.hash.slice(1);

        // Check for company detail page
        if (hash.startsWith('company-detail/')) {
          const companyId = hash.replace('company-detail/', '');
          setCompanyDetailId(companyId);
          setSuperAdminPage('company-detail');
        } else if (hash && !hash.startsWith('service/')) {
          setSuperAdminPage(hash);
          setCompanyDetailId('');
        } else if (!hash) {
          setSuperAdminPage('admin-dashboard');
          setCompanyDetailId('');
        }
      };

      handleSuperAdminHash();
      window.addEventListener('hashchange', handleSuperAdminHash);
      return () => window.removeEventListener('hashchange', handleSuperAdminHash);
    }
  }, [isSuperAdmin]);

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
            {superAdminPage === 'whatsapp-service-management' && <WhatsAppServiceManagement />}
            {superAdminPage === 'instagram-service-management' && <InstagramServiceManagement />}
            {superAdminPage === 'google-calendar-management' && <CalendarServiceManagement />}
            {superAdminPage === 'google-sheets-management' && <SheetsServiceManagement />}
            {superAdminPage === 'gmail-management' && <GmailServiceManagement />}
            {superAdminPage === 'google-docs-management' && <DocsServiceManagement />}
            {superAdminPage === 'google-drive-management' && <DriveServiceManagement />}
            {superAdminPage === 'google-photos-management' && <PhotosServiceManagement />}
            {superAdminPage === 'website-development-management' && <div className="p-6"><h1 className="text-white text-2xl">Website Development Management (Coming Soon)</h1></div>}
            {superAdminPage === 'companies-management' && <CompaniesManagement />}
            {superAdminPage === 'company-detail' && companyDetailId && (
              <CompanyDetail
                companyId={companyDetailId}
                onBack={() => {
                  window.location.hash = 'companies-management';
                  setSuperAdminPage('companies-management');
                  setCompanyDetailId('');
                }}
              />
            )}
            {superAdminPage === 'users-management' && <UsersManagement />}
            {superAdminPage === 'user-invite' && <UserInvite />}
            {superAdminPage === 'notifications-management' && <NotificationsManagement />}
            {superAdminPage === 'revenue-analytics' && <RevenueAnalytics />}
            {superAdminPage === 'invoices-management' && <InvoicesManagement />}
            {superAdminPage === 'support-tickets' && <SupportTicketsManagement />}
            {superAdminPage === 'system-settings' && <SystemSettings />}
            {superAdminPage === 'maintenance-mode' && <MaintenanceMode />}
            {superAdminPage === 'activity-logs' && <ActivityLogs />}
            {superAdminPage === 'service-whatsapp' && <div className="p-6"><h1 className="text-white text-2xl">WhatsApp Dashboard (Coming Soon)</h1></div>}
            {superAdminPage === 'service-instagram' && <div className="p-6"><h1 className="text-white text-2xl">Instagram Dashboard (Coming Soon)</h1></div>}
          </main>
        </div>
      </div>
    );
  }

  if (isCompanyAdmin || isRegularUser) {
    console.log('Rendering Company/User layout');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
        <CompanySidebar
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

            {activePage === 'settings' && isCompanyAdmin && <Settings />}
            {activePage === 'settings' && isRegularUser && (
              <div className="p-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                  <p className="text-gray-400">Only Company Admins can access Settings.</p>
                </div>
              </div>
            )}

            {activePage === 'invoices' && isCompanyAdmin && <Invoices />}
            {activePage === 'invoices' && isRegularUser && (
              <div className="p-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                  <p className="text-gray-400">Only Company Admins can access Invoices. Contact your admin for billing information.</p>
                </div>
              </div>
            )}

            {activePage === 'support' && <Support />}
            {activePage === 'whatsapp-automation' && <WhatsAppAutomation />}
            {activePage === 'instagram-automation' && <InstagramAutomation />}
            {activePage === 'google-calendar' && <GoogleCalendar />}
            {activePage === 'google-sheets' && <GoogleSheets />}
            {activePage === 'gmail-integration' && <Gmail />}
            {activePage === 'google-docs' && <GoogleDocs />}
            {activePage === 'google-drive' && <GoogleDrive />}
            {activePage === 'google-photos' && <GooglePhotos />}
            {activePage === 'website-development' && <WebsiteDevelopment />}
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
