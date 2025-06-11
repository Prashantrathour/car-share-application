import axios from 'axios';
import { store } from '../app/store';
import { clearCredentials } from '../features/auth';
import { toast } from 'react-toastify';

// Define API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If we get any auth error (401 or 403), logout immediately
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Only logout if we're not already trying to logout
      if (!error.config.url.includes('/auth/logout')) {
        store.dispatch(clearCredentials());
        toast.error('Your session has expired. Please login again.');
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 