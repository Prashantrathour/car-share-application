import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  selectIsAuthenticated, 
  selectIsVerified, 
  selectIsActive,
  selectUserRole
} from '../features/auth';

// Higher-order component to protect routes that require authentication
export const RequireAuth = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Store the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};

// Higher-order component to check verification status
export const RequireVerification = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isVerified = useSelector(selectIsVerified);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isVerified) {
    toast.error('Please complete your account verification');
    return <Navigate to="/verification-status" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};

// Higher-order component to check if user is active
export const RequireActiveStatus = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isVerified = useSelector(selectIsVerified);
  const isActive = useSelector(selectIsActive);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isVerified) {
    toast.error('Please complete your account verification');
    return <Navigate to="/verification-status" state={{ from: location }} replace />;
  }

  if (!isActive) {
    toast.error('Your account is not active');
    return <Navigate to="/verification-status" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};

// Higher-order component to check user role
export const RequireRole = ({ allowedRoles, children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isVerified = useSelector(selectIsVerified);
  const isActive = useSelector(selectIsActive);
  const userRole = useSelector(selectUserRole);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isVerified) {
    toast.error('Please complete your account verification');
    return <Navigate to="/verification-status" state={{ from: location }} replace />;
  }

  if (!isActive) {
    toast.error('Your account is not active');
    return <Navigate to="/verification-status" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
};

// Higher-order component to redirect if already authenticated
export const RedirectIfAuthenticated = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return children || <Outlet />;
};

// Combined protection for routes that need full authentication, verification, and active status
export const FullAuthProtection = ({ allowedRoles, children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isVerified = useSelector(selectIsVerified);
  const isActive = useSelector(selectIsActive);
  const userRole = useSelector(selectUserRole);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isVerified) {
    toast.error('Please complete your account verification');
    return <Navigate to="/verification-status" state={{ from: location }} replace />;
  }

  if (!isActive) {
    toast.error('Your account is not active');
    return <Navigate to="/verification-status" state={{ from: location }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}; 