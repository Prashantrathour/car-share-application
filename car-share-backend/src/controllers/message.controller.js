const httpStatus = require('http-status');
const { Message, Trip, User, Booking } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get messages for a trip
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getMessages = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    // Find trip
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
    }

    // Check if user is authorized to view messages
    // User must be either the driver or a passenger with a booking
    const isDriver = trip.driver_id === userId;
    const isPassenger = await Booking.findOne({
      where: {
         tripId,
        passenger_id: userId,
      },
    });
    const isAdmin = req.user.role === 'admin';

    if (!isDriver && !isPassenger && !isAdmin) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'You are not authorized to view messages for this trip'
      );
    }

    // Get messages
    const messages = await Message.findAll({
      where: { tripId: tripId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'profile_image'],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    // Mark messages as read if user is not the sender
    const unreadMessages = messages.filter(
      (message) => !message.is_read && message.sender_id !== userId
    );

    if (unreadMessages.length > 0) {
      await Promise.all(
        unreadMessages.map((message) =>
          message.update({
            is_read: true,
            read_at: new Date(),
          })
        )
      );
    }

    res.send(messages);
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const sendMessage = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Find trip
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
    }

    // Check if user is authorized to send messages
    // User must be either the driver or a passenger with a booking
    const isDriver = trip.driver_id === userId;
    const isPassenger = await Booking.findOne({
      where: {
        tripId,
        passenger_id: userId,
      },
    });
    const isAdmin = req.user.role === 'admin';

    if (!isDriver && !isPassenger && !isAdmin) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'You are not authorized to send messages for this trip'
      );
    }

    // Create message
    const message = await Message.create({
      tripId: tripId,
      sender_id: userId,
      content,
    });

    // Include sender info in response
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'profile_image'],
        },
      ],
    });

    // Emit socket event for real-time updates
    // This will be handled by the socket.io implementation
    req.app.get('io').to(`trip:${tripId}`).emit('new_message', messageWithSender);

    res.status(httpStatus.CREATED).send(messageWithSender);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark message as read
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const markAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Find message
    const message = await Message.findByPk(messageId, {
      include: [
        {
          model: Trip,
          as: 'trip',
        },
      ],
    });

    if (!message) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
    }

    // Check if user is authorized to mark message as read
    // User must be either the driver or a passenger with a booking
    const isDriver = message.trip.driver_id === userId;
    const isPassenger = await Booking.findOne({
      where: {
          tripId: message.tripId,
        passenger_id: userId,
      },
    });
    const isAdmin = req.user.role === 'admin';

    if (!isDriver && !isPassenger && !isAdmin) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'You are not authorized to mark this message as read'
      );
    }

    // Only mark as read if user is not the sender
    if (message.sender_id !== userId) {
      await message.update({
        is_read: true,
        read_at: new Date(),
      });
    }

    res.send(message);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  sendMessage,
  markAsRead,
};