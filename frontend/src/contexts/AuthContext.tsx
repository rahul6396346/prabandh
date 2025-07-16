import React, { createContext, useContext, useEffect, useState } from 'react';
import authService, { Faculty } from '@/services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Faculty | null;
  userType: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | undefined>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<Faculty | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Check if user has valid tokens
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        
        if (isLoggedIn && token) {
          console.log('Found existing auth tokens, validating...');
          
          // Validate and refresh auth if needed
          const isValid = await authService.validateAndRefreshAuth();
          
          if (isValid) {
            const storedUser = localStorage.getItem('user');
            const storedUserType = localStorage.getItem('userType');
            
            if (storedUser && storedUserType) {
              setUser(JSON.parse(storedUser));
              setUserType(storedUserType);
              setIsAuthenticated(true);
              console.log('Auth restored successfully');
            } else {
              // User data missing, fetch from server
              try {
                const userInfo = await authService.getUserInfo();
                setUser(userInfo);
                setUserType(userInfo.emptype || storedUserType);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(userInfo));
                if (userInfo.emptype) {
                  localStorage.setItem('userType', userInfo.emptype);
                }
                console.log('Auth restored and user data refreshed');
              } catch (userError) {
                console.error('Failed to fetch user info:', userError);
                clearAuth();
              }
            }
          } else {
            console.log('Token validation failed, clearing auth');
            clearAuth();
          }
        } else {
          console.log('No valid auth tokens found');
          clearAuth();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuth = () => {
    setIsAuthenticated(false);
    setUser(null);
    setUserType(null);
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({
        primary_email: email,
        password
      });
      setUser(response.user);
      setUserType(response.emptype);
      setIsAuthenticated(true);
      return response.emptype;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    try {
      const isValid = await authService.validateAndRefreshAuth();
      if (!isValid) {
        clearAuth();
      }
      return isValid;
    } catch (error) {
      console.error('Auth refresh failed:', error);
      clearAuth();
      return false;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    userType,
    isLoading,
    login,
    logout,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
