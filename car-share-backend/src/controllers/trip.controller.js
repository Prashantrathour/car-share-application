const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { Trip, User, Vehicle, Booking } = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const tripService = require('../services/trip.service');


/**
 * Get all trips with filtering
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getTrips = async (req, res, next) => {
  try {
    const {
      start_location,
      end_location,
      start_date,
      min_seats,
      max_price,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter
    const filter = {
      status: 'scheduled', // Only show scheduled trips by default
      startTime: { [Op.gt]: new Date() }, // Only future trips
    };

    if (start_location) {
      filter['startLocation.address'] = { [Op.iLike]: `%${start_location}%` };
    }

    if (end_location) {
      filter['endLocation.address'] = { [Op.iLike]: `%${end_location}%` };
    }

    if (start_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(start_date);
      endDate.setDate(endDate.getDate() + 1);
      filter.startTime = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (min_seats) {
      filter.availableSeats = { [Op.gte]: min_seats };
    }

    if (max_price) {
      filter.pricePerSeat = { [Op.lte]: max_price };
    }

    // Pagination
    const offset = (page - 1) * limit;

    // Get trips
    const { count, rows: trips } = await Trip.findAndCountAll({
      where: filter,
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'avatar', 'rating']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'make', 'model', 'year', 'color', 'licensePlate']
        }
      ],
      order: [['startTime', 'ASC']],
    });

    res.send({
      trips,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get trip by id
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findByPk(id, {
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'avatar', 'rating']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'make', 'model', 'year', 'color', 'licensePlate']
        }
      ],
    });
    
    if (!trip) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
    }

    res.send(trip);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new trip
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const createTrip = async (req, res, next) => {
  try {
    const {
      vehicleId,
      startLocation,
      endLocation,
      startTime,
      endTime,
      availableSeats,
      pricePerSeat,
      route,
      estimatedDuration,
      estimatedDistance,
      preferences,
      notes
    } = req.body;

    // Check if user is a driver or admin
    const user = await User.findOne({
      where: {
        id: req.user.id,
        role: {
          [Op.or]: ['driver', 'admin']
        }
      }
    });

    if (!user) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Only drivers and admins can create trips');
    }

    // Verify vehicle exists and belongs to the user
    const vehicle = await Vehicle.findOne({
      where: {
        id: vehicleId,
        ownerId: req.user.id
      }
    });

    if (!vehicle) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found or you do not have permission to use this vehicle');
    }

    // Validate start and end locations
    if (!startLocation.latitude || !startLocation.longitude || !startLocation.address) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Start location must include latitude, longitude, and address');
    }

    if (!endLocation.latitude || !endLocation.longitude || !endLocation.address) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'End location must include latitude, longitude, and address');
    }

    // Validate end time is after start time
    if (endTime <= startTime) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'End time must be after start time');
    }

    // Create trip
    const trip = await Trip.create({
      vehicleId,
      driverId: req.user.id,
      startLocation,
      endLocation,
      startTime,
      endTime,
      availableSeats,
      pricePerSeat,
      route,
      estimatedDuration,
      estimatedDistance,
      preferences,
      notes,
      status: 'scheduled'
    });

    res.status(httpStatus.CREATED).send(trip);
  } catch (error) {
    next(error);
  }
};

/**
 * Update trip
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      startLocation,
      endLocation,
      startTime,
      endTime,
      availableSeats,
      pricePerSeat,
      status,
      route,
      estimatedDuration,
      estimatedDistance,
      preferences,
      notes
    } = req.body;

    // Find trip
    const trip = await Trip.findByPk(id);
    if (!trip) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
    }

    // Check if user is the driver or admin
    if (trip.driverId !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to update this trip');
    }

    // Check if trip can be updated
    if (trip.status === 'completed' || trip.status === 'cancelled') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Completed or cancelled trips cannot be updated');
    }

    // Validate locations if provided
    if (startLocation && (!startLocation.latitude || !startLocation.longitude || !startLocation.address)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Start location must include latitude, longitude, and address');
    }

    if (endLocation && (!endLocation.latitude || !endLocation.longitude || !endLocation.address)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'End location must include latitude, longitude, and address');
    }

    // Validate end time is after start time if both are provided
    if (endTime && startTime && endTime <= startTime) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'End time must be after start time');
    }

    // Update trip
    const updatedTrip = await trip.update({
      startLocation: startLocation || trip.startLocation,
      endLocation: endLocation || trip.endLocation,
      startTime: startTime || trip.startTime,
      endTime: endTime || trip.endTime,
      availableSeats: availableSeats || trip.availableSeats,
      pricePerSeat: pricePerSeat || trip.pricePerSeat,
      status: status || trip.status,
      route: route || trip.route,
      estimatedDuration: estimatedDuration || trip.estimatedDuration,
      estimatedDistance: estimatedDistance || trip.estimatedDistance,
      preferences: preferences || trip.preferences,
      notes: notes !== undefined ? notes : trip.notes,
    });

    res.send(updatedTrip);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete trip
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find trip
    const trip = await Trip.findByPk(id);
    if (!trip) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
    }

    // Check if user is the driver or admin
    if (trip.driverId !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to delete this trip');
    }

    // Check if trip has bookings
    const bookingsCount = await Booking.count({ where: { tripId: id } });
    if (bookingsCount > 0) {
      // Instead of deleting, mark as cancelled
      await trip.update({ status: 'cancelled' });
      res.status(httpStatus.OK).send({ message: 'Trip cancelled successfully' });
    } else {
      // Delete trip if no bookings
      await trip.destroy();
      res.status(httpStatus.NO_CONTENT).send();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Find carpooling options near the user's start and end points
 * @route GET /api/v1/trips/carpool
 */
const findCarpoolOptions = catchAsync(async (req, res) => {
  const options = await tripService.findCarpoolOptions(req.query);
  res.status(httpStatus.OK).json({
    status: 'success',
    results: options.length,
    data: options
  });
});


const addWaypoint = catchAsync(async (req, res) => {
  const { id } = req.params;
  const waypoint = req.body;
  
  const trip = await tripService.addWaypoint(id, waypoint);
  
  res.status(httpStatus.OK).json({
    status: 'success',
    data: trip
  });
});

const getWaypointETAs = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const tripWithETAs = await tripService.calculateWaypointETAs(id);
  
  res.status(httpStatus.OK).json({
    status: 'success',
    data: tripWithETAs
  });
});

module.exports = {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  findCarpoolOptions,
  addWaypoint,
  getWaypointETAs
};

