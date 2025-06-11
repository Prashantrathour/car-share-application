import { configureStore } from '@reduxjs/toolkit';

// Import feature slices
import { authReducer } from '../features/auth';
import { userReducer } from '../features/user';
import { tripsReducer } from '../features/trips';


import { paymentReducer } from '../features/payment';
import { chatReducer } from '../features/chat';
import { bookingsReducer } from '../features/bookings';
// import {driverReducer} from '../features/driver';
import { reviewsReducer } from '../features/reviews';
import driverReducer from '../features/driver';
import vehiclesReducer from '../features/vehicles';


// Create the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    trips: tripsReducer,
    reviews: reviewsReducer,
    driver: driverReducer,
    payment: paymentReducer,
    chat: chatReducer,
    bookings: bookingsReducer,
    vehicles: vehiclesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setCredentials'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.tokenExpiry', 'payload.tokens.accessToken', 'payload.tokens.refreshToken'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.tokenExpiry', 'auth.accessToken', 'auth.refreshToken'],
      },
    }),
});

export default store;
