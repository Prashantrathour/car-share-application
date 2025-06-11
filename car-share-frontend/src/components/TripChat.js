import React, { useEffect, useState, useRef } from 'react';
import socketService from '../socket';
import { useDispatch, useSelector } from 'react-redux';
import { selectBookings } from '../features/bookings';
import useBookings from '../hooks/useBookings';
import { toast } from 'react-hot-toast';
import { fetchTripById } from '../features/trips';

const TripChat = ({ tripId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  // const [isActiveBooking, setIsActiveBooking] = useState(false);
  const { getAllBookings } = useBookings();
  const bookings = useSelector(selectBookings);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const { accessToken } = useSelector((state) => state.auth);
  const currentUser = useSelector((state) => state.auth.user);
  const trip = useSelector((state) => state.trips.selectedTrip);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    const initializeSocket = async () => {
      try {
        // Connect to socket
        await socketService.connect(accessToken);

        // Set up connection status listeners
        socketService.socket.on('connect', async () => {
          console.log('Socket connected');
          if (isMounted) {
            setIsConnected(true);
            toast.success('Connected to chat');
            
            // Join trip room after successful connection
            await socketService.joinTrip(tripId);
            
            // Load messages only after joining the room
            try {
              const existingMessages = await socketService.getTripMessages(tripId);
              if (isMounted && existingMessages && existingMessages.length > 0) {
                setMessages(existingMessages);
              }
            } catch (err) {
              console.error('Error loading messages:', err);
              toast.error('Failed to load messages');
            }
          }
        });

        socketService.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          if (isMounted) {
            setIsConnected(false);
            if (reason === 'io server disconnect') {
              // Server initiated disconnect, try to reconnect
              socketService.connect(accessToken);
            }
          }
        });

        socketService.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          if (isMounted) {
            setIsConnected(false);
            toast.error('Connection error. Retrying...');
          }
        });

        // Add online status handlers
        socketService.socket.on('user_online', (userId) => {
          if (isMounted) {
            setOnlineUsers(prev => [...new Set([...prev, userId])]);
          }
        });

        socketService.socket.on('user_offline', (userId) => {
          if (isMounted) {
            setOnlineUsers(prev => prev.filter(id => id !== userId));
          }
        });

        socketService.socket.on('online_users', (users) => {
          if (isMounted) {
            setOnlineUsers(users);
          }
        });

        // Listen for new messages
        const messageHandler = (message) => {
          console.log('Received new message:', message);
          if (isMounted) {
            setMessages(prev => [...prev, message]);
          }
        };
        socketService.socket.on('new_message', messageHandler);

        // Listen for trip status updates
        const statusHandler = (update) => {
          console.log('Trip status updated:', update);
        };
        socketService.socket.on('trip_status_updated', statusHandler);

      } catch (error) {
        console.error('Error initializing socket:', error);
        toast.error('Failed to connect to chat');
      }
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (socketService.socket) {
        socketService.socket.off('new_message');
        socketService.socket.off('trip_status_updated');
        socketService.socket.off('user_online');
        socketService.socket.off('user_offline');
        socketService.socket.off('online_users');
        socketService.leaveTrip(tripId);
        socketService.disconnect();
      }
    };
  }, [tripId, accessToken]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        await getAllBookings();
        await dispatch(fetchTripById(tripId));
      } catch (err) {
        console.error('Error loading bookings:', err);
      }
    };
    loadBookings();
  }, []);

  const handleSendMessage = async(e) => {
    e.preventDefault();
   
    if (!isConnected) {
      toast.error('Not connected to chat. Please wait for reconnection...');
      return;
    }
    if (newMessage.trim()) {
        // Determine receiverId based on trip details
        const activeBooking = bookings.find(b => 
            b.tripId === tripId && 
            b.status === 'confirmed' &&
            b.paymentStatus === 'paid'
        );
        
       
        if (!activeBooking) {
            toast.error('No active confirmed booking found for this trip');
            console.error('No active confirmed booking found for this trip');
        return;
      }

      const receiverId = currentUser.id === activeBooking.trip.driver.id 
        ? activeBooking.passenger.id 
        : activeBooking.trip.driver.id;
        
        try {
            console.log('Sending message:', { tripId, content: newMessage.trim(), receiverId });
        await socketService.sendMessage(tripId, newMessage.trim(), receiverId);
        setNewMessage(''); // Clear input after successful send
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      }
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
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {!isConnected && (
        <div className="p-2 bg-yellow-100 text-yellow-800 text-sm text-center">
          Connecting to chat...
        </div>
      )}
      
      {/* Enhanced online status indicator */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                {onlineUsers.length} {onlineUsers.length === 1 ? 'user' : 'users'} online
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.senderId === currentUser.id ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className="relative flex-shrink-0">
              <div className="relative">
                <img
                  src={getAvatarUrl(message?.sender)}
                  alt={message?.sender?.firstName || 'User'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
                {onlineUsers.includes(message.senderId) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="mt-1 text-center">
                <span className="text-xs text-gray-500">
                  {message.senderId === currentUser.id ? 'You' : message.sender?.firstName || 'User'}
                </span>
                <span className="block text-xs text-gray-400">
                  {message.senderId === trip?.driver?.id ? 'Driver' : 'Passenger'}
                </span>
              </div>
            </div>
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === currentUser.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="text-sm">{message?.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
        <div className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isConnected || !newMessage.trim()}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default TripChat;