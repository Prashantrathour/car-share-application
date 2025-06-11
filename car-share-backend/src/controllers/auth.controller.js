const httpStatus = require('http-status');
const crypto = require('crypto');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { Op } = require('sequelize');
const tokenService = require('../services/token.service');
const emailService = require('../services/email.service');
const logger = require('../config/logger');
const firebaseService = require('../services/firebase.service');
const admin = require('firebase-admin');
const { isInitialized: isFirebaseInitialized } = require('../services/firebase.service');

/**
 * Helper to check if both email and phone are verified, and activate account if so
 * @param {Object} user - User object
 * @returns {Promise<Object>} - Updated user
 */
const checkAndActivateAccount = async (user) => {
  if (user.isEmailVerified && user.isPhoneVerified && user.status === 'pending') {
    user.status = 'active';
    user.emailVerificationExpires = null;
    user.phoneVerificationExpires = null;
    await user.save();
    logger.info(`User ${user.id} activated after email and phone verification`);
  }
  return user;
};

/**
 * Register a new user
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const generateOTP = (length = 6) => {
  // Generate a random 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Check if email is already in use
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw new ApiError(httpStatus.CONFLICT, 'Email already exists');
    }

    // Check if phone number is already in use
    if (!phoneNumber) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number is required');
    }
    
    const existingPhone = await User.findOne({ where: { phoneNumber } });
    if (existingPhone) {
      throw new ApiError(httpStatus.CONFLICT, 'Phone number already exists');
    }

    // Create user in database
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      status: 'pending',
      isEmailVerified: false,
      isPhoneVerified: false
    });

    // Generate tokens for the new user
    const tokens = await tokenService.generateAuthTokens(user);

    // Send verification codes since user is not verified
    let emailOTP, phoneOTP;
    
    // Send email OTP if not verified
    try {
      emailOTP = generateOTP();
      if (process.env.NODE_ENV === 'development') {
        user.emailVerificationToken = emailOTP;
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 15);
        user.emailVerificationExpires = expirationTime;
        await user.save();
      }
    } catch (error) {
      logger.error(`Failed to send email OTP: ${error.message}`);
    }

    // Send phone OTP if not verified
    try {
      phoneOTP = generateOTP();
      if (process.env.NODE_ENV === 'development') {
        user.phoneVerificationCode = phoneOTP;
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 15);
        user.phoneVerificationExpires = expirationTime;
        await user.save();
      }
    } catch (error) {
      logger.error(`Failed to send phone OTP: ${error.message}`);
    }

    // Send response with user details, tokens, and verification status
    res.status(httpStatus.CREATED).send({
      user: {
        id: user.id,
        email: user.email,
        role: "user",
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status
      },
      tokens,
      needsVerification: !user.isEmailVerified || !user.isPhoneVerified,
      // Include verification codes in development mode
      verification: process.env.NODE_ENV === 'development' ? {
        emailOTP: !user.isEmailVerified ? emailOTP : undefined,
        phoneOTP: !user.isPhoneVerified ? phoneOTP : undefined
      } : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login with email and password
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }

    // Generate tokens for all users, regardless of verification status
    const tokens = await tokenService.generateAuthTokens(user);

    // If user is not verified, send verification codes
    let emailOTP, phoneOTP;
    if (!user.isEmailVerified || !user.isPhoneVerified) {
      if (!user.isEmailVerified) {
        try {
          emailOTP = generateOTP();
          if (process.env.NODE_ENV === 'development') {
            user.emailVerificationToken = emailOTP;
            const expirationTime = new Date();
            expirationTime.setMinutes(expirationTime.getMinutes() + 15);
            user.emailVerificationExpires = expirationTime;
            await user.save();
          }
        } catch (error) {
          logger.error(`Failed to send email OTP: ${error.message}`);
        }
      }

      if (!user.isPhoneVerified && user.phoneNumber) {
        try {
          phoneOTP = generateOTP();
          if (process.env.NODE_ENV === 'development') {
            user.phoneVerificationCode = phoneOTP;
            const expirationTime = new Date();
            expirationTime.setMinutes(expirationTime.getMinutes() + 15);
            user.phoneVerificationExpires = expirationTime;
            await user.save();
          }
        } catch (error) {
          logger.error(`Failed to send phone OTP: ${error.message}`);
        }
      }
    }

    // Send response with user details, tokens, and verification status
    res.send({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status
      },
      tokens,
      needsVerification: !user.isEmailVerified || !user.isPhoneVerified,
      // Include verification codes in development mode
      verification: process.env.NODE_ENV === 'development' ? {
        emailOTP: !user.isEmailVerified ? emailOTP : undefined,
        phoneOTP: !user.isPhoneVerified ? phoneOTP : undefined
      } : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh auth tokens
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Refresh token is required');
    }

    // Verify refresh token
    const user = await tokenService.verifyToken(refreshToken, 'refresh');

    // Generate new tokens
    const tokens = await tokenService.generateAuthTokens(user);

    res.send({ tokens });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Find user by verification token
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid verification token');
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();
    
    // Check if phone is also verified and activate account if both are verified
    await checkAndActivateAccount(user);

    res.status(httpStatus.OK).send({ 
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify phone
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const verifyPhone = async (req, res, next) => {
  try {
    const { code, phoneNumber } = req.body;

    // Find user by phone number
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if phone is already verified
    if (user.isPhoneVerified) {
      return res.status(httpStatus.OK).send({ 
        message: 'Phone is already verified',
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          status: user.status
        }
      });
    }

    // Verify verification code
    if (code !== user.phoneVerificationCode) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid verification code');
    }

    // Update user
    user.isPhoneVerified = true;
    user.phoneVerificationCode = null;
    await user.save();
    
    // Check if email is also verified and activate account if both are verified
    await checkAndActivateAccount(user);

    res.status(httpStatus.OK).send({ 
      message: 'Phone verified successfully',
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify phone with Firebase token from client
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const verifyPhoneWithFirebase = async (req, res, next) => {
  try {
    const { phoneNumber, firebaseToken } = req.body;

    // Find user by phone number
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if phone is already verified
    if (user.isPhoneVerified) {
      return res.status(httpStatus.OK).send({ 
        message: 'Phone is already verified',
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          status: user.status
        }
      });
    }

    // Verify Firebase token
    try {
      // In development mode, we'll skip actual verification
      let firebaseUid;
      
      if (process.env.NODE_ENV === 'development') {
        logger.info('Development mode: Simulating Firebase token verification');
        firebaseUid = 'firebase-uid-' + Date.now();
      } else {
        // In production, verify the token using Firebase Admin SDK
        // This is a placeholder for the actual verification
        if (isFirebaseInitialized()) {
          // Verify the ID token
          const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
          firebaseUid = decodedToken.uid;
          
          // Check if the phone number matches
          if (decodedToken.phone_number !== phoneNumber) {
            throw new Error('Phone number mismatch');
          }
        } else {
          // If Firebase isn't initialized, handle gracefully
          logger.warn('Firebase not initialized, simulating verification');
          firebaseUid = 'firebase-uid-' + Date.now();
        }
      }
      
      // Update user
      user.isPhoneVerified = true;
      user.phoneVerificationCode = null;
      user.firebaseUid = firebaseUid;
      await user.save();
      
      // Check if email is also verified and activate account if both are verified
      await checkAndActivateAccount(user);

      res.status(httpStatus.OK).send({ 
        message: 'Phone verified successfully with Firebase',
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          status: user.status
        }
      });
    } catch (error) {
      logger.error(`Firebase token verification failed: ${error.message}`);
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Firebase token');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No user found with this email');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save reset token
    user.reset_password_token = resetToken;
    user.reset_password_expires = resetTokenExpiry;
    await user.save();

    // Send password reset email
    await emailService.sendResetPasswordEmail(email, resetToken);

    res.status(httpStatus.OK).send({ message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Find user by reset token
    const user = await User.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired reset token');
    }

    // Update password
    user.password = password;
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    res.status(httpStatus.OK).send({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const logout = async (req, res, next) => {
  try {
    // Clear refresh token
    req.user.refresh_token = null;
    await req.user.save();

    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Resend email verification
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const resendEmailVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(httpStatus.OK).send({ message: 'Email is already verified' });
    }

    // Generate new email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 15);
    user.emailVerificationExpires = expirationTime;
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(email, emailVerificationToken);

    res.status(httpStatus.OK).send({ message: 'Verification email resent successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend phone verification
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const resendPhoneVerification = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    // Find user by phone
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if phone is already verified
    if (user.isPhoneVerified) {
      return res.status(httpStatus.OK).send({ message: 'Phone is already verified' });
    }

    // Generate new phone verification code
    const phoneVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.phoneVerificationCode = phoneVerificationCode;
    await user.save();

    // For development, simply return the verification code
    // In production, we would use Firebase to send the code
    try {
      // Attempt to use Firebase to send code (will be simulated in development)
      await firebaseService.sendVerificationCode(phoneNumber);
      
      // For development/testing, include the code in the response
      res.status(httpStatus.OK).send({ 
        message: 'Verification code generated successfully',
        // Only include this in development:
        phoneVerificationCode: process.env.NODE_ENV === 'development' ? phoneVerificationCode : undefined
      });
    } catch (error) {
      logger.error(`Failed to send verification code: ${error.message}`);
      // Even if Firebase fails, return success in development
      if (process.env.NODE_ENV === 'development') {
        res.status(httpStatus.OK).send({ 
          message: 'Verification code generated successfully (Firebase failed but continuing in development)',
          phoneVerificationCode
        });
      } else {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send verification code');
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get verification status
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getVerificationStatus = async (req, res, next) => {
  try {
    const user = req.user;

    res.status(httpStatus.OK).send({
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      status: user.status
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activate user account manually
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const activateAccount = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Update user status to active
    user.status = 'active';
    await user.save();

    res.status(httpStatus.OK).send({ 
      message: 'Account activated successfully',
      user: {
        id: user.id,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email with Firebase
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const verifyEmailWithFirebase = async (req, res, next) => {
  try {
    const { oobCode } = req.body;

    if (!oobCode) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Verification code is required');
    }

    // Use Firebase to verify the email
    const verifiedInfo = await firebaseService.verifyEmailWithToken(oobCode);
    
    // Find user by email
    const user = await User.findOne({ where: { email: verifiedInfo.email } });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Mark email as verified in our database
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();
    
    // Check if phone is also verified and activate account if both are verified
    await checkAndActivateAccount(user);

    res.status(httpStatus.OK).send({ 
      message: 'Email verified successfully with Firebase',
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend email verification link using Firebase
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const resendEmailVerificationFirebase = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(httpStatus.OK).send({ 
        message: 'Email is already verified',
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          status: user.status
        }
      });
    }

    // Create/update the Firebase user
    await firebaseService.createOrUpdateFirebaseUser({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber
    });

    // Generate a continuation URL (where user will land after verification)
    const continueUrl = `${config.clientUrl}/auth/verify-complete?email=${encodeURIComponent(email)}`;
    
    // Send verification email using Firebase
    const verificationLink = await firebaseService.sendEmailVerificationLink(email, continueUrl);
    
    // If in development mode and we get a token back instead of a link
    if (process.env.NODE_ENV === 'development' && !verificationLink.startsWith('http')) {
      // Store token for later verification (only in development)
      user.emailVerificationToken = verificationLink;
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 15);
      user.emailVerificationExpires = expirationTime;
      await user.save();
    }

    res.status(httpStatus.OK).send({ 
      message: 'Verification email sent successfully',
      verificationLink: process.env.NODE_ENV === 'development' ? verificationLink : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send email OTP
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const sendEmailOTP = async (req, res, next) => {
  try {
    // Get email from authenticated user
    const user = req.user;
    const email = user.email;
console.log(user)
    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(httpStatus.OK).send({ 
        message: 'Email is already verified',
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          status: user.status
        }
      });
    }

    // Send OTP to email using our improved function
    const otp = await firebaseService.sendEmailOTP(email);
    
    // In development, we'll save the OTP in the user record for testing
    if (process.env.NODE_ENV === 'development') {
      user.emailVerificationToken = otp;
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 15);
      user.emailVerificationExpires = expirationTime;
      await user.save();
    }

    res.status(httpStatus.OK).send({ 
      message: 'Verification code sent to email',
      email,
      // Only include OTP in development for testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    logger.error(`Failed to send email OTP: ${error.message}`);
    next(error);
  }
};

/**
 * Verify email with OTP
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const verifyEmailOTP = async (req, res, next) => {
  try {
    // Get email from authenticated user and OTP from request body
    const user = req.user;
    const email = user.email;
    const { otp } = req.body;

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(httpStatus.OK).send({ 
        message: 'Email is already verified',
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          status: user.status
        }
      });
    }

    // Verify OTP using our improved function
    const isValid = await firebaseService.verifyEmailOTP(email, otp);
    
    if (!isValid) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired verification code');
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();
    
    // Check if phone is also verified and activate account if both are verified
    await checkAndActivateAccount(user);

    res.status(httpStatus.OK).send({ 
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status
      }
    });
  } catch (error) {
    logger.error(`Email OTP verification failed: ${error.message}`);
    next(error);
  }
};

/**
 * Send phone verification OTP
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const sendPhoneOTP = async (req, res, next) => {
  try {
    // Get phone number from authenticated user
    const user = req.user;
    const phoneNumber = user.phoneNumber;

    if (!phoneNumber) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User does not have a phone number');
    }

    // Check if phone is already verified
    if (user.isPhoneVerified) {
      return res.status(httpStatus.OK).send({ 
        message: 'Phone is already verified',
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          status: user.status
        }
      });
    }

    // Send OTP to phone using our improved function
    const otp = await firebaseService.sendVerificationCode(phoneNumber);
    
    // In development, we'll save the OTP in the user record for testing
    if (process.env.NODE_ENV === 'development') {
      user.phoneVerificationCode = otp;
      // Set expiration to 15 minutes from now
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 15);
      user.phoneVerificationExpires = expirationTime;
      await user.save();
    }

    res.status(httpStatus.OK).send({ 
      message: 'Verification code sent to phone',
      phoneNumber,
      // Only include OTP in development for testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    logger.error(`Failed to send phone OTP: ${error.message}`);
    next(error);
  }
};

/**
 * Verify phone with OTP
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const verifyPhoneOTP = async (req, res, next) => {
  try {
    // Get phone number from authenticated user and OTP from request body
    const user = req.user;
    const phoneNumber = user.phoneNumber;
    const { otp } = req.body;

    if (!phoneNumber) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User does not have a phone number');
    }

    // Check if phone is already verified
    if (user.isPhoneVerified) {
      return res.status(httpStatus.OK).send({ 
        message: 'Phone is already verified',
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          status: user.status
        }
      });
    }

    // Verify OTP using our improved function
    const isValid = await firebaseService.verifyPhoneNumber(phoneNumber, otp);
    
    if (!isValid) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired verification code');
    }

    // Update user
    user.isPhoneVerified = true;
    user.phoneVerificationCode = null;
    user.phoneVerificationExpires = null;
    await user.save();
    
    // Check if email is also verified and activate account if both are verified
    await checkAndActivateAccount(user);

    res.status(httpStatus.OK).send({ 
      message: 'Phone verified successfully',
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status
      }
    });
  } catch (error) {
    logger.error(`Phone OTP verification failed: ${error.message}`);
    next(error);
  }
};

/**
 * Get and send verification tokens for a user
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getAndSendVerificationTokens = async (req, res, next) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request
    
    const verificationInfo = await firebaseService.getAndSendVerificationTokens(userId);
    
    res.status(httpStatus.OK).send({
      message: 'Verification tokens sent successfully',
      ...verificationInfo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send email verification token
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const sendEmailVerificationToken = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    console.log(user)
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(httpStatus.OK).send({ 
        message: 'Email is already verified',
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          status: user.status
        }
      });
    }

    // Generate and send email token
    const emailToken = await firebaseService.sendEmailOTP(email);
    
    // In development, save the token
    if (process.env.NODE_ENV === 'development') {
      user.emailVerificationToken = emailToken;
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 15);
      user.emailVerificationExpires = expirationTime;
      await user.save();
    }

    res.status(httpStatus.OK).send({ 
      message: 'Email verification token sent successfully',
      email,
      // Only include token in development
      token: process.env.NODE_ENV === 'development' ? emailToken : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send phone verification token
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const sendPhoneVerificationToken = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    // Find user by phone
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if phone is already verified
    if (user.isPhoneVerified) {
      return res.status(httpStatus.OK).send({ 
        message: 'Phone is already verified',
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          isPhoneVerified: user.isPhoneVerified,
          status: user.status
        }
      });
    }

    // Generate and send phone verification code
    const phoneToken = await firebaseService.sendVerificationCode(phoneNumber);
    
    // In development, save the token
    if (process.env.NODE_ENV === 'development') {
      user.phoneVerificationCode = phoneToken;
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 15);
      user.phoneVerificationExpires = expirationTime;
      await user.save();
    }

    res.status(httpStatus.OK).send({ 
      message: 'Phone verification code sent successfully',
      phoneNumber,
      // Only include token in development
      token: process.env.NODE_ENV === 'development' ? phoneToken : undefined
    });
  } catch (error) {
    logger.error(`Failed to send phone verification: ${error.message}`);
    next(error);
  }
};

/**
 * Verify email token
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const verifyEmailToken = async (req, res, next) => {
  try {
    const { email, token } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(httpStatus.OK).send({ 
        message: 'Email is already verified',
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          status: user.status
        }
      });
    }

    // Verify token
    const isValid = await firebaseService.verifyEmailOTP(email, token);
    
    if (!isValid) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired verification token');
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();
    
    // Check if both email and phone are verified
    await checkAndActivateAccount(user);

    res.status(httpStatus.OK).send({ 
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify phone token
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const verifyPhoneToken = async (req, res, next) => {
  try {
    const { phoneNumber, token } = req.body;

    // Find user by phone
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if phone is already verified
    if (user.isPhoneVerified) {
      return res.status(httpStatus.OK).send({ 
        message: 'Phone is already verified',
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          isPhoneVerified: user.isPhoneVerified,
          status: user.status
        }
      });
    }

    // Verify token
    const isValid = await firebaseService.verifyPhoneNumber(phoneNumber, token);
    
    if (!isValid) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired verification token');
    }

    // Update user
    user.isPhoneVerified = true;
    user.phoneVerificationCode = null;
    user.phoneVerificationExpires = null;
    await user.save();
    
    // Check if both email and phone are verified
    await checkAndActivateAccount(user);

    res.status(httpStatus.OK).send({ 
      message: 'Phone verified successfully',
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  verifyEmailWithFirebase,
  verifyEmailOTP,
  verifyPhone,
  verifyPhoneWithFirebase,
  verifyPhoneOTP,
  forgotPassword,
  resetPassword,
  activateAccount,
  resendEmailVerification,
  resendEmailVerificationFirebase,
  resendPhoneVerification,
  getVerificationStatus,
  sendEmailOTP,
  sendPhoneOTP,
  getAndSendVerificationTokens,
  sendEmailVerificationToken,
  sendPhoneVerificationToken,
  verifyEmailToken,
  verifyPhoneToken
};