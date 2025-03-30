
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Trash2, PenSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { cancelScheduledTweet, getScheduledTweets } from "@/services/openai";
import { Link } from "react-router-dom";

const Schedule = () => {
  const [scheduledTweets, setScheduledTweets] = useState<any[]>([]);

  useEffect(() => {
    // Load scheduled tweets
    setScheduledTweets(getScheduledTweets());
  }, []);

  const handleCancelTweet = (tweetId: string) => {
    if (cancelScheduledTweet(tweetId)) {
      // Update the state to reflect the canceled tweet
      setScheduledTweets(getScheduledTweets());
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Scheduled Tweets</h1>
        
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
                <Link to="/">
                  <Button className="mt-4">
                    Generate Tweets
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Schedule;
