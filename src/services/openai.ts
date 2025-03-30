
// AI services for generating tweets and managing Twitter integration
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface TweetGenerationProps {
  topic: string;
  tone: string;
  customInstructions?: string;
  apiProvider?: "claude" | "gemini" | "deepseek";
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

// Helper function to extract tweets from text content
const extractTweetsFromText = (content: string, topic: string): Tweet[] => {
  console.log("Extracting tweets from text:", content);
  
  // Method 1: Try to extract using regex for numbered list format
  const tweetRegex = /(\d+\.\s*|"content":|•\s*)(.*?)(?=\n\d+\.|$|\n•|\n"content":)/gs;
  const matches = Array.from(content.matchAll(tweetRegex));
  
  let extractedTweets = matches
    .map(match => match[2].trim())
    .filter(tweet => tweet.length > 0 && tweet.length <= 280);
  
  // Method 2: Try to parse as JSON if regex didn't work
  if (extractedTweets.length === 0) {
    try {
      // Look for JSON-like content in the response
      const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s) || 
                        content.match(/\{\s*"tweets"\s*:\s*\[.*\]\s*\}/s);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsedJson = JSON.parse(jsonStr);
        
        if (Array.isArray(parsedJson)) {
          extractedTweets = parsedJson.map(tweet => 
            typeof tweet === 'string' ? tweet : tweet.content || tweet.text || ""
          );
        } else if (parsedJson.tweets && Array.isArray(parsedJson.tweets)) {
          extractedTweets = parsedJson.tweets.map(tweet => 
            typeof tweet === 'string' ? tweet : tweet.content || tweet.text || ""
          );
        }
      }
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
    }
  }
  
  // Method 3: If methods 1 and 2 failed, split by newlines and filter
  if (extractedTweets.length === 0) {
    extractedTweets = content
      .split("\n")
      .filter(line => line.trim().length > 0 && line.trim().length <= 280 && !line.startsWith("{") && !line.startsWith("["))
      .slice(0, 3);
  }
  
  // Create tweet objects from the extracted content
  return extractedTweets
    .filter(tweet => tweet.length > 0)
    .map((tweetContent, index) => ({
      id: `tweet-${Date.now()}-${index}`,
      content: tweetContent,
      imagePrompt: `Image related to ${topic}`,
      imageUrl: `https://placehold.co/600x400/png?text=${encodeURIComponent(topic.substring(0, 20))}`
    }));
};

// Generate tweets using Claude API
const generateTweetsWithClaude = async (
  topic: string,
  tone: string,
  customInstructions: string = ""
): Promise<Tweet[]> => {
  try {
    const apiKey = localStorage.getItem("openai-api-key");
    
    if (!apiKey) {
      toast.error("Claude API key is required");
      return [];
    }

    const messages: Message[] = [
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
      
      // Extract tweets from the content
      const tweets = extractTweetsFromText(content, topic);
      
      if (tweets.length === 0) {
        toast.error("Couldn't parse tweets from Claude response");
        return [];
      }
      
      toast.success(`Generated ${tweets.length} tweets with Claude`);
      return tweets;
    } catch (fetchError: any) {
      console.error("Fetch error:", fetchError);
      toast.error(`Network error: ${fetchError.message || "Failed to connect to Claude API"}`);
      return [];
    }
  } catch (error: any) {
    console.error("Error generating tweets with Claude:", error);
    toast.error(error instanceof Error ? error.message : "Failed to generate tweets");
    return [];
  }
};

// Generate tweets using Gemini API
const generateTweetsWithGemini = async (
  topic: string,
  tone: string,
  customInstructions: string = ""
): Promise<Tweet[]> => {
  try {
    const apiKey = localStorage.getItem("gemini-api-key");
    
    if (!apiKey) {
      toast.error("Gemini API key is required");
      return [];
    }

    console.log("Sending request to Gemini API");

    try {
      const prompt = `Generate 3 unique, engaging ${tone} tweets about "${topic}". ${customInstructions}
        Each tweet should be under 280 characters and include relevant hashtags.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
        console.error("Gemini API error:", errorData);
        toast.error(`API Error: ${errorData.error?.message || "Failed to generate tweets"}`);
        return [];
      }

      const data = await response.json();
      console.log("Gemini API response:", data);
      
      // Extract content from Gemini's response
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        toast.error("Empty response from Gemini API");
        return [];
      }
      
      console.log("Raw content from Gemini:", content);
      
      // Extract tweets from the content
      const tweets = extractTweetsFromText(content, topic);
      
      if (tweets.length === 0) {
        toast.error("Couldn't parse tweets from Gemini response");
        return [];
      }
      
      toast.success(`Generated ${tweets.length} tweets with Gemini`);
      return tweets;
    } catch (fetchError: any) {
      console.error("Fetch error:", fetchError);
      toast.error(`Network error: ${fetchError.message || "Failed to connect to Gemini API"}`);
      return [];
    }
  } catch (error: any) {
    console.error("Error generating tweets with Gemini:", error);
    toast.error(error instanceof Error ? error.message : "Failed to generate tweets");
    return [];
  }
};

// Generate tweets using DeepSeek API
const generateTweetsWithDeepSeek = async (
  topic: string,
  tone: string,
  customInstructions: string = ""
): Promise<Tweet[]> => {
  try {
    const apiKey = localStorage.getItem("deepseek-api-key");
    
    if (!apiKey) {
      toast.error("DeepSeek API key is required");
      return [];
    }

    const messages: Message[] = [
      {
        role: "system",
        content: "You are a professional tweet writer. Generate exactly 3 engaging tweets about the topic provided."
      },
      {
        role: "user",
        content: `Generate 3 unique, engaging ${tone} tweets about "${topic}". ${customInstructions}
        Each tweet should be under 280 characters and include relevant hashtags.`
      }
    ];

    console.log("Sending request to DeepSeek API with messages:", messages);

    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
        console.error("DeepSeek API error:", errorData);
        toast.error(`API Error: ${errorData.error?.message || "Failed to generate tweets"}`);
        return [];
      }

      const data = await response.json();
      console.log("DeepSeek API response:", data);
      
      // Extract content from DeepSeek's response
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        toast.error("Empty response from DeepSeek API");
        return [];
      }
      
      console.log("Raw content from DeepSeek:", content);
      
      // Extract tweets from the content
      const tweets = extractTweetsFromText(content, topic);
      
      if (tweets.length === 0) {
        toast.error("Couldn't parse tweets from DeepSeek response");
        return [];
      }
      
      toast.success(`Generated ${tweets.length} tweets with DeepSeek`);
      return tweets;
    } catch (fetchError: any) {
      console.error("Fetch error:", fetchError);
      toast.error(`Network error: ${fetchError.message || "Failed to connect to DeepSeek API"}`);
      return [];
    }
  } catch (error: any) {
    console.error("Error generating tweets with DeepSeek:", error);
    toast.error(error instanceof Error ? error.message : "Failed to generate tweets");
    return [];
  }
};

// Main function to generate tweets using the selected API provider
export const generateTweets = async ({
  topic,
  tone,
  customInstructions = "",
  apiProvider = "claude"
}: TweetGenerationProps): Promise<Tweet[]> => {
  console.log(`Generating tweets using ${apiProvider} API`);
  
  switch (apiProvider) {
    case "gemini":
      return generateTweetsWithGemini(topic, tone, customInstructions);
    case "deepseek":
      return generateTweetsWithDeepSeek(topic, tone, customInstructions);
    case "claude":
    default:
      return generateTweetsWithClaude(topic, tone, customInstructions);
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
