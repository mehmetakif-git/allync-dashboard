import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn, signOut, getCurrentUser, onAuthStateChange, AuthUser } from '../lib/auth';
import activityLogger from '../lib/services/activityLogger'; // ✅ Activity Logger

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;  // ✅ AuthUser return!
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current session on mount
    getCurrentUser().then(user => {
      setUser(user);
      setIsLoading(false);
    });

    // Listener'ı GEÇİCİ KAPAT (test için)
    // const { data: { subscription } } = onAuthStateChange((user) => {
    //   console.log('👤 User changed:', user?.email);
    //   setUser(user);
    //   setIsLoading(false);
    // });

    // return () => {
    //   subscription?.unsubscribe();
    // };
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {  // ✅ Return type!
    console.log('🎯 AuthContext.login called');
    const user = await signIn(email, password);
    console.log('🎯 signIn returned:', user);
    setUser(user);
    return user;  // ✅ User'ı return et
  };

  const logout = async () => {
    console.log('👋 Logging out...');
    
    try {
      // ✅ LOGOUT'U LOGLA (signOut ÖNCE!)
      if (user) {
        console.log('📝 Tracking logout for user:', user.email);
        await activityLogger.logLogout();
      }
      
      // Supabase'den çıkış yap
      await signOut();
      
      // Activity logger'ı temizle
      activityLogger.clearUser();
      
      // Local state'i temizle
      setUser(null);
      
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      
      // Hata olsa bile temizle
      activityLogger.clearUser();
      setUser(null);
      
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}