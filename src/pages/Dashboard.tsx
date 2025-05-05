import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Twitter, Linkedin, BarChart2, Calendar, Settings, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface SocialStats {
  tweets: {
    total: number;
    change: number;
  };
  linkedinPosts: {
    total: number;
    change: number;
  };
  engagement: {
    rate: number;
    change: number;
  };
  scheduled: {
    total: number;
    change: number;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SocialStats>({
    tweets: { total: 0, change: 0 },
    linkedinPosts: { total: 0, change: 0 },
    engagement: { rate: 0, change: 0 },
    scheduled: { total: 0, change: 0 }
  });

  useEffect(() => {
    fetchSocialStats();
  }, []);

  const fetchSocialStats = async () => {
    try {
      setIsLoading(true);
      
      // Get the access tokens
      const twitterToken = localStorage.getItem('twitter_access_token');
      const linkedinToken = localStorage.getItem('linkedin_access_token');
      
      if (!twitterToken && !linkedinToken) {
        throw new Error('No social media tokens found');
      }
      
      // Initialize default stats
      const defaultStats = {
        tweets: { total: 0, change: 0 },
        linkedinPosts: { total: 0, change: 0 },
        engagement: { rate: 0, change: 0 },
        scheduled: { total: 0, change: 0 }
      };
      
      // Fetch Twitter stats if token exists
      let twitterData = null;
      if (twitterToken) {
        try {
          const twitterResponse = await fetch('http://localhost:3001/api/twitter/stats', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${twitterToken}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          const responseData = await twitterResponse.json();
          
          if (twitterResponse.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('twitter_access_token');
            throw new Error('Twitter token is invalid or expired');
          }
          
          if (twitterResponse.status === 429) {
            // Rate limit exceeded
            if (responseData._cached) {
              // Show cached data with a warning
              const cacheAge = Math.round((Date.now() - responseData._timestamp) / 1000 / 60);
              const resetTime = responseData._rateLimitReset ? new Date(responseData._rateLimitReset) : null;
              const resetMinutes = resetTime ? Math.round((resetTime.getTime() - Date.now()) / 1000 / 60) : null;
              
              toast.warning(
                `Showing cached Twitter data from ${cacheAge} minutes ago. ` +
                (resetMinutes ? `Rate limit resets in ${resetMinutes} minutes.` : '')
              );
              twitterData = responseData;
            } else {
              const resetTime = responseData.resetTime ? new Date(responseData.resetTime) : null;
              const resetMinutes = resetTime ? Math.round((resetTime.getTime() - Date.now()) / 1000 / 60) : null;
              
              throw new Error(
                `Twitter API rate limit exceeded. ` +
                (resetMinutes ? `Please try again in ${resetMinutes} minutes.` : 'Please try again later.')
              );
            }
          } else if (!twitterResponse.ok) {
            throw new Error(responseData.details || responseData.error || 'Failed to fetch Twitter stats');
          } else {
            twitterData = responseData;
          }
        } catch (error) {
          console.error('Twitter stats error:', error);
          toast.error(error.message || 'Failed to fetch Twitter stats');
        }
      }
      
      // Fetch LinkedIn stats if token exists
      let linkedinData = null;
      if (linkedinToken) {
        try {
          const linkedinResponse = await fetch('http://localhost:3001/api/linkedin/stats', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${linkedinToken}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          const responseData = await linkedinResponse.json();
          
          if (linkedinResponse.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('linkedin_access_token');
            throw new Error('LinkedIn token is invalid or expired');
          }
          
          if (!linkedinResponse.ok) {
            throw new Error(responseData.details || responseData.error || 'Failed to fetch LinkedIn stats');
          }
          
          linkedinData = responseData;
          
          // Show note if using mock data
          if (responseData._note) {
            toast.info(responseData._note);
          }
        } catch (error) {
          console.error('LinkedIn stats error:', error);
          toast.error(error.message || 'Failed to fetch LinkedIn stats');
        }
      }
      
      // Fetch scheduled posts
      let scheduledData = { total: 0, change: 0 };
      try {
        const scheduledResponse = await fetch('http://localhost:3001/api/posts/scheduled', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        const responseData = await scheduledResponse.json();
        
        if (!scheduledResponse.ok) {
          throw new Error(responseData.details || responseData.error || 'Failed to fetch scheduled posts');
        }
        
        scheduledData = responseData;
      } catch (error) {
        console.error('Scheduled posts error:', error);
        toast.error(error.message || 'Failed to fetch scheduled posts');
      }
      
      // Calculate engagement rate with proper null checks
      const totalEngagement = (twitterData?.engagement || 0) + (linkedinData?.engagement || 0);
      const totalPosts = (twitterData?.total_posts || 0) + (linkedinData?.total_posts || 0);
      const engagementRate = totalPosts > 0 ? (totalEngagement / totalPosts) * 100 : 0;
      
      // Update stats with available data
      setStats({
        tweets: {
          total: twitterData?.total_posts || 0,
          change: twitterData?.change_percentage || 0
        },
        linkedinPosts: {
          total: linkedinData?.total_posts || 0,
          change: linkedinData?.change_percentage || 0
        },
        engagement: {
          rate: engagementRate,
          change: ((engagementRate - (twitterData?.previous_engagement_rate || 0)) / (twitterData?.previous_engagement_rate || 1)) * 100
        },
        scheduled: {
          total: scheduledData.total || 0,
          change: scheduledData.change || 0
        }
      });
    } catch (error) {
      console.error('Error fetching social stats:', error);
      toast.error('Failed to load social media statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const statCards = [
    {
      title: 'Total Tweets',
      value: formatNumber(stats.tweets.total),
      change: formatPercentage(stats.tweets.change),
      icon: Twitter,
      color: 'text-blue-500'
    },
    {
      title: 'LinkedIn Posts',
      value: formatNumber(stats.linkedinPosts.total),
      change: formatPercentage(stats.linkedinPosts.change),
      icon: Linkedin,
      color: 'text-blue-700'
    },
    {
      title: 'Engagement Rate',
      value: `${stats.engagement.rate.toFixed(1)}%`,
      change: formatPercentage(stats.engagement.change),
      icon: BarChart2,
      color: 'text-green-500'
    },
    {
      title: 'Scheduled Posts',
      value: formatNumber(stats.scheduled.total),
      change: stats.scheduled.change > 0 ? `+${stats.scheduled.change}` : stats.scheduled.change.toString(),
      icon: Calendar,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          <p className="text-black/70">
            Welcome back! Here's what's happening with your social media.
          </p>
        </div>
        <Button onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">{stat.value}</div>
                <p className={`text-xs ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and actions you might need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => navigate('/analysis')}
            >
              <Twitter className="h-6 w-6 mb-2" />
              Analyze Tweet
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => navigate('/schedule')}
            >
              <Calendar className="h-6 w-6 mb-2" />
              Schedule Post
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => navigate('/analytics')}
            >
              <BarChart2 className="h-6 w-6 mb-2" />
              View Analytics
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => navigate('/history')}
            >
              <Linkedin className="h-6 w-6 mb-2" />
              Post History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 