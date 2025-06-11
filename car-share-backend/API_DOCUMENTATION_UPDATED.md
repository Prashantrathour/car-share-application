# Car-Sharing API Documentation

This document provides detailed information about all available API endpoints, including models, validation rules, and routes.

## Base URL
```
http://your-domain.com/api/v1
```

## Models

### User Model
```javascript
{
  id: UUID,
  firstName: String,          // Required, 2-50 chars
  lastName: String,           // Required, 2-50 chars
  email: String,              // Required, valid email format
  password: String,           // Required, min 8 chars, includes number and letter
  phoneNumber: String,        // Valid international format
  dateOfBirth: Date,          // Must be before today
  avatar: String,             // URL to user's avatar
  role: Enum,                 // 'user', 'driver', 'admin', default: 'user'
  isEmailVerified: Boolean,   // Default: false
  isPhoneVerified: Boolean,   // Default: false
  status: Enum,               // 'pending', 'active', 'suspended', 'banned', default: 'pending'
  driverLicense: JSON,        // Driver license details
  address: JSON,              // User's address
  preferences: JSON,          // User preferences
  rating: Decimal,            // 0-5 rating
  completedTrips: Integer,    // Number of completed trips
  totalEarnings: Decimal,     // Total earnings
  stripeCustomerId: String,   // Stripe customer ID
  stripeConnectAccountId: String, // Stripe connect account ID
  firebaseUid: String,        // Firebase User ID(null)
  createdAt: Date,            // Creation timestamp
  updatedAt: Date,            // Last update timestamp
  deletedAt: Date             // Soft delete timestamp
}
```

### Trip Model
```javascript
{
  id: UUID,
  vehicleId: UUID,            // Required, reference to Vehicle
  driverId: UUID,             // Required, reference to User
  startLocation: JSON,        // Required, includes latitude, longitude, address
  endLocation: JSON,          // Required, includes latitude, longitude, address
  startTime: Date,            // Required, ISO 8601 format
  endTime: Date,              // Required, must be after startTime
  status: Enum,               // 'scheduled', 'in_progress', 'completed', 'cancelled', default: 'scheduled'
  availableSeats: Integer,    // Required, min: 1
  pricePerSeat: Decimal,      // Required, min: 0
  route: JSON,                // Optional, includes waypoints array
  estimatedDuration: Integer, // Required, in minutes
  estimatedDistance: Decimal, // Required, in kilometers
  preferences: JSON,          // Optional, driver preferences
  notes: Text,                // Optional, trip notes
  createdAt: Date,            // Creation timestamp
  updatedAt: Date,            // Last update timestamp
  deletedAt: Date             // Soft delete timestamp
}
```

### Booking Model
```javascript
{
  id: UUID,
  tripId: UUID,               // Required, reference to Trip
  passengerId: UUID,          // Required, reference to User
  numberOfSeats: Integer,     // Required, min: 1
  pickupLocation: JSON,       // Required, includes latitude, longitude, address
  dropoffLocation: JSON,      // Required, includes latitude, longitude, address
  status: Enum,               // 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled_by_passenger', 'cancelled_by_driver', 'no_show', default: 'pending'
  totalPrice: Decimal,        // Required, min: 0
  paymentStatus: Enum,        // 'pending', 'authorized', 'paid', 'failed', 'refunded', default: 'pending'
  paymentIntentId: String,    // Optional, payment intent ID
  cancellationReason: Text,   // Optional, reason for cancellation
  cancellationTime: Date,     // Optional, time of cancellation
  passengerNotes: Text,       // Optional, notes from passenger
  driverNotes: Text,          // Optional, notes from driver
  baggageCount: Integer,      // Default: 0, min: 0
  specialRequests: JSON,      // Default: []
  pickupCode: String,         // Optional, verification code for pickup
  actualPickupTime: Date,     // Optional, actual pickup time
  actualDropoffTime: Date,    // Optional, actual dropoff time
  isReviewedByPassenger: Boolean, // Default: false
  isReviewedByDriver: Boolean,    // Default: false
  createdAt: Date,            // Creation timestamp
  updatedAt: Date,            // Last update timestamp
  deletedAt: Date             // Soft delete timestamp
}
```

### Vehicle Model
```javascript
{
  id: UUID,
  ownerId: UUID,              // Required, reference to User
  make: String,               // Required, vehicle make
  model: String,              // Required, vehicle model
  year: Integer,              // Required, vehicle year
  color: String,              // Required, vehicle color
  licensePlate: String,       // Required, vehicle license plate
  registrationNumber: String, // Optional, vehicle registration number
  status: Enum,               // 'pending', 'active', 'maintenance', 'inactive', default: 'pending'
  seats: Integer,             // Required, min: 1
  type: Enum,                 // 'sedan', 'suv', 'van', 'truck', 'luxury'
  features: JSON,             // Optional, vehicle features
  insurance: JSON,            // Optional, insurance details
  images: JSON,               // Optional, array of image URLs
  createdAt: Date,            // Creation timestamp
  updatedAt: Date,            // Last update timestamp
  deletedAt: Date             // Soft delete timestamp
}
```

### Payment Model
```javascript
{
  id: UUID,
  bookingId: UUID,            // Required, reference to Booking
  payerId: UUID,              // Required, reference to User (passenger)
  receiverId: UUID,           // Required, reference to User (driver)
  amount: Decimal,            // Required, min: 0
  currency: String,           // Required, currency code
  status: Enum,               // 'pending', 'completed', 'failed', 'refunded', default: 'pending'
  paymentMethod: String,      // Required, payment method
  paymentIntentId: String,    // Optional, payment intent ID
  stripeChargeId: String,     // Optional, Stripe charge ID
  refundId: String,           // Optional, refund ID
  refundReason: Text,         // Optional, reason for refund
  metadata: JSON,             // Optional, additional payment metadata
  createdAt: Date,            // Creation timestamp
  updatedAt: Date,            // Last update timestamp
  deletedAt: Date             // Soft delete timestamp
}
```

### Review Model
```javascript
{
  id: UUID,
  bookingId: UUID,            // Required, reference to Booking
  tripId: UUID,               // Required, reference to Trip
  reviewerId: UUID,           // Required, reference to User (who wrote the review)
  targetUserId: UUID,         // Required, reference to User (who is being reviewed)
  rating: Integer,            // Required, 1-5
  comment: Text,              // Optional, review comment
  type: Enum,                 // 'driver_to_passenger', 'passenger_to_driver'
  createdAt: Date,            // Creation timestamp
  updatedAt: Date,            // Last update timestamp
  deletedAt: Date             // Soft delete timestamp
}
```

### Message Model
```javascript
{
  id: UUID,
  tripId: UUID,               // Required, reference to Trip
  senderId: UUID,             // Required, reference to User (sender)
  receiverId: UUID,           // Optional, reference to User (receiver)
  content: Text,              // Required, message content
  isRead: Boolean,            // Default: false
  readAt: Date,               // Optional, when message was read
  createdAt: Date,            // Creation timestamp
  updatedAt: Date,            // Last update timestamp
  deletedAt: Date             // Soft delete timestamp
}
```

### Token Model
```javascript
{
  id: UUID,
  userId: UUID,               // Required, reference to User
  token: String,              // Required, token value
  type: Enum,                 // 'refresh', 'reset_password', 'verify_email'
  expires: Date,              // Required, expiration date
  blacklisted: Boolean,       // Default: false
  createdAt: Date,            // Creation timestamp
  updatedAt: Date             // Last update timestamp
}
```

## Validation Rules

### Authentication Validation

#### Register Validation
- Email: Must be a valid email
- Password: 
  - Minimum 8 characters
  - Must contain at least one number
  - Must contain at least one letter
- Phone Number: Must be a valid international format
- First Name: 
  - Required
  - Between 2 and 50 characters
- Last Name: 
  - Required
  - Between 2 and 50 characters
- Role (optional): Must be 'user', 'driver', or 'admin'
- Date of Birth (optional): 
  - Must be a valid date
  - Must be before today
- Avatar (optional): Must be a valid URL
- Address (optional): Must be a valid object

#### Login Validation
- Email: Must be a valid email
- Password: Required

#### Refresh Token Validation
- Refresh Token: Required

#### Verify Email Validation
- Token: Required

#### Verify Phone Validation
- Code: Required
- Phone Number: Must be a valid phone number

#### Forgot Password Validation
- Email: Must be a valid email

#### Reset Password Validation
- Token: Required
- Password: 
  - Minimum 8 characters
  - Must contain at least one number
  - Must contain at least one letter

### Trip Validation

#### Get Trips Validation
- Start Location (optional): String
- End Location (optional): String
- Start Time (optional): Valid ISO 8601 date
- Min Seats (optional): Positive integer
- Max Price (optional): Positive number
- Status (optional): Must be 'scheduled', 'in_progress', 'completed', or 'cancelled'
- Page (optional): Positive integer
- Limit (optional): Between 1 and 100

#### Create Trip Validation
- Vehicle ID: Required, valid UUID
- Start Location: 
  - Required
  - Must be an object with address, latitude, and longitude
  - Latitude and longitude must be numbers
- End Location: 
  - Required
  - Must be an object with address, latitude, and longitude
  - Latitude and longitude must be numbers
- Start Time: 
  - Required
  - Valid ISO 8601 date
- End Time: 
  - Required
  - Valid ISO 8601 date
  - Must be after start time
- Available Seats: 
  - Required
  - Positive integer
- Price Per Seat: 
  - Required
  - Positive number
- Route (optional): 
  - Must be an object
  - Must include waypoints array
- Estimated Duration: 
  - Required
  - Positive integer
- Estimated Distance: 
  - Required
  - Positive number
- Preferences (optional): Must be an object
- Notes (optional): Must be a string

#### Update Trip Validation
- Vehicle ID (optional): Valid UUID
- Start Location (optional): 
  - Must be an object with address, latitude, and longitude
  - Latitude and longitude must be numbers
- End Location (optional): 
  - Must be an object with address, latitude, and longitude
  - Latitude and longitude must be numbers
- Start Time (optional): Valid ISO 8601 date
- End Time (optional): 
  - Valid ISO 8601 date
  - Must be after start time if start time is provided
- Status (optional): Must be 'scheduled', 'in_progress', 'completed', or 'cancelled'
- Available Seats (optional): Positive integer
- Price Per Seat (optional): Positive number
- Route (optional): 
  - Must be an object
  - Must include waypoints array
- Estimated Duration (optional): Positive integer
- Estimated Distance (optional): Positive number
- Preferences (optional): Must be an object
- Notes (optional): Must be a string

### Booking Validation

#### Create Booking Validation
- Trip ID: Required
- Number of Seats: Positive integer
- Pickup Location: 
  - Required
  - Must include latitude, longitude, and address
- Dropoff Location: 
  - Required
  - Must include latitude, longitude, and address
- Passenger Notes (optional): String
- Baggage Count (optional): Non-negative integer
- Special Requests (optional): Array

#### Cancel Booking Validation
- Cancellation Reason (optional): String

#### Rate Booking Validation
- Rating: Integer between 1 and 5
- Comment (optional): String

### User Validation

#### Update Profile Validation
- First Name (optional): Between 2 and 50 characters
- Last Name (optional): Between 2 and 50 characters
- Phone Number (optional): Valid international format
- Avatar (optional): Valid URL
- Date of Birth (optional): Valid date before today
- Address (optional): Valid object

#### Become Driver Validation
- Vehicle Model: Required
- License Plate: Required
- Seats: Between 2 and 15
- Vehicle Type: Must be 'sedan', 'suv', 'van', 'truck', or 'luxury'
- Driver License: Required object with number, expiry date, state, country, and image
- Vehicle Images (optional): Array of images

### Payment Validation

#### Create Payment Intent Validation
- Booking ID: Required
- Payment Method: Required

### Chat Validation

#### Send Message Validation
- Content: Required, non-empty string

## API Routes

### Authentication Routes

#### Register User
```http
POST /auth/register
```

#### Login
```http
POST /auth/login
```

#### Refresh Token
```http
POST /auth/refresh-token
```

#### Logout
```http
POST /auth/logout
```

#### Send Email OTP
```http
POST /auth/send-email-otp
```

#### Verify Email OTP
```http
POST /auth/verify-email-otp
```

#### Send Phone OTP
```http
POST /auth/send-phone-otp
```

#### Verify Phone OTP
```http
POST /auth/verify-phone-otp
```

#### Get Verification Status
```http
GET /auth/verification-status
```

#### Forgot Password
```http
POST /auth/forgot-password
```

#### Reset Password
```http
POST /auth/reset-password
```

### Trip Routes

#### List Trips
```http
GET /trips
```

#### Get Single Trip
```http
GET /trips/:id
```

#### Create Trip
```http
POST /trips
```

#### Update Trip
```http
PATCH /trips/:id
```

#### Delete Trip
```http
DELETE /trips/:id
```

### Booking Routes

#### List User Bookings
```http
GET /bookings
```

#### Get Single Booking
```http
GET /bookings/:id
```

#### Create Booking
```http
POST /bookings
```

#### Cancel Booking
```http
PATCH /bookings/:id/cancel
```

#### Rate Booking
```http
PATCH /bookings/:id/rate
```

### User Routes

#### Get Profile
```http
GET /users/profile
```

#### Update Profile
```http
PATCH /users/profile
```

#### Become a Driver
```http
POST /users/driver
```

#### Admin: List Users (Admin Only)
```http
GET /users
```

#### Admin: Get User (Admin Only)
```http
GET /users/:id
```

#### Admin: Update User (Admin Only)
```http
PATCH /users/:id
```

### Vehicle Routes

#### List Vehicles
```http
GET /vehicles
```

#### Get Vehicle
```http
GET /vehicles/:id
```

#### Create Vehicle
```http
POST /vehicles
```

#### Update Vehicle
```http
PATCH /vehicles/:id
```

#### Delete Vehicle
```http
DELETE /vehicles/:id
```

### Payment Routes

#### Create Payment Intent
```http
POST /payments/create-payment-intent
```

#### Get Payment History
```http
GET /payments/history
```

### Chat Routes

#### Get Trip Messages
```http
GET /chat/:tripId
```

#### Send Message
```http
POST /chat/:tripId
```

### Review Routes

#### Create Review
```http
POST /reviews
```

#### Get User Reviews
```http
GET /reviews/user/:userId
```

#### Get Trip Reviews
```http
GET /reviews/trip/:tripId
```

## Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Error message here",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

Common HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Unprocessable Entity
- 429: Too Many Requests
- 500: Internal Server Error

## Authentication

All endpoints except `/auth/login`, `/auth/register`, and public endpoints require authentication. Include the access token in the Authorization header:

```http
Authorization: Bearer your_access_token_here
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Current limits:
- Authentication endpoints: 5 requests per minute
- Other endpoints: 60 requests per minute

## Websocket Events

Connect to websocket server:
```javascript
const socket = io('ws://your-domain.com', {
  auth: {
    token: 'your_access_token'
  }
});
```

Available events:
- `join_trip`: Join a trip's chat room
  ```javascript
  socket.emit('join_trip', { tripId: '550e8400-e29b-41d4-a716-446655440000' });
  ```

- `leave_trip`: Leave a trip's chat room
  ```javascript
  socket.emit('leave_trip', { tripId: '550e8400-e29b-41d4-a716-446655440000' });
  ```

- `new_message`: Receive new messages
  ```javascript
  socket.on('new_message', (message) => {
    console.log('New message:', message);
    // message = {
    //   id: '550e8400-e29b-41d4-a716-446655440006',
    //   senderId: '550e8400-e29b-41d4-a716-446655440000',
    //   content: 'I'm at the pickup location',
    //   timestamp: '2024-03-20T10:00:00.000Z',
    //   tripId: '550e8400-e29b-41d4-a716-446655440000'
    // }
  });
  ```

- `trip_update`: Receive trip status updates
  ```javascript
  socket.on('trip_update', (update) => {
    console.log('Trip update:', update);
    // update = {
    //   tripId: '550e8400-e29b-41d4-a716-446655440000',
    //   status: 'in_progress',
    //   currentLocation: {
    //     latitude: 37.5482,
    //     longitude: -122.1504
    //   },
    //   estimatedArrival: '2024-03-21T08:30:00.000Z'
    // }
  });
  ```

## Data Models Relationships

### User Relationships
- User has many Vehicles (as owner)
- User has many Trips (as driver)
- User has many Bookings (as passenger)
- User has many Reviews (as reviewer)
- User has many Reviews (as target)
- User has many Payments (as payer)
- User has many Payments (as receiver)
- User has many Messages (as sender)
- User has many Messages (as receiver)

### Trip Relationships
- Trip belongs to User (as driver)
- Trip belongs to Vehicle
- Trip has many Bookings
- Trip has many Reviews

### Booking Relationships
- Booking belongs to Trip
- Booking belongs to User (as passenger)
- Booking has many Payments
- Booking has many Reviews

### Vehicle Relationships
- Vehicle belongs to User (as owner)
- Vehicle has many Trips

### Payment Relationships
- Payment belongs to Booking
- Payment belongs to User (as payer)
- Payment belongs to User (as receiver)

### Review Relationships
- Review belongs to Booking
- Review belongs to Trip
- Review belongs to User (as reviewer)
- Review belongs to User (as target)

### Message Relationships
- Message belongs to Trip
- Message belongs to User (as sender)
- Message belongs to User (as receiver, optional) 