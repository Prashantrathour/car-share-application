import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import {ReactComponent as Logo} from '../assets/Carshare.svg';
import { 
  HomeIcon, 
  UserCircleIcon, 
  MapIcon, 
  CalendarIcon,
  TruckIcon,
  Bars3Icon as MenuIcon, 
  XMarkIcon as XIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const Layout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        toast.success('Successfully logged out');
        navigate('/login', { replace: true });
      } else {
        toast.error('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
      navigate('/login', { replace: true });
    }
  };

  const navLinks = [
    { to: '/trips', label: 'Find Trips', icon: MapIcon },
    { to: '/about', label: 'About Us', icon: InformationCircleIcon },
    { to: '/how-it-works', label: 'How It Works', icon: QuestionMarkCircleIcon },
    ...(isAuthenticated ? [
      ...(user?.role && ['driver', 'admin'].includes(user.role) ? [
        { to: '/trips/create', label: 'Offer a Ride', icon: CalendarIcon }
      ] : []),
      { to: '/carpool', label: 'Find Carpools', icon: MapIcon },
      { to: '/bookings', label: 'My Bookings', icon: CalendarIcon },
      ...((!user?.role || user.role === 'user') ? [
        { to: '/become-driver', label: 'Become a Driver', icon: TruckIcon }
      ] : []),
      ...(user?.role === 'admin' ? [
        { to: '/analytics', label: 'Analytics', icon: ChartBarIcon }
      ] : [])
    ] : [])
  ];
// console.log(user)
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
             
                <Logo className="h-12 w-[12rem]" />
            
                {/* <motion.span 
                  className="text-xl font-bold text-blue-600"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  CarShare
                </motion.span> */}
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                      location.pathname === to
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } transition-colors duration-200 space-x-1`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMobileMenuOpen ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop Profile/Auth Section */}
            <div className="hidden md:flex md:items-center">
              {isAuthenticated ? (
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to="/profile">
                    <div className="flex items-center space-x-2 group">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                        {user?.profile_image ? (
                          <img
                            src={user.profile_image}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                      <span className="text-gray-900 group-hover:text-blue-600 transition-colors">
                        {user?.name}
                      </span>
                    </div>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  >
                    Logout
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-x-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Register
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === to
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    } transition-colors duration-200 space-x-2`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 space-x-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserCircleIcon className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 space-x-2"
                    >
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="px-3 py-2 space-y-2">
                    <Link
                      to="/login"
                      className="block w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="primary" size="sm" className="w-full">
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <motion.main 
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} CarShare. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              <a
                href="/about"
                className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
              >
                About Us
              </a>
              <a
                href="/privacy-policy"
                className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/contact"
                className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 