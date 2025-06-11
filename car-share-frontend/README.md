# Car Share Frontend - Secure Authentication System

This project implements a secure token-based authentication flow for a React application using Redux Toolkit. The authentication system includes email and phone verification, protected routes, and secure token management.

## Features

### Authentication Flow
- **Token-based Authentication**: Uses JWT tokens stored securely
- **Email & Phone Verification**: Two-factor verification during signup
- **Protected Routes**: Restricts access to private pages based on authentication status
- **Role-based Access Control**: Limits access to certain features based on user roles
- **Active Status Check**: Ensures users are active before granting access

### Security Features
- **HTTP-only Cookies**: For secure token storage (when supported by the backend)
- **Secure Local Storage**: Fallback for environments without HTTP-only cookie support
- **Token Refresh**: Automatic token refresh mechanism to maintain sessions
- **Secure Logout**: Properly invalidates tokens on both client and server

### State Management
- **Redux Toolkit**: Centralized state management for authentication
- **Loading States**: Proper handling of loading states during authentication operations
- **Error Handling**: Comprehensive error handling and user feedback

## Project Structure

### Authentication Components
- `Login.jsx`: User login form with validation
- `Register.jsx`: User registration form with validation
- `EmailVerification.jsx`: Email verification with OTP
- `PhoneVerification.jsx`: Phone verification with OTP
- `VerificationStatus.jsx`: Shows verification status and next steps
- `ForgotPassword.jsx`: Password recovery flow
- `ResetPassword.jsx`: Password reset form

### Authentication Services
- `authService.js`: Core authentication service with token management
- `authEndpoints.js`: API endpoints for authentication operations
- `api.js`: Base API configuration with token refresh

### Redux State Management
- `authSlice.js`: Redux slice for authentication state
- `store/index.js`: Redux store configuration

### Route Protection
- `authMiddleware.js`: Route protection components
  - `RequireAuth`: Basic authentication check
  - `RequireVerification`: Verification status check
  - `RequireActiveStatus`: User active status check
  - `RequireRole`: Role-based access control
  - `FullAuthProtection`: Combined protection for routes

### Custom Hooks
- `useAuth.js`: Custom hook for authentication operations

## Token Structure

The authentication tokens store the following user information:
- User ID
- Email
- Phone
- Status (active/inactive)
- Role (user/driver/admin)
- Verification status
- Token expiry

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables:
   ```
   REACT_APP_API_URL=your_api_url
   ```
4. Start the development server:
   ```
   npm start
   ```

## Security Best Practices

This implementation follows these security best practices:
- Tokens are stored securely and never exposed to JavaScript
- Automatic token refresh maintains sessions securely
- Proper validation of user inputs
- Secure password requirements
- Two-factor verification with email and phone
- Role-based access control
- Active status checks

## Dependencies

- React
- Redux Toolkit
- React Router DOM
- React Hook Form
- Yup (for validation)
- JWT Decode
- React Hot Toast
- React OTP Input
- Tailwind CSS

## License

MIT


// import React, { useEffect, useRef } from 'react';

// const TripMap = ({ waypoints }) => {
//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const directionsRendererRef = useRef(null);

//   useEffect(() => {
//     // Load Google Maps script
//     const script = document.createElement('script');
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
//     script.async = true;
//     script.defer = true;
//     document.head.appendChild(script);

//     script.onload = () => {
//       // Initialize map
//       const map = new window.google.maps.Map(mapRef.current, {
//         center: { lat: waypoints[0].lat, lng: waypoints[0].lng },
//         zoom: 8,
//       });

//       // Create directions service
//       const directionsService = new window.google.maps.DirectionsService();
//       const directionsRenderer = new window.google.maps.DirectionsRenderer({
//         map,
//         suppressMarkers: false,
//       });

//       // Store references
//       mapInstanceRef.current = map;
//       directionsRendererRef.current = directionsRenderer;

//       // Calculate and display route
//       const request = {
//         origin: { lat: waypoints[0].lat, lng: waypoints[0].lng },
//         destination: { lat: waypoints[1].lat, lng: waypoints[1].lng },
//         travelMode: window.google.maps.TravelMode.DRIVING,
//       };

//       directionsService.route(request, (result, status) => {
//         if (status === 'OK') {
//           directionsRenderer.setDirections(result);
//         } else {
//           console.error('Directions request failed:', status);
//         }
//       });
//     };

//     return () => {
//       // Cleanup
//       if (mapInstanceRef.current) {
//         window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
//       }
//       if (directionsRendererRef.current) {
//         directionsRendererRef.current.setMap(null);
//       }
//       document.head.removeChild(script);
//     };
//   }, [waypoints]);

//   return (
//     <div 
//       ref={mapRef} 
//       className="w-full h-[400px] rounded-lg shadow-md"
//     />
//   );
// };

// export default TripMap; 