
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTweetHistory } from "@/services/openai";
import { useEffect, useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";

const History = () => {
  const [tweetHistory, setTweetHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load tweet history
    setTweetHistory(getTweetHistory());
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "posted":
        return <Badge variant="success">Posted</Badge>;
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

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tweet History</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Tweet Activity</CardTitle>
            <CardDescription>
              View all your tweet activity, including posted and scheduled tweets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedHistory.length > 0 ? (
              <div className="space-y-6">
                {sortedHistory.map((tweet) => {
                  const date = tweet.postedAt ? new Date(tweet.postedAt) : new Date(tweet.scheduledAt);
                  return (
                    <div 
                      key={tweet.id}
                      className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-full">
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
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No tweet history found. Post or schedule tweets to see your activity here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default History;
