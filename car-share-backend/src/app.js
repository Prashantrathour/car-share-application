const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const httpStatus = require('http-status');
const config = require('./config/config');
const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Gzip compression
app.use(compression());

// Enable CORS
app.use(cors({
  origin: [config.corsOrigin, 'http://localhost:3000'],
  credentials: true
}));

// Serve static files from the public directory
app.use('/public', express.static('src/public'));

// Request logging
if (config.env !== 'test') {
  app.use(morgan('combined'));
}

// Root route for API documentation
app.get('/', (req, res) => {
  res.status(httpStatus.OK).send({
    message: 'Welcome to Car-Sharing API',
    version: config.apiVersion,
    documentation: '/api-docs',
    endpoints: [
      { path: `/api/${config.apiVersion}/auth`, description: 'Authentication endpoints' },
      { path: `/api/${config.apiVersion}/users`, description: 'User management' },
      { path: `/api/${config.apiVersion}/trips`, description: 'Trip management' },
      { path: `/api/${config.apiVersion}/bookings`, description: 'Booking management' },
      { path: `/api/${config.apiVersion}/chat`, description: 'Chat functionality' },
      { path: `/api/${config.apiVersion}/payments`, description: 'Payment processing' }
    ]
  });
});

// API routes
app.use(`/api/${config.apiVersion}`, routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(httpStatus.OK).send({ status: 'ok' });
});

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  res.status(httpStatus.OK).send({
    message: 'API Documentation',
    auth: {
      register: { method: 'POST', path: `/api/${config.apiVersion}/auth/register`, description: 'Register a new user' },
      login: { method: 'POST', path: `/api/${config.apiVersion}/auth/login`, description: 'User authentication' },
      refreshToken: { method: 'POST', path: `/api/${config.apiVersion}/auth/refresh-token`, description: 'Refresh access token' },
      logout: { method: 'POST', path: `/api/${config.apiVersion}/auth/logout`, description: 'Logout' },
      verifyEmail: { method: 'POST', path: `/api/${config.apiVersion}/auth/verify-email`, description: 'Verify email' },
      verifyPhone: { method: 'POST', path: `/api/${config.apiVersion}/auth/verify-phone`, description: 'Verify phone' }
    },
    trips: {
      list: { method: 'GET', path: `/api/${config.apiVersion}/trips`, description: 'List/search trips' },
      get: { method: 'GET', path: `/api/${config.apiVersion}/trips/:id`, description: 'Get trip details' },
      create: { method: 'POST', path: `/api/${config.apiVersion}/trips`, description: 'Create trip (drivers)' },
      update: { method: 'PATCH', path: `/api/${config.apiVersion}/trips/:id`, description: 'Update trip (drivers)' },
      delete: { method: 'DELETE', path: `/api/${config.apiVersion}/trips/:id`, description: 'Delete trip (drivers)' }
    },
    bookings: {
      list: { method: 'GET', path: `/api/${config.apiVersion}/bookings`, description: 'List user bookings' },
      get: { method: 'GET', path: `/api/${config.apiVersion}/bookings/:id`, description: 'Get booking details' },
      create: { method: 'POST', path: `/api/${config.apiVersion}/bookings`, description: 'Book trip (passengers)' },
      cancel: { method: 'PATCH', path: `/api/${config.apiVersion}/bookings/:id/cancel`, description: 'Cancel booking' },
      rate: { method: 'PATCH', path: `/api/${config.apiVersion}/bookings/:id/rate`, description: 'Rate booking' }
    },
    users: {
      profile: { method: 'GET', path: `/api/${config.apiVersion}/users/profile`, description: 'Get user profile' },
      updateProfile: { method: 'PATCH', path: `/api/${config.apiVersion}/users/profile`, description: 'Update user profile' },
      becomeDriver: { method: 'POST', path: `/api/${config.apiVersion}/users/driver`, description: 'Become a driver' }
    }
  });
});

// Send 404 error for any unknown API request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle errors
app.use(errorHandler);

module.exports = app;