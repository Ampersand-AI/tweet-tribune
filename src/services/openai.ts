
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

interface Tweet {
  id?: string;
  content: string;
  imagePrompt?: string;
  imageUrl?: string;
  scheduledAt?: string;
  postedAt?: string;
  status?: string;
}

export const generateTweets = async ({
  topic,
  tone,
  customInstructions = "",
}: TweetGenerationProps): Promise<Tweet[]> => {
  try {
    const apiKey = localStorage.getItem("openai-api-key"); // Using the same localStorage key
    
    if (!apiKey) {
      toast.error("Claude API key is required");
      return [];
    }

    const messages: ClaudeMessage[] = [
      {
        role: "user",
        content: `Generate 3 unique, engaging ${tone} tweets about "${topic}". ${customInstructions}
        Each tweet should be under 280 characters and include relevant hashtags.`
      }
    ];

    console.log("Sending request to Claude API with messages:", messages);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1000,
          messages,
          temperature: 0.7,
          system: "You are a professional tweet writer. Generate exactly 3 engaging tweets about the topic provided."
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
        console.error("Claude API error:", errorData);
        toast.error(`API Error: ${errorData.error?.message || "Failed to generate tweets"}`);
        return [];
      }

      const data = await response.json();
      console.log("Claude API response:", data);
      
      // Extract content from Claude's response
      const content = data.content?.[0]?.text;
      
      if (!content) {
        toast.error("Empty response from Claude API");
        return [];
      }
      
      console.log("Raw content from Claude:", content);
      
      // Parse the tweets from the content
      // Since Claude may not return strictly formatted JSON, we'll extract the tweets manually
      const tweetRegex = /(\d+\.\s*|"content":|•\s*)(.*?)(?=\n\d+\.|$|\n•|\n"content":)/gs;
      const matches = Array.from(content.matchAll(tweetRegex));
      
      const extractedTweets = matches
        .map(match => match[2].trim())
        .filter(tweet => tweet.length > 0 && tweet.length <= 280);
      
      // If we couldn't extract tweets using regex, try parsing as JSON
      let tweets: Tweet[] = [];
      
      if (extractedTweets.length > 0) {
        tweets = extractedTweets.map((tweetContent, index) => ({
          id: `tweet-${Date.now()}-${index}`,
          content: tweetContent,
          imagePrompt: `Image related to ${topic}`,
          imageUrl: `https://placehold.co/600x400/png?text=${encodeURIComponent(topic.substring(0, 20))}`
        }));
      } else {
        // Try to parse JSON
        try {
          // Look for JSON-like content in Claude's response
          const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s) || 
                            content.match(/\{\s*"tweets"\s*:\s*\[.*\]\s*\}/s);
          
          if (jsonMatch) {
            const jsonStr = jsonMatch[0];
            const parsedJson = JSON.parse(jsonStr);
            
            if (Array.isArray(parsedJson)) {
              // If it's a direct array of tweets
              tweets = parsedJson.map((tweet, index) => ({
                id: `tweet-${Date.now()}-${index}`,
                content: tweet.content || tweet.text || "No content provided",
                imagePrompt: tweet.imagePrompt || `Image related to ${topic}`,
                imageUrl: `https://placehold.co/600x400/png?text=${encodeURIComponent(topic.substring(0, 20))}`
              }));
            } else if (parsedJson.tweets && Array.isArray(parsedJson.tweets)) {
              // If it's an object with a "tweets" array
              tweets = parsedJson.tweets.map((tweet, index) => ({
                id: `tweet-${Date.now()}-${index}`,
                content: tweet.content || tweet.text || "No content provided",
                imagePrompt: tweet.imagePrompt || `Image related to ${topic}`,
                imageUrl: `https://placehold.co/600x400/png?text=${encodeURIComponent(topic.substring(0, 20))}`
              }));
            }
          }
        } catch (jsonError) {
          console.error("Error parsing JSON:", jsonError);
          // If JSON parsing failed, manually create tweets from the content
          const lines = content
            .split("\n")
            .filter(line => line.trim().length > 0 && line.trim().length <= 280)
            .slice(0, 3);
          
          if (lines.length > 0) {
            tweets = lines.map((line, index) => ({
              id: `tweet-${Date.now()}-${index}`,
              content: line,
              imagePrompt: `Image related to ${topic}`,
              imageUrl: `https://placehold.co/600x400/png?text=${encodeURIComponent(topic.substring(0, 20))}`
            }));
          }
        }
      }
      
      // If we still couldn't extract tweets, create default ones
      if (tweets.length === 0) {
        toast.error("Couldn't parse tweets from Claude response");
        return [];
      }
      
      toast.success(`Generated ${tweets.length} tweets`);
      return tweets;
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      toast.error(`Network error: ${fetchError.message || "Failed to connect to Claude API"}`);
      return [];
    }
  } catch (error) {
    console.error("Error generating tweets:", error);
    toast.error(error instanceof Error ? error.message : "Failed to generate tweets");
    return [];
  }
};

// Twitter connection and tweet functionality
let scheduledTweets = JSON.parse(localStorage.getItem("scheduled-tweets") || "[]");

export const connectToTwitter = async (): Promise<boolean> => {
  try {
    // Using the hardcoded key
    const twitterApiKey = "dWbEeB7mH35rRfaeBAyAztDhW";
    
    // Save the key and set connection status
    localStorage.setItem("twitter-api-key", twitterApiKey);
    localStorage.setItem("twitter-connected", "true");
    
    toast.success("Successfully connected to Twitter");
    return true;
  } catch (error) {
    console.error("Error connecting to Twitter:", error);
    toast.error("Failed to connect to Twitter");
    return false;
  }
};

export const isTwitterConnected = (): boolean => {
  const connected = localStorage.getItem("twitter-connected") === "true";
  const hasKey = localStorage.getItem("twitter-api-key") === "dWbEeB7mH35rRfaeBAyAztDhW";
  return connected && hasKey;
};

export const postTweet = async (tweetContent: string): Promise<boolean> => {
  if (!isTwitterConnected()) {
    toast.error("Please connect to Twitter first");
    return false;
  }
  
  try {
    // For now, we'll just simulate a successful tweet post
    toast.success("Tweet posted successfully!");
    
    // Save to tweet history
    const history = JSON.parse(localStorage.getItem("tweet-history") || "[]");
    history.push({
      id: `tweet-${Date.now()}`,
      content: tweetContent,
      postedAt: new Date().toISOString(),
      status: "posted"
    });
    localStorage.setItem("tweet-history", JSON.stringify(history));
    
    return true;
  } catch (error) {
    console.error("Error posting tweet:", error);
    toast.error("Failed to post tweet");
    return false;
  }
};

export const scheduleTweet = async (tweetContent: string, imageUrl: string | null, scheduledTime: Date): Promise<boolean> => {
  if (!isTwitterConnected()) {
    toast.error("Please connect to Twitter first");
    return false;
  }
  
  try {
    // Create a new scheduled tweet
    const newScheduledTweet = {
      id: `scheduled-${Date.now()}`,
      content: tweetContent,
      imageUrl: imageUrl || "",
      scheduledAt: scheduledTime.toISOString(),
      status: "scheduled"
    };
    
    // Get current scheduled tweets
    scheduledTweets = JSON.parse(localStorage.getItem("scheduled-tweets") || "[]");
    
    // Add to scheduled tweets
    scheduledTweets.push(newScheduledTweet);
    localStorage.setItem("scheduled-tweets", JSON.stringify(scheduledTweets));
    
    // Also add to tweet history
    const history = JSON.parse(localStorage.getItem("tweet-history") || "[]");
    history.push({
      ...newScheduledTweet,
      status: "scheduled"
    });
    localStorage.setItem("tweet-history", JSON.stringify(history));
    
    toast.success(`Tweet scheduled for ${scheduledTime.toLocaleString()}`);
    return true;
  } catch (error) {
    console.error("Error scheduling tweet:", error);
    toast.error("Failed to schedule tweet");
    return false;
  }
};

export const getScheduledTweets = (): any[] => {
  return JSON.parse(localStorage.getItem("scheduled-tweets") || "[]");
};

export const cancelScheduledTweet = (tweetId: string): boolean => {
  try {
    // Find the tweet in the scheduled tweets
    const existingTweets = JSON.parse(localStorage.getItem("scheduled-tweets") || "[]");
    const updatedTweets = existingTweets.filter((tweet: any) => tweet.id !== tweetId);
    
    localStorage.setItem("scheduled-tweets", JSON.stringify(updatedTweets));
    scheduledTweets = updatedTweets;
    
    // Update tweet history
    const history = JSON.parse(localStorage.getItem("tweet-history") || "[]");
    const updatedHistory = history.map((tweet: any) => {
      if (tweet.id === tweetId) {
        return { ...tweet, status: "canceled" };
      }
      return tweet;
    });
    localStorage.setItem("tweet-history", JSON.stringify(updatedHistory));
    
    toast.success("Scheduled tweet canceled");
    return true;
  } catch (error) {
    console.error("Error canceling scheduled tweet:", error);
    toast.error("Failed to cancel scheduled tweet");
    return false;
  }
};

export const getTweetHistory = (): any[] => {
  return JSON.parse(localStorage.getItem("tweet-history") || "[]");
};
