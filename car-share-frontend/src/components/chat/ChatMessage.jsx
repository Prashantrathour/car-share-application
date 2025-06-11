import React from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

const ChatMessage = ({ message, currentUserId }) => {
  if (!message) {
    return null; // Return null if message is undefined
  }

  const isOwnMessage = message.senderId === currentUserId;
  
  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getAvatarUrl = (sender) => {
    if (!sender) return 'https://ui-avatars.com/api/?name=Unknown&background=random';
    try {
      return sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.firstName)}+${encodeURIComponent(sender.lastName)}&background=random`;
    } catch (error) {
      console.error('Error generating avatar URL:', error);
      return 'https://ui-avatars.com/api/?name=Error&background=random';
    }
  };

  const renderMessageContent = () => {
    if (!message.content) {
      return <div className="text-sm text-gray-500">Empty message</div>;
    }

    switch (message.type) {
      case 'location':
        return (
          <div className="flex flex-col">
            <div className="text-sm">{message.content}</div>
            <div className="mt-1 text-xs text-gray-500">
              📍 {message.metadata?.address || 'Location unavailable'}
            </div>
          </div>
        );
      case 'text':
      default:
        return <div className="text-sm break-words">{message.content}</div>;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="flex max-w-[70%]">
        {!isOwnMessage && (
          <div className="flex-shrink-0 mr-3">
            <img
              className="h-8 w-8 rounded-full"
              src={getAvatarUrl(message.sender)}
              alt={message.sender ? `${message.sender.firstName} ${message.sender.lastName}` : 'Unknown user'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://ui-avatars.com/api/?name=Error&background=random';
              }}
            />
          </div>
        )}
        
        <div className="flex flex-col">
          {!isOwnMessage && message.sender && (
            <div className="text-xs text-gray-500 mb-1">
              {message.sender.firstName} {message.sender.lastName}
            </div>
          )}
          
          <div
            className={`rounded-lg px-4 py-2 ${
              isOwnMessage
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {renderMessageContent()}
          </div>
          
          <div className={`text-xs text-gray-500 mt-1 ${
            isOwnMessage ? 'text-right' : 'text-left'
          }`}>
            {formatTime(message.createdAt)}
            {message.isEdited && (
              <span className="ml-1">(edited)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    type: PropTypes.string,
    senderId: PropTypes.string,
    createdAt: PropTypes.string,
    isEdited: PropTypes.bool,
    metadata: PropTypes.shape({
      address: PropTypes.string
    }),
    sender: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      avatar: PropTypes.string
    })
  }).isRequired,
  currentUserId: PropTypes.string.isRequired
};

export default ChatMessage; 