import { createSlice } from '@reduxjs/toolkit';
import { fetchTrips, fetchTripById } from './tripsThunks';
import { createNewTrip } from './tripsThunks';

const initialState = {
  trips: [],
  selectedTrip: null,
  filters: {
    origin: null,
    destination: null,
    date: null,
    seats: 1
  },
  loading: false,
  error: null
};

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setSelectedTrip: (state, { payload }) => {
      state.selectedTrip = payload;
    },
    setFilters: (state, { payload }) => {
      state.filters = {
        ...state.filters,
        ...payload
      };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setError: (state, { payload }) => {
      state.error = payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchTrips
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, { payload }) => {
        state.trips = payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchTrips.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Handle fetchTripById
      .addCase(fetchTripById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTripById.fulfilled, (state, { payload }) => {
        state.selectedTrip = payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchTripById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Handle createNewTrip
      .addCase(createNewTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewTrip.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.selectedTrip = payload;
      })
      .addCase(createNewTrip.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  }
});

// Actions
export const {
  setSelectedTrip,
  setFilters,
  clearFilters,
  setError
} = tripsSlice.actions;

// Selectors
export const selectTrips = (state) => state.trips.trips;
export const selectSelectedTrip = (state) => state.trips.selectedTrip;
export const selectTripFilters = (state) => state.trips.filters;
export const selectTripError = (state) => state.trips.error;
export const selectTripsLoading = (state) => state.trips.loading;

export default tripsSlice.reducer; 