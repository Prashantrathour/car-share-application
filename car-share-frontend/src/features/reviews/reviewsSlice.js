import { createSlice } from '@reduxjs/toolkit';
import { createReview, updateReview, deleteReview, fetchTripReviews, fetchUserReviews, reportReview } from './reviewsThunks';

// Thunk functions are now imported from reviewsThunks.js

const initialState = {
  reviews: [],
  selectedReview: null,
  reviewForm: {
    rating: 5,
    comment: ''
  },
  loading: false,
  error: null
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setSelectedReview: (state, { payload }) => {
      state.selectedReview = payload;
    },
    updateReviewForm: (state, { payload }) => {
      state.reviewForm = {
        ...state.reviewForm,
        ...payload
      };
    },
    clearReviewForm: (state) => {
      state.reviewForm = initialState.reviewForm;
    },
    setError: (state, { payload }) => {
      state.error = payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle createReview
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, { payload }) => {
        state.selectedReview = payload;
        state.reviewForm = initialState.reviewForm;
        state.loading = false;
        state.error = null;
      })
      .addCase(createReview.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Handle updateReview
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, { payload }) => {
        state.selectedReview = payload;
        state.loading = false;
        state.error = null;
        // Update the review in the reviews array
        const index = state.reviews.findIndex(review => review.id === payload.id);
        if (index !== -1) {
          state.reviews[index] = payload;
        }
      })
      .addCase(updateReview.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Handle deleteReview
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, { payload }) => {
        // Remove the deleted review from the reviews array
        state.reviews = state.reviews.filter(review => review.id !== payload.id);
        if (state.selectedReview && state.selectedReview.id === payload.id) {
          state.selectedReview = null;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteReview.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Handle fetchTripReviews
      .addCase(fetchTripReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTripReviews.fulfilled, (state, { payload }) => {
        state.reviews = payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchTripReviews.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Handle fetchUserReviews
      .addCase(fetchUserReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReviews.fulfilled, (state, { payload }) => {
        state.reviews = payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUserReviews.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Handle reportReview
      .addCase(reportReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reportReview.fulfilled, (state, { payload }) => {
        // Update the reported review if it exists in the reviews array
        const index = state.reviews.findIndex(review => review.id === payload.id);
        if (index !== -1) {
          state.reviews[index] = payload;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(reportReview.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  }
});

// Actions
export const {
  setSelectedReview,
  updateReviewForm,
  clearReviewForm,
  setError
} = reviewsSlice.actions;

// Selectors
export const selectReviews = (state) => state.reviews.reviews;
export const selectSelectedReview = (state) => state.reviews.selectedReview;
export const selectReviewForm = (state) => state.reviews.reviewForm;
export const selectReviewError = (state) => state.reviews.error;
export const selectReviewsLoading = (state) => state.reviews.loading;
export const selectReviewById = (state, reviewId) => 
  state.reviews.reviews.find(review => review.id === reviewId);
export const selectTripReviews = (state, tripId) => 
  state.reviews.reviews.filter(review => review.tripId === tripId);
export const selectUserReviews = (state, userId) => 
  state.reviews.reviews.filter(review => review.userId === userId);

export default reviewsSlice.reducer; 