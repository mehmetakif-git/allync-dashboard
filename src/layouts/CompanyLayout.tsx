import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CompanySidebar from '../components/CompanySidebar';
import Header from '../components/Header';
import NotificationDebugger from '../components/NotificationDebugger';
import ForcePasswordChangeModal from '../components/ForcePasswordChangeModal';

export default function CompanyLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(
    (user as any)?.must_change_password === true
  );

  const handlePasswordChanged = () => {
    setShowPasswordModal(false);
    // Optionally refresh user data
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-mobile flex">
      <CompanySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* Debug tool - only shows for company_admin and super_admin */}
      <NotificationDebugger />

      {/* Force Password Change Modal - Shows if user has temporary password */}
      {showPasswordModal && (
        <ForcePasswordChangeModal onPasswordChanged={handlePasswordChanged} />
      )}
    </div>
  );
}