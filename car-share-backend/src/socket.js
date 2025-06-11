const jwt = require('jsonwebtoken');
const { User, Trip, Booking, Message } = require('./models');
const logger = require('./config/logger');
const config = require('./config/config');

module.exports = (io) => {
  // Track online users
  const onlineUsers = new Set();

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findByPk(decoded.sub);
      
      if (!user) {
        return next(new Error('Authentication error'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.id}`);

    // Add user to online users and notify others
    onlineUsers.add(socket.user.id);
    io.emit('user_online', socket.user.id);
    io.emit('online_users', Array.from(onlineUsers));

    // Join user to their own room
    socket.join(`user:${socket.user.id}`);

    // Handle joining trip rooms
    socket.on('join_trip', async (tripId) => {
      try {
        // Verify that user is authorized to join this trip room
        const trip = await Trip.findByPk(tripId);
        if (!trip) {
          socket.emit('error', { message: 'Trip not found' });
          return;
        }

        // Check if user is driver or passenger
        const isDriver = trip.driverId === socket.user.id;
        const isPassenger = await Booking.findOne({
          where: {
            tripId,
            passengerId: socket.user.id,
          },
        });

        if (!isDriver && !isPassenger && socket.user.role !== 'admin') {
          socket.emit('error', { message: 'Not authorized to join this trip' });
          return;
        }

        // Join trip room
        socket.join(`trip:${tripId}`);
        logger.info(`User ${socket.user.id} joined trip room: ${tripId}`);
      } catch (error) {
        logger.error('Error joining trip room:', error);
        socket.emit('error', { message: 'Failed to join trip room' });
      }
    });

    // Handle leaving trip rooms
    socket.on('leave_trip', (tripId) => {
      socket.leave(`trip:${tripId}`);
      logger.info(`User ${socket.user.id} left trip room: ${tripId}`);
    });

    // Handle getting trip messages
    socket.on('get_trip_messages', async (tripId, callback) => {
      try {
        // Verify that user is authorized to get messages for this trip
        const trip = await Trip.findByPk(tripId);
        if (!trip) {
          callback({ error: 'Trip not found' });
          return;
        }

        // Check if user is driver or passenger
        const isDriver = trip.driverId === socket.user.id;
        const isPassenger = await Booking.findOne({
          where: {
            tripId,
            passengerId: socket.user.id,
          },
        });

        if (!isDriver && !isPassenger && socket.user.role !== 'admin') {
          callback({ error: 'Not authorized to get messages for this trip' });
          return;
        }

        // Get all messages for the trip
        const messages = await Message.findAll({
          where: { tripId },
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'firstName', 'lastName', 'avatar'],
            },
            {
              model: User,
              as: 'receiver',
              attributes: ['id', 'firstName', 'lastName', 'avatar'],
            },
          ],
          order: [['createdAt', 'ASC']],
        });

        callback({ messages });
      } catch (error) {
        logger.error('Error getting trip messages:', error);
        callback({ error: 'Failed to get trip messages' });
      }
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { tripId, content, receiverId } = data;

        // Verify that user is authorized to send messages in this trip
        const trip = await Trip.findByPk(tripId);
        if (!trip) {
          socket.emit('error', { message: 'Trip not found' });
          return;
        }

        // Check if user is driver or passenger
        const isDriver = trip.driverId === socket.user.id;
        const isPassenger = await Booking.findOne({
          where: {
            tripId,
            passengerId: socket.user.id,
          },
        });

        if (!isDriver && !isPassenger && socket.user.role !== 'admin') {
          socket.emit('error', { message: 'Not authorized to send messages in this trip' });
          return;
        }

        // Create message
        const message = await Message.create({
          tripId,
          senderId: socket.user.id,
          receiverId,
          content,
        });

        // Include sender and receiver info in response
        const messageWithDetails = await Message.findByPk(message.id, {
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'firstName', 'lastName', 'avatar'],
            },
            {
              model: User,
              as: 'receiver',
              attributes: ['id', 'firstName', 'lastName', 'avatar'],
            },
          ],
        });

        // Broadcast message to trip room
        io.to(`trip:${tripId}`).emit('new_message', messageWithDetails);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle trip status updates
    socket.on('trip_update', async (data) => {
      try {
        const { tripId, status } = data;

        // Verify that user is authorized to update this trip
        const trip = await Trip.findByPk(tripId);
        if (!trip) {
          socket.emit('error', { message: 'Trip not found' });
          return;
        }

        // Only driver or admin can update trip status
        if (trip.driverId !== socket.user.id && socket.user.role !== 'admin') {
          socket.emit('error', { message: 'Not authorized to update this trip' });
          return;
        }

        // Update trip status
        await trip.update({ status });

        // Broadcast update to trip room
        io.to(`trip:${tripId}`).emit('trip_status_updated', {
          tripId,
          status,
        });
      } catch (error) {
        logger.error('Error updating trip status:', error);
        socket.emit('error', { message: 'Failed to update trip status' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.id}`);
      
      // Remove user from online users and notify others
      onlineUsers.delete(socket.user.id);
      io.emit('user_offline', socket.user.id);
      io.emit('online_users', Array.from(onlineUsers));
    });
  });

  return io;
};