const httpStatus = require('http-status');
const { Booking, Trip, User, Driver } = require('../models');
const ApiError = require('../utils/ApiError');
const { sequelize } = require('../config/database');
const notificationService = require('../services/notification.service');

/**
 * Get all bookings for the current user
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { role } = req.user;

    let bookings;
    if (role === 'user') {
      // Passengers see their own bookings
      bookings = await Booking.findAll({
        where: { passengerId: userId },
        include: [
          {
            model: Trip,
            as: 'trip',
            include: [
              {
                model: User,
                as: 'driver',
                attributes: ['id', 'firstName', 'lastName', 'avatar'],
              },
            ],
          },
        ],
      });
    } else if (role === 'driver') {
      // Drivers see bookings for their trips
      bookings = await Booking.findAll({
        include: [
          {
            model: Trip,
            as: 'trip',
            where: { driverId: userId },
            include: [
              {
                model: User,
                as: 'driver',
                attributes: ['id', 'firstName', 'lastName', 'avatar'],
              },
            ],
          },
          {
            model: User,
            as: 'passenger',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
        ],
      });
    } else if (role === 'admin') {
      // Admins see all bookings
      bookings = await Booking.findAll({
        include: [
          {
            model: Trip,
            as: 'trip',
            include: [
              {
                model: User,
                as: 'driver',
                attributes: ['id', 'firstName', 'lastName', 'avatar'],
              },
            ],
          },
          {
            model: User,
            as: 'passenger',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
        ],
      });
    } else {
      // Default case: user has an invalid role
      bookings = [];
    }

    // Transform the response to include full names
    const transformedBookings = bookings ? bookings.map(booking => {
      const plainBooking = booking.get({ plain: true });
      
      if (plainBooking.trip?.driver) {
        plainBooking.trip.driver.name = `${plainBooking.trip.driver.firstName} ${plainBooking.trip.driver.lastName}`;
        delete plainBooking.trip.driver.firstName;
        delete plainBooking.trip.driver.lastName;
      }
      
      if (plainBooking.passenger) {
        plainBooking.passenger.name = `${plainBooking.passenger.firstName} ${plainBooking.passenger.lastName}`;
        delete plainBooking.passenger.firstName;
        delete plainBooking.passenger.lastName;
      }
      
      return plainBooking;
    }) : [];

    res.send(transformedBookings);
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by id
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { role } = req.user;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Trip,
          as: 'trip',
          include: [
            {
              model: User,
              as: 'driver',
              attributes: ['id', 'firstName', 'lastName', 'avatar'],
            },
          ],
        },
        {
          model: User,
          as: 'passenger',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
        },
      ],
    });

    if (!booking) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Check if user is authorized to view this booking
    if (
      role !== 'admin' &&
      booking.passengerId !== userId &&
      booking.trip.driverId !== userId
    ) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to view this booking');
    }

    res.send(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new booking
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const createBooking = async (req, res, next) => {
  try {
    const { 
      tripId, 
      numberOfSeats,
      pickupLocation,
      dropoffLocation,
      passengerNotes,
      baggageCount = 0,
      specialRequests = []
    } = req.body;
    const passengerId = req.user.id;

    // Find trip
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
    }

    // Check if trip is available
    if (trip.status !== 'scheduled') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Trip is not available for booking');
    }

    // Check if departure time is in the future
    if (new Date(trip.startTime) < new Date()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot book a trip that has already departed');
    }

    // Check if enough seats are available
    if (trip.availableSeats < numberOfSeats) {
      if (trip.availableSeats === 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Sorry, this trip is fully booked'
        );
      }
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Not enough seats available. Only ${trip.availableSeats} seat${trip.availableSeats === 1 ? '' : 's'} left`
      );
    }

    // Check if user is not booking their own trip
    if (trip.driverId === passengerId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot book your own trip');
    }

    // Validate pickup and dropoff locations
    if (!pickupLocation || !pickupLocation.latitude || !pickupLocation.longitude || !pickupLocation.address) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Pickup location must include latitude, longitude, and address');
    }

    if (!dropoffLocation || !dropoffLocation.latitude || !dropoffLocation.longitude || !dropoffLocation.address) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Dropoff location must include latitude, longitude, and address');
    }

    // Calculate total price
    const totalPrice = trip.pricePerSeat * numberOfSeats;

    // Generate pickup code (6 digits)
    const pickupCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create booking
    const bookingData = {
      tripId,
      passengerId,
      numberOfSeats,
      pickupLocation,
      dropoffLocation,
      totalPrice,
      passengerNotes,
      baggageCount,
      specialRequests,
      status: 'pending',
      paymentStatus: 'pending',
      pickupCode,
      isReviewedByPassenger: false,
      isReviewedByDriver: false
    };

    // Start a transaction to ensure data consistency
    const result = await sequelize.transaction(async (t) => {
      // Create booking
      const booking = await Booking.create(bookingData, { transaction: t });

      // Update available seats
      await trip.update(
        {
          availableSeats: trip.availableSeats - numberOfSeats
        },
        { transaction: t }
      );

      return booking;
    });

    // Send booking confirmation email
    await notificationService.sendBookingConfirmation(result);

    res.status(httpStatus.CREATED).send(result);
  } catch (error) {
    console.error('Error creating booking:', error);
    if (error.name === 'SequelizeValidationError') {
      next(new ApiError(httpStatus.BAD_REQUEST, error.message));
    } else if (error.name === 'SequelizeDatabaseError') {
      next(new ApiError(httpStatus.BAD_REQUEST, 'Database error: ' + error.message));
    } else {
      next(error);
    }
  }
};

/**
 * Cancel booking
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user.id;
    const { role } = req.user;

    // Find booking
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Trip,
          as: 'trip',
        },
      ],
    });

    if (!booking) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Check if user is authorized to cancel this booking
    if (
      role !== 'admin' &&
      booking.passengerId !== userId &&
      booking.trip.driverId !== userId
    ) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to cancel this booking');
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled_by_passenger' || booking.status === 'cancelled_by_driver' || booking.status === 'completed') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Booking cannot be cancelled');
    }

    // Check if trip has already departed
    if (new Date(booking.trip.startTime) < new Date()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot cancel a booking for a trip that has already departed');
    }

    // Determine cancellation status based on user role
    const cancellationStatus = role === 'driver' ? 'cancelled_by_driver' : 'cancelled_by_passenger';

    // Update booking
    await booking.update({
      status: cancellationStatus,
      cancellationReason,
     
      cancellationTime: new Date()
    });

    // Update trip available seats
    await booking.trip.update({
      availableSeats: booking.trip.availableSeats + booking.numberOfSeats
    });

    // If payment was made, initiate refund
    if (booking.paymentStatus === 'paid') {
      // TODO: Implement refund logic with payment provider
      await booking.update({
        paymentStatus: 'refunded',
      });
    }

    res.send(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Rate booking
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const rateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const { role } = req.user;

    // Find booking
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Trip,
          as: 'trip',
        },
        {
          model: User,
          as: 'passenger',
        },
      ],
    });

    if (!booking) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Can only rate completed bookings');
    }

    // Determine if user is passenger or driver
    const isPassenger = booking.passengerId === userId;
    const isDriver = booking.trip.driverId === userId;

    if (!isPassenger && !isDriver && role !== 'admin') {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to rate this booking');
    }

    // Update booking with rating
    if (isPassenger) {
      // Passenger rating the driver
      await booking.update({
        driverRating: rating,
        isReviewedByPassenger: true
      });

      // Update driver's overall rating
      const driver = await User.findOne({
        where: { id: booking.trip.driverId },
      });

      if (driver) {
        // Initialize rating and totalRatings if they are null/undefined
        const currentRating = driver.rating || 0;
        const currentTotalRatings = driver.totalRatings || 0;
        
        // Calculate new rating
        const newTotalRatings = currentTotalRatings + 1;
        const newRating = ((currentRating * currentTotalRatings) + rating) / newTotalRatings;

        await driver.update({
          rating: newRating,
          totalRatings: newTotalRatings,
        });
      }
    } else if (isDriver) {
      // Driver rating the passenger
      await booking.update({
        passengerRating: rating,
        isReviewedByDriver: true
      });

      // Could implement passenger rating system here if needed
    }

    res.send(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Driver confirms or rejects a booking
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const confirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'confirm' or 'reject'
    const userId = req.user.id;

    // Find booking
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Trip,
          as: 'trip',
        },
      ],
    });

    if (!booking) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Check if user is the driver
    if (booking.trip.driverId !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Only the driver can confirm or reject bookings');
    }

    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Booking is not in pending status');
    }

    if (action === 'confirm') {
      // Update booking status
      await booking.update({
        status: 'confirmed',
        driverNotes: reason || null
      });

      // Send status update email
      await notificationService.sendTripStatusUpdate(booking, 'confirmed');
    } else if (action === 'reject') {
      // Update booking status and release seats
      await sequelize.transaction(async (t) => {
        await booking.update({
          status: 'cancelled_by_driver',
          cancellationReason: reason,
          cancellationTime: new Date()
        }, { transaction: t });

        // Release seats back to trip
        await booking.trip.update({
          availableSeats: booking.trip.availableSeats + booking.numberOfSeats
        }, { transaction: t });

        // If payment was made, initiate refund
        if (booking.paymentStatus === 'paid') {
          await booking.update({
            paymentStatus: 'refunded'
          }, { transaction: t });
        }
      });

      // Send status update email
      await notificationService.sendTripStatusUpdate(booking, 'cancelled_by_driver');
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid action. Must be either "confirm" or "reject"');
    }

    res.send(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Complete a booking after trip is finished
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const completeBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    

    // Find booking
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Trip,
          as: 'trip',
        },
      ],
    });

    if (!booking) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Check if user is the driver
    if (booking.trip.driverId !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Only the driver can complete bookings');
    }

    // Check if booking is in confirmed or in_progress status
    if (!['confirmed', 'in_progress'].includes(booking.status)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Booking must be confirmed or in progress to complete');
    }

    // Update booking status
    await booking.update({
      status: 'completed',
      actualDropoffTime: new Date()
    });

    // Send status update email
    await notificationService.sendTripStatusUpdate(booking, 'completed');

    res.send(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking details
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { role } = req.user;
    const {
      pickupLocation,
      dropoffLocation,
      passengerNotes,
      baggageCount,
      specialRequests,paymentIntentId,paymentStatus
    } = req.body;

    // Find booking
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Trip,
          as: 'trip',
        },
      ],
    });

    if (!booking) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Check if user is authorized to update this booking
    if (
      role !== 'admin' &&
      booking.passengerId !== userId &&
      booking.trip.driverId !== userId
    ) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to update this booking');
    }

    // Check if booking can be updated
    if (booking.status === 'cancelled_by_passenger' || 
        booking.status === 'cancelled_by_driver' || 
        booking.status === 'completed') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update a cancelled or completed booking');
    }

    // Check if trip has already departed
    if (new Date(booking.trip.startTime) < new Date()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update a booking for a trip that has already departed');
    }

    // Validate pickup and dropoff locations if provided
    if (pickupLocation) {
      if (!pickupLocation.latitude || !pickupLocation.longitude || !pickupLocation.address) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Pickup location must include latitude, longitude, and address');
      }
    }

    if (dropoffLocation) {
      if (!dropoffLocation.latitude || !dropoffLocation.longitude || !dropoffLocation.address) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Dropoff location must include latitude, longitude, and address');
      }
    }

    // Update booking
    const updatedBooking = await booking.update({
      pickupLocation: pickupLocation || booking.pickupLocation,
      dropoffLocation: dropoffLocation || booking.dropoffLocation,
      passengerNotes: passengerNotes || booking.passengerNotes,
      baggageCount: baggageCount !== undefined ? baggageCount : booking.baggageCount,
      specialRequests: specialRequests || booking.specialRequests,
      paymentStatus: paymentStatus || booking.paymentStatus,
      paymentIntentId: paymentIntentId || booking.paymentIntentId,

    });

    res.send(updatedBooking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookings,
  getBooking,
  createBooking,
  cancelBooking,
  rateBooking,
  confirmBooking,
  updateBooking,completeBooking
};