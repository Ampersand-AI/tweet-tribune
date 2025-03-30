
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Trash2, PenSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { cancelScheduledTweet, getScheduledTweets, getTweetHistory, generateTweets, scheduleTweet } from "@/services/openai";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Schedule = () => {
  const [scheduledTweets, setScheduledTweets] = useState<any[]>([]);
  const [generatedTweets, setGeneratedTweets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load scheduled tweets
    const tweets = getScheduledTweets();
    console.log("Loaded scheduled tweets:", tweets);
    setScheduledTweets(tweets);
  }, []);

  const handleCancelTweet = (tweetId: string) => {
    if (cancelScheduledTweet(tweetId)) {
      // Update the state to reflect the canceled tweet
      setScheduledTweets(getScheduledTweets());
      toast.success("Tweet canceled successfully");
    }
  };

  const handleGenerateTweets = async () => {
    setIsLoading(true);
    try {
      const topics = ["#AIStartups", "#Web3Development", "#TechTrends"];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      const tweets = await generateTweets({
        topic: randomTopic,
        tone: "professional",
        apiProvider: "deepseek"
      });
      
      setGeneratedTweets(tweets);
      toast.success(`Generated ${tweets.length} tweets about ${randomTopic}`);
    } catch (error) {
      console.error("Error generating tweets:", error);
      toast.error("Failed to generate tweets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleAllTweets = () => {
    if (generatedTweets.length === 0) {
      toast.error("No tweets to schedule");
      return;
    }

    // Schedule tweets with 4-hour intervals
    const now = new Date();
    let scheduledCount = 0;

    generatedTweets.forEach((tweet, index) => {
      const scheduledTime = new Date(now);
      scheduledTime.setHours(scheduledTime.getHours() + (index * 4)); // 4-hour gap

      if (scheduleTweet(tweet.content, tweet.imageUrl, scheduledTime)) {
        scheduledCount++;
      }
    });

    if (scheduledCount > 0) {
      setScheduledTweets(getScheduledTweets());
      setGeneratedTweets([]);
      toast.success(`Scheduled ${scheduledCount} tweets with 4-hour intervals`);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tweet Scheduling</h1>
        
        <Tabs defaultValue="scheduled" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scheduled">Scheduled Tweets</TabsTrigger>
            <TabsTrigger value="generate">Generate & Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tweets</CardTitle>
                <CardDescription>
                  Manage your scheduled tweets and their posting times
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scheduledTweets.length > 0 ? (
                  <div className="space-y-6">
                    {scheduledTweets.map((tweet) => {
                      const scheduledDate = new Date(tweet.scheduledAt);
                      return (
                        <div 
                          key={tweet.id}
                          className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg"
                        >
                          <div className="w-full sm:w-1/4">
                            {tweet.imageUrl && (
                              <img 
                                src={tweet.imageUrl} 
                                alt="Tweet preview" 
                                className="object-cover w-full h-32 rounded-md" 
                              />
                            )}
                          </div>
                          <div className="w-full sm:w-3/4 flex flex-col justify-between">
                            <div>
                              <p className="text-sm mb-2">{tweet.content}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                <span>
                                  {scheduledDate.toLocaleDateString(undefined, { 
                                    weekday: 'short', 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                                <Clock className="h-3 w-3 ml-2 mr-1" />
                                <span>
                                  {scheduledDate.toLocaleTimeString(undefined, {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button size="sm" variant="outline">
                                <PenSquare className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleCancelTweet(tweet.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No scheduled tweets yet. Generate some tweets and schedule them for later.
                    </p>
                    <Button className="mt-4" onClick={() => document.querySelector('[data-value="generate"]')?.click()}>
                      Generate Tweets
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle>Generate & Schedule Tweets</CardTitle>
                <CardDescription>
                  Generate tweets and schedule them to be posted with 4-hour intervals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={handleGenerateTweets} 
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      {isLoading ? "Generating..." : "Generate Random Tweets"}
                    </Button>
                    <Button 
                      onClick={handleScheduleAllTweets} 
                      disabled={generatedTweets.length === 0 || isLoading}
                      className="w-full sm:w-auto"
                    >
                      Schedule All Tweets (4-hour intervals)
                    </Button>
                  </div>
                  
                  {generatedTweets.length > 0 && (
                    <div className="space-y-4 mt-6">
                      <h3 className="text-lg font-semibold">Generated Tweets</h3>
                      {generatedTweets.map((tweet, index) => (
                        <div 
                          key={index}
                          className="p-4 border rounded-lg"
                        >
                          <p className="text-sm mb-2">{tweet.content}</p>
                          {tweet.imageUrl && (
                            <img 
                              src={tweet.imageUrl} 
                              alt="Tweet preview" 
                              className="mt-2 object-cover h-32 rounded-md" 
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Schedule;
