import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import Header from '../components/Header';
import ForcePasswordChangeModal from '../components/ForcePasswordChangeModal';

export default function SuperAdminLayout() {
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
    <div className="min-h-screen bg-[#131A29] flex">
      <SuperAdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Force Password Change Modal - Shows if user has temporary password */}
      {showPasswordModal && (
        <ForcePasswordChangeModal onPasswordChanged={handlePasswordChanged} />
      )}
    </div>
  );
}