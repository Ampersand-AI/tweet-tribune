import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Twitter, Linkedin, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const SocialCredentials = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [twitterApiKey, setTwitterApiKey] = useState("");
  const [twitterApiSecret, setTwitterApiSecret] = useState("");
  const [linkedinClientId, setLinkedinClientId] = useState("");
  const [linkedinClientSecret, setLinkedinClientSecret] = useState("");
  const [searchParams] = useSearchParams();

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

  const handleTwitterLogin = async () => {
    try {
      console.log('Initiating Twitter login...');
      const response = await fetch("http://localhost:5000/auth/twitter");
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received auth URL:', data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error("Error initiating Twitter login:", error);
      toast.error(`Failed to initiate Twitter login: ${error.message}`);
    }
  };

  const handleSaveTwitter = async () => {
    setIsLoading(true);
    try {
      // Store credentials in localStorage (in production, use a secure backend)
      localStorage.setItem("twitterAccessToken", twitterApiKey);
      localStorage.setItem("twitterAccessSecret", twitterApiSecret);
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
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
        >
          Social Media Credentials
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground"
        >
          Connect your social media accounts to enable analysis features
        </motion.p>
      </div>

      <Separator className="my-6" />

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Twitter className="h-6 w-6 text-blue-400" />
                <div>
                  <CardTitle>Twitter API</CardTitle>
                  <CardDescription>
                    Connect your Twitter account using OAuth
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!twitterApiKey ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={handleTwitterLogin} 
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    Connect Twitter Account
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter-api-key">Access Token</Label>
                      <Input
                        id="twitter-api-key"
                        type="password"
                        value={twitterApiKey}
                        onChange={(e) => setTwitterApiKey(e.target.value)}
                        placeholder="Twitter Access Token"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter-api-secret">Access Secret</Label>
                      <Input
                        id="twitter-api-secret"
                        type="password"
                        value={twitterApiSecret}
                        onChange={(e) => setTwitterApiSecret(e.target.value)}
                        placeholder="Twitter Access Secret"
                      />
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4"
                  >
                    <Button 
                      onClick={handleSaveTwitter} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? "Saving..." : "Save Twitter Credentials"}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
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
                <Linkedin className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>LinkedIn API</CardTitle>
                  <CardDescription>
                    Connect your LinkedIn account using API credentials
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin-client-id">Client ID</Label>
                  <Input
                    id="linkedin-client-id"
                    type="password"
                    value={linkedinClientId}
                    onChange={(e) => setLinkedinClientId(e.target.value)}
                    placeholder="Enter your LinkedIn Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin-client-secret">Client Secret</Label>
                  <Input
                    id="linkedin-client-secret"
                    type="password"
                    value={linkedinClientSecret}
                    onChange={(e) => setLinkedinClientSecret(e.target.value)}
                    placeholder="Enter your LinkedIn Client Secret"
                  />
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={handleSaveLinkedIn} 
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Saving..." : "Save LinkedIn Credentials"}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SocialCredentials; 