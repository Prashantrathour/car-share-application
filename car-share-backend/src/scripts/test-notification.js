require('dotenv').config();
const nodemailer = require('nodemailer');
const config = require('../config/config');
const path = require('path');
const fs = require('fs');
async function testEmailService() {
  try {
    console.log('Testing Email Service...\n');

    // Create transporter
    const transporter = nodemailer.createTransport(config.email.smtp);
    const logoPath = path.join(__dirname, '../public/images/carshare.jpg');
    console.log('Logo path:', logoPath);
    
    // Verify connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection successful!');

    // Send test email
    console.log('\nSending test email...');
    const mailOptions = {
      from: config.email.from,
      to: 'prathour884@gmail.com',
      subject: 'Test Email from Car Share App',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from the Car Share application.</p>
        <p>If you received this email, the email service is working correctly!</p>
        <br>
        <p>Time sent: ${new Date().toLocaleString()}</p>
      `,
      attachments: []
    };

    // Add logo as an attachment if it exists
    if (fs.existsSync(logoPath)) {
      console.log('Adding logo as attachment');
      mailOptions.attachments.push({
        filename: 'carshare-logo.jpg',
        path: logoPath
      });
    } else {
      console.warn('Logo file not found at:', logoPath);
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);

    console.log('\nAll email tests completed successfully!');
  } catch (error) {
    console.error('Error during email testing:', error);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check your Gmail App Password.');
      console.error('Visit https://myaccount.google.com/apppasswords to generate an App Password.');
    } else if (error.code === 'ESOCKET') {
      console.error('Connection error. Check network and Gmail security settings.');
    }
  }
}

// Run the tests
testEmailService(); 