const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const tripRoute = require('./trip.routes');
const bookingRoute = require('./booking.route');
const vehicleRoute = require('./vehicle.routes');
const reviewRoute = require('./review.routes');
const paymentRoute = require('./payment.routes');
const chatRoute = require('./chat.routes');
const configRoute = require('./config.route');
const analyticsRoute = require('./analytics.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/trips',
    route: tripRoute,
  },
  {
    path: '/bookings',
    route: bookingRoute,
  },
  {
    path: '/vehicles',
    route: vehicleRoute,
  },
  {
    path: '/reviews',
    route: reviewRoute,
  },
  {
    path: '/payments',
    route: paymentRoute,
  },
  {
    path: '/chat',
    route: chatRoute,
  },
  {
    path: '/config',
    route: configRoute,
  },
  {
    path: '/analytics',
    route: analyticsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running'
  });
});

// Handle 404 routes
router.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

module.exports = router;