import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectCurrentUser, 
  getCurrentUser
} from '../../features/auth';
import toast from 'react-hot-toast';
import { sendEmailOTP, sendPhoneOTP } from '../../features/auth/authThunks';

const VerificationStatus = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [accountActive, setAccountActive] = useState(false);
  
  // Initialize verification status from user data
  useEffect(() => {
    if (user) {
      setEmailVerified(user.isEmailVerified || false);
      setPhoneVerified(user.isPhoneVerified || false);
      setAccountActive(user.status === 'active');
      
      // If user is fully verified and active, redirect to home
      if (user.isEmailVerified && user.isPhoneVerified && user.status === 'active') {
        toast.success('Your account is fully verified!');
        navigate('/');
      }
    }
  }, [user, navigate]);
  
  // Request email verification code
  const handleRequestEmailVerification = async () => {
    setLoading(true);
    
    try {
      const resultAction = await dispatch(sendEmailOTP());
      
      if (sendEmailOTP.fulfilled.match(resultAction)) {
        toast.success('Verification email sent! Please check your inbox.');
        navigate('/verify-email');
      } else if (sendEmailOTP.rejected.match(resultAction)) {
        toast.error(resultAction.payload || 'Failed to send verification email');
      }
    } catch (error) {
      toast.error('An error occurred while requesting email verification');
    } finally {
      setLoading(false);
    }
  };
  
  // Request phone verification code
  const handleRequestPhoneVerification = async () => {
    setLoading(true);
    
    try {
      const resultAction = await dispatch(sendPhoneOTP());
      
      if (sendPhoneOTP.fulfilled.match(resultAction)) {
        toast.success('Verification code sent to your phone!');
        navigate('/verify-phone');
      } else if (sendPhoneOTP.rejected.match(resultAction)) {
        toast.error(resultAction.payload || 'Failed to send verification code');
      }
    } catch (error) {
      toast.error('An error occurred while requesting phone verification');
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh user data
  const refreshUserData = async () => {
    setLoading(true);
    
    try {
      const resultAction = await dispatch(getCurrentUser());
      
      if (getCurrentUser.fulfilled.match(resultAction)) {
        const { user } = resultAction.payload;
        setEmailVerified(user.isEmailVerified || false);
        setPhoneVerified(user.isPhoneVerified || false);
        setAccountActive(user.status === 'active');
        
        // If user is fully verified and active, redirect to home
        if (user.isEmailVerified && user.isPhoneVerified && user.status === 'active') {
          toast.success('Your account is fully verified!');
          navigate('/');
        }
      } else if (getCurrentUser.rejected.match(resultAction)) {
        toast.error(resultAction.payload || 'Failed to refresh user data');
      }
    } catch (error) {
      toast.error('An error occurred while refreshing user data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Account Verification Status
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Complete the verification steps to access all features.
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Email Verification
              </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                <span>
                    {emailVerified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Not Verified
                      </span>
                    )}
                </span>
                  
                  {!emailVerified && (
                      <button
                    onClick={handleRequestEmailVerification}
                    disabled={loading}
                    className="ml-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Verify Email'}
                      </button>
                  )}
                </dd>
              </div>
              
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Phone Verification
              </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                <span>
                    {phoneVerified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Not Verified
                      </span>
                    )}
                </span>
                  
                  {!phoneVerified && (
                      <button
                    onClick={handleRequestPhoneVerification}
                    disabled={loading || !emailVerified}
                    className={`ml-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                      !emailVerified 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    } disabled:opacity-50`}
                  >
                    {loading ? 'Sending...' : 'Verify Phone'}
                      </button>
                  )}
                </dd>
              </div>
              
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Account Status
              </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {accountActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        
        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={refreshUserData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Status'}
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Home
            </button>
        </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {emailVerified && phoneVerified ? (
                accountActive ? (
                  'Your account is fully verified and active. You can now access all features.'
                ) : (
                  'Your account is verified but not yet active. This usually happens automatically within a few minutes.'
                )
              ) : (
                'Please complete all verification steps to activate your account.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus; 