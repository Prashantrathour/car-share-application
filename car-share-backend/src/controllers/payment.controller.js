const httpStatus = require('http-status');
const { Booking, Trip, User } = require('../models');
const ApiError = require('../utils/ApiError');
const stripe = require('../config/stripe');
const config = require('../config/config');

/**
 * Create a payment intent
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    // Find booking
    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Trip,
          as: 'trip',
        },
      ],
    });

    if (!booking) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Check if user is the passenger
    if (booking.passengerId !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Only the passenger can create payment');
    }

    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Booking is not in pending status');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId,
        tripId: booking.tripId,
        passengerId: booking.passengerId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update booking with payment intent ID
    await booking.update({
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'pending',
    });

    res.status(httpStatus.OK).json({
      status: 'success',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: booking.totalPrice,
        currency: 'usd',
        bookingId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm payment
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, bookingId } = req.body;
    const userId = req.user.id;

    // Find booking
    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Trip,
          as: 'trip',
        },
      ],
    });

    if (!booking) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Check if user is the passenger
    if (booking.passengerId !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Only the passenger can confirm payment');
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Payment has not been completed');
    }

    // Update booking status
    await booking.update({
      paymentStatus: 'paid',
    });

    res.status(httpStatus.OK).json({
      status: 'success',
      data: {
        booking: {
          id: booking.id,
          status: booking.status,
          paymentStatus: 'paid',
          updatedAt: booking.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Stripe webhook events
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      );
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const booking = await Booking.findOne({
          where: { paymentIntentId: paymentIntent.id },
        });

        if (booking) {
          await booking.update({
            paymentStatus: 'paid',
          });
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedBooking = await Booking.findOne({
          where: { paymentIntentId: failedPayment.id },
        });

        if (failedBooking) {
          await failedBooking.update({
            paymentStatus: 'failed',
          });
        }
        break;

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object;
        const canceledBooking = await Booking.findOne({
          where: { paymentIntentId: canceledPayment.id },
        });

        if (canceledBooking) {
          await canceledBooking.update({
            paymentStatus: 'canceled',
          });
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
};