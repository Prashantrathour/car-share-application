const nodemailer = require('nodemailer');
const config = require('../config/config');
const { User, Trip, Booking } = require('../models');
const path = require('path');
const fs = require('fs');

// Create reusable transporter object using SMTP transport
let transporter = null;
if (config.email.isValid) {
  try {
    transporter = nodemailer.createTransport(config.email.smtp);

    // Verify connection configuration
    transporter.verify(function(error, success) {
      if (error) {
        console.error('SMTP connection error:', error);
        if (error.code === 'EAUTH') {
          console.error('Authentication failed. Please check your Gmail App Password.');
          console.error('Visit https://myaccount.google.com/apppasswords to generate an App Password.');
        } else if (error.code === 'ESOCKET') {
          console.error('Connection error. Check network and Gmail security settings.');
        }
        transporter = null;
      } else {
        console.log('SMTP server is ready to take our messages');
      }
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    transporter = null;
  }
}

// Email template styles
const emailStyles = `
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4CAF50;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px;
    }
    .logo {
      max-width: 150px;
      margin-bottom: 15px;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 5px;
      margin-top: 20px;
    }
    .details {
      background-color: white;
      padding: 15px;
      border-radius: 5px;
      margin-top: 15px;
      border: 1px solid #ddd;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 15px;
      color: white;
      font-weight: bold;
      margin: 10px 0;
    }
    .status-confirmed { background-color: #4CAF50; }
    .status-cancelled { background-color: #f44336; }
    .status-completed { background-color: #2196F3; }
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 10px 0;
    }
  </style>
`;

// Get logo for emails
const logoPath = path.join(__dirname, '../public/images/carshare.jpg');
let logoHtml = '';

// Read the logo file and convert it to base64
try {
  if (fs.existsSync(logoPath)) {
    const logoBuffer = fs.readFileSync(logoPath);
    const base64Logo = logoBuffer.toString('base64');
    logoHtml = `<img src="data:image/jpeg;base64,${base64Logo}" alt="Car Share Logo" class="logo" />`;
  } else {
    console.warn('Logo file not found at:', logoPath);
  }
} catch (error) {
  console.error('Error reading logo file:', error);
}

/**
 * Send booking confirmation email to passenger
 * @param {Booking} booking - The booking object
 * @returns {Promise<void>}
 */
const sendBookingConfirmation = async (booking) => {
  try {
    if (!config.email.isValid || !transporter) {
      console.warn('Email notifications are disabled or not properly configured.');
      return;
    }

    const trip = await Trip.findByPk(booking.tripId, {
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
    });

    const passenger = await User.findByPk(booking.passengerId, {
      attributes: ['firstName', 'lastName', 'email'],
    });

    if (!passenger.email) {
      console.warn(`No email address found for passenger ${passenger.id}`);
      return;
    }

    const startDate = new Date(trip.startTime).toLocaleString();
    const endDate = new Date(trip.endTime).toLocaleString();

    const mailOptions = {
      from: config.email.from,
      to: passenger.email,
      subject: '🎉 Trip Booking Confirmation',
      html: `
        ${emailStyles}
        <div class="header">
         
          <h1>Booking Confirmation</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${passenger.firstName}</strong>,</p>
          <p>Your trip booking has been confirmed! 🚗</p>
          <div class="status-badge status-confirmed">CONFIRMED</div>
          <div class="details">
            <h3>Trip Details:</h3>
            <p><strong>📅 Trip Date:</strong> ${startDate} to ${endDate}</p>
            <p><strong>📍 From:</strong> ${trip.startLocation.address}</p>
            <p><strong>🏁 To:</strong> ${trip.endLocation.address}</p>
            <p><strong>💺 Number of Seats:</strong> ${booking.numberOfSeats}</p>
            <p><strong>💰 Total Price:</strong> $${booking.totalPrice}</p>
            <p><strong>💳 Payment Status:</strong> ${booking.paymentStatus}</p>
            <p><strong>👤 Driver:</strong> ${trip.driver.firstName} ${trip.driver.lastName}</p>
          </div>
          <p>Need to make changes? Contact our support team.</p>
          <a href="${config.clientUrl}/bookings/${booking.id}" class="button">View Booking Details</a>
        </div>
        <div class="footer">
          <p>Thank you for choosing our service!</p>
          <p>© ${new Date().getFullYear()} Car Share. All rights reserved.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log(`Booking confirmation email sent to ${passenger.email}`);
    // console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check your Gmail App Password.');
    } else if (error.code === 'ESOCKET') {
      console.error('Connection error. Check network and Gmail security settings.');
    }
  }
};

/**
 * Send trip status update email to passenger
 * @param {Booking} booking - The booking object
 * @param {string} status - The new status
 * @returns {Promise<void>}
 */
const sendTripStatusUpdate = async (booking, status) => {
  try {
    if (!config.email.isValid || !transporter) {
      console.warn('Email notifications are disabled or not properly configured.');
      return;
    }

    const trip = await Trip.findByPk(booking.tripId, {
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
    });

    const passenger = await User.findByPk(booking.passengerId, {
      attributes: ['firstName', 'lastName', 'email'],
    });

    if (!passenger.email) {
      console.warn(`No email address found for passenger ${passenger.id}`);
      return;
    }

    const startDate = new Date(trip.startTime).toLocaleString();
    const endDate = new Date(trip.endTime).toLocaleString();

    const statusClass = status.toLowerCase();
    const statusEmoji = {
      confirmed: '✅',
      cancelled: '❌',
      completed: '🏁',
    }[statusClass] || '📝';

    const mailOptions = {
      from: config.email.from,
      to: passenger.email,
      subject: `${statusEmoji} Trip Status Update: ${status.toUpperCase()}`,
      html: `
        ${emailStyles}
        <div class="header">
         
          <h1>Trip Status Update</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${passenger.firstName}</strong>,</p>
          <p>Your trip status has been updated to: ${statusEmoji} <strong>${status.toUpperCase()}</strong></p>
          <div class="status-badge status-${statusClass}">${status.toUpperCase()}</div>
          <div class="details">
            <h3>Trip Details:</h3>
            <p><strong>📅 Trip Date:</strong> ${startDate} to ${endDate}</p>
            <p><strong>📍 From:</strong> ${trip.startLocation.address}</p>
            <p><strong>🏁 To:</strong> ${trip.endLocation.address}</p>
            <p><strong>💺 Number of Seats:</strong> ${booking.numberOfSeats}</p>
            <p><strong>💰 Total Price:</strong> $${booking.totalPrice}</p>
            <p><strong>👤 Driver:</strong> ${trip.driver.firstName} ${trip.driver.lastName}</p>
          </div>
          <p>Need assistance? Contact our support team.</p>
            <a href="${config.clientUrl}/bookings/${booking.id}" class="button">View Trip Details</a>
        </div>
        <div class="footer">
          <p>Thank you for choosing our service!</p>
          <p>© ${new Date().getFullYear()} Car Share. All rights reserved.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log(`Trip status update email sent to ${passenger.email}`);
    // console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending trip status update email:', error);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check your Gmail App Password.');
    } else if (error.code === 'ESOCKET') {
      console.error('Connection error. Check network and Gmail security settings.');
    }
  }
};

module.exports = {
  sendBookingConfirmation,
  sendTripStatusUpdate,
}; 