// services/socketService.js
import { io } from 'socket.io-client';

const SOCKET_URL =process.env.REACT_APP_SOCKET_URL 
//  'http://localhost:8080';

class SocketService {
  constructor() {
    this.socket = null;
    this.onlineUsers = new Set();
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
      withCredentials: true
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Add online status listeners
    this.socket.on('user_online', (userId) => {
      this.onlineUsers.add(userId);
    });

    this.socket.on('user_offline', (userId) => {
      this.onlineUsers.delete(userId);
    });

    this.socket.on('online_users', (users) => {
      this.onlineUsers = new Set(users);
    });
  }

  joinTrip(tripId) {
    if (this.socket?.connected) {
      this.socket.emit('join_trip', tripId);
    } else {
      console.error('Socket not connected');
    }
  }

  leaveTrip(tripId) {
    if (this.socket?.connected) {
      this.socket.emit('leave_trip', tripId);
    }
  }

  sendMessage(tripId, content, receiverId) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', { tripId, content, receiverId });
    } else {
      console.error('Socket not connected');
    }
  }

  onNewMessage(callback) {
    if (this.socket?.connected) {
      this.socket.on('new_message', callback);
    }
  }

  onTripStatusUpdate(callback) {
    if (this.socket?.connected) {
      this.socket.on('trip_status_updated', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getTripMessages(tripId) {
    
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('get_trip_messages', tripId, (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        resolve(response.messages);
      });
    });
  }

  // Add methods to check online status
  isUserOnline(userId) {
    return this.onlineUsers.has(userId);
  }

  getOnlineUsers() {
    return Array.from(this.onlineUsers);
  }
}

export default new SocketService();