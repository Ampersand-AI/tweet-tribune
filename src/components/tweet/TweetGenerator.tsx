
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateTweets, isTwitterConnected } from "@/services/openai";
import TweetPreview from "./TweetPreview";
import { sendGeneratedTweetsToSchedule } from "@/pages/Index";

interface TweetGeneratorProps {
  selectedTopic: {
    id: string;
    title: string;
    description: string;
    source: "twitter" | "linkedin";
  };
}

// Update the type to only allow "deepseek"
type ApiProvider = "deepseek";

const TweetGenerator = ({ selectedTopic }: TweetGeneratorProps) => {
  const [generatedTweets, setGeneratedTweets] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState("professional");
  const [customInstructions, setCustomInstructions] = useState("");
  const [selectedApiProvider, setSelectedApiProvider] = useState<ApiProvider>("deepseek");
  const [activeApiTab, setActiveApiTab] = useState<ApiProvider>("deepseek");
  const [deepseekApiKey, setDeepseekApiKey] = useState("");
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [showApiSuccess, setShowApiSuccess] = useState(false);
  const [selectedTweets, setSelectedTweets] = useState<string[]>([]);

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "humorous", label: "Humorous" },
    { value: "informative", label: "Informative" },
  ];

  const saveApiKey = () => {
    if (deepseekApiKey) {
      localStorage.setItem("deepseek-api-key", deepseekApiKey);
      setShowApiSuccess(true);
      setTimeout(() => setShowApiSuccess(false), 5000);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const tweets = await generateTweets({
        topic: selectedTopic.title,
        tone: selectedTone,
        customInstructions: customInstructions + " Include specific examples and personal opinions. Make it sound like I'm sharing my own experience.",
        apiProvider: selectedApiProvider
      });
      setGeneratedTweets(tweets);
      
      // Send generated tweets to Schedule page
      sendGeneratedTweetsToSchedule(tweets);
    } catch (error) {
      console.error("Error generating tweets:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTweetSelect = (tweetId: string) => {
    setSelectedTweets(prev => {
      if (prev.includes(tweetId)) {
        return prev.filter(id => id !== tweetId);
      } else {
        return [...prev, tweetId];
      }
    });
  };

  const handleEditTweet = (tweetId: string, newContent: string) => {
    const updatedTweets = generatedTweets.map(tweet => {
      if (tweet.id === tweetId) {
        return { ...tweet, content: newContent };
      }
      return tweet;
    });
    
    setGeneratedTweets(updatedTweets);
    
    // Update the tweets in localStorage/shared state
    localStorage.setItem("generated-tweets", JSON.stringify(updatedTweets));
    // Also send updated tweets to Schedule page
    sendGeneratedTweetsToSchedule(updatedTweets);
  };

  useEffect(() => {
    // Load API keys from localStorage
    const savedDeepseekKey = localStorage.getItem("deepseek-api-key");
    
    if (savedDeepseekKey) {
      setDeepseekApiKey(savedDeepseekKey);
      setShowApiSuccess(true);
      setTimeout(() => setShowApiSuccess(false), 5000);
    }
    
    // Auto-select deepseek API
    setSelectedApiProvider("deepseek");
    setActiveApiTab("deepseek");
    
    // Check Twitter connection status
    const isConnected = isTwitterConnected();
    setTwitterConnected(isConnected);
  }, []);

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-bold">Generate Tweets for: {selectedTopic.title}</h2>
      <p className="text-muted-foreground">{selectedTopic.description}</p>
      
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="settings">Tweet Settings</TabsTrigger>
          <TabsTrigger value="api" disabled={generatedTweets.length > 0}>API Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Tone</h3>
                <div className="flex flex-wrap gap-2">
                  {tones.map((tone) => (
                    <Button
                      key={tone.value}
                      variant={selectedTone === tone.value ? "default" : "outline"}
                      onClick={() => setSelectedTone(tone.value)}
                    >
                      {tone.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">API Provider</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled
                  >
                    {selectedApiProvider === "deepseek" && <Check className="h-4 w-4" />}
                    DeepSeek
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Custom Instructions (Optional)</h3>
                <Textarea 
                  placeholder="Write tweets in my voice. Include relevant hashtags and make them sound conversational." 
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="h-32"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Twitter Connection</h3>
                {twitterConnected ? (
                  <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                    <AlertDescription className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Connected to Twitter
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Not connected to Twitter. Please connect in Settings.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !deepseekApiKey} 
                className="w-full md:w-auto mt-4"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Tweets"
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          <Tabs value={activeApiTab} onValueChange={(v) => setActiveApiTab(v as ApiProvider)}>
            <TabsList className="mb-4">
              <TabsTrigger value="deepseek">DeepSeek</TabsTrigger>
            </TabsList>
            
            <TabsContent value="deepseek" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">DeepSeek API Key</h3>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="password" 
                      placeholder="Enter your DeepSeek API key" 
                      value={deepseekApiKey}
                      onChange={(e) => setDeepseekApiKey(e.target.value)}
                    />
                    <Button onClick={saveApiKey}>Save</Button>
                  </div>
                  {showApiSuccess && (
                    <p className="text-green-500 text-sm">API key saved successfully!</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
      
      {generatedTweets.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Generated Tweets</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {generatedTweets.map((tweet, index) => (
              <TweetPreview 
                key={index} 
                tweet={tweet} 
                isSelected={selectedTweets.includes(tweet.id)}
                onSelect={() => handleTweetSelect(tweet.id)}
                onEdit={handleEditTweet}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TweetGenerator;
