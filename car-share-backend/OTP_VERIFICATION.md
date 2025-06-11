# OTP-Based Verification Guide

This document explains how to use the OTP (One-Time Password) verification system for both email and phone verification.

## Overview

The system now supports OTP-based verification for both email and phone, using Firebase for the underlying implementation. When a user registers, they will receive OTP codes to verify both their email and phone number. Once both are verified, their account status will be automatically set to "active".

## Email Verification Flow

1. **Registration**: When a user registers, an OTP is automatically sent to their email.

2. **Requesting Email OTP**:
   - Endpoint: `POST /api/auth/send-email-otp`
   - Request Body:
     ```json
     {
       "email": "user@example.com"
     }
     ```
   - Response:
     ```json
     {
       "message": "Verification code sent to email",
       "email": "user@example.com"
     }
     ```

3. **Verifying Email OTP**:
   - Endpoint: `POST /api/auth/verify-email-otp`
   - Request Body:
     ```json
     {
       "email": "user@example.com",
       "otp": "123456"
     }
     ```
   - Response:
     ```json
     {
       "message": "Email verified successfully",
       "user": {
         "id": "uuid",
         "email": "user@example.com",
         "isEmailVerified": true,
         "isPhoneVerified": false,
         "status": "pending"
       }
     }
     ```

## Phone Verification Flow

1. **Registration**: If a phone number is provided during registration, an OTP is automatically sent to the phone.

2. **Requesting Phone OTP**:
   - Endpoint: `POST /api/auth/send-phone-otp`
   - Request Body:
     ```json
     {
       "phoneNumber": "+1234567890"
     }
     ```
   - Response:
     ```json
     {
       "message": "Verification code sent to phone",
       "phoneNumber": "+1234567890"
     }
     ```

3. **Verifying Phone OTP**:
   - Endpoint: `POST /api/auth/verify-phone-otp`
   - Request Body:
     ```json
     {
       "phoneNumber": "+1234567890",
       "otp": "123456"
     }
     ```
   - Response:
     ```json
     {
       "message": "Phone verified successfully",
       "user": {
         "id": "uuid",
         "email": "user@example.com",
         "isEmailVerified": true,
         "isPhoneVerified": true,
         "status": "active"
       }
     }
     ```

## Account Activation

Once both email and phone are verified, the user's account status will automatically change from "pending" to "active". This is handled by the `checkAndActivateAccount` function that runs after each successful verification.

## OTP Details

- OTP codes are 6-digit numbers
- OTP codes expire after 15 minutes
- Failed verification attempts are logged
- In development mode, OTP codes are returned in the response for testing purposes

## Frontend Implementation

### Email Verification

```javascript
// Request email OTP
async function requestEmailOTP(email) {
  try {
    const response = await axios.post('/api/auth/send-email-otp', { email });
    return response.data;
  } catch (error) {
    console.error('Error requesting email OTP:', error);
    throw error;
  }
}

// Verify email with OTP
async function verifyEmailOTP(email, otp) {
  try {
    const response = await axios.post('/api/auth/verify-email-otp', { email, otp });
    return response.data;
  } catch (error) {
    console.error('Error verifying email OTP:', error);
    throw error;
  }
}
```

### Phone Verification

```javascript
// Request phone OTP
async function requestPhoneOTP(phoneNumber) {
  try {
    const response = await axios.post('/api/auth/send-phone-otp', { phoneNumber });
    return response.data;
  } catch (error) {
    console.error('Error requesting phone OTP:', error);
    throw error;
  }
}

// Verify phone with OTP
async function verifyPhoneOTP(phoneNumber, otp) {
  try {
    const response = await axios.post('/api/auth/verify-phone-otp', { phoneNumber, otp });
    return response.data;
  } catch (error) {
    console.error('Error verifying phone OTP:', error);
    throw error;
  }
}
```

## User Interface Recommendations

1. **Registration Form**:
   - After successful registration, show a message indicating that verification codes have been sent
   - Redirect to a verification page

2. **Verification Page**:
   - Include separate sections for email and phone verification
   - Show verification status for each (pending/verified)
   - Allow resending of OTP codes
   - Include countdown timers for OTP expiration

3. **Dashboard**:
   - Show verification status in the user dashboard
   - If not verified, provide quick links to verification forms

## Troubleshooting

### OTP Not Received

1. Check that the email/phone is correct
2. Check spam/junk folders for email OTPs
3. Use the resend functionality (through the respective endpoints)
4. In development, OTPs are included in the API response

### Verification Fails

1. Ensure the OTP is entered correctly
2. Check if the OTP has expired (15-minute lifetime)
3. Request a new OTP if needed

## Firebase Configuration

Make sure your Firebase project is properly configured as outlined in the FIREBASE_SETUP.md document.

## Development vs. Production

- In development mode, OTP codes are returned in API responses and stored in the database for testing
- In production, OTPs are securely managed via Firebase and not exposed in responses 