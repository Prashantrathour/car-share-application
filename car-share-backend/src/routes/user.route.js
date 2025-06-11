const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const userController = require('../controllers/user.controller');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get(
  '/profile',
  auth(),
  userController.getProfile
);

router.patch(
  '/profile',
  auth(),
  validate([
    body('firstName').optional().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName').optional().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Must be a valid phone number'),
    body('avatar').optional().isURL().withMessage('Must be a valid URL'),
    body('dateOfBirth').optional().isDate().withMessage('Must be a valid date'),
    body('address').optional().isObject().withMessage('Must be a valid address object'),
  ]),
  userController.updateProfile
);

router.post(
  '/driver',
  auth(),
  authorize('user'),
  validate([
    body('make').isString().trim().isLength({ min: 1, max: 50 }).withMessage('Make is required'),
    body('model').isString().trim().isLength({ min: 1, max: 50 }).withMessage('Model is required'),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
    body('licensePlate').isString().trim().isLength({ min: 2, max: 20 }).withMessage('Valid license plate is required'),
    body('color').isString().trim().isLength({ min: 1, max: 30 }).withMessage('Color is required'),
    body('type').isIn(['sedan', 'suv', 'van', 'truck', 'luxury']).withMessage('Valid vehicle type is required'),
    body('seats').isInt({ min: 2, max: 15 }).withMessage('Valid number of seats is required'),
    body('transmission').isIn(['automatic', 'manual']).withMessage('Valid transmission type is required'),
    body('dailyRate').isFloat({ min: 0 }).withMessage('Valid daily rate is required'),
    body('location')
      .isObject()
      .withMessage('Location is required')
      .custom((value) => {
        if (!value.latitude || !value.longitude) {
          throw new Error('Location must include latitude and longitude');
        }
        return true;
      }),
      // body('images').optional().isArray().withMessage('Images must be an array'),
      // // body('documents').optional().isArray().withMessage('Documents must be an array'),
      // body('verificationStatus')
      //   .optional()
      //   .isIn(['pending', 'verified', 'rejected'])
      //   .withMessage('Valid verification status is required'),
    body('images').isArray().withMessage('Vehicle images must be an array'),
    body('driverLicense')
      .isObject()
      .withMessage('Driver license details are required')
      .custom((value) => {
        if (!value.number || !value.expiryDate || !value.state) {
          throw new Error('Driver license must include number, expiry date, and state');
        }
        return true;
      })
  ]),
  userController.becomeDriver
);

router.get(
  '/',
  auth(),
  authorize('admin'),
  userController.getUsers
);

router.get(
  '/:id',
  auth(),
  authorize('admin'),
  userController.getUser
);

router.patch(
  '/:id',
  auth(),
  authorize('admin'),
  validate([
    body('role').optional().isIn(['user', 'driver', 'admin']),
    body('isEmailVerified').optional().isBoolean(),
    body('isPhoneVerified').optional().isBoolean(),
    body('status').optional().isIn(['pending', 'active', 'suspended', 'banned']),
  ]),
  userController.updateUser
);

module.exports = router;