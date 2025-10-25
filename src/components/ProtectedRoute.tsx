import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'company_admin' | 'user';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole) {
    // Super admins can access everything
    if (user?.role === 'super_admin') {
      console.log('✅ Super admin access granted');
      return <>{children}</>;
    }

    // Check if user has required role
    if (user?.role !== requiredRole) {
      console.log('❌ Insufficient permissions');
      return (
        <div className="min-h-screen flex items-center justify-center bg-primary">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md">
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-muted mb-4">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  console.log('✅ Access granted for role:', user?.role);
  return <>{children}</>;
}