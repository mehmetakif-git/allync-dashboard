import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import MaintenanceGuard from './components/MaintenanceGuard';
import Login from './pages/auth/Login';
import MaintenancePage from './pages/MaintenancePage';

// Layouts
import SuperAdminLayout from '././layouts/SuperAdminLayout';
import CompanyLayout from '././layouts/CompanyLayout';

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

// Service Management Pages (Super Admin Only)
import WebsiteServiceManagement from './pages/admin/services/WebsiteServiceManagement';
import MobileAppServiceManagement from './pages/admin/services/MobileAppServiceManagement';

// Company/User Pages
import CompanyAdminDashboard from './pages/dasboard/CompanyAdminDashboard';
import Services from './pages/dasboard/Services';
import Invoices from './pages/dasboard/Invoices';
import Support from './pages/dasboard/Support';
import Settings from './pages/dasboard/Settings';

// Service Pages (Company/User)
import WebsiteDevelopment from './pages/dasboard/services/WebsiteDevelopment';
import MobileAppDevelopment from './pages/dasboard/services/MobileAppDevelopment';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Maintenance Page - Public (no auth required) */}
            <Route path="/maintenance" element={<MaintenancePage />} />

            {/* Super Admin Routes - NO MAINTENANCE GUARD (Super admins always have access) */}
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
              <Route path="services-catalog" element={<ServicesCatalog />} />
              <Route path="services/website-development" element={<WebsiteServiceManagement />} />
              <Route path="services/mobile-app-development" element={<MobileAppServiceManagement />} />
              
              {/* Management */}
              <Route path="notifications" element={<NotificationsManagement />} />
              <Route path="revenue" element={<RevenueAnalytics />} />
              <Route path="invoices" element={<InvoicesManagement />} />
              <Route path="support-tickets" element={<SupportTicketsManagement />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="maintenance" element={<MaintenanceMode />} />
              <Route path="logs" element={<ActivityLogs />} />
            </Route>

            {/* Company Admin & User Routes - WITH MAINTENANCE GUARD */}
            <Route
              path="/dashboard"
              element={
                <MaintenanceGuard>
                  <ProtectedRoute>
                    <CompanyLayout />
                  </ProtectedRoute>
                </MaintenanceGuard>
              }
            >
              {/* Default route - Company Dashboard */}
              <Route index element={<CompanyAdminDashboard />} />
              <Route path="services" element={<Services />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="support" element={<Support />} />
              <Route path="settings" element={<Settings />} />
              
              {/* Service Pages */}
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