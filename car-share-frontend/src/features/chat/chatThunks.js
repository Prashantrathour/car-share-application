import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosService';
import { setError, clearCurrentMessage } from './chatSlice';

// Helper function to validate message data
const validateMessageData = (data) => {
  if (!data) throw new Error('Invalid message data received');
  if (!data.content) throw new Error('Message content is required');
  if (!data.tripId) throw new Error('Trip ID is required');
  return data;
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ tripId, content }, { rejectWithValue }) => {
    if (!tripId) return rejectWithValue('Trip ID is required');
    if (!content || !content.trim()) return rejectWithValue('Message content cannot be empty');

    try {
      const response = await axiosInstance.post(`/chat/${tripId}`, { 
        content: content.trim(),
        timestamp: new Date().toISOString()
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      return validateMessageData(response.data);
    } catch (error) {
      console.error('Send message error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to send message'
      );
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (tripId, { rejectWithValue }) => {
    if (!tripId) return rejectWithValue('Trip ID is required');

    try {
      const response = await axiosInstance.get(`/chat/${tripId}`);

      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Validate messages array
      if (!Array.isArray(response.data?.messages)) {
        throw new Error('Invalid messages data received');
      }

      return response.data;
    } catch (error) {
      console.error('Fetch messages error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch messages'
      );
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  'chat/markMessageRead',
  async (messageId, { rejectWithValue }) => {
    if (!messageId) return rejectWithValue('Message ID is required');

    try {
      const response = await axiosInstance.post(`/messages/${messageId}/read`);

      if (!response.data) {
        throw new Error('No data received from server');
      }

      return response.data;
    } catch (error) {
      console.error('Mark message as read error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to mark message as read'
      );
    }
  }
); 