
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getTweetHistory } from "@/services/openai";
import { useEffect, useState } from "react";
import { CalendarIcon, Clock, ThumbsUp } from "lucide-react";

const History = () => {
  const [tweetHistory, setTweetHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load tweet history
    const history = getTweetHistory();
    console.log("Loaded tweet history:", history);
    setTweetHistory(history);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "posted":
        return <Badge className="bg-green-500 hover:bg-green-600">Posted</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "canceled":
        return <Badge variant="destructive">Canceled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const sortedHistory = [...tweetHistory].sort((a, b) => {
    const dateA = a.postedAt ? new Date(a.postedAt).getTime() : new Date(a.scheduledAt).getTime();
    const dateB = b.postedAt ? new Date(b.postedAt).getTime() : new Date(b.scheduledAt).getTime();
    return dateB - dateA; // Most recent first
  });

  // Filter only posted tweets
  const postedTweets = sortedHistory.filter(tweet => tweet.status === "posted");

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tweet History</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Posted Tweets</CardTitle>
            <CardDescription>
              View all your tweet activity that has been published to Twitter
            </CardDescription>
          </CardHeader>
          <CardContent>
            {postedTweets.length > 0 ? (
              <div className="space-y-6">
                {postedTweets.map((tweet) => {
                  const date = new Date(tweet.postedAt);
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
                      <div className="w-full sm:w-3/4">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                          <p className="text-sm">{tweet.content}</p>
                          <div>
                            {getStatusBadge(tweet.status)}
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          <span>
                            {date.toLocaleDateString(undefined, { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                          <Clock className="h-3 w-3 ml-2 mr-1" />
                          <span>
                            {date.toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="mt-3">
                          <Button size="sm" variant="outline" className="text-xs">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Like on Twitter
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
                  No posted tweets found yet. Schedule tweets to see them here after they're posted.
                </p>
                <Link to="/schedule">
                  <Button className="mt-4">
                    Schedule Tweets
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

export default History;
