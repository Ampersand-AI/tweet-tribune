
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Trash2, PenSquare, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cancelScheduledTweet, getScheduledTweets, generateTweets, scheduleTweet } from "@/services/openai";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Schedule = () => {
  const [scheduledTweets, setScheduledTweets] = useState<any[]>([]);
  const [generatedTweets, setGeneratedTweets] = useState<any[]>([]);
  const [pendingTweets, setPendingTweets] = useState<any[]>([]);
  const [approvedTweets, setApprovedTweets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load scheduled tweets
    const tweets = getScheduledTweets();
    console.log("Loaded scheduled tweets:", tweets);
    setScheduledTweets(tweets);
    
    // Load any generated tweets from localStorage (from Index page)
    const savedTweets = localStorage.getItem("generated-tweets");
    if (savedTweets) {
      const parsedTweets = JSON.parse(savedTweets);
      setPendingTweets(parsedTweets);
      console.log("Loaded generated tweets from Index page:", parsedTweets);
    }
    
    // Listen for new generated tweets
    const handleNewTweets = (event: CustomEvent) => {
      console.log("Received new tweets from event:", event.detail);
      setPendingTweets(event.detail);
    };
    
    window.addEventListener('tweetsGenerated', handleNewTweets as EventListener);
    
    return () => {
      window.removeEventListener('tweetsGenerated', handleNewTweets as EventListener);
    };
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
      setPendingTweets([...pendingTweets, ...tweets]);
      toast.success(`Generated ${tweets.length} tweets about ${randomTopic}`);
    } catch (error) {
      console.error("Error generating tweets:", error);
      toast.error("Failed to generate tweets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTweet = (tweet: any) => {
    // Add to approved tweets
    setApprovedTweets([...approvedTweets, tweet]);
    
    // Remove from pending tweets
    setPendingTweets(pendingTweets.filter(t => t.content !== tweet.content));
    
    toast.success("Tweet approved and ready for scheduling");
  };

  const handleRejectTweet = (tweet: any) => {
    // Remove from pending tweets
    setPendingTweets(pendingTweets.filter(t => t.content !== tweet.content));
    
    toast.info("Tweet removed from queue");
  };

  const handleScheduleAllTweets = () => {
    if (approvedTweets.length === 0) {
      toast.error("No tweets to schedule");
      return;
    }

    // Schedule tweets with 4-hour intervals, 3 times a day
    const now = new Date();
    let scheduledCount = 0;
    
    // Reset the time to the start of the next day
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(9, 0, 0, 0); // Start at 9 AM

    approvedTweets.forEach((tweet, index) => {
      // Calculate which day and time slot this tweet belongs to
      const dayOffset = Math.floor(index / 3); // 3 tweets per day
      const timeSlot = index % 3; // 0, 1, or 2 (9 AM, 1 PM, 5 PM)
      
      const scheduledTime = new Date(startDate);
      scheduledTime.setDate(scheduledTime.getDate() + dayOffset);
      scheduledTime.setHours(9 + (timeSlot * 4), 0, 0, 0); // 9 AM, 1 PM, 5 PM

      if (scheduleTweet(tweet.content, tweet.imageUrl, scheduledTime)) {
        scheduledCount++;
      }
    });

    if (scheduledCount > 0) {
      setScheduledTweets(getScheduledTweets());
      setApprovedTweets([]);
      toast.success(`Scheduled ${scheduledCount} tweets for posting at 9 AM, 1 PM, and 5 PM`);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tweet Scheduling</h1>
        
        <Tabs defaultValue="pending" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Approval ({pendingTweets.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedTweets.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({scheduledTweets.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Tweets</CardTitle>
                <CardDescription>
                  Review and approve tweets before scheduling them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {pendingTweets.length > 0 ? (
                    <>
                      {pendingTweets.map((tweet, index) => (
                        <div 
                          key={index}
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
                            <p className="text-sm mb-4">{tweet.content}</p>
                            <div className="flex gap-2 mt-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleApproveTweet(tweet)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleRejectTweet(tweet)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No pending tweets to approve. Generate tweets from the dashboard or below.
                      </p>
                      <Button 
                        className="mt-4" 
                        onClick={handleGenerateTweets}
                        disabled={isLoading}
                      >
                        {isLoading ? "Generating..." : "Generate Random Tweets"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Tweets</CardTitle>
                <CardDescription>
                  These tweets are ready to be scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {approvedTweets.length > 0 ? (
                  <>
                    <div className="space-y-6 mb-6">
                      {approvedTweets.map((tweet, index) => (
                        <div 
                          key={index}
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
                          <div className="w-full sm:w-3/4">
                            <p className="text-sm">{tweet.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={handleScheduleAllTweets}
                      className="w-full sm:w-auto"
                    >
                      Schedule All Approved Tweets (3 times daily)
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No approved tweets yet. Approve some tweets from the Pending tab.
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => {
                        // Get the "pending" tab element and switch to it
                        const pendingTab = document.querySelector('[data-value="pending"]');
                        if (pendingTab) {
                          pendingTab.dispatchEvent(new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                          }));
                        }
                      }}
                    >
                      Go to Pending Tweets
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
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
                      No scheduled tweets yet. Approve and schedule tweets from the Approved tab.
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => {
                        const approvedTab = document.querySelector('[data-value="approved"]');
                        if (approvedTab) {
                          approvedTab.dispatchEvent(new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                          }));
                        }
                      }}
                    >
                      Go to Approved Tweets
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Schedule;
