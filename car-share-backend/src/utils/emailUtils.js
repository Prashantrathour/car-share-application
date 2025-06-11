const fs = require('fs');
const path = require('path');

/**
 * Get the logo as a base64 string for embedding in emails
 * @returns {string} Base64 encoded logo
 */
const getLogoAsBase64 = () => {
  try {
    // Use absolute path from project root
    const logoPath = path.join(process.cwd(), 'src', 'public', 'images', 'carshare.svg');
    const logoBuffer = fs.readFileSync(logoPath);
    const base64Logo = logoBuffer.toString('base64');
    return `data:image/svg+xml;base64,${base64Logo}`;
  } catch (error) {
    console.error('Error reading logo file:', error);
    return null;
  }
};

module.exports = {
  getLogoAsBase64,
}; 