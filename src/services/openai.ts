
// Claude AI service for generating tweets and images
import { toast } from "sonner";

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface TweetGenerationProps {
  topic: string;
  tone: string;
  customInstructions?: string;
}

export const generateTweets = async ({
  topic,
  tone,
  customInstructions = "",
}: TweetGenerationProps): Promise<any[]> => {
  try {
    const apiKey = localStorage.getItem("openai-api-key"); // We'll keep using the same localStorage key for simplicity
    
    if (!apiKey) {
      toast.error("Claude API key is required");
      return [];
    }

    const messages: ClaudeMessage[] = [
      {
        role: "user",
        content: `You are a professional tweet writer. Generate 3 unique, engaging ${tone} tweets about "${topic}". ${customInstructions}
        Each tweet should be under 280 characters, include relevant hashtags. Format your response as a JSON array of tweets, where each tweet is an object with 'content' and 'imagePrompt' properties.
        Only return valid JSON with no markdown formatting or additional text.`
      }
    ];

    console.log("Sending request to Claude API with messages:", messages);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        messages,
        temperature: 0.7,
        system: "You are a professional tweet writer. Generate exactly what the user asks for in JSON format with an array of tweets. Each tweet should have content and imagePrompt properties."
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to generate tweets");
    }

    const data = await response.json();
    console.log("Claude API response:", data);
    
    let tweets = [];
    
    try {
      // Claude returns the content in the response text
      const content = data.content[0].text;
      console.log("Raw content from Claude:", content);
      
      // Extract JSON from the content (in case Claude wraps it in markdown)
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\[([\s\S]*?)\]/) || content.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      
      console.log("Extracted JSON content:", jsonContent);
      
      // Parse the JSON
      const parsedResponse = JSON.parse(jsonContent);
      console.log("Parsed response:", parsedResponse);
      
      // Handle different response formats
      if (Array.isArray(parsedResponse)) {
        tweets = parsedResponse;
      } else if (parsedResponse.tweets && Array.isArray(parsedResponse.tweets)) {
        tweets = parsedResponse.tweets;
      } else {
        tweets = [parsedResponse]; // Fallback if single object
      }
      
      console.log("Final tweets array:", tweets);
      
      // Add placeholder images until we implement image generation
      return tweets.map((tweet: any, index: number) => ({
        id: `tweet-${Date.now()}-${index}`,
        content: tweet.content || tweet.text || "No content provided",
        imageUrl: `https://placehold.co/600x400/png?text=${encodeURIComponent(topic.substring(0, 20))}`
      }));
    } catch (e) {
      console.error("Error parsing Claude response:", e);
      toast.error("Error parsing the generated tweets");
      return [];
    }
  } catch (error) {
    console.error("Error generating tweets:", error);
    toast.error(error instanceof Error ? error.message : "Failed to generate tweets");
    return [];
  }
};

// Implement the Twitter connection functionality
export const connectToTwitter = async (): Promise<boolean> => {
  try {
    // In a real app, this would connect to Twitter OAuth
    // For now, we'll simulate a successful connection
    localStorage.setItem("twitter-connected", "true");
    const twitterApiKey = localStorage.getItem("twitter-api-key");
    const twitterSecretKey = localStorage.getItem("twitter-secret-api-key");
    
    if (!twitterApiKey || !twitterSecretKey) {
      toast.warning("Connected to Twitter, but API keys are missing", {
        description: "Please add your Twitter API keys in settings"
      });
    } else {
      toast.success("Successfully connected to Twitter");
    }
    
    return true;
  } catch (error) {
    console.error("Error connecting to Twitter:", error);
    toast.error("Failed to connect to Twitter");
    return false;
  }
};

export const postTweet = async (tweetContent: string): Promise<boolean> => {
  const isConnected = localStorage.getItem("twitter-connected") === "true";
  
  if (!isConnected) {
    toast.error("Please connect to Twitter first");
    return false;
  }
  
  // For now, we'll just simulate a successful tweet post
  toast.success("Tweet posted successfully!");
  return true;
};

export const scheduleTweet = async (tweetContent: string, scheduledTime: Date): Promise<boolean> => {
  const isConnected = localStorage.getItem("twitter-connected") === "true";
  
  if (!isConnected) {
    toast.error("Please connect to Twitter first");
    return false;
  }
  
  // For now, we'll just simulate scheduling a tweet
  toast.success(`Tweet scheduled for ${scheduledTime.toLocaleString()}`);
  return true;
};
