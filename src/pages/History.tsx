
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  History as HistoryIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { getTweetHistory } from "@/services/openai";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const History = () => {
  const [tweetHistory, setTweetHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load tweet history
    setTweetHistory(getTweetHistory());
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "posted":
        return (
          <Badge variant="success" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Posted
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "canceled":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Canceled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tweet History</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HistoryIcon className="h-5 w-5 mr-2" />
              Tweet Activity History
            </CardTitle>
            <CardDescription>
              View all your past tweets, scheduled, and canceled tweets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tweetHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tweetHistory.map((tweet) => {
                    const date = new Date(
                      tweet.status === "scheduled" ? tweet.scheduledAt : tweet.postedAt
                    );
                    return (
                      <TableRow key={tweet.id}>
                        <TableCell className="max-w-md truncate">
                          {tweet.content}
                        </TableCell>
                        <TableCell>{getStatusBadge(tweet.status)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            {date.toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            {date.toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No tweet history yet. Start by generating and posting tweets.
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

export default History;
