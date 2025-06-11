import { createSlice } from '@reduxjs/toolkit';
import {
  updateDriverProfile,
  uploadDocument,
  updateAvailability,
  fetchDriverDetails
} from './driverThunks';

const initialState = {
  driverProfile: null,
  documents: [],
  availability: {
    isAvailable: false,
    schedule: []
  },
  isLoading: false,
  error: null
};

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    setError: (state, { payload }) => {
      state.error = payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setDriverProfile: (state, { payload }) => {
      state.driverProfile = payload;
    },
    clearDriverData: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchDriverDetails
      .addCase(fetchDriverDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDriverDetails.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.driverProfile = payload.data;
      })
      .addCase(fetchDriverDetails.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      
      // Handle updateDriverProfile
      .addCase(updateDriverProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDriverProfile.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.driverProfile = payload.data.driverProfile;
      })
      .addCase(updateDriverProfile.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      
      // Handle uploadDocument
      .addCase(uploadDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        const newDocument = payload.data.document;
        
        // Replace if exists, otherwise add
        const existingIndex = state.documents.findIndex(doc => doc.type === newDocument.type);
        if (existingIndex >= 0) {
          state.documents[existingIndex] = newDocument;
        } else {
          state.documents.push(newDocument);
        }
      })
      .addCase(uploadDocument.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      
      // Handle updateAvailability
      .addCase(updateAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAvailability.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.availability = payload.data.availability;
      })
      .addCase(updateAvailability.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });
  }
});

// Actions
export const {
  setError,
  clearError,
  setDriverProfile,
  clearDriverData
} = driverSlice.actions;

// Selectors
export const selectDriverProfile = (state) => state.driver.driverProfile;
export const selectDriverDocuments = (state) => state.driver.documents;
export const selectDriverAvailability = (state) => state.driver.availability;
export const selectDriverIsAvailable = (state) => state.driver.availability.isAvailable;
export const selectDriverLoading = (state) => state.driver.isLoading;
export const selectDriverError = (state) => state.driver.error;

export default driverSlice.reducer;
