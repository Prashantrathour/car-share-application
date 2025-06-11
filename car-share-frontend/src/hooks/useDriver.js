import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  selectDriverProfile,
  selectDriverDocuments,
  selectDriverAvailability,
  selectDriverIsAvailable,
  selectDriverLoading,
  selectDriverError,
  updateDriverProfile,
  uploadDocument,
  updateAvailability
} from '../features/driver';

export const useDriver = () => {
  const dispatch = useDispatch();
  
  // Get driver state from Redux
  const driverProfile = useSelector(selectDriverProfile);
  const documents = useSelector(selectDriverDocuments);
  const availability = useSelector(selectDriverAvailability);
  const isAvailable = useSelector(selectDriverIsAvailable);
  const loading = useSelector(selectDriverLoading);
  const error = useSelector(selectDriverError);
  
  /**
   * Update driver profile
   */
  const updateProfile = async (profileData) => {
    try {
      const resultAction = await dispatch(updateDriverProfile(profileData));
      
      if (updateDriverProfile.fulfilled.match(resultAction)) {
        toast.success('Driver profile updated successfully');
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to update driver profile');
        return null;
      }
    } catch (error) {
      toast.error('Failed to update driver profile');
      return null;
    }
  };
  
  /**
   * Upload driver document
   */
  const uploadDriverDocument = async (type, file) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);
      
      const resultAction = await dispatch(uploadDocument({ type, file: formData }));
      
      if (uploadDocument.fulfilled.match(resultAction)) {
        toast.success(`${type} document uploaded successfully`);
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to upload document');
        return null;
      }
    } catch (error) {
      toast.error('Failed to upload document');
      return null;
    }
  };
  
  /**
   * Update driver availability
   */
  const updateDriverAvailability = async (availabilityData) => {
    try {
      const resultAction = await dispatch(updateAvailability(availabilityData));
      
      if (updateAvailability.fulfilled.match(resultAction)) {
        toast.success('Availability updated successfully');
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to update availability');
        return null;
      }
    } catch (error) {
      toast.error('Failed to update availability');
      return null;
    }
  };
  
  /**
   * Toggle driver availability status
   */
  const toggleAvailability = async () => {
    try {
      const newStatus = !isAvailable;
      const resultAction = await dispatch(updateAvailability({ isAvailable: newStatus }));
      
      if (updateAvailability.fulfilled.match(resultAction)) {
        toast.success(`You are now ${newStatus ? 'available' : 'unavailable'} for trips`);
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to update availability status');
        return null;
      }
    } catch (error) {
      toast.error('Failed to update availability status');
      return null;
    }
  };
  
  return {
    // State
    driverProfile,
    documents,
    availability,
    isAvailable,
    loading,
    error,
    
    // Actions
    updateProfile,
    uploadDriverDocument,
    updateDriverAvailability,
    toggleAvailability
  };
};

export default useDriver; 