/**
 * Parse and decode a JWT token
 * @param {string} token - JWT token to decode
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export const parseToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const base64Url = parts[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Check if a token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true;

  const decodedToken = parseToken(token);
  if (!decodedToken || !decodedToken.exp) return true;

  // Get current time in seconds
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Check if token is expired (with 60 seconds buffer)
  return decodedToken.exp <= currentTime + 60;
};

/**
 * Get remaining token time in seconds
 * @param {string} token - JWT token to check
 * @returns {number} - Remaining time in seconds
 */
export const getTokenRemainingTime = (token) => {
  if (!token || typeof token !== 'string') return 0;

  const decodedToken = parseToken(token);
  if (!decodedToken || !decodedToken.exp) return 0;

  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, decodedToken.exp - currentTime);
};

/**
 * Extract user data from token
 * @param {string} token - JWT token to extract data from
 * @returns {object|null} - User data from token or null if invalid
 */
export const getTokenData = (token) => {
  if (!token) return null;
  const decoded = parseToken(token);
  if (!decoded) return null;
  return {
    userId: decoded.sub,
    role: decoded.role,
    status: decoded.status,
    isEmailVerified: decoded.isEmailVerified,
    isPhoneVerified: decoded.isPhoneVerified,
    type: decoded.type,
    iat: decoded.iat,
    exp: decoded.exp
  };
};

/**
 * Get access token from storage
 * @returns {string|null} - Access token or null if not found
 */
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Get refresh token from storage
 * @returns {string|null} - Refresh token or null if not found
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * Check if user is authenticated (has valid non-expired token)
 * @returns {boolean} - True if user has valid tokens
 */
export const isAuthenticated = () => {
  const token = getAccessToken();
  return token !== null && !isTokenExpired(token);
};

/**
 * Clear all auth data from localStorage
 */
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}; 