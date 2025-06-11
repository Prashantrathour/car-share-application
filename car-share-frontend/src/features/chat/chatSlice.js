import { createSlice } from '@reduxjs/toolkit';
import { fetchMessages, sendMessage } from './chatThunks';

const initialState = {
  messages: [],
  currentMessage: '',
  isLoading: false,
  isSending: false,
  error: null,
  lastMessageTimestamp: null,
  unreadCount: 0
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentMessage: (state, { payload }) => {
      state.currentMessage = payload;
    },
    clearCurrentMessage: (state) => {
      state.currentMessage = '';
    },
    setError: (state, { payload }) => {
      state.error = payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    updateLastMessageTimestamp: (state, { payload }) => {
      state.lastMessageTimestamp = payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, { payload }) => {
       
        state.isLoading = false;
        
        state.messages = payload?.messages || [];
        state.error = null;
        if (state.messages.length > 0) {
          state.lastMessageTimestamp = state.messages[state.messages.length - 1].createdAt;
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch messages';
      })
      // Handle sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, { payload }) => {
        
        state.isSending = false;
        
        if (!state.messages.some(msg => msg.id === payload.id)) {
          state.messages = [...state.messages, payload];
        }
        state.currentMessage = '';
        state.error = null;
        state.lastMessageTimestamp = payload.createdAt;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload || 'Failed to send message';
      });
  }
});

// Actions
export const {
  setCurrentMessage,
  clearCurrentMessage,
  setError,
  clearError,
  incrementUnreadCount,
  clearUnreadCount,
  updateLastMessageTimestamp
} = chatSlice.actions;

// Selectors
export const selectMessages = (state) => state.chat.messages;
export const selectCurrentMessage = (state) => state.chat.currentMessage;
export const selectChatError = (state) => state.chat.error;
export const selectIsLoading = (state) => state.chat.isLoading;
export const selectIsSending = (state) => state.chat.isSending;
export const selectUnreadCount = (state) => state.chat.unreadCount;
export const selectLastMessageTimestamp = (state) => state.chat.lastMessageTimestamp;

export default chatSlice.reducer; 