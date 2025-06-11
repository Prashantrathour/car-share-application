# Firebase Setup Guide

This document outlines how to set up Firebase for the OTP verification system used in the car-sharing application.

## Prerequisites

- A Google account
- Node.js installed on your development machine
- npm or yarn package manager

## Firebase Project Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter a project name (e.g., "Car-Share-App")
   - Enable Google Analytics if desired
   - Follow the prompts to complete project creation

2. **Register Your Web App**
   - From the Firebase project dashboard, click the web icon (</>) to add a web app
   - Register the app with a nickname (e.g., "car-share-frontend")
   - Check "Also set up Firebase Hosting" if you plan to use it
   - Click "Register app"

3. **Copy Firebase Config**
   - Firebase will generate configuration code for your app
   - Copy the firebaseConfig object

4. **Create Environment Variables**
   - Create or update your `.env` file in the project root with:

   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

## Enable Authentication Methods

### Email/Password Authentication

1. In the Firebase console, navigate to "Authentication" > "Sign-in method"
2. Enable "Email/Password" provider
3. Save your changes

### Phone Authentication

1. In the Firebase console, navigate to "Authentication" > "Sign-in method"
2. Enable "Phone" provider
3. Save your changes
4. Note: For testing, you should add test phone numbers in the Firebase console

## Firebase SDK Integration

1. **Install Firebase Packages**

   ```bash
   npm install firebase
   # or
   yarn add firebase
   ```

2. **Create a Firebase Configuration File**

   Create a file in your project at `src/config/firebase.js`:

   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';

   const firebaseConfig = {
     apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
     authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
     storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.REACT_APP_FIREBASE_APP_ID
   };

   // Initialize Firebase
   const app = initializeApp(firebaseConfig);
   const auth = getAuth(app);

   export { app, auth };
   ```

## Testing OTP Verification

### Email OTP Testing

1. In development mode, you can use the Firebase Authentication Emulator
2. Configure your app to use the emulator:

   ```javascript
   if (process.env.NODE_ENV === 'development') {
     connectAuthEmulator(auth, 'http://localhost:9099');
   }
   ```

3. Alternatively, use real emails but with test accounts

### Phone OTP Testing

1. In the Firebase console, go to "Authentication" > "Phone" > "Phone numbers for testing"
2. Add your test phone numbers with their verification codes
3. When testing, use these phone numbers to receive predictable verification codes

## Security Rules

Ensure your Firebase security rules are properly configured:

1. Go to "Firestore Database" > "Rules" in the Firebase console
2. Set up rules to protect user data:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Only authenticated users can read and write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Add additional rules as needed
     }
   }
   ```

## Production Considerations

1. **API Key Restrictions**
   - In the Google Cloud Console, restrict your API key to only work with specific services and domains

2. **Authentication Methods**
   - Review and limit authentication methods to only those needed by your application

3. **Security Monitoring**
   - Enable Firebase App Check to verify that requests come from your app
   - Set up security monitoring and alerts in the Firebase console

4. **Error Handling**
   - Implement comprehensive error handling for authentication failures
   - Log authentication errors to help identify potential security issues

## Troubleshooting

### Common Issues

1. **CORS Issues with Phone Auth**
   - Ensure you've allowed your domain in the Firebase console
   - For local development, ensure you're using `localhost` and not an IP address

2. **Rate Limiting**
   - Firebase enforces rate limits on verification attempts
   - Implement exponential backoff in your retry logic

3. **Invalid Configuration**
   - Double-check your environment variables match the values from Firebase
   - Ensure the Firebase config object is properly initialized

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules) 