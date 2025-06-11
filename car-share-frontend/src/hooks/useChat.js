import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  selectMessages,
  selectCurrentMessage,
  selectChatError,
  setCurrentMessage,
  clearCurrentMessage,
  sendMessage,
  markMessageAsRead
} from '../features/chat';

export const useChat = () => {
  const dispatch = useDispatch();
  
  // Get chat state from Redux
  const messages = useSelector(selectMessages);
  const currentMessage = useSelector(selectCurrentMessage);
  const error = useSelector(selectChatError);
  
  /**
   * Update the current message being composed
   */
  const updateCurrentMessage = (message) => {
    dispatch(setCurrentMessage(message));
  };
  
  /**
   * Clear the current message
   */
  const clearMessage = () => {
    dispatch(clearCurrentMessage());
  };
  
  /**
   * Send a message
   */
  const sendChatMessage = async (messageData) => {
    try {
      const resultAction = await dispatch(sendMessage(messageData));
      
      if (sendMessage.fulfilled.match(resultAction)) {
        dispatch(clearCurrentMessage());
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to send message');
        return null;
      }
    } catch (error) {
      toast.error('Failed to send message');
      return null;
    }
  };
  
  /**
   * Mark a message as read
   */
  const markAsRead = async (messageId) => {
    try {
      const resultAction = await dispatch(markMessageAsRead(messageId));
      
      if (markMessageAsRead.fulfilled.match(resultAction)) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };
  
  return {
    // State
    messages,
    currentMessage,
    error,
    
    // Actions
    updateCurrentMessage,
    clearMessage,
    sendChatMessage,
    markAsRead
  };
};

export default useChat; 