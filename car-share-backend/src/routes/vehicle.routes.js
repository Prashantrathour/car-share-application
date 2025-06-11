const express = require('express');
const { body } = require('express-validator');
const vehicleController = require('../controllers/vehicle.controller');
const { auth, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router
  .route('/')
  .get(auth(), vehicleController.getVehicles)
  .post(
    auth(),
    validate([
      body('make').isString().trim().isLength({ min: 1, max: 50 }).withMessage('Make is required'),
      body('model').isString().trim().isLength({ min: 1, max: 50 }).withMessage('Model is required'),
      body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
      body('licensePlate').isString().trim().isLength({ min: 2, max: 20 }).withMessage('Valid license plate is required'),
      body('color').isString().trim().isLength({ min: 1, max: 30 }).withMessage('Color is required'),
      body('type').isIn(['sedan', 'suv', 'van', 'truck', 'luxury']).withMessage('Valid vehicle type is required'),
      body('seats').isInt({ min: 2, max: 15 }).withMessage('Valid number of seats is required'),
      body('transmission').isIn(['automatic', 'manual']).withMessage('Valid transmission type is required'),
      body('features').isArray().optional().withMessage('Features must be an array'),
      body('availabilityStatus')
        .optional()
        .isIn(['available', 'in_use', 'maintenance', 'inactive'])
        .withMessage('Valid availability status is required'),
      body('dailyRate')
        .isFloat({ min: 0 })
        .withMessage('Valid daily rate is required'),
      body('location')
        .isObject()
        .withMessage('Location is required')
        .custom((value) => {
          if (!value.latitude || !value.longitude) {
            throw new Error('Location must include latitude and longitude');
          }
          return true;
        }),
      body('images').isArray().optional().withMessage('Images must be an array'),
      body('documents').isArray().optional().withMessage('Documents must be an array'),
      body('verificationStatus')
        .optional()
        .isIn(['pending', 'verified', 'rejected'])
        .withMessage('Valid verification status is required')
    ]),
    vehicleController.createVehicle
  );

router
  .route('/:id')
  .get(auth(), vehicleController.getVehicle)
  .patch(
    auth(),
    validate([
      body('make').optional().isString().trim().isLength({ min: 1, max: 50 }),
      body('model').optional().isString().trim().isLength({ min: 1, max: 50 }),
      body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
      body('licensePlate').optional().isString().trim().isLength({ min: 2, max: 20 }),
      body('color').optional().isString().trim().isLength({ min: 1, max: 30 }),
      body('type').optional().isIn(['sedan', 'suv', 'van', 'truck', 'luxury']),
      body('seats').optional().isInt({ min: 2, max: 15 }),
      body('transmission').optional().isIn(['automatic', 'manual']),
      body('features').optional().isArray(),
      body('availabilityStatus')
        .optional()
        .isIn(['available', 'in_use', 'maintenance', 'inactive']),
      body('dailyRate').optional().isFloat({ min: 0 }),
      body('location')
        .optional()
        .isObject()
        .custom((value) => {
          if (value && (!value.latitude || !value.longitude)) {
            throw new Error('Location must include latitude and longitude');
          }
          return true;
        }),
      body('images').optional().isArray(),
      body('documents').optional().isArray(),
      body('verificationStatus')
        .optional()
        .isIn(['pending', 'verified', 'rejected'])
    ]),
    vehicleController.updateVehicle
  )
  .delete(auth(), vehicleController.deleteVehicle);

module.exports = router; 