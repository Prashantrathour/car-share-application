const config = {
  smtp: {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    }
  },
  from: process.env.EMAIL_FROM || 'noreply@car-share.com',
  enabled: process.env.EMAIL_ENABLED === 'true',
};

// Validate email configuration
const validateConfig = () => {
 

  if (!config.enabled) {
    console.warn('Email notifications are disabled. Set EMAIL_ENABLED=true to enable.');
    return false;
  }

  if (!config.smtp.auth.user || !config.smtp.auth.pass) {
    console.warn('SMTP credentials are missing. Email notifications will not work.');
    console.warn('Please set SMTP_USER and SMTP_PASS environment variables.');
    return false;
  }

  return true;
};

config.isValid = validateConfig();

module.exports = config; 