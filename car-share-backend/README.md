# Car-Sharing Backend API

A production-ready Node.js/Express backend for a car-sharing platform with role-based user system, trip management, real-time chat, and payment processing.

## Features

- **Authentication & User Management**
  - JWT-based authentication with refresh tokens
  - Role-based access control (Passengers, Drivers, Admins)
  - Email/phone verification
  - Password hashing with bcrypt

- **Trip Management**
  - Create and manage trips (drivers)
  - Search and filter trips
  - Booking system with seat management

- **Real-time Communication**
  - Trip-based chat rooms
  - Real-time notifications
  - Message read status

- **Payment Processing**
  - Secure payment with Stripe
  - Payment status tracking
  - Refund handling

- **Security**
  - Input validation
  - Rate limiting
  - CORS configuration
  - XSS protection

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: PostgreSQL, Sequelize ORM
- **Caching**: Redis
- **Real-time**: Socket.io
- **Payments**: Stripe
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Redis (optional for production)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Set up the database:
   ```
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate
   ```
5. Start the server:
   ```
   npm start
   ```
   
For development:
```
npm run dev
```

## API Documentation

### Authentication

```
POST /api/v1/auth/register     # User registration
POST /api/v1/auth/login        # User authentication
POST /api/v1/auth/refresh-token # Refresh access token
POST /api/v1/auth/logout       # Logout
POST /api/v1/auth/verify-email # Verify email
POST /api/v1/auth/verify-phone # Verify phone
```

### Trips

```
GET  /api/v1/trips            # List/search trips
GET  /api/v1/trips/:id        # Get trip details
POST /api/v1/trips            # Create trip (drivers)
PATCH /api/v1/trips/:id       # Update trip (drivers)
DELETE /api/v1/trips/:id      # Delete trip (drivers)
```

### Bookings

```
GET  /api/v1/bookings         # List user bookings
GET  /api/v1/bookings/:id     # Get booking details
POST /api/v1/bookings         # Book trip (passengers)
PATCH /api/v1/bookings/:id/cancel # Cancel booking
PATCH /api/v1/bookings/:id/rate   # Rate booking
```

### Chat

```
GET  /api/v1/chat/:tripId     # Get trip messages
POST /api/v1/chat/:tripId     # Send message
PATCH /api/v1/chat/:messageId/read # Mark message as read
```

### Payments

```
POST /api/v1/payments/create-payment-intent # Create payment intent
POST /api/v1/payments/confirm-payment       # Confirm payment
POST /api/v1/payments/webhook               # Stripe webhook
```

### Users

```
GET  /api/v1/users/profile    # Get user profile
PATCH /api/v1/users/profile   # Update user profile
POST /api/v1/users/driver     # Become a driver
```

## Database Schema

```
users (id, email, password, phone, name, role, profile_image)
drivers (user_id, car_model, license_plate, capacity, rating)
trips (id, driver_id, departure_city, destination_city, departure_time, seats, price)
bookings (id, tripId, passenger_id, seats_booked, payment_status)
messages (id, tripId, sender_id, content, timestamp)
```

## WebSocket Events

- `join_trip`: Join a trip's chat room
- `leave_trip`: Leave a trip's chat room
- `send_message`: Send a message in a trip's chat
- `new_message`: Receive a new message
- `trip_update`: Update trip status
- `trip_status_updated`: Receive trip status update

## Security Considerations

- All endpoints are protected with appropriate authentication and authorization
- Input validation is performed on all requests
- Rate limiting is applied to sensitive endpoints
- Passwords are hashed using bcrypt
- JWT tokens have appropriate expiration times
- Database queries are protected against SQL injection

## Deployment

The application is designed to be deployed to any Node.js hosting environment. For production:

1. Set appropriate environment variables
2. Use a process manager like PM2
3. Set up a reverse proxy (Nginx/Apache)
4. Configure SSL
5. Set up database backups

## License

This project is licensed under the MIT License.

# Phone Verification with Firebase

This project includes functionality to send and verify phone verification codes using Firebase Authentication.

## How to Send a Verification Code

You can send a verification code to a phone number using the following API endpoints:

```
POST /api/auth/verify-phone     # Legacy endpoint
POST /api/auth/send-phone-otp   # Recommended endpoint
```

### Request Body

```json
{
  "phoneNumber": "+1234567890"
}
```

### Response

```json
{
  "message": "Verification code sent to phone",
  "phoneNumber": "+1234567890",
  "otp": "123456"  // Only included in development mode
}
```

## How to Verify a Phone Number

After receiving the verification code, you can verify it using:

```
POST /api/auth/verify-phone-token  # Legacy endpoint
POST /api/auth/verify-phone-otp    # Recommended endpoint
```

### Request Body

```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456"  // or "token" for legacy endpoint
}
```

### Response

```json
{
  "message": "Phone verified successfully",
  "user": {
    "id": "user-id",
    "phoneNumber": "+1234567890",
    "isPhoneVerified": true,
    "status": "active"
  }
}
```

## Implementation Details

The phone verification system uses Firebase Authentication for production environments and a simulated verification system for development. The verification code is a 6-digit OTP that expires after 15 minutes.

### Streamlined Implementation

The Firebase service has been optimized with:
- Common functions for both email and phone verification
- Unified OTP generation, storage, and verification
- Consistent error handling and logging
- Proper validation of phone numbers and emails

### Development Mode

In development mode:
- The OTP is logged to the console
- The OTP is returned in the API response
- The OTP is stored in memory and in the user model

### Production Mode

In production mode:
- The OTP is stored in Firebase Firestore
- SMS is sent using a proper SMS provider (configured separately)
- The OTP is not returned in the API response

## Example Usage in JavaScript

```javascript
// Send verification code
async function sendVerificationCode(phoneNumber) {
  const response = await fetch('/api/auth/send-phone-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phoneNumber })
  });
  return response.json();
}

// Verify phone number
async function verifyPhoneNumber(phoneNumber, otp) {
  const response = await fetch('/api/auth/verify-phone-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      phoneNumber,
      otp
    })
  });
  return response.json();
}
```