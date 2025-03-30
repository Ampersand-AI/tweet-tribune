
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Send, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TweetPreview from "./TweetPreview";
import ApiKeyForm from "../settings/ApiKeyForm";
import { generateTweets, postTweet, scheduleTweet, isTwitterConnected } from "@/services/openai";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface TweetGeneratorProps {
  selectedTopic: {
    id: string;
    title: string;
    description: string;
    source: "twitter" | "linkedin";
  } | null;
}

const TweetGenerator = ({ selectedTopic }: TweetGeneratorProps) => {
  const [generatedTweets, setGeneratedTweets] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [deepseekApiKey, setDeepseekApiKey] = useState("");
  const [selectedApiProvider, setSelectedApiProvider] = useState<"claude" | "gemini" | "deepseek">("claude");
  const [toneSelection, setToneSelection] = useState("professional");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedTweet, setSelectedTweet] = useState<any>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [showApiSuccess, setShowApiSuccess] = useState(false);
  const [activeApiTab, setActiveApiTab] = useState<"claude" | "gemini" | "deepseek">("claude");

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const savedClaudeKey = localStorage.getItem("openai-api-key");
    const savedGeminiKey = localStorage.getItem("gemini-api-key");
    const savedDeepseekKey = localStorage.getItem("deepseek-api-key");
    
    if (savedClaudeKey) {
      setOpenaiApiKey(savedClaudeKey);
      setShowApiSuccess(true);
      setTimeout(() => setShowApiSuccess(false), 5000);
    }
    
    if (savedGeminiKey) {
      setGeminiApiKey(savedGeminiKey);
    }
    
    if (savedDeepseekKey) {
      setDeepseekApiKey(savedDeepseekKey);
    }
    
    // Auto-select the first available API
    if (savedClaudeKey) {
      setSelectedApiProvider("claude");
      setActiveApiTab("claude");
    } else if (savedGeminiKey) {
      setSelectedApiProvider("gemini");
      setActiveApiTab("gemini");
    } else if (savedDeepseekKey) {
      setSelectedApiProvider("deepseek");
      setActiveApiTab("deepseek");
    }
    
    // Check Twitter connection status
    const isConnected = isTwitterConnected();
    setTwitterConnected(isConnected);
  }, []);

  const handleGenerate = async () => {
    // Check if the selected API provider has a key
    let apiKey = "";
    if (selectedApiProvider === "claude") {
      apiKey = openaiApiKey;
    } else if (selectedApiProvider === "gemini") {
      apiKey = geminiApiKey;
    } else if (selectedApiProvider === "deepseek") {
      apiKey = deepseekApiKey;
    }

    if (!apiKey) {
      toast.error(`Please provide your ${selectedApiProvider} API key in the settings`);
      return;
    }

    if (!selectedTopic) {
      toast.error("Please select a topic first");
      return;
    }

    setIsGenerating(true);
    setGeneratedTweets([]);
    
    try {
      const tweets = await generateTweets({
        topic: selectedTopic.title,
        tone: toneSelection,
        customInstructions: customPrompt,
        apiProvider: selectedApiProvider
      });
      
      setGeneratedTweets(tweets);
      
      if (tweets.length > 0) {
        toast.success(`Tweets generated successfully with ${selectedApiProvider}`);
      } else {
        toast.error(`No tweets were generated with ${selectedApiProvider}`);
      }
    } catch (error) {
      console.error(`Error generating tweets with ${selectedApiProvider}:`, error);
      toast.error(`Failed to generate tweets with ${selectedApiProvider}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClaudeApiKeySubmit = (key: string) => {
    setOpenaiApiKey(key);
    setShowApiSuccess(true);
    toast.success("Claude API key saved successfully");
    setTimeout(() => setShowApiSuccess(false), 5000);
    
    if (!selectedApiProvider) {
      setSelectedApiProvider("claude");
    }
  };

  const handleGeminiApiKeySubmit = (key: string) => {
    setGeminiApiKey(key);
    toast.success("Gemini API key saved successfully");
    
    if (!selectedApiProvider) {
      setSelectedApiProvider("gemini");
    }
  };

  const handleDeepseekApiKeySubmit = (key: string) => {
    setDeepseekApiKey(key);
    toast.success("DeepSeek API key saved successfully");
    
    if (!selectedApiProvider) {
      setSelectedApiProvider("deepseek");
    }
  };

  const handleTweetSelect = (tweet: any) => {
    setSelectedTweet(tweet);
  };

  const handlePostNow = async () => {
    if (!selectedTweet) return;
    
    if (!twitterConnected) {
      toast.error("Please connect to Twitter first in Settings");
      return;
    }
    
    try {
      await postTweet(selectedTweet.content);
      toast.success("Tweet posted successfully");
    } catch (error) {
      toast.error("Failed to post tweet");
    }
  };

  const handleScheduleTweet = async () => {
    if (!selectedTweet || !scheduleDate || !scheduleTime) {
      toast.error("Please fill all the scheduling details");
      return;
    }
    
    if (!twitterConnected) {
      toast.error("Please connect to Twitter first in Settings");
      return;
    }
    
    try {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      await scheduleTweet(selectedTweet.content, selectedTweet.imageUrl, scheduledDateTime);
      setIsScheduleDialogOpen(false);
      toast.success("Tweet scheduled successfully");
    } catch (error) {
      toast.error("Failed to schedule tweet");
    }
  };

  if (!selectedTopic) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle>Generate Tweets</CardTitle>
          <CardDescription>
            Select a trending topic first to generate tweets
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-10">
          <p className="text-muted-foreground">No topic selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Tweets</CardTitle>
          <CardDescription>
            Create engaging tweets about "{selectedTopic.title}"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showApiSuccess && (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <AlertDescription className="text-green-700 flex items-center">
                <div className="bg-green-100 p-1 rounded-full mr-2">
                  <div className="bg-green-500 h-2 w-2 rounded-full"></div>
                </div>
                API key is connected and ready to use
              </AlertDescription>
            </Alert>
          )}

          {twitterConnected && (
            <Alert className="bg-blue-50 border-blue-200 mb-4">
              <AlertDescription className="text-blue-700 flex items-center">
                <div className="bg-blue-100 p-1 rounded-full mr-2">
                  <div className="bg-blue-500 h-2 w-2 rounded-full"></div>
                </div>
                Twitter account connected and ready to post
              </AlertDescription>
            </Alert>
          )}

          <Tabs 
            defaultValue={activeApiTab} 
            value={activeApiTab}
            onValueChange={(value) => {
              setActiveApiTab(value as "claude" | "gemini" | "deepseek");
              setSelectedApiProvider(value as "claude" | "gemini" | "deepseek");
            }}
            className="w-full mb-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="claude">Claude API</TabsTrigger>
              <TabsTrigger value="gemini">Gemini API</TabsTrigger>
              <TabsTrigger value="deepseek">DeepSeek API</TabsTrigger>
            </TabsList>
            
            <TabsContent value="claude">
              {!openaiApiKey ? (
                <div className="space-y-4">
                  <p className="text-sm text-amber-600">
                    Claude API Key is required to generate tweets with Claude.
                  </p>
                  <ApiKeyForm
                    keyType="openai"
                    label="Claude API Key"
                    placeholder="sk-ant-..."
                    description="Your API key is stored locally and never sent to our servers."
                    onApiKeySubmit={handleClaudeApiKeySubmit}
                  />
                </div>
              ) : (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    Claude API key is configured and ready to use
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="gemini">
              {!geminiApiKey ? (
                <div className="space-y-4">
                  <p className="text-sm text-amber-600">
                    Gemini API Key is required to generate tweets with Gemini.
                  </p>
                  <ApiKeyForm
                    keyType="gemini"
                    label="Gemini API Key"
                    placeholder="AIzaSyC..."
                    description="Your API key is stored locally and never sent to our servers."
                    onApiKeySubmit={handleGeminiApiKeySubmit}
                  />
                </div>
              ) : (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    Gemini API key is configured and ready to use
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="deepseek">
              {!deepseekApiKey ? (
                <div className="space-y-4">
                  <p className="text-sm text-amber-600">
                    DeepSeek API Key is required to generate tweets with DeepSeek.
                  </p>
                  <ApiKeyForm
                    keyType="deepseek"
                    label="DeepSeek API Key"
                    placeholder="sk-..."
                    description="Your API key is stored locally and never sent to our servers."
                    onApiKeySubmit={handleDeepseekApiKeySubmit}
                  />
                </div>
              ) : (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    DeepSeek API key is configured and ready to use
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          {/* Show tweet generation options if any API key is available */}
          {(openaiApiKey || geminiApiKey || deepseekApiKey) && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="api-provider">API Provider</Label>
                  <Select
                    value={selectedApiProvider}
                    onValueChange={(value) => setSelectedApiProvider(value as "claude" | "gemini" | "deepseek")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select API provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {openaiApiKey && <SelectItem value="claude">Claude</SelectItem>}
                      {geminiApiKey && <SelectItem value="gemini">Gemini</SelectItem>}
                      {deepseekApiKey && <SelectItem value="deepseek">DeepSeek</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select
                    value={toneSelection}
                    onValueChange={setToneSelection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                      <SelectItem value="informative">Informative</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="custom-prompt">Custom instructions (optional)</Label>
                  <Textarea
                    id="custom-prompt"
                    placeholder="Add custom instructions for the AI..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full mt-4"
                disabled={isGenerating}
              >
                {isGenerating ? `Generating with ${selectedApiProvider}...` : `Generate Tweets with ${selectedApiProvider}`}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {isGenerating && (
        <Card className="w-full p-8 flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-muted-foreground">Generating tweets with {selectedApiProvider}...</p>
          </div>
        </Card>
      )}

      {generatedTweets.length > 0 && (
        <Tabs defaultValue="tweets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tweets">Generated Tweets</TabsTrigger>
            <TabsTrigger value="customize" disabled={!selectedTweet}>Customize & Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tweets" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {generatedTweets.map((tweet) => (
                <TweetPreview
                  key={tweet.id}
                  tweet={tweet}
                  isSelected={selectedTweet?.id === tweet.id}
                  onSelect={() => handleTweetSelect(tweet)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="customize">
            {selectedTweet && (
              <Card>
                <CardHeader>
                  <CardTitle>Customize Tweet</CardTitle>
                  <CardDescription>
                    Edit your tweet and schedule it for posting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tweet-content">Tweet Content</Label>
                    <Textarea
                      id="tweet-content"
                      value={selectedTweet.content}
                      onChange={(e) => 
                        setSelectedTweet({
                          ...selectedTweet,
                          content: e.target.value
                        })
                      }
                      className="min-h-[100px]"
                    />
                    <div className="text-xs text-right text-muted-foreground">
                      {selectedTweet.content.length}/280 characters
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Preview Image</Label>
                    <div className="relative aspect-video rounded-md overflow-hidden border">
                      <img 
                        src={selectedTweet.imageUrl} 
                        alt="Tweet preview" 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Clock className="mr-2 h-4 w-4" />
                        Schedule for Later
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule Tweet</DialogTitle>
                        <DialogDescription>
                          Choose when you want this tweet to be posted
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="schedule-date">Date</Label>
                          <Input 
                            id="schedule-date" 
                            type="date" 
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            min={format(new Date(), "yyyy-MM-dd")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schedule-time">Time</Label>
                          <Input 
                            id="schedule-time" 
                            type="time" 
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleScheduleTweet}>
                          Schedule Tweet
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={handlePostNow}>
                    <Send className="mr-2 h-4 w-4" />
                    Post Now
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default TweetGenerator;
