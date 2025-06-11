import { default as driverReducer } from './driverSlice';
import {
  updateDriverProfile,
  uploadDocument,
  updateAvailability,
  becomeDriver,
  fetchDriverDetails
} from './driverThunks';
import {
  setError,
  clearError,
  setDriverProfile,
  clearDriverData,
  selectDriverProfile,
  selectDriverDocuments,
  selectDriverAvailability,
  selectDriverIsAvailable,
  selectDriverLoading,
  selectDriverError
} from './driverSlice';

export {
  driverReducer as default,
  // Thunks
  updateDriverProfile,
  uploadDocument, 
  updateAvailability,
  becomeDriver,
  fetchDriverDetails,
  // Actions
  setError,
  clearError,
  setDriverProfile,
  clearDriverData,
  // Selectors
  selectDriverProfile,
  selectDriverDocuments,
  selectDriverAvailability,
  selectDriverIsAvailable,
  selectDriverLoading,
  selectDriverError
};