import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedUserTypes?: string[];
};

const ProtectedRoute = ({ children, allowedUserTypes }: ProtectedRouteProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const location = useLocation();
  const { isAuthenticated, userType, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const checkAuthorization = () => {
      if (authLoading) return; // Wait for auth to complete
      
      if (!isAuthenticated) {
        setIsAuthorized(false);
        return;
      }

      // Authorization check
      if (allowedUserTypes && allowedUserTypes.length > 0) {
        const isAllowed = userType ? allowedUserTypes.includes(userType) : false;
        console.log('Authorization check:', { userType, allowedUserTypes, isAllowed });
        setIsAuthorized(isAllowed);
      } else {
        setIsAuthorized(true); // No restrictions specified
      }
    };

    checkAuthorization();
    }, [isAuthenticated, userType, allowedUserTypes, authLoading]);

  // Loading state
  if (authLoading || isAuthorized === null) {
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

  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute;