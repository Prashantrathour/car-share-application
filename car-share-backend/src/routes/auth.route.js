const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const authController = require('../controllers/auth.controller');
const { auth, verifyAuth } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Apply rate limiting to auth endpoints
// router.use(authLimiter);

// Registration and Authentication
router.post(
  '/register',
  validate([
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .matches(/[a-zA-Z]/)
      .withMessage('Password must contain a letter'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+?[\d\s-]+$/)
      .withMessage('Invalid phone number format')
  ]),
  authController.register
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login
);

router.post('/refresh-token', authController.refreshToken);

router.post('/logout', auth(), authController.logout);

// Email verification with OTP
router.post(
  '/send-email-otp',
  verifyAuth(),
  authController.sendEmailOTP
);

router.post(
  '/verify-email-otp',
  verifyAuth(),
  validate([
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ]),
  authController.verifyEmailOTP
);

router.post(
  '/send-phone-otp',
  verifyAuth(),
  authController.sendPhoneOTP
);

router.post(
  '/verify-phone-otp',
  verifyAuth(),
  validate([
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ]),
  authController.verifyPhoneOTP
);
// Phone verification with OTP

// Get verification status
router.get(
  '/verification-status',
  verifyAuth(),
  authController.getVerificationStatus
);

/**
 * @swagger
 * /auth/verification-tokens:
 *   get:
 *     summary: Get and send verification tokens for email and phone
 *     description: Get verification tokens for unverified email and phone and send them to the user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Tokens sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification tokens sent successfully
 *                 needsEmailVerification:
 *                   type: boolean
 *                   example: true
 *                 needsPhoneVerification:
 *                   type: boolean
 *                   example: true
 *                 emailToken:
 *                   type: string
 *                   example: "123456"
 *                   description: Only included in development mode
 *                 phoneToken:
 *                   type: string
 *                   example: "654321"
 *                   description: Only included in development mode
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/verification-tokens',
  verifyAuth(),
  authController.getAndSendVerificationTokens
);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Send email verification token
 *     description: Sends a verification token to the user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       "200":
 *         description: Token sent successfully
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  '/verify-email',
  validate([
    body('email').isEmail().withMessage('Must be a valid email'),
  ]),
  authController.sendEmailVerificationToken
);

/**
 * @swagger
 * /auth/verify-phone:
 *   post:
 *     summary: Send phone verification token
 *     description: Sends a verification token to the user's phone
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       "200":
 *         description: Token sent successfully
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  '/verify-phone',
  validate([
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+?[\d\s-]+$/)
      .withMessage('Invalid phone number format'),
  ]),
  authController.sendPhoneVerificationToken
);

/**
 * @swagger
 * /auth/verify-email-token:
 *   post:
 *     summary: Verify email with token
 *     description: Verifies user's email using the token they received
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *     responses:
 *       "200":
 *         description: Email verified successfully
 *       "400":
 *         description: Invalid or expired token
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  '/verify-email-token',
  validate([
    body('email').isEmail().withMessage('Must be a valid email'),
    body('token').notEmpty().withMessage('Token is required'),
  ]),
  authController.verifyEmailToken
);

/**
 * @swagger
 * /auth/verify-phone-token:
 *   post:
 *     summary: Verify phone with token
 *     description: Verifies user's phone using the token they received
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - token
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       "200":
 *         description: Phone verified successfully
 *       "400":
 *         description: Invalid or expired token
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  '/verify-phone-token',
  validate([
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+?[\d\s-]+$/)
      .withMessage('Invalid phone number format'),
    body('token').notEmpty().withMessage('Token is required'),
  ]),
  authController.verifyPhoneToken
);

module.exports = router;