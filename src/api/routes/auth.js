import express from 'express';
import url from 'url';
import { TwitterApi } from 'twitter-api-v2';
import { stateMap, tokenMap } from '../storage.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { LINKEDIN_CREDENTIALS } from '../credentials.js';

dotenv.config();

const router = express.Router();

// Parse the environment variables
const TWITTER_API_KEY = process.env.TWITTER_API_KEY || 'your_twitter_api_key';
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET || 'your_twitter_api_secret';
const TWITTER_CLIENT_ID = 'dGlzTGlzaFZDZVZkWXhhWWlQRnI6MTpjaQ'; // Base64 encoded client ID
const TWITTER_CLIENT_SECRET = 'HuGEhEDL6PUCtgOkvwxNbiU9SpJH0t9KwHuLqJS5yL6DcChFI2';
const TWITTER_BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAABc51AEAAAAAMU3FrAK%2F4D%2B17c1jtGar%2F1jAz3A%3Dd2pFbiOgRbtZXzbJpi2ZI8wx8MTqBwLYw2pTNVQHbevkx9bo8h';

// Get LinkedIn credentials from separate file to ensure they're always available
const LINKEDIN_CLIENT_ID = LINKEDIN_CREDENTIALS.client_id;
const LINKEDIN_CLIENT_SECRET = LINKEDIN_CREDENTIALS.client_secret;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Get the frontend URL from environment or default to localhost:5173
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Log at startup to confirm
console.log('Auth router loaded with:');
console.log('- Twitter Client ID:', TWITTER_CLIENT_ID);
console.log('- Twitter Secret:', TWITTER_CLIENT_SECRET ? 'Set (hidden)' : 'not set');
console.log('- Twitter Bearer Token:', TWITTER_BEARER_TOKEN ? 'Set (hidden)' : 'not set');
console.log('- LinkedIn Client ID:', LINKEDIN_CLIENT_ID ? `${LINKEDIN_CLIENT_ID.substring(0, 4)}...` : 'not set');
console.log('- LinkedIn Secret:', LINKEDIN_CLIENT_SECRET ? 'Set (hidden)' : 'not set');
console.log('- Frontend URL:', FRONTEND_URL);

// Helper functions for OAuth 2.0 PKCE
function base64URLEncode(str) {
  return str
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

function generateCodeVerifier() {
  return base64URLEncode(crypto.randomBytes(32));
}

function generateCodeChallenge(verifier) {
  return base64URLEncode(sha256(verifier));
}

// Auth callback handler for OAuth (including Google)
router.get('/callback', (req, res) => {
  try {
    console.log('Auth callback called with query:', req.query);
    console.log('Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
    
    // Parse the query parameters
    const parsedUrl = url.parse(req.url, true);
    const { code, state, error } = parsedUrl.query;
    
    if (error) {
      console.error('Error in auth callback:', error);
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error)}`);
    }
    
    if (!code || !state) {
      console.error('Missing code or state in callback');
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Missing required parameters')}`);
    }
    
    // Verify the state
    const storedState = stateMap.get(state);
    if (!storedState) {
      console.error('Invalid state parameter');
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Invalid state parameter')}`);
    }
    
    // Delete the state from the map
    stateMap.delete(state);
    
    // Your existing callback logic
    // ...
    
    // Return a 302 Found response with a redirect URL
    return res.redirect(`${FRONTEND_URL}/auth/callback`);
  } catch (error) {
    console.error('Error processing callback:', error);
    return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Server error')}`);
  }
});

// Twitter OAuth 2.0 Routes
router.get('/twitter', async (req, res) => {
  try {
    console.log('Twitter Auth endpoint called');
    
    if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
      throw new Error('Twitter API credentials not configured');
    }
    
    // Generate a random state parameter
    const state = crypto.randomBytes(16).toString('hex');
    stateMap.set(state, {
      timestamp: Date.now(),
      service: 'twitter'
    });
    
    // Make sure callback URL exactly matches what's in your Twitter app settings
    const callbackUrl = `${FRONTEND_URL}/auth/twitter/callback`;
    console.log('Using Twitter callback URL:', callbackUrl);
    
    // Create Twitter OAuth 2.0 authorization URL with correct API v2 format
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.append('client_id', TWITTER_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', callbackUrl);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'tweet.read tweet.write users.read offline.access');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('code_challenge', base64URLEncode(sha256(state)));
    
    console.log('Generated Twitter OAuth URL:', authUrl.toString());
    
    // Return the authorization URL to the client
    res.json({ url: authUrl.toString() });
  } catch (error) {
    console.error('Error initiating Twitter OAuth:', error);
    res.status(500).json({ 
      error: 'Failed to initiate Twitter OAuth',
      details: error.message
    });
  }
});

router.get('/twitter/callback', async (req, res) => {
  try {
    console.log('Twitter callback received:', req.query);
    const { code, state, error, error_description } = req.query;
    
    if (error) {
      throw new Error(`${error}: ${error_description || 'Unknown error'}`);
    }
    
    if (!code) {
      throw new Error('Missing authorization code');
    }
    
    // Verify the state parameter
    const storedState = stateMap.get(state);
    if (!storedState) {
      throw new Error('Invalid or expired state parameter');
    }
    
    // Delete the used state
    stateMap.delete(state);
    
    // Exchange the authorization code for access token
    const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', `${FRONTEND_URL}/auth/twitter/callback`);
    params.append('client_id', TWITTER_CLIENT_ID);
    params.append('code_verifier', state); // Using state as code verifier
    
    try {
      // Make the token request
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64')}`
        },
        body: params
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Twitter token exchange error:', errorData);
        throw new Error(`Failed to exchange code for token: ${response.status}`);
      }
      
      const tokenData = await response.json();
      console.log('Token data received:', Object.keys(tokenData).join(', '));
      
      const { access_token, refresh_token, expires_in } = tokenData;
      
      // Get user information
      const userResponse = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error(`Failed to retrieve user data: ${userResponse.status}`);
      }
      
      const userData = await userResponse.json();
      console.log('Twitter user data:', userData);
      
      const { data } = userData;
      const { username, id } = data;
      
      console.log('Twitter authentication successful for:', username);
      
      // Calculate token expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);
      
      // Store the credentials
      const userCredentials = {
        twitter_id: id,
        username: username,
        access_token: access_token,
        refresh_token: refresh_token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      };
      
      // Store in memory (in production, save to database)
      tokenMap.set(id, userCredentials);
      
      console.log('Twitter credentials saved for user:', id);
      
      // Redirect to frontend with tokens and user info
      const redirectUrl = `${FRONTEND_URL}/social-credentials?` +
        `twitter_access_token=${encodeURIComponent(access_token)}` +
        `&twitter_expires_at=${encodeURIComponent(expiresAt.toISOString())}` +
        (refresh_token ? `&twitter_refresh_token=${encodeURIComponent(refresh_token)}` : '') +
        `&twitter_username=${encodeURIComponent(username)}` +
        `&twitter_user_id=${encodeURIComponent(id)}`;
      
      return res.redirect(redirectUrl);
    } catch (tokenError) {
      console.error('Twitter token exchange or user data error:', tokenError);
      return res.redirect(`${FRONTEND_URL}/social-credentials?error=${encodeURIComponent(tokenError.message)}`);
    }
  } catch (error) {
    console.error('Twitter callback error:', error);
    return res.redirect(`${FRONTEND_URL}/social-credentials?error=${encodeURIComponent(error.message)}`);
  }
});

// LinkedIn OAuth Routes
router.get('/linkedin', async (req, res) => {
  try {
    console.log('LinkedIn Auth endpoint called');
    
    // Generate a random state parameter
    const state = crypto.randomBytes(16).toString('hex');
    stateMap.set(state, {
      timestamp: Date.now(),
      service: 'linkedin'
    });
    
    // Create OAuth URL with OpenID Connect scopes
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', LINKEDIN_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', `${FRONTEND_URL}/auth/linkedin/callback`);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'openid profile email');
    
    console.log('Generated LinkedIn OAuth URL:', authUrl.toString());
    
    // Return the authorization URL to the client
    res.json({ url: authUrl.toString() });
  } catch (error) {
    console.error('Error initiating LinkedIn OAuth:', error);
    res.status(500).json({ 
      error: 'Failed to initiate LinkedIn OAuth',
      details: error.message
    });
  }
});

// Debugging endpoint to verify LinkedIn route is accessible
router.get('/linkedin/test', async (req, res) => {
  try {
    console.log('LinkedIn test endpoint called');
    console.log('Direct ID value:', LINKEDIN_CLIENT_ID);
    console.log('Direct secret available:', Boolean(LINKEDIN_CLIENT_SECRET));
    
    // Return direct information about what values are being used
    res.json({
      credentials: {
        actual_client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET ? 'Present' : 'Missing',
        env_linkedin_id: process.env.LINKEDIN_CLIENT_ID || 'not in env',
        env_linkedin_secret: process.env.LINKEDIN_CLIENT_SECRET ? 'Present in env' : 'not in env'
      },
      constant_values: {
        hardcoded_id: '77gusscneoxu7s',
        hardcoded_secret: 'WPL_AP1.M6MzyR1FkhUzuIQH.Vi551Q=='
      },
      callback_url: `${FRONTEND_URL}/auth/linkedin/callback`,
      current_time: new Date().toISOString(),
      message: 'LinkedIn API route is working correctly'
    });
  } catch (error) {
    console.error('Error in LinkedIn test endpoint:', error);
    res.status(500).json({ 
      error: 'Error testing LinkedIn credentials',
      details: error.message 
    });
  }
});

router.get('/linkedin/callback', async (req, res) => {
  try {
    console.log('LinkedIn callback received:', req.query);
    const { code, state, error, error_description } = req.query;
    
    if (error) {
      throw new Error(`${error}: ${error_description || 'Unknown error'}`);
    }
    
    if (!code) {
      throw new Error('Missing authorization code');
    }
    
    // Verify the state parameter
    const storedState = stateMap.get(state);
    if (!storedState) {
      throw new Error('Invalid or expired state parameter');
    }
    
    // Delete the used state
    stateMap.delete(state);
    
    // Exchange the authorization code for access token
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', `${FRONTEND_URL}/auth/linkedin/callback`);
    params.append('client_id', LINKEDIN_CLIENT_ID);
    params.append('client_secret', LINKEDIN_CLIENT_SECRET);
    
    try {
      // Make the token request
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('LinkedIn token exchange error:', errorData);
        throw new Error(`Failed to exchange code for token: ${response.status}`);
      }
      
      const tokenData = await response.json();
      console.log('Token data received:', Object.keys(tokenData).join(', '));
      
      const { access_token, expires_in, refresh_token } = tokenData;
      
      // Get user information using OpenID Connect userinfo endpoint
      const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      if (!userInfoResponse.ok) {
        throw new Error(`Failed to retrieve user info: ${userInfoResponse.status}`);
      }
      
      const userInfo = await userInfoResponse.json();
      console.log('LinkedIn user info:', userInfo);
      
      const { name, email, sub: id } = userInfo;
      
      console.log('LinkedIn authentication successful for:', name);
      
      // Calculate token expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);
      
      // Store the credentials
      const userCredentials = {
        linkedin_id: id,
        username: name,
        email: email,
        access_token: access_token,
        refresh_token: refresh_token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      };
      
      // Store in memory (in production, save to database)
      tokenMap.set(id, userCredentials);
      
      console.log('LinkedIn credentials saved for user:', id);
      
      // Redirect to frontend with tokens and user info
      const redirectUrl = `${FRONTEND_URL}/social-credentials?` +
        `linkedin_access_token=${encodeURIComponent(access_token)}` +
        `&linkedin_expires_at=${encodeURIComponent(expiresAt.toISOString())}` +
        (refresh_token ? `&linkedin_refresh_token=${encodeURIComponent(refresh_token)}` : '') +
        `&linkedin_username=${encodeURIComponent(name)}` +
        `&linkedin_user_id=${encodeURIComponent(id)}` +
        (email ? `&linkedin_email=${encodeURIComponent(email)}` : '');
      
      return res.redirect(redirectUrl);
    } catch (tokenError) {
      console.error('LinkedIn token exchange or userinfo error:', tokenError);
      return res.redirect(`${FRONTEND_URL}/social-credentials?error=${encodeURIComponent(tokenError.message)}`);
    }
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return res.redirect(`${FRONTEND_URL}/social-credentials?error=${encodeURIComponent(error.message)}`);
  }
});

// Add a test endpoint to verify Twitter API credentials
router.get('/twitter/test', async (req, res) => {
  try {
    console.log('Testing Twitter OAuth 2.0 credentials');
    console.log('Client ID present:', Boolean(TWITTER_CLIENT_ID));
    console.log('Client Secret present:', Boolean(TWITTER_CLIENT_SECRET));
    
    // Return information about the credentials
    res.json({
      credentials: {
        client_id_present: Boolean(TWITTER_CLIENT_ID),
        client_secret_present: Boolean(TWITTER_CLIENT_SECRET),
        client_id_first_10: TWITTER_CLIENT_ID ? TWITTER_CLIENT_ID.substring(0, 10) + '...' : 'missing',
      },
      callback_url: 'http://localhost:5173/auth/twitter/callback',
      instructions: 'Verify this callback URL matches exactly what is in your Twitter Developer Portal'
    });
  } catch (error) {
    console.error('Error testing Twitter credentials:', error);
    res.status(500).json({ error: 'Error testing credentials' });
  }
});

export default router; 