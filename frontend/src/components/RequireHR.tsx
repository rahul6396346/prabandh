import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const RequireHR = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user || user.emptype !== 'hr') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default RequireHR; 