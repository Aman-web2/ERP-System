import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { canAccess } from '../utils/permissions';

const ProtectedRoute = ({ moduleKey }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  const { status } = userInfo;
  const path = location.pathname;

  if (status === 'PendingDetails' && path !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  if (status === 'PendingApproval' && path !== '/pending-approval') {
    return <Navigate to="/pending-approval" replace />;
  }

  if ((status === 'Active' || !status) && (path === '/complete-profile' || path === '/pending-approval')) {
    return <Navigate to="/dashboard" replace />;
  }

  if (moduleKey && !canAccess(userInfo, moduleKey)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

