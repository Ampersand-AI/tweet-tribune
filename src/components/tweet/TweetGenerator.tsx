
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2, Twitter, Linkedin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateTweets, isTwitterConnected, isLinkedinConnected, postTweet } from "@/services/openai";
import TweetPreview from "./TweetPreview";
import { sendGeneratedTweetsToSchedule } from "@/pages/Index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSelectedOpenRouterModels } from "@/services/openrouter";

interface TweetGeneratorProps {
  selectedTopic: {
    id: string;
    title: string;
    description: string;
    source: "twitter" | "linkedin";
  };
}

// Update the type to allow multiple API providers
type ApiProvider = "deepseek" | "openrouter";

const TweetGenerator = ({ selectedTopic }: TweetGeneratorProps) => {
  const [generatedTweets, setGeneratedTweets] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState("professional");
  const [customInstructions, setCustomInstructions] = useState("");
  const [selectedApiProvider, setSelectedApiProvider] = useState<ApiProvider>("deepseek");
  const [activeApiTab, setActiveApiTab] = useState<ApiProvider>("deepseek");
  const [deepseekApiKey, setDeepseekApiKey] = useState("");
  const [openRouterApiKey, setOpenRouterApiKey] = useState("");
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [showApiSuccess, setShowApiSuccess] = useState(false);
  const [selectedTweets, setSelectedTweets] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<"twitter" | "linkedin">("twitter");
  const [selectedOpenRouterModels, setSelectedOpenRouterModels] = useState<any[]>([]);

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "humorous", label: "Humorous" },
    { value: "informative", label: "Informative" },
  ];

  const saveApiKey = () => {
    if (activeApiTab === "deepseek" && deepseekApiKey) {
      localStorage.setItem("deepseek-api-key", deepseekApiKey);
      setShowApiSuccess(true);
      setTimeout(() => setShowApiSuccess(false), 5050);
    } else if (activeApiTab === "openrouter" && openRouterApiKey) {
      localStorage.setItem("openrouter-api-key", openRouterApiKey);
      setShowApiSuccess(true);
      setTimeout(() => setShowApiSuccess(false), 5050);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const tweets = await generateTweets({
        topic: selectedTopic.title,
        tone: selectedTone,
        customInstructions: customInstructions + " Include specific examples and personal opinions. Make it sound like I'm sharing my own experience.",
        apiProvider: selectedApiProvider,
        platform: selectedPlatform
      });
      
      // Ensure each tweet has the platform property set
      const tweetsWithPlatform = tweets.map(tweet => ({
        ...tweet,
        platform: selectedPlatform
      }));
      
      setGeneratedTweets(tweetsWithPlatform);
      
      // Send generated tweets to Schedule page
      sendGeneratedTweetsToSchedule(tweetsWithPlatform);
    } catch (error) {
      console.error("Error generating posts:", error);
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
  
  const handlePostNow = (tweetId: string) => {
    const tweet = generatedTweets.find(t => t.id === tweetId);
    if (tweet) {
      postTweet(tweet.content, tweet.imageUrl, tweet.platform || selectedPlatform);
      
      // Update the tweet in generatedTweets to mark it as posted
      const updatedTweets = generatedTweets.map(t => {
        if (t.id === tweetId) {
          return { ...t, status: "posted", postedAt: new Date().toISOString() };
        }
        return t;
      });
      
      setGeneratedTweets(updatedTweets);
      localStorage.setItem("generated-tweets", JSON.stringify(updatedTweets));
      sendGeneratedTweetsToSchedule(updatedTweets);
    }
  };

  useEffect(() => {
    // Load API keys from localStorage
    const savedDeepseekKey = localStorage.getItem("deepseek-api-key");
    if (savedDeepseekKey) {
      setDeepseekApiKey(savedDeepseekKey);
    }
    
    const savedOpenRouterKey = localStorage.getItem("openrouter-api-key");
    if (savedOpenRouterKey) {
      setOpenRouterApiKey(savedOpenRouterKey);
    }
    
    // Load selected OpenRouter models
    const models = getSelectedOpenRouterModels();
    setSelectedOpenRouterModels(models);
    
    // Auto-select API provider based on available keys
    if (savedOpenRouterKey && models.length > 0) {
      setSelectedApiProvider("openrouter");
      setActiveApiTab("openrouter");
    } else if (savedDeepseekKey) {
      setSelectedApiProvider("deepseek");
      setActiveApiTab("deepseek");
    }
    
    // Check social media connection status
    const isTwitterConn = isTwitterConnected();
    setTwitterConnected(isTwitterConn);
    
    const isLinkedinConn = isLinkedinConnected();
    setLinkedinConnected(isLinkedinConn);
    
    // Set platform based on topic source if applicable
    if (selectedTopic.source === "linkedin") {
      setSelectedPlatform("linkedin");
    }
  }, [selectedTopic.source]);

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-bold">Generate Content for: {selectedTopic.title}</h2>
      <p className="text-muted-foreground">{selectedTopic.description}</p>
      
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="settings">Content Settings</TabsTrigger>
          <TabsTrigger value="api" disabled={generatedTweets.length > 0}>API Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Platform</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedPlatform === "twitter" ? "default" : "outline"}
                    onClick={() => setSelectedPlatform("twitter")}
                    className="flex items-center gap-2"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    variant={selectedPlatform === "linkedin" ? "default" : "outline"}
                    onClick={() => setSelectedPlatform("linkedin")}
                    className="flex items-center gap-2"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                </div>
              </div>
              
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
                  <Select 
                    value={selectedApiProvider} 
                    onValueChange={(value) => setSelectedApiProvider(value as ApiProvider)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select API Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek" disabled={!deepseekApiKey}>
                        DeepSeek {!deepseekApiKey && "(No API key)"}
                      </SelectItem>
                      <SelectItem 
                        value="openrouter" 
                        disabled={!openRouterApiKey || selectedOpenRouterModels.length === 0}
                      >
                        OpenRouter {(!openRouterApiKey || selectedOpenRouterModels.length === 0) && "(Setup required)"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedApiProvider === "openrouter" && selectedOpenRouterModels.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      Using {selectedOpenRouterModels[0]?.name || "Unknown"} as primary model 
                      {selectedOpenRouterModels.length > 1 ? ` with ${selectedOpenRouterModels.length - 1} fallbacks` : ""}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Custom Instructions (Optional)</h3>
                <Textarea 
                  placeholder="Write posts in my voice. Include relevant hashtags and make them sound conversational." 
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="h-32"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Account Connections</h3>
                
                <div className="space-y-2">
                  {twitterConnected ? (
                    <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                      <AlertDescription className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <Twitter className="h-4 w-4" />
                        Connected to Twitter
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertDescription className="flex items-center gap-2">
                        <Twitter className="h-4 w-4" />
                        Not connected to Twitter. Please connect in Settings.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {linkedinConnected ? (
                    <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                      <AlertDescription className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <Linkedin className="h-4 w-4" />
                        Connected to LinkedIn
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertDescription className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4" />
                        Not connected to LinkedIn. Please connect in Settings.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={
                  isGenerating || 
                  (selectedApiProvider === "deepseek" && !deepseekApiKey) || 
                  (selectedApiProvider === "openrouter" && (!openRouterApiKey || selectedOpenRouterModels.length === 0)) || 
                  (selectedPlatform === "twitter" && !twitterConnected) || 
                  (selectedPlatform === "linkedin" && !linkedinConnected)
                } 
                className="w-full md:w-auto mt-4"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  `Generate ${selectedPlatform === "twitter" ? "Tweets" : "LinkedIn Posts"}`
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          <Tabs value={activeApiTab} onValueChange={(v) => setActiveApiTab(v as ApiProvider)}>
            <TabsList className="mb-4">
              <TabsTrigger value="deepseek">DeepSeek</TabsTrigger>
              <TabsTrigger value="openrouter">OpenRouter</TabsTrigger>
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
                  {activeApiTab === "deepseek" && showApiSuccess && (
                    <p className="text-green-500 text-sm">API key saved successfully!</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="openrouter" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">OpenRouter API Key</h3>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="password" 
                      placeholder="Enter your OpenRouter API key" 
                      value={openRouterApiKey}
                      onChange={(e) => setOpenRouterApiKey(e.target.value)}
                    />
                    <Button onClick={saveApiKey}>Save</Button>
                  </div>
                  {activeApiTab === "openrouter" && showApiSuccess && (
                    <p className="text-green-500 text-sm">API key saved successfully!</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    After saving your OpenRouter API key, visit the Settings page to configure model selection
                  </p>
                </div>
                
                {selectedOpenRouterModels.length > 0 && (
                  <div className="mt-4 border rounded-md p-4">
                    <h4 className="font-medium mb-2">Selected OpenRouter Models</h4>
                    <div className="space-y-2">
                      {selectedOpenRouterModels.map((model, index) => (
                        <div key={model.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                          <div>
                            <p className="font-medium text-sm">{model.name}</p>
                            <p className="text-xs text-muted-foreground">{model.provider}</p>
                          </div>
                          <div className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                            {index === 0 ? "Primary" : `Fallback ${index}`}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => window.location.href = "/settings"}
                    >
                      Configure Models in Settings
                    </Button>
                  </div>
                )}
                
                {openRouterApiKey && selectedOpenRouterModels.length === 0 && (
                  <Alert>
                    <AlertDescription>
                      Please visit the Settings page to select OpenRouter models.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
      
      {generatedTweets.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">
            Generated {selectedPlatform === "twitter" ? "Tweets" : "LinkedIn Posts"}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {generatedTweets.map((tweet, index) => (
              <TweetPreview 
                key={index} 
                tweet={tweet} 
                isSelected={selectedTweets.includes(tweet.id)}
                onSelect={() => handleTweetSelect(tweet.id)}
                onEdit={handleEditTweet}
                onPostNow={handlePostNow}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TweetGenerator;
