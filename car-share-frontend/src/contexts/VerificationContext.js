import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUserProfile } from '../features/user';

const VerificationContext = createContext();

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};

export const VerificationProvider = ({ children }) => {
  const [verificationStatus, setVerificationStatus] = useState({
    emailVerified: false,
    phoneVerified: false,
    accountActive: false,
    loading: true,
    error: null
  });

  const userProfile = useSelector(selectUserProfile);
  
  useEffect(() => {
    if (userProfile) {
      setVerificationStatus({
        emailVerified: userProfile.isEmailVerified || false,
        phoneVerified: userProfile.isPhoneVerified || false,
        accountActive: userProfile.status === 'active',
        loading: false,
        error: null
      });
    }
  }, [userProfile]);

  const refetchStatus = () => {
    // Return a promise that resolves when the refetch is complete
    return new Promise((resolve, reject) => {
      if (!userProfile) {
        reject(new Error('User is not authenticated'));
        return;
      }
      
      // Set loading state
      setVerificationStatus(prev => ({
        ...prev,
        loading: true,
        error: null
      }));
      
      // Refetch verification status
      // This part is not provided in the original code or the new implementation
      // It's assumed to exist as it's called in the refetchStatus function
      // Implementation details are not provided in the original file or the new one
      // This function should be implemented to actually refetch the verification status
      // and update the verificationStatus state with the result
      // For example, using a Redux thunk or a custom API call
      // This is a placeholder and should be replaced with actual implementation
      resolve(userProfile);
    });
  };

  const value = {
    ...verificationStatus,
    refetchStatus
  };

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  );
}; 