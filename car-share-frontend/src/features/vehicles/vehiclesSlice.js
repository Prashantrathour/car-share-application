import { createSlice } from '@reduxjs/toolkit';
import { fetchVehicles } from './vehiclesThunks';

const initialState = {
  vehicles: [],
  selectedVehicle: null,
  isLoading: false,
  error: null
};

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    setSelectedVehicle: (state, { payload }) => {
      state.selectedVehicle = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchVehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, { payload }) => {
       
        state.isLoading = false;
        state.vehicles = payload || [];
        state.error = null;
      })
      .addCase(fetchVehicles.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });
  }
});

// Actions
export const {
  setSelectedVehicle,
  setError
} = vehiclesSlice.actions;

// Selectors
export const selectVehicles = (state) => state.vehicles.vehicles;
export const selectSelectedVehicle = (state) => state.vehicles.selectedVehicle;
export const selectVehiclesLoading = (state) => state.vehicles.isLoading;
export const selectVehiclesError = (state) => state.vehicles.error;

export default vehiclesSlice.reducer; 