import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Plus, Loader2, Trash2, Edit2, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

interface ScheduledTweet {
  id: string;
  content: string;
  scheduledAt: string;
  status: 'pending' | 'posted' | 'failed';
}

const Schedule = () => {
  const [tweetContent, setTweetContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledTweets, setScheduledTweets] = useState<ScheduledTweet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTweetId, setEditingTweetId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    // Load scheduled tweets from localStorage on component mount
    const loadScheduledTweets = () => {
      const savedTweets = localStorage.getItem('scheduledTweets');
      if (savedTweets) {
        setScheduledTweets(JSON.parse(savedTweets));
      }
    };

    loadScheduledTweets();

    // Set up interval to check and post scheduled tweets
    const interval = setInterval(() => {
      checkAndPostScheduledTweets();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const checkAndPostScheduledTweets = async () => {
    const now = new Date();
    const tweetsToPost = scheduledTweets.filter(tweet => {
      const scheduledDate = new Date(tweet.scheduledAt);
      return scheduledDate <= now && tweet.status === 'pending';
    });

    for (const tweet of tweetsToPost) {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:3001/api/tweet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: tweet.content,
            accessToken: localStorage.getItem('twitterAccessToken'),
            accessSecret: localStorage.getItem('twitterAccessSecret'),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to post tweet');
        }

        // Update tweet status to posted
        const updatedTweets = scheduledTweets.map(t => 
          t.id === tweet.id ? { ...t, status: 'posted' } : t
        );
        setScheduledTweets(updatedTweets);
        localStorage.setItem('scheduledTweets', JSON.stringify(updatedTweets));
        
        toast.success('Tweet posted successfully!');
      } catch (error) {
        console.error('Error posting tweet:', error);
        // Update tweet status to failed
        const updatedTweets = scheduledTweets.map(t => 
          t.id === tweet.id ? { ...t, status: 'failed' } : t
        );
        setScheduledTweets(updatedTweets);
        localStorage.setItem('scheduledTweets', JSON.stringify(updatedTweets));
        
        toast.error('Failed to post tweet');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleScheduleTweet = () => {
    if (!tweetContent || !scheduledDate || !scheduledTime) {
      toast.error("Please fill in all fields");
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      toast.error("Please select a future date and time");
      return;
    }

    const newTweet: ScheduledTweet = {
      id: Date.now().toString(),
      content: tweetContent,
      scheduledAt: scheduledDateTime.toISOString(),
      status: 'pending'
    };

    const updatedTweets = [...scheduledTweets, newTweet];
    setScheduledTweets(updatedTweets);
    localStorage.setItem('scheduledTweets', JSON.stringify(updatedTweets));

    // Reset form
    setTweetContent("");
    setScheduledDate("");
    setScheduledTime("");
    
    toast.success("Tweet scheduled successfully!");
  };

  const handleDeleteTweet = (tweetId: string) => {
    const updatedTweets = scheduledTweets.filter(tweet => tweet.id !== tweetId);
    setScheduledTweets(updatedTweets);
    localStorage.setItem('scheduledTweets', JSON.stringify(updatedTweets));
    toast.success("Tweet deleted successfully!");
  };

  const handleEditTweet = (tweet: ScheduledTweet) => {
    setEditingTweetId(tweet.id);
    setEditedContent(tweet.content);
  };

  const handleSaveEdit = (tweetId: string) => {
    const updatedTweets = scheduledTweets.map(tweet => 
      tweet.id === tweetId ? { ...tweet, content: editedContent } : tweet
    );
    setScheduledTweets(updatedTweets);
    localStorage.setItem('scheduledTweets', JSON.stringify(updatedTweets));
    setEditingTweetId(null);
    setEditedContent("");
    toast.success("Tweet updated successfully!");
  };

  const handlePostNow = async (tweet: ScheduledTweet) => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:3001/api/tweet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: tweet.content,
          accessToken: localStorage.getItem('twitterAccessToken'),
          accessSecret: localStorage.getItem('twitterAccessSecret'),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post tweet');
      }

      // Update tweet status to posted
      const updatedTweets = scheduledTweets.map(t => 
        t.id === tweet.id ? { ...t, status: 'posted' } : t
      );
      setScheduledTweets(updatedTweets);
      localStorage.setItem('scheduledTweets', JSON.stringify(updatedTweets));
      
      toast.success('Tweet posted successfully!');
    } catch (error) {
      console.error('Error posting tweet:', error);
      toast.error('Failed to post tweet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="space-y-2">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
        >
          Schedule Tweets
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground"
        >
          Plan and schedule your tweets for optimal engagement
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-blue-400" />
                <div>
                  <CardTitle>Schedule New Tweet</CardTitle>
                  <CardDescription>
                    Create and schedule your next tweet
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tweet-content">Tweet Content</Label>
                <Textarea
                  id="tweet-content"
                  placeholder="What's happening?"
                  className="min-h-[100px]"
                  value={tweetContent}
                  onChange={(e) => setTweetContent(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-date">Date</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-time">Time</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="w-full" 
                  onClick={handleScheduleTweet}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Tweet
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Upcoming Tweets</CardTitle>
                  <CardDescription>
                    Your scheduled tweets
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledTweets.length > 0 ? (
                  scheduledTweets.map((tweet) => (
                    <div key={tweet.id} className="p-4 rounded-lg bg-muted space-y-2">
                      {editingTweetId === tweet.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="min-h-[100px]"
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
                        <>
                          <p className="text-sm">{tweet.content}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {format(parseISO(tweet.scheduledAt), 'MMM d, yyyy')}
                            </span>
                            <Clock className="h-3 w-3 ml-2 mr-1" />
                            <span>
                              {format(parseISO(tweet.scheduledAt), 'h:mm a')}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {tweet.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditTweet(tweet)}
                                >
                                  <Edit2 className="h-4 w-4 mr-1" />
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
                                  onClick={() => handleDeleteTweet(tweet.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </>
                            )}
                            {tweet.status === 'posted' && (
                              <span className="text-xs text-green-500">Posted</span>
                            )}
                            {tweet.status === 'failed' && (
                              <span className="text-xs text-red-500">Failed</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">
                      No scheduled tweets yet
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Schedule;
