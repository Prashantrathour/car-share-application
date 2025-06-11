import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import ChatMessage from './ChatMessage';
import { fetchMessages, sendMessage } from '../../features/chat/chatThunks';
import { selectMessages, selectChatError } from '../../features/chat/chatSlice';

const Chat = () => {
  const { tripId } = useParams();
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const dispatch = useDispatch();
  
  const currentUser = useSelector((state) => state.auth.user);
  const messages = useSelector(selectMessages);
  const isLoading = useSelector(state => state.chat.isLoading);
  const error = useSelector(selectChatError);

  // Load messages when component mounts
  useEffect(() => {
    if (tripId) {
      loadMessages();
    }
  }, [dispatch, tripId]);

  const loadMessages = async () => {
    try {
      await dispatch(fetchMessages(tripId)).unwrap();
    } catch (error) {
      toast.error(error?.message || 'Failed to load messages');
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle message sending
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = messageInput.trim();
    
    if (!trimmedMessage) return;
    if (!currentUser) {
      toast.error('You must be logged in to send messages');
      return;
    }

    setIsSending(true);
    try {
      await dispatch(sendMessage({
        tripId,
        content: trimmedMessage,
      })).unwrap();
      setMessageInput('');
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to send message');
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle retry loading messages
  const handleRetryLoad = () => {
    loadMessages();
  };

  if (error && !messages.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={handleRetryLoad}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry Loading Messages
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Chat Header */}
      <div className="flex-none p-4 border-b">
        <h2 className="text-lg font-semibold">Trip Chat</h2>
        {isLoading && (
          <p className="text-sm text-gray-500">Loading messages...</p>
        )}
      </div>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages?.length === 0 && !isLoading ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages?.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              currentUserId={currentUser?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-none p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || isSending || !currentUser}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Send'
            )}
          </button>
        </form>
        {!currentUser && (
          <p className="text-sm text-red-500 mt-2">
            Please log in to send messages
          </p>
        )}
      </div>
    </div>
  );
};

export default Chat; 