const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

/**
 * Create a Nodemailer transporter using Gmail SMTP
 * For production, consider using SendGrid, Mailgun, Amazon SES, etc.
 */
const transporter = nodemailer.createTransport({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: config.email.smtp.secure,
  auth: {
    user: config.email.smtp.auth.user,
    pass: config.email.smtp.auth.pass,
  },
});

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} html
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html) => {
  const msg = {
    from: config.email.from,
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(msg);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // You should replace this URL with your actual frontend URL
  const verificationUrl = `${config.clientUrl}/verify-email?token=${token}`;
  
  const text = `Dear user,
  
To verify your email, please click on this link: ${verificationUrl}
  
If you did not create an account, please ignore this email.`;

  const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
    <h2 style="color: #333;">Verify Your Email</h2>
    <p>Thank you for registering! Please click the button below to verify your email address:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
    </div>
    <p>Or copy and paste this link in your browser:</p>
    <p style="word-break: break-all; color: #666;">
      <a href="${verificationUrl}">${verificationUrl}</a>
    </p>
    <p style="margin-top: 40px; font-size: 12px; color: #999;">If you did not create an account, please ignore this email.</p>
  </div>`;

  return sendEmail(to, subject, text, html);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset Password';
  const resetPasswordUrl = `${config.clientUrl}/reset-password?token=${token}`;
  
  const text = `Dear user,
  
To reset your password, please click on this link: ${resetPasswordUrl}
  
If you did not request a password reset, please ignore this email.`;

  const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
    <h2 style="color: #333;">Reset Your Password</h2>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetPasswordUrl}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
    </div>
    <p>Or copy and paste this link in your browser:</p>
    <p style="word-break: break-all; color: #666;">
      <a href="${resetPasswordUrl}">${resetPasswordUrl}</a>
    </p>
    <p style="margin-top: 40px; font-size: 12px; color: #999;">If you did not request a password reset, please ignore this email.</p>
  </div>`;

  return sendEmail(to, subject, text, html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
}; 