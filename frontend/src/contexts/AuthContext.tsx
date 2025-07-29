import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseAuth } from '../lib/supabase';

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
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
      console.log('Initializing authentication...');
      
      // Check for existing session
      const session = await supabaseAuth.getSession();
      const currentUser = await supabaseAuth.getCurrentUser();
      
      console.log('Session found:', !!session);
      console.log('Current user:', currentUser);

      if (session && currentUser) {
        // Convert Supabase user to our User interface
        const userData: User = {
          id: currentUser.id || currentUser.username,
          username: currentUser.username || currentUser.email?.split('@')[0] || 'user',
          email: currentUser.email || '',
          role: currentUser.role || 'user',
          full_name: currentUser.full_name || currentUser.username || 'User',
          phone: currentUser.phone,
          is_active: currentUser.is_active !== false,
          permissions: currentUser.permissions || []
        };

        setToken(session.access_token);
        setUser(userData);
        
        console.log('Authentication initialized successfully:', userData);
      } else {
        console.log('No valid session found');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting login for:', username);
      
      const result = await supabaseAuth.login(username, password);
      
      console.log('Login successful:', result);
      
      // Ensure the user object matches our User interface
      const userData: User = {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email || '',
        role: result.user.role as 'admin' | 'manager' | 'staff' | 'security',
        full_name: result.user.full_name,
        phone: result.user.phone,
        is_active: result.user.is_active,
        permissions: result.user.permissions
      };
      
      setToken(result.token);
      setUser(userData);
      
      // Store in localStorage for persistence
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await supabaseAuth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    console.log('Clearing authentication...');
    setToken(null);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('demoSession');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin' || user.permissions.includes('all')) return true;
    
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
  const { isAuthenticated, hasPermission, isRole, isLoading, user } = useAuth();

  console.log('ProtectedRoute - isLoading:', isLoading);
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - permission:', permission);
  console.log('ProtectedRoute - role:', role);

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
    console.log('Not authenticated, redirecting to login');
    window.location.href = '/login';
    return null;
  }

  // Check permission if specified
  if (permission && !hasPermission(permission)) {
    console.log('Permission denied:', permission);
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
    console.log('Role denied:', role);
    return fallback || (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-golden-300">You don't have the required role to access this page.</p>
        </div>
      </div>
    );
  }

  console.log('ProtectedRoute - rendering children');
  return <>{children}</>;
};

export default AuthProvider; 