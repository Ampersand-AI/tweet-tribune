
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import TweetPreview from "./TweetPreview";
import ApiKeyForm from "../settings/ApiKeyForm";

interface TweetGeneratorProps {
  selectedTopic: {
    id: string;
    title: string;
    description: string;
    source: "twitter" | "linkedin";
  } | null;
}

// Mock tweet generations
const MOCK_TWEETS = [
  {
    id: "tweet1",
    content: "Exciting developments in #AIHealthcare! New studies show AI diagnostic tools are reaching 95% accuracy for early disease detection. The future of medicine looks promising! 💻🔬 #HealthTech",
    imageUrl: "https://placehold.co/600x400/png?text=AI+Healthcare+Innovation",
  },
  {
    id: "tweet2",
    content: "AI is revolutionizing patient care with personalized treatment plans. A recent study shows 30% better outcomes when AI assists healthcare providers. What are your thoughts on AI in medicine? #AIHealthcare",
    imageUrl: "https://placehold.co/600x400/png?text=AI+Patient+Care",
  },
  {
    id: "tweet3",
    content: "Did you know? AI-powered diagnostic tools can now detect certain conditions faster than human doctors. This isn't about replacing healthcare workers - it's about giving them superpowers! #AIHealthcare #FutureTech",
    imageUrl: "https://placehold.co/600x400/png?text=AI+Diagnostics",
  },
];

const TweetGenerator = ({ selectedTopic }: TweetGeneratorProps) => {
  const [generatedTweets, setGeneratedTweets] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [toneSelection, setToneSelection] = useState("professional");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedTweet, setSelectedTweet] = useState<any>(null);

  const handleGenerate = () => {
    if (!apiKey) {
      // Show error for missing API key
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setGeneratedTweets(MOCK_TWEETS);
      setIsGenerating(false);
    }, 2000);
  };

  const handleTweetSelect = (tweet: any) => {
    setSelectedTweet(tweet);
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
          {!apiKey && (
            <ApiKeyForm
              onApiKeySubmit={(key) => setApiKey(key)}
            />
          )}

          {apiKey && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
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
                
                <div className="space-y-2">
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
                {isGenerating ? "Generating..." : "Generate Tweets"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

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
                      <Button
                        variant="outline" 
                        size="sm"
                        className="absolute bottom-2 right-2"
                      >
                        Regenerate Image
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule for Later
                  </Button>
                  <Button>Post Now</Button>
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
