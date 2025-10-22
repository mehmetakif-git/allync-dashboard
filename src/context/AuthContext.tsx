import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<string, User> = {
  'admin@allync.com': {
    id: '1',
    name: 'Allync Admin',
    email: 'admin@allync.com',
    role: 'SUPER_ADMIN',
    companyId: '2e661604-cf99-4cbd-8db3-1d8eae58327a', // ✅ Allync UUID
    companyName: 'Allync',
    phone: '+1 555 999 8888',
    language: 'EN',
  },
  'info@allyncai.com': {
    id: '1',
    name: 'Allync Admin',
    email: 'info@allyncai.com',
    role: 'SUPER_ADMIN',
    companyId: '2e661604-cf99-4cbd-8db3-1d8eae58327a', // ✅ Allync UUID
    companyName: 'Allync',
    phone: '+1 555 999 8888',
    language: 'EN',
  },
  'company@example.com': {
    id: '2',
    name: 'Sarah Smith',
    email: 'company@example.com',
    role: 'COMPANY_ADMIN',
    companyId: '3c718eec-c7d6-434a-9bb4-8492347d6bab', // ✅ Tech Corp UUID
    companyName: 'Tech Corp',
    phone: '+90 555 123 4567',
    language: 'EN',
  },
  'user@example.com': {
    id: '3',
    name: 'Ahmed Ali',
    email: 'user@example.com',
    role: 'USER',
    companyId: '3c718eec-c7d6-434a-9bb4-8492347d6bab', // ✅ Tech Corp UUID
    companyName: 'Tech Corp',
    phone: '+90 555 777 8888',
    language: 'EN',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', email);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const foundUser = mockUsers[email];
      if (foundUser) {
        console.log('Login successful! User role:', foundUser.role);
        setUser(foundUser);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
