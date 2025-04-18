import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Twitter, Linkedin, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export const SocialSetup = () => {
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const navigate = useNavigate();

  const handleTwitterConnect = async () => {
    // Here you would implement the actual Twitter OAuth flow
    // For now, we'll just simulate a successful connection
    setTwitterConnected(true);
    toast.success('Twitter connected successfully');
  };

  const handleLinkedinConnect = async () => {
    // Here you would implement the actual LinkedIn OAuth flow
    // For now, we'll just simulate a successful connection
    setLinkedinConnected(true);
    toast.success('LinkedIn connected successfully');
  };

  const handleContinue = () => {
    // Navigate to dashboard when both are connected or user wants to skip
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Connect Your Social Media</CardTitle>
          <CardDescription>
            Connect your social media accounts to get started with Tweet Tribune
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Twitter Connection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Twitter className="h-8 w-8 text-twitter" />
                <div>
                  <h3 className="font-medium">Twitter</h3>
                  <p className="text-sm text-gray-500">
                    Connect your Twitter account to analyze and schedule tweets
                  </p>
                </div>
              </div>
              {twitterConnected ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span>Connected</span>
                </div>
              ) : (
                <Button onClick={handleTwitterConnect}>
                  Connect Twitter
                </Button>
              )}
            </div>

            {/* LinkedIn Connection */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Linkedin className="h-8 w-8 text-linkedin" />
                <div>
                  <h3 className="font-medium">LinkedIn</h3>
                  <p className="text-sm text-gray-500">
                    Connect your LinkedIn account to analyze and schedule posts
                  </p>
                </div>
              </div>
              {linkedinConnected ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span>Connected</span>
                </div>
              ) : (
                <Button onClick={handleLinkedinConnect}>
                  Connect LinkedIn
                </Button>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={handleContinue}
            >
              Skip for now
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!twitterConnected && !linkedinConnected}
            >
              Continue to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 