# Firebase Setup Guide

This document explains how to set up Firebase for email and phone verification in the application.

## Prerequisites

1. A Google account
2. A Firebase project (either existing or new)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or use an existing one
3. Follow the setup wizard to create your project

## Step 2: Enable Authentication Methods

1. In the Firebase Console, go to "Authentication" in the left sidebar
2. Click the "Sign-in method" tab
3. Enable the following authentication methods:
   - Email/Password
   - Phone Number

## Step 3: Get Firebase Admin SDK Credentials

1. Go to "Project settings" (gear icon in the top-left corner)
2. Select the "Service accounts" tab
3. Click "Generate new private key" button
4. Save the downloaded JSON file securely

## Step 4: Add Web SDK Configuration

1. In "Project settings", go to the "General" tab
2. Scroll down to "Your apps" and select or create a Web app
3. Register the app with a nickname if needed
4. Copy the Firebase SDK configuration (the `firebaseConfig` object)

## Step 5: Configure Environment Variables

Add the following variables to your `.env` file:

```
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"

# Firebase Web Client SDK (for frontend)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id
```

Replace all placeholders with your actual Firebase project values.

## Step 6: Run Migrations

Run the database migration to add Firebase-related fields to the User model:

```bash
npx sequelize-cli db:migrate
```

## Frontend Integration

### Email Verification

1. Import Firebase in your frontend app:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, applyActionCode } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
```

2. Handle email verification link:

```javascript
// Extract the action code (oobCode) from the URL
const actionCode = new URLSearchParams(window.location.search).get('oobCode');

if (actionCode) {
  // Verify the email with Firebase
  applyActionCode(auth, actionCode)
    .then(() => {
      // Tell your backend the email is verified
      return axios.post('/api/auth/verify-email-firebase', { oobCode: actionCode });
    })
    .then(response => {
      // Show success message to user
      console.log('Email verified successfully!');
    })
    .catch(error => {
      // Handle error
      console.error('Error verifying email:', error);
    });
}
```

### Phone Verification

1. Set up phone authentication:

```javascript
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Create invisible reCAPTCHA
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
  'size': 'invisible',
  'callback': (response) => {
    // reCAPTCHA solved, you can now sign in
    onSignInSubmit();
  }
});

// Function to send verification code
function sendVerificationCode(phoneNumber) {
  return signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    .then((confirmationResult) => {
      // SMS sent. Store the confirmation result for later use
      window.confirmationResult = confirmationResult;
      return true;
    })
    .catch((error) => {
      // Error; SMS not sent
      console.error('Error sending verification code:', error);
      return false;
    });
}

// Function to verify code
function verifyCode(code) {
  return window.confirmationResult.confirm(code)
    .then((result) => {
      // User signed in successfully with phone number
      const user = result.user;
      
      // Get the Firebase ID token
      return user.getIdToken().then(idToken => {
        // Send the token to your backend
        return axios.post('/api/auth/verify-phone-firebase', {
          phoneNumber: user.phoneNumber,
          firebaseToken: idToken
        });
      });
    })
    .catch((error) => {
      // Invalid code
      console.error('Error verifying code:', error);
      return false;
    });
}
```

## Troubleshooting

### Firebase Connection Issues

If you're having trouble connecting to Firebase:

1. Check that your environment variables are correctly set
2. Verify that your Firebase project is properly configured
3. Ensure you've enabled the required authentication methods

### Phone Verification Issues

For phone verification issues:

1. Make sure your Firebase project is on the Blaze plan to use phone authentication
2. Check that you've set up reCAPTCHA correctly
3. Verify the phone number format (use E.164 format, e.g., +12065551234)

### Email Verification Issues

For email verification issues:

1. Check your email templates in Firebase Console
2. Make sure the action URL (continueUrl) is correctly configured
3. Check that your domain is authorized in Firebase Console (Authentication > Settings > Authorized domains)

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Phone Authentication](https://firebase.google.com/docs/auth/web/phone-auth)
- [Email Verification](https://firebase.google.com/docs/auth/web/manage-users#send_a_user_a_verification_email) 