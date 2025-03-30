
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { getAnalytics, getTweetHistory } from "@/services/openai";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, AreaChart, LineChart as LineChartIcon, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Bar, CartesianGrid, Legend, Tooltip, Line, LineChart as RechartsLineChart } from "recharts";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<any>({
    totalTweets: 0,
    totalImpressions: 0,
    engagementRate: 0,
    monthlyChange: 0
  });
  
  const [tweetHistory, setTweetHistory] = useState<any[]>([]);
  
  useEffect(() => {
    // Initial fetch
    loadAnalyticsData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      loadAnalyticsData();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const loadAnalyticsData = () => {
    const analytics = getAnalytics();
    setAnalyticsData(analytics);
    
    const history = getTweetHistory();
    setTweetHistory(history);
  };
  
  // Generate some performance data for charts
  const generatePerformanceData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      name: day,
      impressions: Math.floor(Math.random() * 1000) + 500,
      engagement: Math.floor(Math.random() * 50) + 10,
    }));
  };
  
  // Generate audience growth data
  const generateGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    let followers = 100;
    
    return months.map(month => {
      const growth = Math.floor(Math.random() * 50) + 10;
      followers += growth;
      
      return {
        name: month,
        followers: followers,
        growth: growth
      };
    });
  };
  
  const performanceData = generatePerformanceData();
  const growthData = generateGrowthData();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tweets</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalTweets || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData.monthlyChange > 0 
                  ? `+${analyticsData.monthlyChange}% from last month` 
                  : `${analyticsData.monthlyChange}% from last month`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
              <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalImpressions?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">+19% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.engagementRate || 0}%</div>
              <p className="text-xs text-muted-foreground">+0.5% from last month</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="performance">
          <TabsList>
            <TabsTrigger value="performance">Tweet Performance</TabsTrigger>
            <TabsTrigger value="growth">Audience Growth</TabsTrigger>
          </TabsList>
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Tweet Performance</CardTitle>
                <CardDescription>
                  View engagement metrics for your recent tweets
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {tweetHistory.length > 0 ? (
                  <ChartContainer 
                    className="h-full" 
                    config={{
                      impressions: { color: "#2563eb" },
                      engagement: { color: "#16a34a" }
                    }}
                  >
                    <RechartsBarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="impressions" fill="#2563eb" name="Impressions" />
                      <Bar dataKey="engagement" fill="#16a34a" name="Engagement" />
                    </RechartsBarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Post some tweets to see performance metrics
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="growth">
            <Card>
              <CardHeader>
                <CardTitle>Audience Growth</CardTitle>
                <CardDescription>
                  Track your follower growth over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {tweetHistory.length > 0 ? (
                  <ChartContainer 
                    className="h-full" 
                    config={{
                      followers: { color: "#8b5cf6" },
                      growth: { color: "#ec4899" }
                    }}
                  >
                    <RechartsLineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="followers" stroke="#8b5cf6" name="Followers" />
                      <Line type="monotone" dataKey="growth" stroke="#ec4899" name="Monthly Growth" />
                    </RechartsLineChart>
                  </ChartContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Post some tweets to see audience growth metrics
                    </p>
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

export default Analytics;
