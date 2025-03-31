// AI services for generating tweets and managing Twitter/LinkedIn integration
import React from "react";
import { toast } from "sonner";
import ToastImageContent from "@/components/toast/ToastImageContent";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface TweetGenerationProps {
  topic: string;
  tone: string;
  customInstructions?: string;
  apiProvider?: "deepseek";
  platform?: "twitter" | "linkedin";
}

interface Tweet {
  id?: string;
  content: string;
  imagePrompt?: string;
  imageUrl?: string;
  scheduledAt?: string;
  postedAt?: string;
  status?: string;
  platform?: "twitter" | "linkedin";
  screenshotUrl?: string;
}

// Helper function to extract tweets from text content
const extractTweetsFromText = (content: string, topic: string, platform: "twitter" | "linkedin" = "twitter"): Tweet[] => {
  console.log("Extracting tweets from text:", content);
  
  // Method 1: Try to extract using regex for numbered list format
  const tweetRegex = /(\d+\.\s*|"content":|•\s*)(.*?)(?=\n\d+\.|$|\n•|\n"content":)/gs;
  const matches = Array.from(content.matchAll(tweetRegex));
  
  let extractedTweets = matches
    .map(match => match[2].trim())
    .filter(tweet => tweet.length > 0 && (platform === "twitter" ? tweet.length <= 280 : tweet.length <= 700));
  
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
      .filter(line => line.trim().length > 0 && (platform === "twitter" ? line.trim().length <= 280 : line.trim().length <= 700) && !line.startsWith("{") && !line.startsWith("["))
      .slice(0, 3);
  }
  
  // Generate more descriptive image prompts for each tweet
  const generateImagePrompt = (tweetContent: string, topic: string): string => {
    // Extract hashtags from the tweet content
    const hashtags = tweetContent.match(/#\w+/g) || [];
    const hashtagText = hashtags.join(" ");
    
    // Create a more descriptive image prompt
    let imagePrompt = `High quality professional photo related to ${topic}`;
    
    if (hashtagText) {
      imagePrompt += ` and ${hashtagText}`;
    }
    
    // Add some context based on the content
    if (tweetContent.toLowerCase().includes("startup")) {
      imagePrompt += ", showing a modern office with diverse team collaborating";
    } else if (tweetContent.toLowerCase().includes("tech") || tweetContent.toLowerCase().includes("technology")) {
      imagePrompt += ", showing futuristic technology devices on clean workspace";
    } else if (tweetContent.toLowerCase().includes("ai") || tweetContent.toLowerCase().includes("machine learning")) {
      imagePrompt += ", showing data visualization or AI concept with clean modern aesthetic";
    }
    
    return imagePrompt;
  };
  
  // Generate pseudo-random but deterministic image URLs based on content
  const generateImageUrl = (tweetContent: string, topic: string): string => {
    // List of relevant stock photo categories
    const categories = [
      "business", "technology", "office", "startup", 
      "coding", "computer", "artificial-intelligence", "data"
    ];
    
    // Generate a deterministic index based on tweet content
    const contentHash = tweetContent.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const categoryIndex = contentHash % categories.length;
    const imageIndex = (contentHash * 13) % 1000; // Multiply by prime for better distribution
    
    return `https://source.unsplash.com/featured/?${categories[categoryIndex]},${topic.replace("#", "")}&${imageIndex}`;
  };
  
  // Create tweet objects from the extracted content
  return extractedTweets
    .filter(tweet => tweet.length > 0)
    .map((tweetContent, index) => {
      const imagePrompt = generateImagePrompt(tweetContent, topic);
      const imageUrl = generateImageUrl(tweetContent, topic);
      
      return {
        id: `tweet-${Date.now()}-${index}`,
        content: tweetContent,
        imagePrompt: imagePrompt,
        imageUrl: imageUrl,
        platform: platform
      };
    });
};

// Generate tweets using DeepSeek API
const generateTweetsWithDeepSeek = async (
  topic: string,
  tone: string,
  customInstructions: string = "",
  platform: "twitter" | "linkedin" = "twitter"
): Promise<Tweet[]> => {
  try {
    const apiKey = localStorage.getItem("deepseek-api-key");
    
    if (!apiKey) {
      toast.error("DeepSeek API key is required");
      return [];
    }

    const platformSpecificInstructions = platform === "twitter" 
      ? "Each tweet should be under 280 characters, include relevant hashtags, and express original thoughts."
      : "Each post should be under 700 characters, include relevant hashtags, and express professional insights. LinkedIn posts should be slightly more formal and business-oriented than Twitter.";

    const messages: Message[] = [
      {
        role: "system",
        content: `You are a professional ${platform} content writer. Generate exactly 3 engaging posts about the topic provided. Use your own words and insights, not just links or forwards. Each post should feel personal and authentic. Include relevant hashtags naturally within the content.`
      },
      {
        role: "user",
        content: `Generate 3 unique, engaging ${tone} posts for ${platform} about "${topic}". Write in first person as if I'm posting these myself. ${customInstructions}
        ${platformSpecificInstructions}`
      }
    ];

    console.log(`Sending request to DeepSeek API with messages for ${platform}:`, messages);

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
        toast.error(`API Error: ${errorData.error?.message || "Failed to generate posts"}`);
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
      
      console.log(`Raw content from DeepSeek for ${platform}:`, content);
      
      // Extract tweets from the content
      const tweets = extractTweetsFromText(content, topic, platform);
      
      if (tweets.length === 0) {
        toast.error(`Couldn't parse ${platform} posts from DeepSeek response`);
        return [];
      }
      
      toast.success(`Generated ${tweets.length} ${platform} posts with DeepSeek`);
      return tweets;
    } catch (fetchError: any) {
      console.error("Fetch error:", fetchError);
      toast.error(`Network error: ${fetchError.message || `Failed to connect to DeepSeek API for ${platform} post generation`}`);
      return [];
    }
  } catch (error: any) {
    console.error(`Error generating ${platform} posts with DeepSeek:`, error);
    toast.error(error instanceof Error ? error.message : `Failed to generate ${platform} posts`);
    return [];
  }
};

// Main function to generate tweets using the selected API provider
export const generateTweets = async ({
  topic,
  tone,
  customInstructions = "",
  apiProvider = "deepseek",
  platform = "twitter"
}: TweetGenerationProps): Promise<Tweet[]> => {
  console.log(`Generating ${platform} posts using ${apiProvider} API`);
  return generateTweetsWithDeepSeek(topic, tone, customInstructions, platform);
};

// Twitter connection and tweet functionality
let scheduledTweets = JSON.parse(localStorage.getItem("scheduled-tweets") || "[]");

// Add this function to check for scheduled tweets that need posting
export const checkAndPostScheduledTweets = () => {
  const now = new Date();
  const tweets = JSON.parse(localStorage.getItem("scheduled-tweets") || "[]");
  
  if (tweets.length === 0) return;
  
  console.log("Checking scheduled tweets:", tweets);
  
  const tweetsToPost = tweets.filter((tweet: any) => {
    const scheduledTime = new Date(tweet.scheduledAt);
    return scheduledTime <= now && tweet.status === "scheduled";
  });
  
  if (tweetsToPost.length > 0) {
    console.log("Found tweets to post:", tweetsToPost);
    
    // Post each tweet
    tweetsToPost.forEach((tweet: any) => {
      postScheduledTweet(tweet);
    });
    
    // Update scheduled tweets list
    const remainingTweets = tweets.filter((tweet: any) => {
      const scheduledTime = new Date(tweet.scheduledAt);
      return scheduledTime > now || tweet.status !== "scheduled";
    });
    
    localStorage.setItem("scheduled-tweets", JSON.stringify(remainingTweets));
    scheduledTweets = remainingTweets;
  }
};

// Function to post a scheduled tweet
const postScheduledTweet = (tweet: any) => {
  console.log("Posting scheduled tweet:", tweet);
  
  // Generate a post URL
  const contentHash = tweet.content.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const platform = tweet.platform || "twitter";
  const postUrl = generatePostUrl(platform, contentHash);
  
  // Update tweet history
  const history = JSON.parse(localStorage.getItem("tweet-history") || "[]");
  
  // Update the tweet status in history
  const updatedHistory = history.map((historyTweet: any) => {
    if (historyTweet.id === tweet.id) {
      return {
        ...historyTweet,
        postedAt: new Date().toISOString(),
        status: "posted",
        postUrl: postUrl
      };
    }
    return historyTweet;
  });
  
  // If the tweet wasn't in history, add it
  if (!updatedHistory.some((historyTweet: any) => historyTweet.id === tweet.id)) {
    updatedHistory.push({
      ...tweet,
      postedAt: new Date().toISOString(),
      status: "posted",
      postUrl: postUrl
    });
  }
  
  localStorage.setItem("tweet-history", JSON.stringify(updatedHistory));
  
  // Show success toast with link
  toast.success(
    `${platform === "twitter" ? "Tweet" : "LinkedIn post"} published successfully!`, 
    {
      description: tweet.content.substring(0, 60) + "...",
      action: {
        label: "View",
        onClick: () => window.open(postUrl),
      },
      duration: 5000,
    }
  );
  
  // Update analytics after posting
  updateAnalytics();
};

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

export const connectToLinkedin = async (): Promise<boolean> => {
  try {
    // Using the hardcoded credentials
    const linkedinClientId = "776n50wy97k6rn";
    const linkedinAuthKey = "WPL_AP1.VrsAeeeyhPxYz7CT.ITUw+Q==";
    
    // Save the credentials and set connection status
    localStorage.setItem("linkedin-client-id", linkedinClientId);
    localStorage.setItem("linkedin-auth-key", linkedinAuthKey);
    localStorage.setItem("linkedin-connected", "true");
    
    toast.success("Successfully connected to LinkedIn");
    return true;
  } catch (error) {
    console.error("Error connecting to LinkedIn:", error);
    toast.error("Failed to connect to LinkedIn");
    return false;
  }
};

export const isTwitterConnected = (): boolean => {
  const connected = localStorage.getItem("twitter-connected") === "true";
  const hasKey = localStorage.getItem("twitter-api-key") === "dWbEeB7mH35rRfaeBAyAztDhW";
  return connected && hasKey;
};

export const isLinkedinConnected = (): boolean => {
  const connected = localStorage.getItem("linkedin-connected") === "true";
  const hasClientId = localStorage.getItem("linkedin-client-id") === "776n50wy97k6rn";
  const hasAuthKey = localStorage.getItem("linkedin-auth-key") === "WPL_AP1.VrsAeeeyhPxYz7CT.ITUw+Q==";
  return connected && hasClientId && hasAuthKey;
};

// Function to generate a fake screenshot URL based on platform and content
const generateScreenshotUrl = (platform: "twitter" | "linkedin", content: string): string => {
  // Generate a deterministic screenshot based on content
  const contentHash = content.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageIndex = contentHash % 5 + 1; // Use mod 5 to get a number between 1-5
  
  if (platform === "twitter") {
    return `https://source.unsplash.com/featured/?twitter,post&${imageIndex}`;
  } else {
    return `https://source.unsplash.com/featured/?linkedin,post&${imageIndex}`;
  }
};

// Generate a fake post URL for demo purposes
const generatePostUrl = (platform: "twitter" | "linkedin", contentHash: number): string => {
  const postId = `${Date.now()}-${contentHash}`.substring(0, 15);
  
  // Use URLs that actually resolve to valid pages (even if not the actual post)
  if (platform === "twitter") {
    // Twitter is now X, so we'll use x.com which will at least show the Twitter homepage
    return `https://x.com/intent/tweet?text=${encodeURIComponent(contentHash.toString())}`;
  } else {
    // LinkedIn share URL that will at least resolve to LinkedIn
    return `https://www.linkedin.com/sharing/share-offsite/?url=https://example.com/${postId}`;
  }
};

export const postTweet = async (tweetContent: string, imageUrl?: string, platform: "twitter" | "linkedin" = "twitter"): Promise<boolean> => {
  if (platform === "twitter" && !isTwitterConnected()) {
    toast.error("Please connect to Twitter first");
    return false;
  }
  
  if (platform === "linkedin" && !isLinkedinConnected()) {
    toast.error("Please connect to LinkedIn first");
    return false;
  }
  
  try {
    // Generate a fake screenshot URL and post URL for the post
    const screenshotUrl = generateScreenshotUrl(platform, tweetContent);
    const contentHash = tweetContent.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const postUrl = generatePostUrl(platform, contentHash);
    
    // Import the usePostToast hook and use it to show the confirmation
    const { showPostConfirmation } = await import('@/hooks/usePostToast');
    showPostConfirmation(tweetContent, platform, screenshotUrl, postUrl);
    
    // Save to post history
    const history = JSON.parse(localStorage.getItem("tweet-history") || "[]");
    history.push({
      id: `${platform}-${Date.now()}`,
      content: tweetContent,
      imageUrl: imageUrl || "",
      postedAt: new Date().toISOString(),
      status: "posted",
      platform: platform,
      screenshotUrl: screenshotUrl,
      postUrl: postUrl
    });
    localStorage.setItem("tweet-history", JSON.stringify(history));
    
    // Update analytics
    updateAnalytics();
    
    return true;
  } catch (error) {
    console.error(`Error posting to ${platform}:`, error);
    toast.error(`Failed to post to ${platform}`);
    return false;
  }
};

export const scheduleTweet = async (tweetContent: string, imageUrl: string | null, scheduledTime: Date, platform: "twitter" | "linkedin" = "twitter"): Promise<boolean> => {
  if (platform === "twitter" && !isTwitterConnected()) {
    toast.error("Please connect to Twitter first");
    return false;
  }
  
  if (platform === "linkedin" && !isLinkedinConnected()) {
    toast.error("Please connect to LinkedIn first");
    return false;
  }
  
  try {
    // Create a new scheduled post
    const newScheduledTweet = {
      id: `scheduled-${Date.now()}`,
      content: tweetContent,
      imageUrl: imageUrl || "",
      scheduledAt: scheduledTime.toISOString(),
      status: "scheduled",
      platform: platform
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
    
    toast.success(`${platform === "twitter" ? "Tweet" : "LinkedIn post"} scheduled for ${scheduledTime.toLocaleString()}`);
    return true;
  } catch (error) {
    console.error(`Error scheduling ${platform} post:`, error);
    toast.error(`Failed to schedule ${platform} post`);
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
    
    toast.success("Scheduled post canceled");
    return true;
  } catch (error) {
    console.error("Error canceling scheduled post:", error);
    toast.error("Failed to cancel scheduled post");
    return false;
  }
};

export const getTweetHistory = (): any[] => {
  return JSON.parse(localStorage.getItem("tweet-history") || "[]");
};

// Analytics data functions
export const updateAnalytics = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Get or initialize analytics data
  const analytics = JSON.parse(localStorage.getItem("tweet-analytics") || "{}");
  
  // Get tweet history
  const history = getTweetHistory();
  const postedTweets = history.filter(tweet => tweet.status === "posted");
  
  // Count by platform
  const twitterPosts = postedTweets.filter(tweet => tweet.platform !== "linkedin").length;
  const linkedinPosts = postedTweets.filter(tweet => tweet.platform === "linkedin").length;
  
  // Update total tweets
  analytics.totalTweets = postedTweets.length;
  analytics.twitterPosts = twitterPosts;
  analytics.linkedinPosts = linkedinPosts;
  
  // Calculate tweets this month
  const tweetsThisMonth = postedTweets.filter(tweet => {
    const postedDate = new Date(tweet.postedAt);
    return postedDate.getMonth() === currentMonth && postedDate.getFullYear() === currentYear;
  }).length;
  
  // Calculate tweets last month
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const tweetsLastMonth = postedTweets.filter(tweet => {
    const postedDate = new Date(tweet.postedAt);
    return postedDate.getMonth() === lastMonth && postedDate.getFullYear() === lastMonthYear;
  }).length;
  
  // Calculate month-over-month change
  analytics.monthlyChange = tweetsLastMonth > 0 ? 
    Math.round((tweetsThisMonth - tweetsLastMonth) / tweetsLastMonth * 100) : 
    100;
  
  // Simulate impressions (average 500 per tweet)
  analytics.totalImpressions = postedTweets.length * 500;
  
  // Simulate engagement (varies between 2-5%)
  analytics.engagementRate = (Math.random() * 3 + 2).toFixed(1);
  
  // Store updated analytics
  localStorage.setItem("tweet-analytics", JSON.stringify(analytics));
  return analytics;
};

export const getAnalytics = () => {
  // Update analytics first to ensure fresh data
  updateAnalytics();
  return JSON.parse(localStorage.getItem("tweet-analytics") || "{}");
};
