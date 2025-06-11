import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { verifyPhone, requestPhoneVerification } from '../../features/auth';

const PhoneVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Handle verification code input
  const handleCodeChange = (e) => {
    setVerificationCode(e.target.value);
  };
  
  // Handle verification code submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }
    
    setLoading(true);
    
    try {
      const resultAction = await dispatch(verifyPhone(verificationCode)).unwrap();
      console.log('Verification result:', resultAction);
      
      toast.success('Phone verified successfully!');
      navigate('/verification-status');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error || 'An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };
  
  // Request a new verification code
  const handleResendCode = async () => {
    setLoading(true);
    
    try {
      const resultAction = await dispatch(requestPhoneVerification()).unwrap();
      toast.success('New verification code sent to your phone!');
    } catch (error) {
      toast.error(error || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };
  
  // Mask phone number for display
  const maskPhoneNumber = (phone) => {
    if (!phone) return '';
    
    const digits = phone.replace(/\D/g, '');
    const lastFour = digits.slice(-4);
    return `******${lastFour}`;
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Phone
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification code to {user?.phone ? maskPhoneNumber(user.phone) : 'your phone'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <div className="mt-1">
              <input
                id="verification-code"
                name="code"
                type="text"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={handleCodeChange}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              Resend Code
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/verification-status')}
              className="text-sm font-medium text-gray-600 hover:text-gray-500"
            >
              Back to Verification Status
            </button>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              Verify Phone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhoneVerification; 