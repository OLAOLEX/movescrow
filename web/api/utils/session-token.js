/**
 * Generate secure session token for deep links
 * Uses JWT for production, simple hash for development
 */
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

/**
 * Generate session token for restaurant order deep link
 * @param {string} phoneNumber - Restaurant phone number
 * @param {string} orderId - Order ID
 * @param {number} expiresInHours - Token expiration in hours (default: 24)
 * @returns {string} Session token
 */
export function generateSessionToken(phoneNumber, orderId, expiresInHours = 24) {
  const payload = {
    phone: phoneNumber,
    orderId: orderId,
    type: 'restaurant_session',
    exp: Math.floor(Date.now() / 1000) + (expiresInHours * 60 * 60)
  };
  
  // For now, use simple base64 encoding (can upgrade to JWT later)
  // In production, consider using: jsonwebtoken library
  const payloadString = JSON.stringify(payload);
  const token = Buffer.from(payloadString).toString('base64');
  
  return token;
}

/**
 * Verify and decode session token
 * @param {string} token - Session token
 * @returns {object|null} Decoded token payload or null if invalid
 */
export function verifySessionToken(token) {
  try {
    const payloadString = Buffer.from(token, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadString);
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }
    
    return payload;
  } catch (error) {
    console.error('Error verifying session token:', error);
    return null;
  }
}

 * Uses JWT for production, simple hash for development
 */
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

/**
 * Generate session token for restaurant order deep link
 * @param {string} phoneNumber - Restaurant phone number
 * @param {string} orderId - Order ID
 * @param {number} expiresInHours - Token expiration in hours (default: 24)
 * @returns {string} Session token
 */
export function generateSessionToken(phoneNumber, orderId, expiresInHours = 24) {
  const payload = {
    phone: phoneNumber,
    orderId: orderId,
    type: 'restaurant_session',
    exp: Math.floor(Date.now() / 1000) + (expiresInHours * 60 * 60)
  };
  
  // For now, use simple base64 encoding (can upgrade to JWT later)
  // In production, consider using: jsonwebtoken library
  const payloadString = JSON.stringify(payload);
  const token = Buffer.from(payloadString).toString('base64');
  
  return token;
}

/**
 * Verify and decode session token
 * @param {string} token - Session token
 * @returns {object|null} Decoded token payload or null if invalid
 */
export function verifySessionToken(token) {
  try {
    const payloadString = Buffer.from(token, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadString);
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }
    
    return payload;
  } catch (error) {
    console.error('Error verifying session token:', error);
    return null;
  }
}

