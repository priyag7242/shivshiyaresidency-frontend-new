import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'security';
  full_name: string;
  phone?: string;
  is_active: boolean;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  isRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Set axios default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Verify token with backend
        try {
          const response = await axios.get(`/api/auth/verify`);
          if (response.data.valid) {
            setToken(storedToken);
            setUser(response.data.user);
          } else {
            // Token is invalid, clear everything
            clearAuth();
          }
        } catch (error) {
          // Token verification failed, clear everything
          console.error('Token verification failed:', error);
          clearAuth();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    
    // Store in localStorage
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // Set axios default authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      if (token) {
        await axios.post(`/api/auth/logout`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    setToken(null);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove axios default authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.permissions.includes('all')) return true;
    
    // Check specific permission
    return user.permissions.includes(permission);
  };

  const isRole = (role: string): boolean => {
    return user?.role === role;
  };

  const isAuthenticated = !!token && !!user;

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isLoading,
    hasPermission,
    isRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
  role?: string;
  fallback?: ReactNode;
}

export const ProtectedRoute = ({ 
  children, 
  permission, 
  role, 
  fallback 
}: ProtectedRouteProps) => {
  const { isAuthenticated, hasPermission, isRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golden-500 mx-auto mb-4"></div>
          <p className="text-golden-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  // Check permission if specified
  if (permission && !hasPermission(permission)) {
    return fallback || (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-golden-300">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Check role if specified
  if (role && !isRole(role)) {
    return fallback || (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-golden-300">You don't have the required role to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider; 