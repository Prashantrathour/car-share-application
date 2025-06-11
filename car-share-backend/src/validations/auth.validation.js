const { body } = require('express-validator');

const register = [
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain a letter'),
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Must be a valid phone number'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['user', 'driver', 'admin'])
    .withMessage('Role must be either user, driver, or admin'),
  body('dateOfBirth')
    .optional()
    .isDate()
    .withMessage('Must be a valid date')
    .custom((value) => {
      if (new Date(value) >= new Date()) {
        throw new Error('Date of birth must be before today');
      }
      return true;
    }),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be a valid object'),
];

const login = [
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshToken = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

const verifyEmail = [
  body('token').notEmpty().withMessage('Verification token is required'),
];

const verifyPhone = [
  body('code').notEmpty().withMessage('Verification code is required'),
  body('phoneNumber').isMobilePhone().withMessage('Must be a valid phone number'),
];

const forgotPassword = [
  body('email').isEmail().withMessage('Must be a valid email'),
];

const resetPassword = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain a letter'),
];

const resendEmailVerification = [
  body('email').isEmail().withMessage('Must be a valid email'),
];

const resendPhoneVerification = [
  body('phoneNumber').isMobilePhone().withMessage('Must be a valid phone number'),
];

module.exports = {
  register,
  login,
  refreshToken,
  verifyEmail,
  verifyPhone,
  forgotPassword,
  resetPassword,
  resendEmailVerification,
  resendPhoneVerification,
};