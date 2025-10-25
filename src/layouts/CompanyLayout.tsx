import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import CompanySidebar from '../components/CompanySidebar';
import Header from '../components/Header';

export default function CompanyLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex">
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
    </div>
  );
}