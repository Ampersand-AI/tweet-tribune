import OpenAI from 'openai';

// Check if OpenAI API key is available
let openai = null;
try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key') {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.warn('Missing OpenAI API key - will use mock responses');
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

// Mock analysis function when no API key is available
const mockAnalyzeTweet = (tweetUrl) => {
  console.log('Using mock analysis for:', tweetUrl);
  
  // Extract username and tweet ID from URL for a more personalized mock response
  const urlParts = tweetUrl.split('/');
  const username = urlParts[urlParts.indexOf('twitter.com') + 1] || 'user';
  
  return `
# Tweet Analysis for @${username}

## Sentiment Analysis
This tweet appears to have a neutral to slightly positive sentiment. The language used is informative and engaging without strong emotional markers.

## Key Themes and Topics
- Social media engagement
- Content sharing
- Digital communication
- Online networking

## Engagement Analysis
This tweet has moderate engagement potential. It uses clear language and direct communication which typically performs well on Twitter. The content appears to be straightforward and accessible to a general audience.

## Potential Impact and Reach
The tweet could reach a moderate audience, particularly those interested in social media and online communication. Its straightforward nature makes it easily shareable.

## Suggestions for Improvement
- Consider adding relevant hashtags to increase discoverability
- Including a visual element could boost engagement by up to 150%
- Posing a question might encourage more replies and interactions
- Timing the post during peak hours could increase initial visibility

This is a mock analysis generated because no OpenAI API key was provided.
`;
}

export const analyzeTweet = async (tweetUrl) => {
  try {
    console.log('Starting tweet analysis for URL:', tweetUrl);
    
    // If no OpenAI client, use mock response
    if (!openai) {
      return mockAnalyzeTweet(tweetUrl);
    }
    
    // Extract tweet ID from URL
    const tweetId = tweetUrl.split('/').pop();
    console.log('Extracted tweet ID:', tweetId);
    
    // Prepare prompt for OpenAI
    const prompt = `Analyze this tweet URL and provide a comprehensive report:

Tweet URL: ${tweetUrl}

Please provide a detailed analysis including:
1. Sentiment analysis
2. Key themes and topics
3. Engagement analysis
4. Potential impact and reach
5. Suggestions for improvement (if any)

Format the response in clear paragraphs with proper spacing.`;

    console.log('Sending request to OpenAI...');
    // Get analysis from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a social media analyst with expertise in Twitter content analysis. Provide detailed, professional insights about tweets. If you can't access the tweet directly, analyze the URL and provide general insights about the potential content and impact."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log('Received response from OpenAI');
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error in analyzeTweet:', error);
    if (error.response) {
      console.error('OpenAI API Error:', error.response.data);
    }
    // Fallback to mock response on error
    return mockAnalyzeTweet(tweetUrl);
  }
}; 