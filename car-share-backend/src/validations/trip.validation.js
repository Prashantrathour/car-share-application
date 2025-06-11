const { body, query } = require('express-validator');
const Joi = require('joi');

const getTripValidation = [
  query('startLocation').optional().trim(),
  query('endLocation').optional().trim(),
  query('startTime').optional().isISO8601().withMessage('Must be a valid date'),
  query('minSeats').optional().isInt({ min: 1 }).withMessage('Must be a positive integer'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Must be a positive number'),
  query('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled']),
  query('page').optional().isInt({ min: 1 }).withMessage('Must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Must be between 1 and 100'),
];

const createTripValidation = [
  body('vehicleId').notEmpty().isUUID().withMessage('Valid vehicle ID is required'),
  body('startLocation')
    .notEmpty().withMessage('Start location is required')
    .isObject().withMessage('Start location must be an object')
    .custom((value) => {
      if (!value.address || !value.latitude || !value.longitude) {
        throw new Error('Start location must include address, latitude, and longitude');
      }
      if (typeof value.latitude !== 'number' || typeof value.longitude !== 'number') {
        throw new Error('Latitude and longitude must be numbers');
      }
      return true;
    }),
  body('endLocation')
    .notEmpty().withMessage('End location is required')
    .isObject().withMessage('End location must be an object')
    .custom((value) => {
      if (!value.address || !value.latitude || !value.longitude) {
        throw new Error('End location must include address, latitude, and longitude');
      }
      if (typeof value.latitude !== 'number' || typeof value.longitude !== 'number') {
        throw new Error('Latitude and longitude must be numbers');
      }
      return true;
    }),
  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .isISO8601().withMessage('Must be a valid date'),
  body('endTime')
    .notEmpty().withMessage('End time is required')
    .isISO8601().withMessage('Must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('availableSeats')
    .notEmpty().withMessage('Available seats is required')
    .isInt({ min: 1 }).withMessage('Must be a positive integer'),
  body('pricePerSeat')
    .notEmpty().withMessage('Price per seat is required')
    .isFloat({ min: 0 }).withMessage('Must be a positive number'),
  body('route')
    .optional()
    .isObject().withMessage('Route must be an object')
    .custom((value) => {
      if (!Array.isArray(value.waypoints)) {
        throw new Error('Route must include waypoints array');
      }
      return true;
    }),
  body('estimatedDuration')
    .notEmpty().withMessage('Estimated duration is required')
    .isInt({ min: 1 }).withMessage('Must be a positive integer'),
  body('estimatedDistance')
    .notEmpty().withMessage('Estimated distance is required')
    .isFloat({ min: 0 }).withMessage('Must be a positive number'),
  body('preferences')
    .optional()
    .isObject().withMessage('Preferences must be an object'),
  body('notes')
    .optional()
    .isString().withMessage('Notes must be a string'),
];

const updateTripValidation = [
  body('vehicleId').optional().isUUID().withMessage('Must be a valid UUID'),
  body('startLocation')
    .optional()
    .isObject().withMessage('Start location must be an object')
    .custom((value) => {
      if (value && (!value.address || !value.latitude || !value.longitude)) {
        throw new Error('Start location must include address, latitude, and longitude');
      }
      if (value && (typeof value.latitude !== 'number' || typeof value.longitude !== 'number')) {
        throw new Error('Latitude and longitude must be numbers');
      }
      return true;
    }),
  body('endLocation')
    .optional()
    .isObject().withMessage('End location must be an object')
    .custom((value) => {
      if (value && (!value.address || !value.latitude || !value.longitude)) {
        throw new Error('End location must include address, latitude, and longitude');
      }
      if (value && (typeof value.latitude !== 'number' || typeof value.longitude !== 'number')) {
        throw new Error('Latitude and longitude must be numbers');
      }
      return true;
    }),
  body('startTime')
    .optional()
    .isISO8601().withMessage('Must be a valid date'),
  body('endTime')
    .optional()
    .isISO8601().withMessage('Must be a valid date')
    .custom((value, { req }) => {
      if (value && req.body.startTime && new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
  body('availableSeats')
    .optional()
    .isInt({ min: 1 }).withMessage('Must be a positive integer'),
  body('pricePerSeat')
    .optional()
    .isFloat({ min: 0 }).withMessage('Must be a positive number'),
  body('route')
    .optional()
    .isObject().withMessage('Route must be an object')
    .custom((value) => {
      if (value && !Array.isArray(value.waypoints)) {
        throw new Error('Route must include waypoints array');
      }
      return true;
    }),
  body('estimatedDuration')
    .optional()
    .isInt({ min: 1 }).withMessage('Must be a positive integer'),
  body('estimatedDistance')
    .optional()
    .isFloat({ min: 0 }).withMessage('Must be a positive number'),
  body('preferences')
    .optional()
    .isObject().withMessage('Preferences must be an object'),
  body('notes')
    .optional()
    .isString().withMessage('Notes must be a string'),
];

const findCarpoolOptions = {
  query: Joi.object().keys({
    startLocation: Joi.object().keys({
      latitude: Joi.number().required().min(-90).max(90),
      longitude: Joi.number().required().min(-180).max(180),
      address: Joi.string().optional()
    }).required(),
    endLocation: Joi.object().keys({
      latitude: Joi.number().required().min(-90).max(90),
      longitude: Joi.number().required().min(-180).max(180),
      address: Joi.string().optional()
    }).required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
    radius: Joi.number().min(0.1).max(50).default(5),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

const addWaypoint = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required()
  }),
  body: Joi.object().keys({
    location: Joi.object().keys({
      latitude: Joi.number().required().min(-90).max(90),
      longitude: Joi.number().required().min(-180).max(180),
      address: Joi.string().required()
    }).required(),
    type: Joi.string().valid('pickup', 'dropoff').required(),
    sequence: Joi.number().integer().min(0).optional(),
    distanceFromStart: Joi.number().min(0).optional(),
    estimatedArrivalTime: Joi.date().iso().optional(),
    notes: Joi.string().max(500).optional(),
    passengerId: Joi.string().uuid().optional()
  })
};

module.exports = {
  getTripValidation,
  createTripValidation,
  updateTripValidation,
  findCarpoolOptions,
  addWaypoint
};