const express = require('express');
const { body, query } = require('express-validator');
const validate = require('../middlewares/validate');
console.log('Before requiring trip controller');
const tripController = require('../controllers/trip.controller');
console.log('Trip controller:', tripController);
const { auth, authorize } = require('../middlewares/auth');
const tripValidation = require('../validations/trip.validation');

const router = express.Router();

router.get(
  '/',
  validate([
    query('startLocation').optional().trim(),
    query('endLocation').optional().trim(),
    query('startTime').optional().isDate().withMessage('Must be a valid date'),
    query('minSeats').optional().isInt({ min: 1 }).withMessage('Must be a positive integer'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Must be a positive number'),
    query('page').optional().isInt({ min: 1 }).withMessage('Must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Must be between 1 and 100'),
  ]),
  tripController.getTrips
);

router.get('/:id', tripController.getTrip);

router.post(
  '/',
  auth(),
  authorize('driver', 'admin'),
  validate([
    body('startLocation').notEmpty().withMessage('Start location is required')
      .isObject().withMessage('Start location must be an object')
      .custom((value) => {
        if (!value.address || !value.latitude || !value.longitude) {
          throw new Error('Start location must include address, latitude, and longitude');
        }
        return true;
      }),
    body('endLocation').notEmpty().withMessage('End location is required')
      .isObject().withMessage('End location must be an object')
      .custom((value) => {
        if (!value.address || !value.latitude || !value.longitude) {
          throw new Error('End location must include address, latitude, and longitude');
        }
        return true;
      }),
    body('startTime').isISO8601().withMessage('Must be a valid date'),
    body('endTime').optional().isISO8601().withMessage('Must be a valid date'),
    body('availableSeats').isInt({ min: 1 }).withMessage('Must be a positive integer'),
    body('pricePerSeat').isFloat({ min: 0 }).withMessage('Must be a positive number'),
    body('preferences').optional().isObject().withMessage('Preferences must be an object'),
    body('notes').optional().isString(),
    body('vehicleId').optional().isString(),
  ]),
  tripController.createTrip
);

router.patch(
  '/:id',
  auth(),
  authorize('driver', 'admin'),
  validate([
    body('startLocation').optional()
      .isObject().withMessage('Start location must be an object')
      .custom((value) => {
        if (value && (!value.address || !value.latitude || !value.longitude)) {
          throw new Error('Start location must include address, latitude, and longitude');
        }
        return true;
      }),
    body('endLocation').optional()
      .isObject().withMessage('End location must be an object')
      .custom((value) => {
        if (value && (!value.address || !value.latitude || !value.longitude)) {
          throw new Error('End location must include address, latitude, and longitude');
        }
        return true;
      }),
    body('startTime').optional().isISO8601().withMessage('Must be a valid date'),
    body('availableSeats').optional().isInt({ min: 1 }).withMessage('Must be a positive integer'),
    body('pricePerSeat').optional().isFloat({ min: 0 }).withMessage('Must be a positive number'),
    body('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled']),
    body('description').optional(),
  ]),
  tripController.updateTrip
);

router.delete(
  '/:id',
  auth(),
  authorize('driver', 'admin'),
  tripController.deleteTrip
);

// Add carpooling routes
router.get('/carpool', 
  auth(), 
  validate(tripValidation.findCarpoolOptions),
  tripController.findCarpoolOptions
);

router.post('/:id/waypoints',
  auth(),
  validate(tripValidation.addWaypoint),
  tripController.addWaypoint
);

router.get('/:id/waypoint-etas',
  auth(),
  tripController.getWaypointETAs
);

module.exports = router;