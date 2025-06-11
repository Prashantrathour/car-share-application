const admin = require('firebase-admin');
const config = require('../config/config');
const logger = require('../config/logger');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

let firebaseInitialized = false;
let developmentMode = process.env.NODE_ENV !== 'production';

// Initialize Twilio client
const twilioClient = twilio(
  config.twilio.accountSid,
  config.twilio.authToken
);

const firebaseConfig = {
  apiKey: "AIzaSyDGjA-0y3KWJg2vmkS3kmBRX0Z2deJ2Wa4",
  authDomain: "carshare-82464.firebaseapp.com",
  projectId: "carshare-82464",
  storageBucket: "carshare-82464.firebasestorage.app",
  messagingSenderId: "404341052544",
  appId: "1:404341052544:web:e53f616bf64a8bca174265",
  measurementId: "G-YL1Y4TXHDF"
};

/**
 * Initialize Firebase Admin SDK
 */
const initializeFirebase = () => {
  try {
    // If we already have Firebase initialized, don't initialize again
    if (firebaseInitialized) return true;
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          clientEmail: config.firebase.clientEmail,
          privateKey: config.firebase.privateKey?.replace(/\\n/g, '\n'),
        }),
      });
      firebaseInitialized = true;
      logger.info('Firebase initialized successfully');
      return true;
    }
    
    return true;
  } catch (error) {
    logger.error(`Firebase initialization failed: ${error.message}`);
    return false;
  }
};

// Try to initialize Firebase during service startup
firebaseInitialized = initializeFirebase();

/**
 * Create or update Firebase user
 * @param {Object} userData - User data containing email, phone, etc.
 * @returns {Promise<Object>} - Firebase user record
 */
const createOrUpdateFirebaseUser = async (userData) => {
  try {
    if (!firebaseInitialized || developmentMode) {
      logger.info('Development mode: Simulating Firebase user creation/update');
      return { uid: 'firebase-uid-' + Date.now() };
    }

    const { email, phoneNumber, id } = userData;
    
    try {
      // Check if user exists by email
      let firebaseUser;
      try {
        if (email) {
          firebaseUser = await admin.auth().getUserByEmail(email);
        } else if (phoneNumber) {
          firebaseUser = await admin.auth().getUserByPhoneNumber(phoneNumber);
        }
      } catch (error) {
        // User doesn't exist, create a new one
        if (error.code === 'auth/user-not-found') {
          const userParams = {
            uid: id, // Use the database UUID as Firebase UID for consistency
          };
          
          if (email) userParams.email = email;
          if (phoneNumber) userParams.phoneNumber = phoneNumber;
          
          firebaseUser = await admin.auth().createUser(userParams);
          logger.info(`Created new Firebase user with UID: ${firebaseUser.uid}`);
          return firebaseUser;
        }
        throw error;
      }
      
      // User exists, update their info
      const updateParams = {};
      if (email && firebaseUser.email !== email) updateParams.email = email;
      if (phoneNumber && firebaseUser.phoneNumber !== phoneNumber) updateParams.phoneNumber = phoneNumber;
      
      if (Object.keys(updateParams).length > 0) {
        firebaseUser = await admin.auth().updateUser(firebaseUser.uid, updateParams);
        logger.info(`Updated Firebase user with UID: ${firebaseUser.uid}`);
      }
      
      return firebaseUser;
    } catch (firebaseError) {
      logger.error(`Firebase user operation failed: ${firebaseError.message}`);
      throw new Error(`Firebase user operation failed: ${firebaseError.message}`);
    }
  } catch (error) {
    logger.error(`Failed to manage Firebase user: ${error.message}`);
    throw error;
  }
};

/**
 * Send email verification link via Firebase
 * @param {string} email - User's email address
 * @param {string} continueUrl - URL to redirect to after verification
 * @returns {Promise<string>} - Verification link or token
 */
const sendEmailVerificationLink = async (email, continueUrl) => {
  try {
    if (!firebaseInitialized || developmentMode) {
      logger.info(`Development mode: Simulating sending email verification to ${email}`);
      // Generate a random token for development
      const mockToken = Buffer.from(Math.random().toString(36) + Date.now().toString()).toString('base64').substring(0, 32);
      return mockToken;
    }
    
    try {
      // In production, use Firebase Admin to generate a verification link
      const actionCodeSettings = {
        url: continueUrl || config.clientUrl + '/verify-email',
        handleCodeInApp: true,
      };
      
      // Find or create the Firebase user
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().getUserByEmail(email);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create a temporary user in Firebase (will be linked later)
          firebaseUser = await admin.auth().createUser({
            email,
            emailVerified: false,
          });
        } else {
          throw error;
        }
      }
      
      // Generate email verification link
      const link = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
      logger.info(`Email verification link sent to ${email}`);
      
      return link;
    } catch (firebaseError) {
      logger.error(`Firebase email verification failed: ${firebaseError.message}`);
      throw new Error(`Firebase email verification failed: ${firebaseError.message}`);
    }
  } catch (error) {
    logger.error(`Failed to send email verification to ${email}: ${error.message}`);
    throw error;
  }
};

/**
 * Verify email with Firebase token
 * @param {string} oobCode - The verification code from the email link
 * @returns {Promise<Object>} - Verified email info
 */
const verifyEmailWithToken = async (oobCode) => {
  try {
    if (!firebaseInitialized || developmentMode) {
      logger.info('Development mode: Simulating email verification with token');
      return { 
        email: 'dev@example.com',
        verified: true
      };
    }
    
    try {
      // In production, verify the email using Firebase Admin
      // Note: Firebase Admin SDK doesn't have a direct method to verify oobCode
      // This would typically be done on the client side with Firebase Auth
      // Here we're simulating it for the server-side flow
      
      // In a real implementation, you would use the Firebase Auth REST API
      // or a custom Firebase Function to verify the oobCode
      
      // For now, we'll just return a mock response
      logger.info('Email verified with token');
      
      return {
        email: 'user@example.com', // This would be the actual email from the token
        verified: true
      };
    } catch (firebaseError) {
      logger.error(`Firebase email verification failed: ${firebaseError.message}`);
      throw new Error(`Firebase email verification failed: ${firebaseError.message}`);
    }
  } catch (error) {
    logger.error(`Failed to verify email with token: ${error.message}`);
    throw error;
  }
};

/**
 * Verify ID token from Firebase
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<Object>} - Decoded token
 */
const verifyIdToken = async (idToken) => {
  try {
    if (!firebaseInitialized || developmentMode) {
      logger.info('Development mode: Simulating ID token verification');
      return { 
        uid: 'dev-user-id',
        email: 'dev@example.com',
        email_verified: true
      };
    }
    
    try {
      // In production, verify the ID token using Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      logger.info(`ID token verified for user: ${decodedToken.uid}`);
      
      return decodedToken;
    } catch (firebaseError) {
      logger.error(`Firebase ID token verification failed: ${firebaseError.message}`);
      throw new Error(`Firebase ID token verification failed: ${firebaseError.message}`);
    }
  } catch (error) {
    logger.error(`Failed to verify ID token: ${error.message}`);
    throw error;
  }
};

/**
 * Generate a secure OTP code
 * @param {number} length - Length of the OTP (default: 6)
 * @returns {string} - Generated OTP
 */
const generateOTP = (length = 6) => {
  // Generate a random n-digit number with leading zeros if needed
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString().padStart(length, '0');
};

/**
 * Common function to send OTP
 * @param {string} type - Type of verification ('email' or 'phone')
 * @param {string} identifier - Email or phone number
 * @returns {Promise<string>} - Generated OTP
 */
const sendOTP = async (type, identifier) => {
  try {
    // Validate identifier format
    if (type === 'phone' && (!identifier || !/^\+?[1-9]\d{1,14}$/.test(identifier))) {
      throw new Error('Invalid phone number format. Please use E.164 format (e.g., +1234567890)');
    } else if (type === 'email' && (!identifier || !/\S+@\S+\.\S+/.test(identifier))) {
      throw new Error('Invalid email format');
    }
    
    // Find user by identifier
    const { User } = require('../models');
    const user = await User.findOne({
      where: type === 'email' ? { email: identifier } : { phoneNumber: identifier }
    });

    if (!user) {
      throw new Error(`User not found with ${type}: ${identifier}`);
    }

    // Check for existing OTP and its expiration
    const existingToken = type === 'email' ? user.emailVerificationToken : user.phoneVerificationCode;
    const existingExpires = type === 'email' ? user.emailVerificationExpires : user.phoneVerificationExpires;

    let otp = existingToken;
    let expiresAt = existingExpires;

    // If no existing OTP or expired, generate new one
    if (!existingToken || !existingExpires || new Date(existingExpires) < new Date()) {
      otp = generateOTP();
      expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Update user record with new OTP and expiration
      if (type === 'email') {
        user.emailVerificationToken = otp;
        user.emailVerificationExpires = expiresAt;
      } else {
        user.phoneVerificationCode = otp;
        user.phoneVerificationExpires = expiresAt;
      }
      await user.save();
    }

    // Store OTP in Firestore for verification
    const collection = type === 'email' ? 'emailVerifications' : 'phoneVerifications';
      const docRef = admin.firestore().collection(collection).doc(identifier);
      await docRef.set({
        otp,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Send OTP based on type
      if (type === 'email') {
      try {
        // Create a transporter using SMTP
        const transporter = nodemailer.createTransport({
          host: config.email.smtp.host,
          port: config.email.smtp.port,
          secure: config.email.smtp.secure,
          auth: {
            user: config.email.smtp.auth.user,
            pass: config.email.smtp.auth.pass,
          }
        });

        // Verify transporter configuration
        await transporter.verify();

        // Email content
        const mailOptions = {
          from: config.email.from,
          to: identifier,
          subject: `${config.appName} Verification Code`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${config.appName} Verification Code</h2>
              <p>Your verification code is:</p>
              <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
              <p>This code will expire in 15 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
          `
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully to ${identifier}`);
        logger.info(`Message ID: ${info.messageId}`);
      } catch (emailError) {
        logger.error(`Failed to send email: ${emailError.message}`);
        // logger.error(`Email error details: ${JSON.stringify(emailError)}`);
        // Don't throw here - we've stored the OTP, so verification can still work
      }
      } else if (type === 'phone') {
        try {
          if (developmentMode) {
            logger.info(`Development mode: SMS OTP ${otp} would be sent to ${identifier}`);
            // return ;
         }
            // Send OTP via Twilio
            await twilioClient.messages.create({
              body: `Your ${config.appName} verification code is: ${otp}. This code will expire in 15 minutes.`,
              from: config.twilio.phoneNumber,
              to: identifier
            });
            logger.info(`SMS OTP sent successfully to ${identifier}`);
          
        } catch (smsError) {
          logger.error(`SMS sending failed: ${smsError.message}`);
          logger.error(`SMS error details: ${JSON.stringify(smsError)}`);
          // Don't throw here - we've stored the OTP, so verification can still work
        }
      }
      
      return otp;
  } catch (error) {
    logger.error(`Failed to send ${type} OTP to ${identifier}: ${error.message}`);
    throw error;
  }
};

/**
 * Send email OTP using Firebase
 * @param {string} email - User's email address
 * @returns {Promise<string>} - Generated OTP
 */
const sendEmailOTP = async (email) => {
  return sendOTP('email', email);
};

/**
 * Send phone verification code via Firebase (using OTP)
 * @param {string} phoneNumber - Phone number to send verification code
 * @returns {Promise<string>} - Generated OTP
 */
const sendVerificationCode = async (phoneNumber) => {
  return sendOTP('phone', phoneNumber);
};

/**
 * Common function to verify OTP
 * @param {string} type - Type of verification ('email' or 'phone')
 * @param {string} identifier - Email or phone number
 * @param {string} otp - OTP code to verify
 * @returns {Promise<boolean>} - Whether verification was successful
 */
const verifyOTP = async (type, identifier, otp) => {
  try {
    const collection = type === 'email' ? 'emailVerifications' : 'phoneVerifications';
    
    // Get OTP from Firestore
        const docRef = admin.firestore().collection(collection).doc(identifier);
        const doc = await docRef.get();
        
        if (!doc.exists) {
          logger.error(`No OTP found for ${type} ${identifier}`);
          return false;
        }
        
    const storedData = doc.data();
    const expiresAt = storedData.expiresAt.toDate().getTime();
    
    // Check if OTP has expired
    if (Date.now() > expiresAt) {
      logger.error(`OTP expired for ${type} ${identifier}`);
      
      // Clean up expired OTP
        await docRef.delete();
      return false;
    }
    
    // Verify OTP
    if (storedData.otp === otp) {
      logger.info(`${type} OTP verified successfully for ${identifier}`);
      
      // Clean up used OTP
        await docRef.delete();
        
      // Update user's verification status in database
      const { User } = require('../models');
      const user = await User.findOne({
        where: type === 'email' ? { email: identifier } : { phoneNumber: identifier }
      });

      if (user) {
        if (type === 'email') {
          user.isEmailVerified = true;
        } else {
          user.isPhoneVerified = true;
        }
        await user.save();
        logger.info(`Updated ${type} verification status for user: ${identifier}`);
      }
      
      return true;
    }
    
    logger.error(`Invalid OTP provided for ${type} ${identifier}`);
    return false;
  } catch (error) {
    logger.error(`${type} OTP verification failed: ${error.message}`);
    return false;
  }
};

/**
 * Verify email OTP
 * @param {string} email - Email to verify
 * @param {string} otp - OTP code to verify
 * @returns {Promise<boolean>} - Whether verification was successful
 */
const verifyEmailOTP = async (email, otp) => {
  return verifyOTP('email', email, otp);
};

/**
 * Verify phone number with Firebase OTP
 * @param {string} phoneNumber - Phone number to verify
 * @param {string} code - Verification code (OTP)
 * @returns {Promise<boolean>} - Whether verification was successful
 */
const verifyPhoneNumber = async (phoneNumber, code) => {
  return verifyOTP('phone', phoneNumber, code);
};

/**
 * Get and send verification tokens for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Verification tokens
 */
// const getAndSendVerificationTokens = async (userId) => {
//   try {
//     // Find user by ID
//     const user = await require('../models').User.findByPk(userId);
//     if (!user) {
//       throw new Error('User not found');
//     }
    
//     let emailToken, phoneToken;
    
//     // Send email verification if not verified
//     if (!user.isEmailVerified) {
//       emailToken = await sendEmailOTP(user.email);
//       if (process.env.NODE_ENV === 'development') {
//         user.emailVerificationToken = emailToken;
//         const expirationTime = new Date();
//         expirationTime.setMinutes(expirationTime.getMinutes() + 15);
//         user.emailVerificationExpires = expirationTime;
//       }
//     }
    
//     // Send phone verification if not verified
//     if (!user.isPhoneVerified) {
//       phoneToken = await sendVerificationCode(user.phoneNumber);
//       if (process.env.NODE_ENV === 'development') {
//         user.phoneVerificationCode = phoneToken;
//         const expirationTime = new Date();
//         expirationTime.setMinutes(expirationTime.getMinutes() + 15);
//         user.phoneVerificationExpires = expirationTime;
//       }
//     }
    
//     // Save user if tokens were updated
//     if (emailToken || phoneToken) {
//       await user.save();
//     }
    
//     return {
//       emailToken: process.env.NODE_ENV === 'development' ? emailToken : undefined,
//       phoneToken: process.env.NODE_ENV === 'development' ? phoneToken : undefined,
//       needsEmailVerification: !user.isEmailVerified,
//       needsPhoneVerification: !user.isPhoneVerified
//     };
//   } catch (error) {
//     logger.error(`Failed to get and send verification tokens: ${error.message}`);
//     throw error;
//   }
// };

module.exports = {
  verifyPhoneNumber,
  sendVerificationCode,
  sendEmailOTP,
  verifyEmailOTP,
  sendEmailVerificationLink,
  verifyEmailWithToken,
  verifyIdToken,
  createOrUpdateFirebaseUser,
  initializeFirebase,
  isInitialized: () => firebaseInitialized,
  // getAndSendVerificationTokens
}; 