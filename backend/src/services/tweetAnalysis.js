import { Configuration, OpenAIApi } from 'openai';

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const analyzeTweet = async (tweetUrl) => {
  try {
    console.log('Starting tweet analysis for URL:', tweetUrl);
    
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
    const completion = await openai.createChatCompletion({
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
    return completion.data.choices[0].message.content;
  } catch (error) {
    console.error('Error in analyzeTweet:', error);
    if (error.response) {
      console.error('OpenAI API Error:', error.response.data);
    }
    throw new Error(error.message || 'Failed to analyze tweet');
  }
}; 