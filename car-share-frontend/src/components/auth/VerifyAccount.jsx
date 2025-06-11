import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail, verifyPhone, sendEmailOTP, sendPhoneOTP } from '../../features/auth/authThunks';
import toast from 'react-hot-toast';

const VerifyAccount = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector(state => state.auth.isLoading);

  const [verificationData, setVerificationData] = useState(null);
  const [formData, setFormData] = useState({
    emailOTP: '',
    phoneOTP: ''
  });

  useEffect(() => {
    const data = localStorage.getItem('verificationData');
    if (!data) {
      navigate('/login');
      return;
    }
    setVerificationData(JSON.parse(data));
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendEmailOTP = async () => {
    try {
      await dispatch(sendEmailOTP()).unwrap();
      toast.success('Email verification code sent!');
    } catch (error) {
      toast.error(error.message || 'Failed to send email verification code');
    }
  };

  const handleSendPhoneOTP = async () => {
    try {
      await dispatch(sendPhoneOTP()).unwrap();
      toast.success('Phone verification code sent!');
    } catch (error) {
      toast.error(error.message || 'Failed to send phone verification code');
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await dispatch(verifyEmail(formData.emailOTP)).unwrap();
      
      toast.success('Email verified successfully!');
      
      // Update verification data
      setVerificationData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          isEmailVerified: true
        }
      }));
    } catch (error) {
      toast.error(error.message || 'Email verification failed');
    }
  };

  const handleVerifyPhone = async () => {
    try {
      await dispatch(verifyPhone(formData.phoneOTP)).unwrap();
      
      toast.success('Phone number verified successfully!');
      
      // Update verification data
      setVerificationData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          isPhoneVerified: true
        }
      }));
    } catch (error) {
      toast.error(error.message || 'Phone verification failed');
    }
  };

  if (!verificationData) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Verify Your Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please verify both your email and phone number to continue
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Email Verification */}
          <div className="space-y-4">
            <div>
              <label htmlFor="emailOTP" className="block text-sm font-medium text-gray-700">
                Email Verification Code
              </label>
              <div className="mt-1 flex">
                <input
                  id="emailOTP"
                  name="emailOTP"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter email OTP"
                  value={formData.emailOTP}
                  onChange={handleChange}
                  disabled={verificationData.user.isEmailVerified}
                />
                <button
                  type="button"
                  onClick={handleSendEmailOTP}
                  disabled={verificationData.user.isEmailVerified}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Send OTP
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleVerifyEmail}
              disabled={verificationData.user.isEmailVerified}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {verificationData.user.isEmailVerified ? 'Email Verified' : 'Verify Email'}
            </button>
          </div>

          {/* Phone Verification */}
          <div className="space-y-4">
            <div>
              <label htmlFor="phoneOTP" className="block text-sm font-medium text-gray-700">
                Phone Verification Code
              </label>
              <div className="mt-1 flex">
                <input
                  id="phoneOTP"
                  name="phoneOTP"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter phone OTP"
                  value={formData.phoneOTP}
                  onChange={handleChange}
                  disabled={verificationData.user.isPhoneVerified}
                />
                <button
                  type="button"
                  onClick={handleSendPhoneOTP}
                  disabled={verificationData.user.isPhoneVerified}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Send OTP
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleVerifyPhone}
              disabled={verificationData.user.isPhoneVerified}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {verificationData.user.isPhoneVerified ? 'Phone Verified' : 'Verify Phone'}
            </button>
          </div>
        </div>

        {/* Status Display */}
        <div className="mt-6">
          <div className="rounded-md bg-gray-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-gray-700">
                  Email Status: {verificationData.user.isEmailVerified ? '✅ Verified' : '⏳ Pending'}
                  <br />
                  Phone Status: {verificationData.user.isPhoneVerified ? '✅ Verified' : '⏳ Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount; 