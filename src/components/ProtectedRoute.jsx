import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './ui/LoadingSpinner';

export default function ProtectedRoute({ children, requiredRole, requireApproved = false }) {
  const { user, userProfile, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) return <Navigate to="/" replace />;

  // Media pending approval
  if (
    userProfile?.userType === 'media' &&
    !userProfile?.approved &&
    window.location.pathname !== '/pending-approval'
  ) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (requiredRole && userProfile?.userType !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (requireApproved && !userProfile?.approved) {
    return <Navigate to="/pending-approval" replace />;
  }

  return children;
}
