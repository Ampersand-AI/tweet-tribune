import express from 'express';
import { analyzeTweet } from '../services/tweetAnalysis.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { tweetUrl } = req.body;
    
    if (!tweetUrl) {
      return res.status(400).json({ error: 'Tweet URL is required' });
    }

    console.log('Analyzing tweet:', tweetUrl);
    const analysis = await analyzeTweet(tweetUrl);
    console.log('Analysis completed successfully');
    
    res.json({ analysis });
  } catch (error) {
    console.error('Error in tweet analysis route:', error);
    res.status(500).json({ 
      error: 'Failed to analyze tweet',
      details: error.message 
    });
  }
});

export default router; 