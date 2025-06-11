require('dotenv').config();
const nodemailer = require('nodemailer');
const config = require('../config/config');

async function testEmailConfig() {
  console.log('Testing email configuration...');
  console.log('Email enabled:', process.env.EMAIL_ENABLED);
  console.log('SMTP service:', config.email.smtp.service);
  console.log('SMTP user:', process.env.SMTP_USER || 'Not set');
  console.log('SMTP password:', process.env.SMTP_PASS ? 'Set' : 'Not set');
  console.log('From address:', process.env.EMAIL_FROM || 'Not set');

  if (!process.env.EMAIL_ENABLED || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Email configuration is not valid. Please check your environment variables.');
    return;
  }

  try {
    // Create transporter with more secure settings
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      }
    });

    // Verify connection
    console.log('Verifying SMTP connection...');
    const info = await transporter.verify();
    console.log('SMTP connection successful!');

    // Send test email
    console.log('Sending test email...');
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'Test Email from Car Share App',
      text: 'This is a test email to verify your email configuration is working correctly.',
      html: '<p>This is a <b>test email</b> to verify your email configuration is working correctly.</p>',
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully!');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('Error testing email configuration:', error);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check your Gmail App Password.');
      console.error('Make sure you\'re using an App Password, not your regular Gmail password.');
      console.error('You can generate an App Password at: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ESOCKET') {
      console.error('Connection error. This might be due to:');
      console.error('1. Network connectivity issues');
      console.error('2. Gmail\'s security settings blocking the connection');
      console.error('3. Antivirus or firewall blocking the connection');
      console.error('\nTry the following:');
      console.error('1. Check your internet connection');
      console.error('2. Make sure you have 2-Step Verification enabled in your Google Account');
      console.error('3. Generate a new App Password');
      console.error('4. Temporarily disable antivirus/firewall to test');
    }
  }
}

// Run the test
testEmailConfig(); 