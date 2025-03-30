
// OpenAI service for generating tweets and images
import { toast } from "sonner";

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
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
    const apiKey = localStorage.getItem("openai-api-key");
    
    if (!apiKey) {
      toast.error("OpenAI API key is required");
      return [];
    }

    const messages: OpenAIMessage[] = [
      {
        role: "system",
        content: `You are a professional tweet writer. Generate 3 unique, engaging tweets about the given topic. Each tweet should be under 280 characters, include relevant hashtags, and match the requested tone. Format your response as a JSON array of objects, where each object has 'content' and 'imagePrompt' properties.`
      },
      {
        role: "user",
        content: `Write 3 ${tone} tweets about "${topic}". ${customInstructions}`
      }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to generate tweets");
    }

    const data = await response.json();
    let tweets = [];
    
    try {
      const parsedResponse = JSON.parse(data.choices[0].message.content);
      tweets = parsedResponse.tweets || [];
      
      // Add placeholder images until we implement image generation
      return tweets.map((tweet: any, index: number) => ({
        id: `tweet-${Date.now()}-${index}`,
        content: tweet.content,
        imageUrl: `https://placehold.co/600x400/png?text=${encodeURIComponent(topic.substring(0, 20))}`
      }));
    } catch (e) {
      console.error("Error parsing OpenAI response:", e);
      toast.error("Error parsing the generated tweets");
      return [];
    }
  } catch (error) {
    console.error("Error generating tweets:", error);
    toast.error(error instanceof Error ? error.message : "Failed to generate tweets");
    return [];
  }
};

export const postTweet = async (tweetContent: string): Promise<boolean> => {
  // For now, we'll just simulate a successful tweet post
  toast.success("Tweet posted successfully!");
  return true;
};

export const scheduleTweet = async (tweetContent: string, scheduledTime: Date): Promise<boolean> => {
  // For now, we'll just simulate scheduling a tweet
  toast.success(`Tweet scheduled for ${scheduledTime.toLocaleString()}`);
  return true;
};
