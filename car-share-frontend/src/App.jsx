import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { 
  RequireAuth, 
  RedirectIfAuthenticated,
  FullAuthProtection 
} from './middleware/authMiddleware';
import { VerificationProvider } from './contexts/VerificationContext';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import EmailVerification from './components/auth/EmailVerification';
import PhoneVerification from './components/auth/PhoneVerification';
import VerificationStatus from './components/auth/VerificationStatus';
import TripList from './components/trips/TripList';
import CreateTrip from './components/trips/CreateTrip';
import TripDetails from './components/trips/TripDetails';
import BookingList from './components/bookings/BookingList';
import CreateReview from './components/reviews/CreateReview';
import Profile from './components/profile/Profile';
import Hero from './components/home/Hero';
import DriverRegistration from './pages/DriverRegistration';
import { setCredentials } from './features/auth';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import BookingDetails from './components/bookings/BookingDetails';
import TermsAndConditions from './pages/TermAndCondition';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermOfServices';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import HowItWorks from './pages/HowItWorks';
import CarpoolFinder from './components/CarpoolFinder';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize auth from localStorage
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      // Get user from localStorage or parse from token if needed
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Set credentials in Redux store
      dispatch(setCredentials({
        user,
        tokens: {
          access: { token: accessToken },
          refresh: { token: refreshToken }
        }
      }));
    }
  }, [dispatch]);

  return (
    <VerificationProvider>
      <div className="min-h-screen bg-gray-50">
        <Toaster
          position="top-right"
          toastOptions={{
            success: { style: { background: '#10B981', color: 'white' } },
            error: { style: { background: '#EF4444', color: 'white' } },
            loading: { style: { background: '#6366F1', color: 'white' } },
          }}
        />

        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Hero />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/how-it-works" element={<HowItWorks />} />

            {/* Auth Routes - Redirect if authenticated */}
            <Route element={<RedirectIfAuthenticated />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Routes that require authentication but not verification */}
            <Route element={<RequireAuth />}>
              <Route path="/verification-status" element={<VerificationStatus />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/verify-phone" element={<PhoneVerification />} />
            </Route>

            {/* Routes that require both authentication, verification, and active status */}
            <Route element={<FullAuthProtection />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/trips" element={<TripList />} />
              <Route path="/trips/:tripId" element={<TripDetails />} />
              <Route path="/bookings" element={<BookingList />} />
              <Route path="/bookings/:bookingId/review" element={<CreateReview />} />
              <Route path="/bookings/:bookingId" element={<BookingDetails />} />
              <Route path="/become-driver" element={<DriverRegistration />} />
              <Route path="/carpool" element={<CarpoolFinder />} />
            </Route>
            
            {/* Routes that require driver role */}
            <Route element={<FullAuthProtection allowedRoles={['driver', 'admin']} />}>
              <Route path="/trips/create" element={<CreateTrip />} />
            </Route>

            <Route path="/payment/:bookingId" element={<PaymentPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />

            {/* Routes that require admin role */}
            <Route element={<FullAuthProtection allowedRoles={['admin']} />}>
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Route>
          </Routes>
        </Layout>
      </div>
    </VerificationProvider>
  );
};

export default App; 