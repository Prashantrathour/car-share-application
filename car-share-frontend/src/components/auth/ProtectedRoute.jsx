import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  selectIsAuthenticated, 
  selectIsVerified, 
  selectIsActive,
  selectUserRole
} from '../../features/auth';
import toast from 'react-hot-toast';

/**
 * ProtectedRoute component that handles route protection based on authentication and verification status
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if conditions are met
 * @param {string[]} [props.allowedRoles] - Optional array of roles allowed to access the route
 * @param {boolean} [props.requireVerification=true] - Whether to require email and phone verification
 * @param {boolean} [props.requireActive=true] - Whether to require an active account status
 * @returns {React.ReactNode} - The protected route or a redirect
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles,
  requireVerification = true,
  requireActive = true
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isVerified = useSelector(selectIsVerified);
  const isActive = useSelector(selectIsActive);
  const userRole = useSelector(selectUserRole);
  const location = useLocation();
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if user is verified (if required)
  if (requireVerification && !isVerified) {
    toast.error('Please complete your account verification');
    return <Navigate to="/verification-status" state={{ from: location }} replace />;
  }
  
  // Check if user account is active (if required)
  if (requireActive && !isActive) {
    toast.error('Your account is not active');
    return <Navigate to="/verification-status" state={{ from: location }} replace />;
  }
  
  // Check if user has required role (if specified)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      toast.error('You do not have permission to access this page');
      return <Navigate to="/" replace />;
    }
  }
  
  // All checks passed, render the protected content
  return children;
};

export default ProtectedRoute; 