import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '../components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userTypes?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userTypes = [] }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        setIsAuthenticated(isLoggedIn);

        // If user types restriction is provided, check if user is authorized
        if (isLoggedIn && userTypes.length > 0) {
          const userType = localStorage.getItem('userType');
          setIsAuthorized(userType ? userTypes.includes(userType) : false);
        } else if (isLoggedIn) {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, [userTypes]);

  // Loading state
  if (isAuthenticated === null || (isAuthenticated && isAuthorized === null)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Not authorized for this route
  if (!isAuthorized) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;