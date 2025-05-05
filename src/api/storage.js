/**
 * Simple in-memory storage for OAuth tokens and states.
 * 
 * In a production environment, this should be replaced with a more robust
 * solution like Redis or a database to handle multiple server instances
 * and server restarts.
 */

// Map to store temporary state values for OAuth flows
const stateMap = new Map();

// Map to store temporary tokens for OAuth flows
const tokenMap = new Map();

// Set expiration for items (3 hours)
const EXPIRATION_MS = 3 * 60 * 60 * 1000;

// Function to clean up expired tokens and states
const cleanupExpired = () => {
  const now = Date.now();
  
  for (const [key, value] of stateMap.entries()) {
    if (value.timestamp && now - value.timestamp > EXPIRATION_MS) {
      stateMap.delete(key);
    }
  }
  
  for (const [key, value] of tokenMap.entries()) {
    if (value.timestamp && now - value.timestamp > EXPIRATION_MS) {
      tokenMap.delete(key);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupExpired, 60 * 60 * 1000);

// Export as ES modules
export { stateMap, tokenMap }; 