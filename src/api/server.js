import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import tweetAnalysisRouter from './routes/tweetAnalysis.js';
import authRouter from './routes/auth.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Log environment variables availability for debugging
console.log('Environment variables loaded:');
console.log('TWITTER_API_KEY available:', Boolean(process.env.TWITTER_API_KEY));
console.log('TWITTER_API_SECRET available:', Boolean(process.env.TWITTER_API_SECRET));
console.log('TWITTER_API_KEY value (first 4 chars):', process.env.TWITTER_API_KEY ? process.env.TWITTER_API_KEY.substring(0, 4) : 'none');
console.log('LINKEDIN_CLIENT_ID available:', Boolean(process.env.LINKEDIN_CLIENT_ID));
console.log('LINKEDIN_CLIENT_SECRET available:', Boolean(process.env.LINKEDIN_CLIENT_SECRET));
console.log('LINKEDIN_CLIENT_ID value (first 4 chars):', process.env.LINKEDIN_CLIENT_ID ? process.env.LINKEDIN_CLIENT_ID.substring(0, 4) : 'none');

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:8081'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Routes - ensure paths don't conflict
app.use('/api/analyze-tweet', tweetAnalysisRouter);
app.use('/auth', authRouter); // All auth routes including /auth/twitter go here

// Tweet on user's behalf (API route, not auth route)
app.post('/api/tweet', async (req, res) => {
  try {
    // Get the Twitter API credentials from environment variables
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
      throw new Error('Twitter API credentials are missing');
    }
    
    // Get authorization token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization token is missing or invalid');
    }
    
    // Extract the access token
    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!accessToken) {
      throw new Error('Access token is required');
    }
    
    const { message } = req.body;
    if (!message || !message.trim()) {
      throw new Error('Tweet message is required');
    }
    
    console.log('Posting tweet with access token:', accessToken.substring(0, 10) + '...');
    console.log('Tweet message:', message);
    
    // Import the Twitter API library
    const { TwitterApi } = await import('twitter-api-v2');
    
    // For OAuth 2.0, we just need the access token
    const userClient = new TwitterApi(accessToken);
    
    // Post the tweet using Twitter API v2
    const result = await userClient.v2.tweet(message);
    
    console.log('Tweet posted successfully:', result);
    
    res.json({ success: true, tweet: result });
  } catch (error) {
    console.error('Error tweeting:', error);
    res.status(500).json({ 
      error: 'Failed to post tweet', 
      details: error.message 
    });
  }
});

// Simple in-memory cache for Twitter stats
const twitterStatsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Twitter stats endpoint
app.get('/api/twitter/stats', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Extract the token and ensure it's in the correct format
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: 'Invalid authorization token format' });
    }

    // Check cache first
    const cachedData = twitterStatsCache.get(token);
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      return res.json({
        ...cachedData.data,
        _cached: true,
        _timestamp: cachedData.timestamp
      });
    }

    const { TwitterApi } = await import('twitter-api-v2');
    
    try {
      // Initialize the client with the bearer token
      const client = new TwitterApi(token);

      // First verify the token is valid by getting user info
      const me = await client.v2.me();
      
      if (!me.data) {
        return res.status(401).json({ 
          error: 'Invalid Twitter token',
          details: 'Could not retrieve user information'
        });
      }

      // Get user's tweets with pagination and proper error handling
      const tweets = await client.v2.userTimeline(me.data.id, {
        max_results: 100,
        'tweet.fields': ['public_metrics', 'created_at']
      });

      // Ensure we have valid data
      const tweetData = tweets.data || [];
      const totalPosts = tweetData.length;
      
      // Calculate engagement metrics with proper null checks
      const engagement = tweetData.reduce((acc, tweet) => {
        const metrics = tweet.public_metrics || {};
        return acc + (metrics.like_count || 0) +
                    (metrics.retweet_count || 0) +
                    (metrics.reply_count || 0);
      }, 0);

      // Prepare response data
      const responseData = {
        total_posts: totalPosts,
        engagement: engagement,
        change_percentage: 0,
        previous_engagement_rate: 0,
        _timestamp: Date.now()
      };

      // Cache the response
      twitterStatsCache.set(token, {
        data: responseData,
        timestamp: Date.now()
      });

      res.json(responseData);

    } catch (apiError) {
      console.error('Twitter API Error:', apiError);
      
      // Handle specific Twitter API errors
      if (apiError.code === 401 || apiError.code === 403) {
        return res.status(401).json({ 
          error: 'Invalid or expired Twitter token',
          details: apiError.message
        });
      }
      
      if (apiError.code === 429) {
        // If we have cached data, return it even if expired
        const cachedData = twitterStatsCache.get(token);
        if (cachedData) {
          const resetTime = apiError.rateLimit?.reset ? new Date(apiError.rateLimit.reset * 1000) : null;
          return res.json({
            ...cachedData.data,
            _cached: true,
            _error: 'Rate limit exceeded, showing cached data',
            _timestamp: cachedData.timestamp,
            _rateLimitReset: resetTime
          });
        }
        
        return res.status(429).json({ 
          error: 'Twitter API rate limit exceeded',
          details: 'Please try again in a few minutes',
          resetTime: apiError.rateLimit?.reset ? new Date(apiError.rateLimit.reset * 1000) : null
        });
      }

      // Log the full error for debugging
      console.error('Full Twitter API Error:', {
        code: apiError.code,
        message: apiError.message,
        data: apiError.data,
        rateLimit: apiError.rateLimit
      });

      return res.status(500).json({ 
        error: 'Twitter API error',
        details: apiError.message
      });
    }
  } catch (error) {
    console.error('Error in Twitter stats endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Twitter statistics',
      details: error.message
    });
  }
});

// LinkedIn OpenID Connect configuration
const LINKEDIN_CONFIG = {
  clientId: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  redirectUri: 'http://localhost:3001/auth/linkedin/callback',
  scopes: [
    'openid',
    'profile',
    'email',
    'r_liteprofile',
    'r_emailaddress',
    'w_member_social'
  ],
  authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  userInfoUrl: 'https://api.linkedin.com/v2/userinfo'
};

// LinkedIn stats endpoint
app.get('/api/linkedin/stats', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: 'Invalid authorization token format' });
    }

    // Check if LinkedIn credentials are available
    if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
      console.error('LinkedIn credentials not found in environment variables');
      return res.status(500).json({ 
        error: 'LinkedIn API configuration error',
        details: 'LinkedIn credentials not properly configured'
      });
    }

    try {
      // For now, return mock data since LinkedIn API requires additional setup
      // To fix the "Not enough permissions" error, you need to:
      // 1. Go to your LinkedIn Developer Console
      // 2. Enable OpenID Connect
      // 3. Add these OAuth 2.0 scopes to your app:
      //    - openid
      //    - profile
      //    - email
      // 4. Update your auth URL to include these scopes
      // 5. Re-authenticate users to get new tokens with these permissions
      res.json({
        total_posts: 12,
        engagement: 450,
        change_percentage: 5.2,
        previous_engagement_rate: 42.3,
        _note: 'Using mock data - To enable real LinkedIn data, please update your app to use OpenID Connect and re-authenticate',
        _requiredScopes: ['openid', 'profile', 'email'],
        _timestamp: Date.now()
      });

    } catch (apiError) {
      console.error('LinkedIn API Error:', apiError);
      
      // Handle specific LinkedIn API errors
      if (apiError.code === 401 || apiError.code === 403) {
        return res.status(401).json({ 
          error: 'Invalid or expired LinkedIn token',
          details: 'Please re-authenticate with LinkedIn to get the required permissions'
        });
      }
      
      if (apiError.code === 429) {
        return res.status(429).json({ 
          error: 'LinkedIn API rate limit exceeded',
          details: 'Please try again in a few minutes'
        });
      }

      // Log the full error for debugging
      console.error('Full LinkedIn API Error:', {
        code: apiError.code,
        message: apiError.message,
        data: apiError.data
      });

      return res.status(500).json({ 
        error: 'LinkedIn API error',
        details: apiError.message
      });
    }
  } catch (error) {
    console.error('Error in LinkedIn stats endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to fetch LinkedIn statistics',
      details: error.message
    });
  }
});

// LinkedIn post endpoint
app.post('/api/linkedin/post', async (req, res) => {
  try {
    // Get authorization token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authorization token is missing or invalid',
        details: 'A valid LinkedIn OAuth token is required'
      });
    }
    
    // Extract the access token
    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Access token is required',
        details: 'The LinkedIn access token is missing'
      });
    }
    
    // Get the message content
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ 
        error: 'Message is required',
        details: 'The post content cannot be empty'
      });
    }
    
    // Log the request
    console.log('LinkedIn post request:');
    console.log('- Token:', accessToken.substring(0, 10) + '...');
    console.log('- Message:', message);

    // First, get the user's profile to get their URN
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Cache-Control': 'no-cache'
      }
    });

    if (!profileResponse.ok) {
      const errorData = await profileResponse.json();
      console.error('LinkedIn profile error:', errorData);
      throw new Error(`Failed to get LinkedIn profile: ${errorData.message || profileResponse.statusText}`);
    }

    const profileData = await profileResponse.json();
    console.log('LinkedIn profile data:', profileData);
    const authorUrn = `urn:li:person:${profileData.id}`;

    // Prepare the share content
    const shareContent = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: message
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    console.log('Sending share content:', JSON.stringify(shareContent, null, 2));

    // Make the share request
    const shareResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(shareContent)
    });

    if (!shareResponse.ok) {
      const errorData = await shareResponse.json();
      console.error('LinkedIn share error:', errorData);
      throw new Error(`Failed to create LinkedIn post: ${errorData.message || shareResponse.statusText}`);
    }

    const shareData = await shareResponse.json();
    console.log('LinkedIn share response:', shareData);
    
    // Return success response with the actual post ID
    res.json({
      success: true,
      message: 'Post created successfully on LinkedIn',
      post_id: shareData.id,
      timestamp: new Date().toISOString(),
      linkedin_url: `https://www.linkedin.com/feed/update/${shareData.id}`
    });
  } catch (error) {
    console.error('Error in LinkedIn post endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to handle LinkedIn post request',
      details: error.message
    });
  }
});

// LinkedIn auth endpoint
app.get('/auth/linkedin', (req, res) => {
  const authUrl = new URL(LINKEDIN_CONFIG.authUrl);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', LINKEDIN_CONFIG.clientId);
  authUrl.searchParams.append('redirect_uri', LINKEDIN_CONFIG.redirectUri);
  authUrl.searchParams.append('scope', LINKEDIN_CONFIG.scopes.join(' '));
  authUrl.searchParams.append('state', crypto.randomBytes(16).toString('hex'));

  res.redirect(authUrl.toString());
});

// LinkedIn callback endpoint
app.get('/auth/linkedin/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      throw new Error('No authorization code received');
    }

    // Exchange code for access token
    const tokenResponse = await fetch(LINKEDIN_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINKEDIN_CONFIG.redirectUri,
        client_id: LINKEDIN_CONFIG.clientId,
        client_secret: LINKEDIN_CONFIG.clientSecret
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();

    // Get user info using the access token
    const userResponse = await fetch(LINKEDIN_CONFIG.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();

    // Store the token in localStorage (you might want to use a more secure method)
    res.send(`
      <script>
        localStorage.setItem('linkedin_access_token', '${tokenData.access_token}');
        window.location.href = '/dashboard';
      </script>
    `);
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    res.status(500).send('Authentication failed');
  }
});

// Scheduled posts endpoint
app.get('/api/posts/scheduled', async (req, res) => {
  try {
    // This would typically come from your database
    // For now, returning mock data
    res.json({
      total: 0,
      change: 0
    });
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled posts' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app; 