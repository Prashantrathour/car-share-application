# Email Notification Setup

This document provides instructions on how to set up email notifications for the Car Share application.

## Environment Variables

Add the following environment variables to your `.env` file:

```
# Email Configuration
EMAIL_ENABLED=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
```

## Gmail Setup

If you're using Gmail, you need to create an App Password:

1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. Scroll down to "App passwords"
4. Select "Mail" and your device
5. Click "Generate"
6. Use the generated 16-character password as your `SMTP_PASS`

## Testing Email Configuration

You can test your email configuration by running:

```bash
node src/scripts/test-email.js
```

This will:
1. Verify your SMTP connection
2. Send a test email to yourself

## Troubleshooting

### "Missing credentials for PLAIN" Error

This error occurs when:
- The SMTP credentials are not properly set
- You're using your regular Gmail password instead of an App Password
- The email service is blocking the authentication method

### "Invalid login" Error

This error occurs when:
- The username or password is incorrect
- You're using an App Password but with the wrong email address

### "Connection refused" Error

This error occurs when:
- The SMTP server is not accessible
- A firewall is blocking the connection
- The port is incorrect

## Email Templates

The application sends the following types of emails:

1. **Booking Confirmation**: Sent when a user books a trip
2. **Trip Status Update**: Sent when a trip status changes (confirmed, cancelled, completed)

You can customize these templates in the `src/services/notification.service.js` file. 