
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Trash2 } from "lucide-react";

// Mock scheduled tweets data
const SCHEDULED_TWEETS = [
  {
    id: "1",
    content: "AI is revolutionizing patient care with personalized treatment plans. A recent study shows 30% better outcomes when AI assists healthcare providers. #AIHealthcare",
    scheduledAt: "2023-07-15T09:00:00",
    imageUrl: "https://placehold.co/600x400/png?text=AI+Patient+Care",
  },
  {
    id: "2",
    content: "Did you know? AI-powered diagnostic tools can now detect certain conditions faster than human doctors. This isn't about replacing healthcare workers - it's about giving them superpowers! #AIHealthcare #FutureTech",
    scheduledAt: "2023-07-18T14:30:00",
    imageUrl: "https://placehold.co/600x400/png?text=AI+Diagnostics",
  },
];

const Schedule = () => {
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
            {SCHEDULED_TWEETS.length > 0 ? (
              <div className="space-y-6">
                {SCHEDULED_TWEETS.map((tweet) => {
                  const scheduledDate = new Date(tweet.scheduledAt);
                  return (
                    <div 
                      key={tweet.id}
                      className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-full sm:w-1/4">
                        <img 
                          src={tweet.imageUrl} 
                          alt="Tweet preview" 
                          className="object-cover w-full h-32 rounded-md" 
                        />
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
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive">
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
                <Button className="mt-4">
                  Generate Tweets
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Schedule;
