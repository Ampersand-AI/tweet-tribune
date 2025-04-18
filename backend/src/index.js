import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import tweetAnalysisRouter from './routes/tweetAnalysis.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:8081'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.use(express.json());

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
});

// Store temporary OAuth tokens (in production, use a database)
const tempTokens = new Map();

// Generate Twitter OAuth URL
app.get('/auth/twitter', async (req, res) => {
  try {
    const { url, oauth_token, oauth_token_secret } = await twitterClient.generateAuthLink(
      'http://localhost:8080/twitter/callback'
    );

    // Store the token secret temporarily
    tempTokens.set(oauth_token, oauth_token_secret);

    res.json({ url, oauth_token, oauth_token_secret });
  } catch (error) {
    console.error('Error generating auth link:', error);
    res.status(500).json({ error: 'Failed to generate Twitter auth link' });
  }
});

// Handle Twitter OAuth callback
app.get('/auth/twitter/callback', async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;

  try {
    const savedSecret = tempTokens.get(oauth_token);
    if (!savedSecret) {
      throw new Error('OAuth token not found');
    }

    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: oauth_token,
      accessSecret: savedSecret,
    });

    const { accessToken, accessSecret } = await client.login(oauth_verifier);

    // Clean up temporary token
    tempTokens.delete(oauth_token);

    // In production, store these tokens in a database
    res.redirect(`http://localhost:5173/social-credentials?accessToken=${accessToken}&accessSecret=${accessSecret}`);
  } catch (error) {
    console.error('Error in Twitter callback:', error);
    res.status(500).json({ error: 'Failed to complete Twitter authentication' });
  }
});

// Tweet on user's behalf
app.post('/api/tweet', async (req, res) => {
  const { accessToken, accessSecret, message } = req.body;

  try {
    const userClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken,
      accessSecret,
    });

    const result = await userClient.v2.tweet(message);
    res.json({ success: true, tweet: result });
  } catch (error) {
    console.error('Error tweeting:', error);
    res.status(500).json({ error: 'Failed to post tweet' });
  }
});

// Routes
app.use('/api/analyze-tweet', tweetAnalysisRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 