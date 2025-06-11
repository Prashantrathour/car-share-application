const httpStatus = require('http-status');
const { Message, User, Trip } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get messages for a trip
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Message[]>}
 */
const getTripMessages = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if trip exists
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
    }

    // Get messages with pagination
    const offset = (page - 1) * limit;
    const { count, rows: messages } = await Message.findAndCountAll({
      where: { tripId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.send({
      messages,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message in a trip chat
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Message>}
 */
const sendMessage = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    // Check if trip exists and get driver details
    const trip = await Trip.findByPk(tripId, {
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id']
        }
      ]
    });

    if (!trip) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
    }

    // Determine the receiver
    // If sender is the driver, find the first booking's passenger
    // If sender is a passenger, the receiver is the driver
    let receiverId;
    if (senderId === trip.driver.id) {
      // Get the first booking's passenger ID
      const booking = await trip.getBookings({
        limit: 1,
        attributes: ['passengerId']
      });
      if (!booking || booking.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'No passenger found for this trip');
      }
      receiverId = booking[0].passengerId;
    } else {
      receiverId = trip.driver.id;
    }

    // Create message
    const message = await Message.create({
      tripId,
      senderId,
      receiverId,
      content,
      type: 'text'
    });

    // Get message with sender details
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ]
    });

    res.status(httpStatus.CREATED).send(messageWithSender);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTripMessages,
  sendMessage
}; 