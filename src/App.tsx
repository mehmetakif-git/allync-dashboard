import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

// Layouts
import SuperAdminLayout from './layouts/SuperAdminLayout';
import CompanyLayout from './layouts/CompanyLayout';

// Super Admin Pages
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import CompaniesManagement from './pages/admin/CompaniesManagement';
import CompanyDetail from './pages/admin/CompanyDetail';
import UsersManagement from './pages/admin/UsersManagement';
import UserInvite from './pages/admin/UserInvite';
import ServicesCatalog from './pages/admin/ServicesCatalog';
import NotificationsManagement from './pages/admin/NotificationsManagement';
import RevenueAnalytics from './pages/admin/RevenueAnalytics';
import InvoicesManagement from './pages/admin/InvoicesManagement';
import SupportTicketsManagement from './pages/admin/SupportTicketsManagement';
import SystemSettings from './pages/admin/SystemSettings';
import MaintenanceMode from './pages/admin/MaintenanceMode';
import ActivityLogs from './pages/admin/ActivityLogs';

// Service Management Pages
import WhatsAppServiceManagement from './pages/admin/services/WhatsAppServiceManagement';
import InstagramServiceManagement from './pages/admin/services/InstagramServiceManagement';
import CalendarServiceManagement from './pages/admin/services/CalendarServiceManagement';
import SheetsServiceManagement from './pages/admin/services/SheetsServiceManagement';
import GmailServiceManagement from './pages/admin/services/GmailServiceManagement';
import DocsServiceManagement from './pages/admin/services/DocsServiceManagement';
import DriveServiceManagement from './pages/admin/services/DriveServiceManagement';
import PhotosServiceManagement from './pages/admin/services/PhotosServiceManagement';
import WebsiteServiceManagement from './pages/admin/services/WebsiteServiceManagement';
import MobileAppServiceManagement from './pages/admin/services/MobileAppServiceManagement';

// Company/User Pages
import CompanyAdminDashboard from './pages/CompanyAdminDashboard';
import Services from './pages/Services';
import Invoices from './pages/Invoices';
import Support from './pages/Support';
import Settings from './pages/Settings';

// Service Pages (Company/User)
import WhatsAppAutomation from './pages/services/WhatsAppAutomation';
import InstagramAutomation from './pages/services/InstagramAutomation';
import GoogleCalendar from './pages/services/GoogleCalendar';
import GoogleSheets from './pages/services/GoogleSheets';
import Gmail from './pages/services/Gmail';
import GoogleDocs from './pages/services/GoogleDocs';
import GoogleDrive from './pages/services/GoogleDrive';
import GooglePhotos from './pages/services/GooglePhotos';
import WebsiteDevelopment from './pages/services/WebsiteDevelopment';
import MobileAppDevelopment from './pages/services/MobileAppDevelopment';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Super Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <SuperAdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Default route - Super Admin Dashboard */}
              <Route index element={<SuperAdminDashboard />} />
              
              {/* Companies */}
              <Route path="companies" element={<CompaniesManagement />} />
              <Route path="companies/:id" element={<CompanyDetail />} />
              
              {/* Users */}
              <Route path="users" element={<UsersManagement />} />
              <Route path="users/invite" element={<UserInvite />} />
              
              {/* Services */}
              <Route path="services" element={<ServicesCatalog />} />
              <Route path="services/whatsapp" element={<WhatsAppServiceManagement />} />
              <Route path="services/instagram" element={<InstagramServiceManagement />} />
              <Route path="services/calendar" element={<CalendarServiceManagement />} />
              <Route path="services/sheets" element={<SheetsServiceManagement />} />
              <Route path="services/gmail" element={<GmailServiceManagement />} />
              <Route path="services/docs" element={<DocsServiceManagement />} />
              <Route path="services/drive" element={<DriveServiceManagement />} />
              <Route path="services/photos" element={<PhotosServiceManagement />} />
              <Route path="services/website" element={<WebsiteServiceManagement />} />
              <Route path="services/mobile-app" element={<MobileAppServiceManagement />} />
              
              {/* Management */}
              <Route path="notifications" element={<NotificationsManagement />} />
              <Route path="revenue" element={<RevenueAnalytics />} />
              <Route path="invoices" element={<InvoicesManagement />} />
              <Route path="support" element={<SupportTicketsManagement />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="maintenance" element={<MaintenanceMode />} />
              <Route path="logs" element={<ActivityLogs />} />
            </Route>

            {/* Company Admin & User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <CompanyLayout />
                </ProtectedRoute>
              }
            >
              {/* Default route - Company Dashboard */}
              <Route index element={<CompanyAdminDashboard />} />
              <Route path="services" element={<Services />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="support" element={<Support />} />
              <Route path="settings" element={<Settings />} />
              
              {/* Service Pages */}
              <Route path="services/whatsapp" element={<WhatsAppAutomation />} />
              <Route path="services/instagram" element={<InstagramAutomation />} />
              <Route path="services/calendar" element={<GoogleCalendar />} />
              <Route path="services/sheets" element={<GoogleSheets />} />
              <Route path="services/gmail" element={<Gmail />} />
              <Route path="services/docs" element={<GoogleDocs />} />
              <Route path="services/drive" element={<GoogleDrive />} />
              <Route path="services/photos" element={<GooglePhotos />} />
              <Route path="services/website" element={<WebsiteDevelopment />} />
              <Route path="services/mobile-app" element={<MobileAppDevelopment />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}