import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosService';
import { setSelectedReview, setError, clearReviewForm } from './reviewsSlice';

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/reviews', reviewData);
      dispatch(clearReviewForm());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ id, ...reviewData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/reviews/${id}`, reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

export const reportReview = createAsyncThunk(
  'reviews/reportReview',
  async ({ reviewId, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/reviews/${reviewId}/report`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to report review');
    }
  }
);

export const fetchTripReviews = createAsyncThunk(
  'reviews/fetchTripReviews',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/reviews/trip/${tripId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trip reviews');
    }
  }
);

export const fetchUserReviews = createAsyncThunk(
  'reviews/fetchUserReviews',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/reviews/user/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user reviews');
    }
  }
); 