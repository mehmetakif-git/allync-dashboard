import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getActiveMaintenanceWindow } from '../lib/api/maintenanceWindows';
import LoadingSpinner from '../components/LoadingSpinner';

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

export default function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);

  useEffect(() => {
    checkMaintenanceStatus();
    
    // Check every 30 seconds for maintenance status changes
    const interval = setInterval(checkMaintenanceStatus, 30000);
    
    return () => clearInterval(interval);
  }, [location.pathname]);

  const checkMaintenanceStatus = async () => {
    try {
      // Don't check if on maintenance page already
      if (location.pathname === '/maintenance') {
        setIsChecking(false);
        return;
      }

      const activeWindow = await getActiveMaintenanceWindow();
      
      if (activeWindow) {
        console.log('⚠️ Maintenance mode is active:', activeWindow);
        setIsMaintenanceActive(true);
      } else {
        setIsMaintenanceActive(false);
      }
      
    } catch (error) {
      console.error('Failed to check maintenance status:', error);
      // On error, assume no maintenance to avoid blocking users
      setIsMaintenanceActive(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-muted mt-4">Checking system status...</p>
        </div>
      </div>
    );
  }

  // If maintenance is active and user is NOT super admin → redirect to maintenance page
  if (isMaintenanceActive && user?.role !== 'super_admin') {
    console.log('🚧 Redirecting to maintenance page');
    return <Navigate to="/maintenance" replace />;
  }

  // If maintenance is NOT active but user is on maintenance page → redirect to home
  if (!isMaintenanceActive && location.pathname === '/maintenance') {
    console.log('✅ Maintenance ended, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // All checks passed, render children
  return <>{children}</>;
}