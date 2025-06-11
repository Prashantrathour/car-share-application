/**
 * Utility functions for OTP-based verification
 */

/**
 * Format a countdown timer as MM:SS
 * @param {number} countdown - Countdown in seconds
 * @returns {string} Formatted countdown string
 */
export const formatCountdown = (countdown) => {
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Create a countdown timer that updates every second
 * @param {number} initialTime - Initial countdown time in seconds
 * @param {function} onTick - Callback function that receives the current countdown value
 * @param {function} onComplete - Callback function that's called when countdown reaches zero
 * @returns {object} Timer control object with start, pause, resume, and stop methods
 */
export const createCountdownTimer = (initialTime, onTick, onComplete) => {
  let timerId = null;
  let remaining = initialTime;
  let isPaused = false;

  const tick = () => {
    if (isPaused) return;
    
    remaining -= 1;
    onTick(remaining);

    if (remaining <= 0) {
      clearInterval(timerId);
      timerId = null;
      if (onComplete) onComplete();
    }
  };

  return {
    start: () => {
      if (timerId === null) {
        remaining = initialTime;
        onTick(remaining);
        timerId = setInterval(tick, 1000);
      }
      return remaining;
    },
    pause: () => {
      isPaused = true;
      return remaining;
    },
    resume: () => {
      isPaused = false;
      return remaining;
    },
    stop: () => {
      if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
      }
      return remaining;
    },
    getRemaining: () => remaining
  };
};

/**
 * Validate a 6-digit OTP code
 * @param {string} otp - The OTP code to validate
 * @returns {boolean} Whether the OTP is valid
 */
export const validateOTP = (otp) => {
  return /^\d{6}$/.test(otp);
};

/**
 * Mask an email address for privacy
 * @param {string} email - Email address to mask
 * @returns {string} Masked email address
 */
export const maskEmail = (email) => {
  if (!email) return '';
  
  const [username, domain] = email.split('@');
  if (!username || !domain) return email;
  
  const maskedUsername = username.length <= 3 
    ? username.charAt(0) + '***'
    : username.charAt(0) + '***' + username.charAt(username.length - 1);
    
  return `${maskedUsername}@${domain}`;
};

/**
 * Mask a phone number for privacy
 * @param {string} phoneNumber - Phone number to mask 
 * @returns {string} Masked phone number
 */
export const maskPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Keep country code and last 4 digits
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length <= 4) return phoneNumber;
  
  const lastFour = digits.slice(-4);
  const countryCode = phoneNumber.startsWith('+') 
    ? phoneNumber.slice(0, 3) 
    : '';
    
  return `${countryCode}***${lastFour}`;
}; 