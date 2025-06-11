# Car-Sharing Frontend Development Guide

This guide provides instructions for setting up and developing the frontend application for the Car-Sharing platform using modern web technologies.

## Project Setup

### 1. Initialize Project
```bash
# Create a new Next.js project with TypeScript
npx create-next-app@latest car-sharing-frontend --typescript --tailwind --eslint

# Navigate to project directory
cd car-sharing-frontend

# Install additional dependencies
npm install @tanstack/react-query axios @headlessui/react @heroicons/react @tailwindcss/forms dayjs socket.io-client @reduxjs/toolkit react-redux react-hot-toast
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://your-domain.com/api/v1
NEXT_PUBLIC_WEBSOCKET_URL=ws://your-domain.com

# Authentication
NEXT_PUBLIC_TOKEN_STORAGE_KEY=car_sharing_token
```

### 3. API Configuration

Create `src/config/api.ts`:

```typescript
import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || '');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem(process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || '');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── trips/             # Trip-related routes
│   ├── bookings/          # Booking-related routes
│   └── profile/           # User profile routes
├── components/            # Reusable components
│   ├── common/           # Common UI components
│   ├── trips/            # Trip-related components
│   ├── bookings/         # Booking-related components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── services/             # API service functions
├── store/                # Redux store configuration
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Type Definitions

Create `src/types/api.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'user' | 'driver' | 'admin';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: 'active' | 'inactive';
  preferences: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  createdAt: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Trip {
  id: string;
  startLocation: Location;
  endLocation: Location;
  startTime: string;
  endTime: string;
  availableSeats: number;
  pricePerSeat: number;
  estimatedDuration: number;
  estimatedDistance: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  preferences: {
    smoking: boolean;
    music: boolean;
    pets: boolean;
  };
  driver: {
    id: string;
    firstName: string;
    lastName: string;
    rating: number;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    color: string;
  };
  route: {
    waypoints: Array<{ lat: number; lng: number }>;
  };
  notes: string;
}

export interface Booking {
  id: string;
  tripId: string;
  passengerId: string;
  numberOfSeats: number;
  pickupLocation: Location;
  dropoffLocation: Location;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  passengerNotes: string;
  baggageCount: number;
  specialRequests: string[];
  pickupCode: string;
  isReviewedByPassenger: boolean;
  isReviewedByDriver: boolean;
  createdAt: string;
}
```

## API Services

Create `src/services/api.ts`:

```typescript
import { api } from '@/config/api';
import type { User, Trip, Booking } from '@/types/api';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: Partial<User>) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export const tripService = {
  listTrips: async (params?: any) => {
    const response = await api.get('/trips', { params });
    return response.data;
  },
  createTrip: async (tripData: Partial<Trip>) => {
    const response = await api.post('/trips', tripData);
    return response.data;
  },
};

export const bookingService = {
  createBooking: async (bookingData: Partial<Booking>) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  listUserBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },
};
```

## WebSocket Integration

Create `src/services/socket.ts`:

```typescript
import { io } from 'socket.io-client';
import { WEBSOCKET_URL } from '@/config/api';

export const socket = io(WEBSOCKET_URL, {
  autoConnect: false,
  auth: {
    token: typeof window !== 'undefined' 
      ? localStorage.getItem(process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || '')
      : '',
  },
});

export const connectSocket = () => {
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

// Socket event listeners
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});
```

## Development Guidelines

1. **Component Structure**
   - Use TypeScript for all components
   - Implement proper error handling
   - Add loading states for async operations
   - Use React Query for data fetching
   - Implement proper form validation

2. **Styling**
   - Use Tailwind CSS for styling
   - Create reusable UI components
   - Maintain consistent spacing and typography
   - Implement responsive design

3. **State Management**
   - Use Redux for global state
   - Use React Query for server state
   - Use local state for component-specific state

4. **Authentication**
   - Implement protected routes
   - Handle token expiration
   - Manage user sessions

5. **Error Handling**
   - Implement global error boundary
   - Show user-friendly error messages
   - Log errors for debugging

6. **Performance**
   - Implement code splitting
   - Optimize images
   - Use proper caching strategies
   - Minimize bundle size

## Example Component

Here's an example of a trip card component:

```typescript
// src/components/trips/TripCard.tsx
import { FC } from 'react';
import Image from 'next/image';
import { Trip } from '@/types/api';
import { formatCurrency, formatDate } from '@/utils/format';

interface TripCardProps {
  trip: Trip;
  onBookNow: (tripId: string) => void;
}

export const TripCard: FC<TripCardProps> = ({ trip, onBookNow }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {trip.startLocation.address} → {trip.endLocation.address}
            </h3>
            <p className="text-gray-600">
              {formatDate(trip.startTime)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">
              {formatCurrency(trip.pricePerSeat)}
            </p>
            <p className="text-sm text-gray-500">per seat</p>
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <Image
              src={trip.driver.profileImage || '/default-avatar.png'}
              alt={`${trip.driver.firstName} ${trip.driver.lastName}`}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="ml-2">
              <p className="font-medium">
                {trip.driver.firstName} {trip.driver.lastName}
              </p>
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-600 ml-1">
                  {trip.driver.rating}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <p>{trip.estimatedDuration} mins</p>
            <p>{trip.estimatedDistance} miles</p>
          </div>
          <div>
            <p>{trip.availableSeats} seats left</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {Object.entries(trip.preferences).map(([key, value]) => (
            value && (
              <span
                key={key}
                className="px-2 py-1 text-xs rounded-full bg-gray-100"
              >
                {key}
              </span>
            )
          ))}
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50">
        <button
          onClick={() => onBookNow(trip.id)}
          className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          disabled={trip.availableSeats === 0}
        >
          {trip.availableSeats > 0 ? 'Book Now' : 'Fully Booked'}
        </button>
      </div>
    </div>
  );
};
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`
5. Open http://localhost:3000

## Best Practices

1. Follow the established project structure
2. Use TypeScript for type safety
3. Write clean, maintainable code
4. Add proper documentation
5. Implement proper error handling
6. Follow accessibility guidelines
7. Write unit tests for components
8. Use proper Git workflow

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
``` 