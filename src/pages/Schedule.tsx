
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Trash2, PenSquare, Check, X, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { cancelScheduledTweet, checkAndPostScheduledTweets, getScheduledTweets, generateTweets, scheduleTweet, postTweet } from "@/services/openai";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const Schedule = () => {
  const [scheduledTweets, setScheduledTweets] = useState<any[]>([]);
  const [generatedTweets, setGeneratedTweets] = useState<any[]>([]);
  const [pendingTweets, setPendingTweets] = useState<any[]>([]);
  const [approvedTweets, setApprovedTweets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTweetId, setEditingTweetId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

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
      setPendingTweets(prev => [...prev, ...event.detail]);
    };
    
    window.addEventListener('tweetsGenerated', handleNewTweets as EventListener);
    
    // Set up scheduled tweet checker to run every minute
    const intervalId = setInterval(() => {
      console.log("Checking for scheduled tweets to post...");
      checkAndPostScheduledTweets();
      // Refresh the scheduled tweets list after checking
      setScheduledTweets(getScheduledTweets());
    }, 60000); // Check every minute
    
    // Run once on component mount
    checkAndPostScheduledTweets();
    
    return () => {
      window.removeEventListener('tweetsGenerated', handleNewTweets as EventListener);
      clearInterval(intervalId);
    };
  }, []);

  const handleCancelTweet = (tweetId: string) => {
    if (cancelScheduledTweet(tweetId)) {
      // Update the state to reflect the canceled tweet
      setScheduledTweets(getScheduledTweets());
      toast.success("Tweet canceled successfully");
    }
  };

  const handleEditTweet = (tweet: any) => {
    setEditingTweetId(tweet.id);
    setEditedContent(tweet.content);
  };

  const handleSaveEdit = (tweetId: string) => {
    // Find which array contains the tweet
    let updatedTweet;
    
    // Check in pending tweets
    const updatedPending = pendingTweets.map(tweet => {
      if (tweet.id === tweetId) {
        updatedTweet = { ...tweet, content: editedContent };
        return updatedTweet;
      }
      return tweet;
    });
    
    // Check in approved tweets
    const updatedApproved = approvedTweets.map(tweet => {
      if (tweet.id === tweetId) {
        updatedTweet = { ...tweet, content: editedContent };
        return updatedTweet;
      }
      return tweet;
    });
    
    // Check in scheduled tweets
    const updatedScheduled = scheduledTweets.map(tweet => {
      if (tweet.id === tweetId) {
        updatedTweet = { ...tweet, content: editedContent };
        return updatedTweet;
      }
      return tweet;
    });
    
    // Update the appropriate state
    setPendingTweets(updatedPending);
    setApprovedTweets(updatedApproved);
    
    // If it's a scheduled tweet, update in localStorage
    if (scheduledTweets.some(tweet => tweet.id === tweetId)) {
      localStorage.setItem("scheduled-tweets", JSON.stringify(updatedScheduled));
      setScheduledTweets(updatedScheduled);
    }
    
    // Reset editing state
    setEditingTweetId(null);
    setEditedContent("");
    
    toast.success("Tweet updated successfully");
  };

  const handleGenerateTweets = async () => {
    setIsLoading(true);
    try {
      const topics = ["#AIStartups", "#Web3Development", "#TechTrends"];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      const tweets = await generateTweets({
        topic: randomTopic,
        tone: "professional",
        customInstructions: "Include specific examples and personal experiences. Make it sound like I'm sharing my own thoughts.",
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
    setPendingTweets(pendingTweets.filter(t => t.id !== tweet.id));
    
    toast.success("Tweet approved and ready for scheduling");
  };

  const handleRejectTweet = (tweet: any) => {
    // Remove from pending tweets
    setPendingTweets(pendingTweets.filter(t => t.id !== tweet.id));
    
    toast.info("Tweet removed from queue");
  };

  const handlePostNow = async (tweet: any) => {
    try {
      // Post the tweet immediately
      const success = await postTweet(tweet.content);
      
      if (success) {
        // If it was in approved tweets, remove it
        if (approvedTweets.some(t => t.id === tweet.id)) {
          setApprovedTweets(approvedTweets.filter(t => t.id !== tweet.id));
        }
        
        // If it was in scheduled tweets, cancel it
        if (scheduledTweets.some(t => t.id === tweet.id)) {
          cancelScheduledTweet(tweet.id);
          setScheduledTweets(getScheduledTweets());
        }
        
        toast.success("Tweet posted successfully!");
      }
    } catch (error) {
      console.error("Error posting tweet:", error);
      toast.error("Failed to post tweet");
    }
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
                            {editingTweetId === tweet.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editedContent}
                                  onChange={(e) => setEditedContent(e.target.value)}
                                  className="min-h-[100px] text-sm"
                                  maxLength={280}
                                />
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleSaveEdit(tweet.id)}
                                  >
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setEditingTweetId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm mb-4">{tweet.content}</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              {editingTweetId !== tweet.id && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleEditTweet(tweet)}
                                  >
                                    <PenSquare className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
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
                                </>
                              )}
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
                          <div className="w-full sm:w-3/4 flex flex-col justify-between">
                            {editingTweetId === tweet.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editedContent}
                                  onChange={(e) => setEditedContent(e.target.value)}
                                  className="min-h-[100px] text-sm"
                                  maxLength={280}
                                />
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleSaveEdit(tweet.id)}
                                  >
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setEditingTweetId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm">{tweet.content}</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-4">
                              {editingTweetId !== tweet.id && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleEditTweet(tweet)}
                                  >
                                    <PenSquare className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handlePostNow(tweet)}
                                    className="bg-blue-500 hover:bg-blue-600"
                                  >
                                    <Send className="h-4 w-4 mr-1" />
                                    Post Now
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => handleRejectTweet(tweet)}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Remove
                                  </Button>
                                </>
                              )}
                            </div>
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
                        // Switch to the pending tab using tabsTrigger
                        const pendingTab = document.querySelector('[data-value="pending"]');
                        if (pendingTab) {
                          pendingTab.dispatchEvent(new Event('click', {
                            bubbles: true,
                            cancelable: true
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
                              {editingTweetId === tweet.id ? (
                                <div className="space-y-2">
                                  <Textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    className="min-h-[100px] text-sm"
                                    maxLength={280}
                                  />
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleSaveEdit(tweet.id)}
                                    >
                                      Save
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => setEditingTweetId(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm mb-2">{tweet.content}</p>
                              )}
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
                            <div className="flex flex-wrap gap-2 mt-4">
                              {editingTweetId !== tweet.id && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => handleEditTweet(tweet)}>
                                    <PenSquare className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handlePostNow(tweet)}
                                    className="bg-blue-500 hover:bg-blue-600"
                                  >
                                    <Send className="h-4 w-4 mr-1" />
                                    Post Now
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => handleCancelTweet(tweet.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </>
                              )}
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
                          approvedTab.dispatchEvent(new Event('click', {
                            bubbles: true,
                            cancelable: true
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
