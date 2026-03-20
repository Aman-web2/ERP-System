import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { canAccess } from '../utils/permissions';

const ProtectedRoute = ({ moduleKey }) => {
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (moduleKey && !canAccess(userInfo, moduleKey)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

