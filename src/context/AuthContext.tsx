import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  error: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials as specified
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = '0247';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  // Check session on mount
  useEffect(() => {
    const session = sessionStorage.getItem('shafqat_poultry_auth');
    if (session === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      sessionStorage.setItem('shafqat_poultry_auth', 'authenticated');
      return true;
    } else {
      setError('Invalid username or password');
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('shafqat_poultry_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
