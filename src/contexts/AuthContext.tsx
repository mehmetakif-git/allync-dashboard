import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn, signOut, getCurrentUser, onAuthStateChange, AuthUser } from '../lib/auth';

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
    await signOut();
    setUser(null);
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