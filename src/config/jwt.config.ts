/**
 * JWT Configuration Constants
 * Centralized configuration for JWT token expiration
 */
export const JWT_CONFIG = {
  /**
   * JWT Token expiration time
   * Format: number + unit (s = seconds, m = minutes, h = hours, d = days)
   * Default: 7 days
   */
  EXPIRES_IN: '7d',
  
  /**
   * Refresh token expiration in days
   * Used for calculating refresh token expiry date
   */
  REFRESH_TOKEN_EXPIRES_DAYS: 7,
  
  /**
   * JWT Secret key from environment variable
   */
  SECRET: process.env.JWT_SECRET || 'JWT_SECRET',
} as const;

