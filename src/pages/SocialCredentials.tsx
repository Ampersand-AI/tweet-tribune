import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Twitter, Linkedin, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, useLocation } from "react-router-dom";

const SocialCredentials = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTwitterLoading, setIsTwitterLoading] = useState(false);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState<string | null>(localStorage.getItem('twitter_username'));
  const [linkedInUsername, setLinkedInUsername] = useState<string | null>(localStorage.getItem('linkedin_username'));
  const [twitterApiKey, setTwitterApiKey] = useState<string>("");
  const [twitterApiSecret, setTwitterApiSecret] = useState<string>("");
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    // Check for Twitter OAuth callback
    const accessToken = searchParams.get("accessToken");
    const accessSecret = searchParams.get("accessSecret");
    
    if (accessToken && accessSecret) {
      setTwitterApiKey(accessToken);
      setTwitterApiSecret(accessSecret);
      toast.success("Twitter credentials saved successfully!");
    }
  }, [searchParams]);

  useEffect(() => {
    // Check if we have Twitter OAuth response in the URL
    const params = new URLSearchParams(location.search);
    const twitterAccessToken = params.get('twitter_access_token');
    const twitterRefreshToken = params.get('twitter_refresh_token');
    const twitterUsername = params.get('twitter_username');
    const twitterError = params.get('error');

    if (twitterError) {
      toast.error(`Twitter authentication failed: ${twitterError}`);
      return;
    }

    if (twitterAccessToken && twitterUsername) {
      console.log('Found Twitter credentials in URL, saving to local storage');
      localStorage.setItem('twitter_access_token', twitterAccessToken);
      if (twitterRefreshToken) {
        localStorage.setItem('twitter_refresh_token', twitterRefreshToken);
      }
      localStorage.setItem('twitter_username', twitterUsername);
      
      setTwitterUsername(twitterUsername);
      toast.success(`Connected to Twitter as @${twitterUsername}`);
      
      // Clean the URL to remove the tokens
      const cleanUrl = new URL(window.location.href);
      cleanUrl.search = '';
      window.history.replaceState({}, document.title, cleanUrl.toString());
    }
  }, [location]);

  useEffect(() => {
    // Check if we have LinkedIn OAuth response in the URL
    const params = new URLSearchParams(location.search);
    const linkedinAccessToken = params.get('linkedin_access_token');
    const linkedinUsername = params.get('linkedin_username');
    const linkedinUserId = params.get('linkedin_user_id');
    const linkedinExpiresAt = params.get('linkedin_expires_at');
    const linkedinRefreshToken = params.get('linkedin_refresh_token');
    const linkedinEmail = params.get('linkedin_email');
    const error = params.get('error');

    if (error) {
      toast.error(`Authentication failed: ${error}`);
      return;
    }

    if (linkedinAccessToken && linkedinUsername) {
      console.log('Found LinkedIn credentials in URL, saving to local storage');
      localStorage.setItem('linkedin_access_token', linkedinAccessToken);
      localStorage.setItem('linkedin_username', linkedinUsername);
      localStorage.setItem('linkedin_user_id', linkedinUserId || '');
      
      if (linkedinExpiresAt) {
        localStorage.setItem('linkedin_expires_at', linkedinExpiresAt);
      }
      if (linkedinRefreshToken) {
        localStorage.setItem('linkedin_refresh_token', linkedinRefreshToken);
      }
      if (linkedinEmail) {
        localStorage.setItem('linkedin_email', linkedinEmail);
      }
      
      setLinkedInUsername(linkedinUsername);
      toast.success(`Connected to LinkedIn as ${linkedinUsername}`);
      
      // Clean the URL to remove the tokens
      const cleanUrl = new URL(window.location.href);
      cleanUrl.search = '';
      window.history.replaceState({}, document.title, cleanUrl.toString());
    }
  }, [location]);

  const handleTwitterLogin = async () => {
    try {
      setIsTwitterLoading(true);
      // Use the full URL to our backend endpoint
      const response = await fetch('http://localhost:3001/auth/twitter');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Twitter API error response:', errorData);
        
        // Show a more helpful error message with details if available
        if (errorData.details) {
          toast.error(
            <div>
              <p><strong>Twitter Error:</strong> {errorData.error}</p>
              <p className="text-sm">{errorData.details}</p>
            </div>,
            { duration: 6000 }
          );
        } else {
          toast.error(errorData.error || 'Failed to initiate Twitter login');
        }
        
        throw new Error(errorData.error || 'Failed to initiate Twitter login');
      }
      
      const data = await response.json();
      
      if (data.url) {
        // Log before redirecting
        console.log('Opening Twitter auth URL:', data.url);
        // Open in a new window instead of redirecting
        const authWindow = window.open(data.url, 'Twitter Auth', 'width=600,height=600');
        
        // Add event listener for the popup window
        const checkWindow = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkWindow);
            // Check if we have the credentials in localStorage
            const twitterUsername = localStorage.getItem('twitter_username');
            if (twitterUsername) {
              setTwitterUsername(twitterUsername);
              toast.success(`Connected to Twitter as @${twitterUsername}`);
            }
          }
        }, 1000);
      } else {
        throw new Error('No authentication URL received from server');
      }
    } catch (error) {
      console.error('Error initiating Twitter login:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect to Twitter');
    } finally {
      setIsTwitterLoading(false);
    }
  };

  const handleLogoutTwitter = () => {
    localStorage.removeItem('twitter_access_token');
    localStorage.removeItem('twitter_refresh_token');
    localStorage.removeItem('twitter_access_secret');
    localStorage.removeItem('twitter_username');
    setTwitterUsername(null);
    toast.success('Disconnected from Twitter');
  };

  const handleSaveTwitter = async () => {
    setIsLoading(true);
    try {
      // Store credentials in localStorage (in production, use a secure backend)
      localStorage.setItem("twitter_access_token", twitterApiKey);
      localStorage.setItem("twitter_access_secret", twitterApiSecret);
      toast.success("Twitter credentials saved successfully!");
    } catch (error) {
      toast.error("Failed to save Twitter credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLinkedIn = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement LinkedIn API key validation and storage
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("LinkedIn credentials saved successfully!");
    } catch (error) {
      toast.error("Failed to save LinkedIn credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInLogin = async () => {
    try {
      setIsLinkedInLoading(true);
      toast('Connecting to LinkedIn...');
      
      // Call our backend to initiate LinkedIn OAuth
      const response = await fetch('/auth/linkedin');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('LinkedIn API error response:', errorData);
        
        // Show a more helpful error message with details if available
        if (errorData.details) {
          toast.error(
            <div>
              <p><strong>LinkedIn Error:</strong> {errorData.error}</p>
              <p className="text-sm">{errorData.details}</p>
            </div>,
            { duration: 6000 }
          );
        } else {
          toast.error(errorData.error || 'Failed to initiate LinkedIn login');
        }
        
        throw new Error(errorData.error || 'Failed to initiate LinkedIn login');
      }
      
      const data = await response.json();
      
      if (data.url) {
        // Log before redirecting
        console.log('Redirecting to LinkedIn auth URL:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No authentication URL received from server');
      }
    } catch (error) {
      console.error('Error initiating LinkedIn login:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect to LinkedIn');
    } finally {
      setIsLinkedInLoading(false);
    }
  };

  const handleLogoutLinkedIn = () => {
    localStorage.removeItem('linkedin_access_token');
    localStorage.removeItem('linkedin_refresh_token');
    localStorage.removeItem('linkedin_expires_at');
    localStorage.removeItem('linkedin_username');
    localStorage.removeItem('linkedin_user_id');
    localStorage.removeItem('linkedin_email');
    setLinkedInUsername(null);
    toast.success('Disconnected from LinkedIn');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="space-y-2">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-blue-600"
        >
          Social Media Connections
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-600"
        >
          Connect your social media accounts to enable content publishing and analytics
        </motion.p>
      </div>

      <div className="grid gap-6">
        {/* Twitter Card */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Twitter className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900">Twitter</CardTitle>
                  <CardDescription className="text-slate-600">Connect your Twitter account to publish tweets</CardDescription>
                </div>
              </div>
              {twitterUsername && (
                <div className="flex items-center space-x-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Connected as @{twitterUsername}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {twitterUsername ? (
              <div className="space-y-4">
                <p className="text-slate-600">Your Twitter account is connected and ready to use.</p>
                <Button
                  variant="destructive"
                  onClick={handleLogoutTwitter}
                  disabled={isTwitterLoading}
                  className="w-full sm:w-auto"
                >
                  Disconnect Twitter Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-600">Connect your Twitter account to enable tweet publishing.</p>
                <Button 
                  onClick={handleTwitterLogin} 
                  disabled={isTwitterLoading}
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isTwitterLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">◌</span> Connecting...
                    </span>
                  ) : (
                    "Connect Twitter Account"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* LinkedIn Card */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Linkedin className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900">LinkedIn</CardTitle>
                  <CardDescription className="text-slate-600">Connect your LinkedIn account to publish posts</CardDescription>
                </div>
              </div>
              {linkedInUsername && (
                <div className="flex items-center space-x-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Connected as {linkedInUsername}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {linkedInUsername ? (
              <div className="space-y-4">
                <p className="text-slate-600">Your LinkedIn account is connected and ready to use.</p>
                <Button
                  variant="destructive"
                  onClick={handleLogoutLinkedIn}
                  disabled={isLinkedInLoading}
                  className="w-full sm:w-auto"
                >
                  Disconnect LinkedIn Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-600">Connect your LinkedIn account to enable post publishing.</p>
                <Button 
                  onClick={handleLinkedInLogin}
                  disabled={isLinkedInLoading}
                  className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white"
                >
                  {isLinkedInLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">◌</span> Connecting...
                    </span>
                  ) : (
                    "Connect LinkedIn Account"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default SocialCredentials; 