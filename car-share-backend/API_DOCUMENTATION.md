# Car-Sharing API Documentation

This document provides detailed information about all available API endpoints, including sample request and response data.

## Base URL
```
http://your-domain.com/api/v1
```

## Authentication

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "country": "USA"
  },
  "preferences": {
    "language": "en",
    "currency": "USD",
    "notifications": {
      "email": true,
      "push": true,
      "sms": true
    }
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+1234567890",
      "role": "user",
      "isEmailVerified": false,
      "isPhoneVerified": false,
      "status": "pending",
      "address": {
        "street": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94105",
        "country": "USA"
      },
      "preferences": {
        "language": "en",
        "currency": "USD",
        "notifications": {
          "email": true,
          "push": true,
          "sms": true
        }
      },
      "rating": null,
      "completedTrips": 0,
      "totalEarnings": 0,
      "createdAt": "2024-03-20T10:00:00.000Z"
    },
    "tokens": {
      "access": {
        "token": "eyJhbG...",
        "expires": "2024-03-20T11:00:00.000Z"
      },
      "refresh": {
        "token": "eyJhbG...",
        "expires": "2024-03-27T10:00:00.000Z"
      }
    }
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "status": "active",
      "preferences": {
        "language": "en",
        "currency": "USD",
        "notifications": {
          "email": true,
          "push": true,
          "sms": true
        }
      }
    },
    "tokens": {
      "access": {
        "token": "eyJhbG...",
        "expires": "2024-03-20T11:00:00.000Z"
      },
      "refresh": {
        "token": "eyJhbG...",
        "expires": "2024-03-27T10:00:00.000Z"
      }
    }
  }
}
```

### Refresh Token
```http
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "tokens": {
      "access": {
        "token": "eyJhbG...",
        "expires": "2024-03-20T11:00:00.000Z"
      },
      "refresh": {
        "token": "eyJhbG...",
        "expires": "2024-03-27T10:00:00.000Z"
      }
    }
  }
}
```

### Verify Email
```http
POST /auth/verify-email
```

**Request Body:**
```json
{
  "token": "verification_token_here"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Email verified successfully"
}
```

### Verify Phone
```http
POST /auth/verify-phone
```

**Request Body:**
```json
{
  "code": "123456",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Phone number verified successfully"
}
```

### Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password reset instructions sent to email"
}
```

### Reset Password
```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "newSecurePassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

## Trips

### List Trips
```http
GET /trips
```

**Query Parameters:**
```
start_location (optional): string
end_location (optional): string
start_date (optional): YYYY-MM-DD
min_seats (optional): number
max_price (optional): number
page (optional): number
limit (optional): number (1-100)
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "trips": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "startLocation": {
          "latitude": 37.7749,
          "longitude": -122.4194,
          "address": "123 Main St, San Francisco, CA 94105"
        },
        "endLocation": {
          "latitude": 37.3382,
          "longitude": -121.8863,
          "address": "456 First St, San Jose, CA 95113"
        },
        "startTime": "2024-03-21T08:00:00.000Z",
        "endTime": "2024-03-21T09:00:00.000Z",
        "availableSeats": 3,
        "pricePerSeat": 25.00,
        "estimatedDuration": 60,
        "estimatedDistance": 50.5,
        "status": "scheduled",
        "preferences": {
          "smoking": false,
          "music": true,
          "pets": false
        },
        "driver": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "firstName": "John",
          "lastName": "Driver",
          "rating": 4.5
        },
        "vehicle": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "make": "Toyota",
          "model": "Camry",
          "year": 2020,
          "color": "Silver"
        },
        "route": {
          "waypoints": [
            { "lat": 37.7749, "lng": -122.4194 },
            { "lat": 37.5482, "lng": -122.1504 },
            { "lat": 37.3382, "lng": -121.8863 }
          ]
        },
        "notes": "Direct route to San Jose, minimal stops"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "totalResults": 48
    }
  }
}
```

### Create Trip
```http
POST /trips
```

**Request Body:**
```json
{
  "startLocation": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "address": "123 Main St, San Francisco, CA 94105"
  },
  "endLocation": {
    "latitude": 37.3382,
    "longitude": -121.8863,
    "address": "456 First St, San Jose, CA 95113"
  },
  "startTime": "2024-03-21T08:00:00.000Z",
  "endTime": "2024-03-21T09:00:00.000Z",
  "availableSeats": 3,
  "pricePerSeat": 25.00,
  "preferences": {
    "smoking": false,
    "music": true,
    "pets": false,
    "luggage": true,
    "airConditioner": true
  },
  "notes": "Direct route to San Jose, minimal stops",
  "vehicleId": "550e8400-e29b-41d4-a716-446655440002",
  "estimatedDuration": 60,
  "estimatedDistance": 50.5,
  "route": {
    "waypoints": [
      { "lat": 37.7749, "lng": -122.4194 },
      { "lat": 37.5482, "lng": -122.1504 },
      { "lat": 37.3382, "lng": -121.8863 }
    ]
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "trip": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "startLocation": {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "address": "123 Main St, San Francisco, CA 94105"
      },
      "endLocation": {
        "latitude": 37.3382,
        "longitude": -121.8863,
        "address": "456 First St, San Jose, CA 95113"
      },
      "startTime": "2024-03-21T08:00:00.000Z",
      "endTime": "2024-03-21T09:00:00.000Z",
      "availableSeats": 3,
      "pricePerSeat": 25.00,
      "status": "scheduled",
      "preferences": {
        "smoking": false,
        "music": true,
        "pets": false,
        "luggage": true,
        "airConditioner": true
      },
      "estimatedDuration": 60,
      "estimatedDistance": 50.5,
      "driverId": "550e8400-e29b-41d4-a716-446655440001",
      "vehicleId": "550e8400-e29b-41d4-a716-446655440002",
      "route": {
        "waypoints": [
          { "lat": 37.7749, "lng": -122.4194 },
          { "lat": 37.5482, "lng": -122.1504 },
          { "lat": 37.3382, "lng": -121.8863 }
        ]
      },
      "notes": "Direct route to San Jose, minimal stops",
      "createdAt": "2024-03-20T10:00:00.000Z"
    }
  }
}
```

### Update Trip
```http
PATCH /trips/:id
```

**Request Body:**
```json
{
  "startLocation": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "address": "123 Main St, San Francisco, CA 94105"
  },
  "endLocation": {
    "latitude": 37.3382,
    "longitude": -121.8863,
    "address": "456 First St, San Jose, CA 95113"
  },
  "startTime": "2024-03-21T08:00:00.000Z",
  "endTime": "2024-03-21T09:00:00.000Z",
  "availableSeats": 3,
  "pricePerSeat": 25.00,
  "status": "in_progress",
  "notes": "Updated route details"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "trip": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "startLocation": {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "address": "123 Main St, San Francisco, CA 94105"
      },
      "endLocation": {
        "latitude": 37.3382,
        "longitude": -121.8863,
        "address": "456 First St, San Jose, CA 95113"
      },
      "startTime": "2024-03-21T08:00:00.000Z",
      "endTime": "2024-03-21T09:00:00.000Z",
      "availableSeats": 3,
      "pricePerSeat": 25.00,
      "status": "in_progress",
      "notes": "Updated route details",
      "updatedAt": "2024-03-20T10:30:00.000Z"
    }
  }
}
```

### Delete Trip
```http
DELETE /trips/:id
```

**Response:**
```json
{
  "status": "success",
  "message": "Trip deleted successfully"
}
```

## Bookings

### Create Booking
```http
POST /bookings
```

**Request Body:**
```json
{
  "tripId": "550e8400-e29b-41d4-a716-446655440000",
  "numberOfSeats": 2,
  "pickupLocation": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "address": "123 Main St, San Francisco, CA 94105"
  },
  "dropoffLocation": {
    "latitude": 37.3382,
    "longitude": -121.8863,
    "address": "456 First St, San Jose, CA 95113"
  },
  "passengerNotes": "I have two medium-sized bags",
  "baggageCount": 2,
  "specialRequests": ["wheelchair_accessible", "quiet_preferred"]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "booking": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "tripId": "550e8400-e29b-41d4-a716-446655440000",
      "passengerId": "550e8400-e29b-41d4-a716-446655440004",
      "numberOfSeats": 2,
      "pickupLocation": {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "address": "123 Main St, San Francisco, CA 94105"
      },
      "dropoffLocation": {
        "latitude": 37.3382,
        "longitude": -121.8863,
        "address": "456 First St, San Jose, CA 95113"
      },
      "status": "pending",
      "totalPrice": 50.00,
      "paymentStatus": "pending",
      "passengerNotes": "I have two medium-sized bags",
      "baggageCount": 2,
      "specialRequests": ["wheelchair_accessible", "quiet_preferred"],
      "pickupCode": "123456",
      "isReviewedByPassenger": false,
      "isReviewedByDriver": false,
      "createdAt": "2024-03-20T10:00:00.000Z"
    }
  }
}
```

### List User Bookings
```http
GET /bookings
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "bookings": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "trip": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "startLocation": {
            "latitude": 37.7749,
            "longitude": -122.4194,
            "address": "123 Main St, San Francisco, CA 94105"
          },
          "endLocation": {
            "latitude": 37.3382,
            "longitude": -121.8863,
            "address": "456 First St, San Jose, CA 95113"
          },
          "startTime": "2024-03-21T08:00:00.000Z",
          "endTime": "2024-03-21T09:00:00.000Z",
          "driver": {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "firstName": "John",
            "lastName": "Driver",
            "rating": 4.5
          }
        },
        "numberOfSeats": 2,
        "status": "confirmed",
        "totalPrice": 50.00,
        "paymentStatus": "paid",
        "pickupLocation": {
          "latitude": 37.7749,
          "longitude": -122.4194,
          "address": "123 Main St, San Francisco, CA 94105"
        },
        "dropoffLocation": {
          "latitude": 37.3382,
          "longitude": -121.8863,
          "address": "456 First St, San Jose, CA 95113"
        },
        "passengerNotes": "I have two medium-sized bags",
        "baggageCount": 2,
        "specialRequests": ["wheelchair_accessible", "quiet_preferred"],
        "pickupCode": "123456",
        "isReviewedByPassenger": false,
        "isReviewedByDriver": false,
        "createdAt": "2024-03-20T10:00:00.000Z"
      }
    ]
  }
}
```

### Get Single Booking
```http
GET /bookings/:id
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "booking": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "tripId": "550e8400-e29b-41d4-a716-446655440000",
      "passengerId": "550e8400-e29b-41d4-a716-446655440004",
      "numberOfSeats": 2,
      "status": "confirmed",
      "totalPrice": 50.00,
      "paymentStatus": "paid",
      "pickupLocation": {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "address": "123 Main St, San Francisco, CA 94105"
      },
      "dropoffLocation": {
        "latitude": 37.3382,
        "longitude": -121.8863,
        "address": "456 First St, San Jose, CA 95113"
      },
      "passengerNotes": "I have two medium-sized bags",
      "baggageCount": 2,
      "specialRequests": ["wheelchair_accessible", "quiet_preferred"],
      "pickupCode": "123456",
      "isReviewedByPassenger": false,
      "isReviewedByDriver": false,
      "createdAt": "2024-03-20T10:00:00.000Z"
    }
  }
}
```

### Cancel Booking
```http
PATCH /bookings/:id/cancel
```

**Request Body:**
```json
{
  "cancellationReason": "Change of plans"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "booking": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "status": "cancelled",
      "cancellationReason": "Change of plans",
      "cancelledAt": "2024-03-20T10:30:00.000Z"
    }
  }
}
```

### Rate Booking
```http
PATCH /bookings/:id/rate
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent service and very punctual!"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "booking": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "rating": 5,
      "comment": "Excellent service and very punctual!",
      "isReviewedByPassenger": true
    }
  }
}
```

## User Profile

### Get Profile
```http
GET /users/profile
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+1234567890",
      "avatar": "https://example.com/images/profile.jpg",
      "dateOfBirth": "1990-01-01",
      "role": "user",
      "status": "active",
      "isEmailVerified": true,
      "isPhoneVerified": true,
      "address": {
        "street": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94105",
        "country": "USA"
      },
      "rating": 4.8,
      "completedTrips": 15,
      "totalEarnings": 1250.50,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Profile
```http
PATCH /users/profile
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1987654321",
  "avatar": "https://example.com/images/new-profile.jpg",
  "dateOfBirth": "1990-01-01",
  "address": {
    "street": "456 Oak St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "firstName": "John",
      "lastName": "Smith",
      "phoneNumber": "+1987654321",
      "avatar": "https://example.com/images/new-profile.jpg",
      "dateOfBirth": "1990-01-01",
      "address": {
        "street": "456 Oak St",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94105",
        "country": "USA"
      },
      "updatedAt": "2024-03-20T10:30:00.000Z"
    }
  }
}
```

**Validation Rules:**
- First name must be between 2 and 50 characters
- Last name must be between 2 and 50 characters
- Phone number must be in valid international format
- Avatar must be a valid URL
- Date of birth must be a valid date
- Address must be a valid object

### Become a Driver
```http
POST /users/driver
```

**Request Body:**
```json
{
  "vehicleModel": "Toyota Camry 2020",
  "licensePlate": "ABC123",
  "seats": 4,
  "vehicleType": "sedan",
  "driverLicense": {
    "number": "DL123456789",
    "expiryDate": "2025-12-31",
    "state": "CA",
    "country": "USA",
    "image": "base64_encoded_image"
  },
  "vehicleImages": [
    "base64_encoded_image_1",
    "base64_encoded_image_2"
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Driver registration submitted for review",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "role": "driver",
      "status": "pending",
      "vehicle": {
        "model": "Toyota Camry 2020",
        "licensePlate": "ABC123",
        "seats": 4,
        "type": "sedan",
        "status": "pending",
        "images": [
          "https://example.com/vehicle/image1.jpg",
          "https://example.com/vehicle/image2.jpg"
        ]
      },
      "driverLicense": {
        "number": "DL123456789",
        "expiryDate": "2025-12-31",
        "state": "CA",
        "country": "USA",
        "verificationStatus": "pending"
      }
    }
  }
}
```

**Validation Rules:**
- Must be authenticated as a regular user
- Vehicle model is required
- License plate is required
- Seats must be between 2 and 15
- Vehicle type must be one of: 'sedan', 'suv', 'van', 'truck', 'luxury'
- Driver license details are required
- Vehicle images are optional but must be an array if provided

### Admin: List Users (Admin Only)
```http
GET /users
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "status": "active",
        "isEmailVerified": true,
        "isPhoneVerified": true,
        "createdAt": "2024-03-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "totalResults": 1
    }
  }
}
```

### Admin: Get User (Admin Only)
```http
GET /users/:id
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "status": "active",
      "isEmailVerified": true,
      "isPhoneVerified": true,
      "createdAt": "2024-03-20T10:00:00.000Z"
    }
  }
}
```

### Admin: Update User (Admin Only)
```http
PATCH /users/:id
```

**Request Body:**
```json
{
  "role": "driver",
  "status": "active",
  "isEmailVerified": true,
  "isPhoneVerified": true
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "role": "driver",
      "status": "active",
      "isEmailVerified": true,
      "isPhoneVerified": true,
      "updatedAt": "2024-03-20T10:30:00.000Z"
    }
  }
}
```

**Admin Validation Rules:**
- Role must be one of: 'user', 'driver', 'admin'
- Status must be one of: 'pending', 'active', 'suspended', 'banned'
- Email verification status must be boolean
- Phone verification status must be boolean

## Payments

### Create Payment Intent
```http
POST /payments/create-payment-intent
```

**Request Body:**
```json
{
  "bookingId": "550e8400-e29b-41d4-a716-446655440003",
  "paymentMethod": "card"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "clientSecret": "pi_3Nj..._secret_K2J...",
    "amount": 5000,
    "currency": "usd",
    "paymentMethods": ["card"],
    "booking": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "totalPrice": 50.00,
      "status": "pending_payment"
    }
  }
}
```

### Get Payment History
```http
GET /payments/history
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "payments": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440005",
        "bookingId": "550e8400-e29b-41d4-a716-446655440003",
        "amount": 50.00,
        "currency": "usd",
        "status": "completed",
        "paymentMethod": "card",
        "paymentIntentId": "pi_3Nj...",
        "createdAt": "2024-03-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "totalResults": 1
    }
  }
}
```

## Chat Messages

### Get Trip Messages
```http
GET /chat/:tripId
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "messages": [
      {
        "id": 1,
        "sender": {
          "id": 1,
          "name": "John Doe"
        },
        "content": "I'm running 5 minutes late",
        "timestamp": "2024-03-20T09:55:00.000Z",
        "read": true
      }
    ]
  }
}
```

### Send Message
```http
POST /chat/:tripId
```

**Request Body:**
```json
{
  "content": "I'm at the pickup location"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": {
      "id": 2,
      "sender_id": 1,
      "content": "I'm at the pickup location",
      "timestamp": "2024-03-20T10:00:00.000Z",
      "read": false
    }
  }
}
```

## Reviews

### Create Review
```http
POST /reviews
```

**Request Body:**
```json
{
  "booking_id": 1,
  "rating": 5,
  "comment": "Great driver, very punctual!"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "review": {
      "id": 1,
      "booking_id": 1,
      "rating": 5,
      "comment": "Great driver, very punctual!",
      "createdAt": "2024-03-20T10:00:00.000Z"
    }
  }
}
```

## Vehicles

### List Vehicles
```http
GET /vehicles
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "vehicles": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "color": "Silver",
        "licensePlate": "ABC123",
        "status": "active",
        "owner": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "firstName": "John",
          "lastName": "Driver"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "totalResults": 1
    }
  }
}
```

### Create Vehicle
```http
POST /vehicles
```

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "color": "Silver",
  "licensePlate": "ABC123",
  "registrationNumber": "REG123456",
  "insurance": {
    "provider": "Insurance Co",
    "policyNumber": "POL123456",
    "expiryDate": "2025-12-31"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "vehicle": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "color": "Silver",
      "licensePlate": "ABC123",
      "status": "pending",
      "createdAt": "2024-03-20T10:00:00.000Z"
    }
  }
}
```

### Get Vehicle
```http
GET /vehicles/:id
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "vehicle": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "color": "Silver",
      "licensePlate": "ABC123",
      "status": "active",
      "insurance": {
        "provider": "Insurance Co",
        "policyNumber": "POL123456",
        "expiryDate": "2025-12-31"
      }
    }
  }
}
```

### Update Vehicle
```http
PATCH /vehicles/:id
```

**Request Body:**
```json
{
  "color": "Black",
  "insurance": {
    "provider": "New Insurance Co",
    "policyNumber": "POL789012",
    "expiryDate": "2026-12-31"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "vehicle": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "color": "Black",
      "insurance": {
        "provider": "New Insurance Co",
        "policyNumber": "POL789012",
        "expiryDate": "2026-12-31"
      },
      "updatedAt": "2024-03-20T10:30:00.000Z"
    }
  }
}
```

### Delete Vehicle
```http
DELETE /vehicles/:id
```

**Response:**
```json
{
  "status": "success",
  "message": "Vehicle deleted successfully"
}
```

## Validation Rules

### Password Requirements
- Minimum 8 characters
- Must contain at least one number
- Must contain at least one letter

### Phone Number Format
- Must be a valid international phone number format
- Example: +1234567890

### Date Formats
- All dates should be in ISO 8601 format
- Example: "2024-03-21T08:00:00.000Z"

### Location Format
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "address": "123 Main St, San Francisco, CA 94105"
}
```

### Rating Rules
- Must be between 1 and 5
- Must be an integer

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

All endpoints except `/auth/login` and `/auth/register` require authentication. Include the access token in the Authorization header:

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
  firebaseUid: String,        // Firebase User ID
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