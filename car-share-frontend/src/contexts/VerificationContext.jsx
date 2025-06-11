import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateVerificationStatus, getCurrentUser } from '../features/auth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const VerificationContext = createContext();

export const VerificationProvider = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  const verificationStatus = useSelector(state => state.auth.verificationStatus);
  const loading = useSelector(state => state.auth.loading);
  const error = useSelector(state => state.auth.error);
  
  // Fetch user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, dispatch]);

  // Update verification status when user data changes
  useEffect(() => {
    // Skip if not authenticated or no user
    if (!isAuthenticated || !user) return;

    const newStatus = {
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      status: user.status,
      isComplete: user.isEmailVerified && user.isPhoneVerified
    };

    dispatch(updateVerificationStatus(newStatus));
  }, [user, isAuthenticated, dispatch]);

  const refetch = useCallback(() => {
    if (isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  const value = {
    isLoading: loading,
    isError: !!error,
    error,
    verificationStatus,
    needsVerification: isAuthenticated && (!verificationStatus?.isComplete || verificationStatus?.status !== 'active'),
    refetch,
    emailVerified: verificationStatus?.isEmailVerified || false,
    phoneVerified: verificationStatus?.isPhoneVerified || false,
    accountActive: verificationStatus?.isComplete || false
  };

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};

export default VerificationProvider; 