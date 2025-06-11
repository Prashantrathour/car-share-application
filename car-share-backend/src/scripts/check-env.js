require('dotenv').config();

console.log('Environment Variables:');
console.log('EMAIL_ENABLED:', process.env.EMAIL_ENABLED);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Set (hidden)' : 'Not set');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

// Check if .env file exists
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
console.log('\n.env file path:', envPath);
console.log('.env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('\n.env file contents:');
  const envContents = fs.readFileSync(envPath, 'utf8');
  console.log(envContents);
} 